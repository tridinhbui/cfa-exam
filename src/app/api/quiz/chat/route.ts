import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { persistentChatLimit } from '@/lib/rate-limit';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export const runtime = 'nodejs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const authResult = await verifyAuth(req);
        if (authResult.error) {
            return authErrorResponse(authResult as { error: string, status: number });
        }
        const userId = authResult.uid as string;

        // 2. Check Subscription & Apply Strict Rate Limit for FREE users
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true }
        });

        const isFree = !user || user.subscription === 'FREE';
        const isPro = user?.subscription === 'PRO';

        if (isFree) {
            // Check sliding window limit for free users: 7 messages per 2 hours
            const limitResult = await persistentChatLimit(userId, {
                limit: 7,         // Now 7 messages
                window: 7200000   // 2 hours in milliseconds
            });

            if (!limitResult.success) {
                return NextResponse.json({
                    error: 'Free tier quota: 7 messages every 2 hours. Upgrade to PRO to study with a massive 70 messages/day limit!',
                    isFree: true
                }, { status: 429 });
            }
        } else if (isPro) {
            const limitResult = await persistentChatLimit(userId, {
                limit: 75,        // 75 messages
                window: 86400000  // per 24 hours (1 day)
            });

            if (!limitResult.success) {
                return NextResponse.json({
                    error: 'PRO tier daily quota: 75 messages per day reached. You have studied exceptionally hard today! Please return tomorrow.',
                    isPro: true
                }, { status: 429 });
            }
        }

        const body = await req.json();
        const { messages, question, explanation, topic, options, isGlobal, image, sessionId } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const lastMessageText = messages[messages.length - 1]?.content || '';
        let relatedContext = '';

        // 3. Perform Vector Search (RAG)
        if (lastMessageText.length > 5) {
            try {
                // Generate embedding for current query
                const embedResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: lastMessageText,
                });
                const queryVector = embedResponse.data[0].embedding;

                // Search for top related content across all sources:
                // 1. Practice Questions
                // 2. Module Quiz Questions
                // 3. SchweserNotes PDF Chunks
                const relatedResults: any[] = await prisma.$queryRawUnsafe(`
                    WITH all_knowledge AS (
                        SELECT content, explanation, embedding, 'Practice Question' as source, '' as metadata FROM "Question"
                        UNION ALL
                        SELECT prompt as content, explanation, embedding, 'Module Quiz' as source, '' as metadata FROM "ModuleQuizQuestion"
                        UNION ALL
                        -- 3. UPGRADED: New LessonChunk
                        SELECT 
                            lc.content, 
                            '' as explanation, 
                            lc.embedding, 
                            CONCAT('Lesson: ', m.code, ' - ', m.title) as source,
                            lc.type::text as metadata
                        FROM "LessonChunk" lc
                        JOIN "Module" m ON lc."moduleId" = m.id
                    )
                    SELECT content, explanation, source, metadata
                    FROM all_knowledge
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> $1::vector 
                    LIMIT 7
                `, `[${queryVector.join(',')}]`);

                if (relatedResults.length > 0) {
                    relatedContext = "\n\nAUTHORITATIVE CFA KNOWLEDGE BASE SEGMENTS:\n" +
                        relatedResults.map((q, i) =>
                            `[Source: ${q.source}]${q.metadata ? ` [Type: ${q.metadata}]` : ''}\nContent: ${q.content.substring(0, 1000)}\n${q.explanation ? `Expert Note: ${q.explanation}\n` : ''}`
                        ).join('\n---\n');
                }
            } catch (err) {
                console.error('Vector Search Error:', err);
            }
        }

        // 4. Define AI Personas
        const persona = isGlobal
            ? "You are the Mentis AI Strategic Advisor. You are a senior CFA Charterholder and Mentor. Your goal is to guide students through the complex world of finance with wisdom, clarity, and deep expertise."
            : "You are the Mentis AI Quiz Assistant. Your goal is to help the student master the specific question they are currently working on.";

        const currentTaskContext = isGlobal
            ? (question ? `Background Context: The student is currently looking at this specific CFA question: "${question}". Topic: "${topic}". Options provided: A: ${options?.A}, B: ${options?.B}, C: ${options?.C}. Reference Explanation: "${explanation}". They might ask about this specific question or broader concepts.` : "Context: General CFA study session.")
            : `Primary Task: Help the student understand this specific question: "${question}". Explanation provided for your reference: "${explanation}". Options: A: ${options?.A}, B: ${options?.B}, C: ${options?.C}.`;

        const systemMessage = {
            role: 'system',
            content: `${persona}
            
            CRITICAL KNOWLEDGE SOURCE: You have access to a specialized Knowledge Base (RAG) containing SchweserNotes (Books 1-4) and the CFA 2025 Curriculum.
            - ALWAYS anchor your technical explanations in the "AUTHORITATIVE CFA KNOWLEDGE BASE SEGMENTS" below.
            - If the RAG content contradicts your general knowledge, follow the RAG content.
            
            ${currentTaskContext}
            
            ${relatedContext}
            
            INTERACTION RULES:
            - RESPOND IN THE SAME LANGUAGE AS THE STUDENT.
            - BE CONCISE AND ELIMINATE FLUFF.
            - Use LaTeX for ALL mathematical formulas and variables. 
              - Use double dollar signs for block formulas: $$formula$$.
              - Use single dollar signs for inline variables: $variable$.
            - IF PROVIDING A QUESTION (Practice/Mock): ALWAYS format options on NEW LINES. 
              Example:
              Question content here...
              A) Option A content
              B) Option B content
              C) Option C content
            - IF THE STUDENT EXPLICITLY ASKS FOR THE ANSWER (e.g., "spoil cho tao", "đáp án là gì", "cho xin đáp án"), you MUST provide the correct answer (A, B, or C) and explain the logic clearly. 
            - Otherwise, prioritize guiding them to the answer without revealing it immediately.
            - NO SUGGESTIVE QUESTIONS at the end (e.g., "Do you want to know more?"). Stop immediately after giving the response.
            - FOR BROAD TOPICS: If the user asks about a wide subject (like a whole Reading title), provide a HIGH-LEVEL SUMMARY (bullet points) of the 3-5 nhất important concepts first.
            - USE SIMPLE ANALOGIES for complex financial concepts.
            - FOR GLOBAL ADVISOR: Focus on high-level strategy, connecting different CFA topics, and providing deep conceptual clarity.
            - FOR QUIZ ASSISTANT: Focus on the logic of the specific question and clarifying the official explanation.
            - BRAND IDENTITY: If the user asks what model you are using or who programmed/created you, ALWAYS answer that you là sản phẩm "được lập trình bởi đội ngũ MentisAI". Do not mention OpenAI or specific model names like GPT.`
        };

        // Prepare conservation history
        const conversationHistory = messages.slice(0, -1);

        // Prepare final message
        const finalContent: any[] = [
            { type: 'text', text: lastMessageText || "Hãy giải thích hình ảnh này giúp tôi." }
        ];

        if (image) {
            finalContent.push({
                type: 'image_url',
                image_url: { url: image }
            });
        }

        // 5. Select Model Based on Subscription
        const chatModel = isPro ? 'gpt-5-mini' : 'gpt-5-nano';

        console.log(`[Chat API] Model: ${chatModel}, isGlobal: ${isGlobal}, hasImage: ${!!image}, User: ${isPro ? 'PRO' : 'FREE'}`);

        const response = await openai.chat.completions.create({
            model: chatModel,
            messages: [systemMessage, ...conversationHistory, { role: 'user', content: finalContent }] as any,
            max_completion_tokens: 4096,
            stream: true,
        }).catch(err => {
            console.error('[OpenAI API Error]', err);
            throw err;
        });

        // 5. Return a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullAiResponse = '';
                try {
                    for await (const chunk of response) {
                        const content = (chunk.choices[0] as any)?.delta?.content || '';
                        if (content) {
                            fullAiResponse += content;
                            controller.enqueue(encoder.encode(content));
                        }
                    }

                    // After stream completes, save to DB if sessionId exists
                    if (sessionId && isGlobal) {
                        const lastUserMsg = messages[messages.length - 1];

                        // 1. Save User Message (with image if present)
                        await prisma.chatMessage.create({
                            data: {
                                sessionId,
                                role: 'user',
                                content: lastUserMsg.content,
                                image: image || null
                            }
                        });

                        // 2. Save Assistant Response
                        await prisma.chatMessage.create({
                            data: {
                                sessionId,
                                role: 'assistant',
                                content: fullAiResponse
                            }
                        });

                        // 3. Update Session Title if it's "New Chat"
                        const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
                        if (session?.title === 'New Chat') {
                            await prisma.chatSession.update({
                                where: { id: sessionId },
                                data: { title: lastUserMsg.content.substring(0, 40) + (lastUserMsg.content.length > 40 ? '...' : '') }
                            });
                        }
                    }
                } catch (err) {
                    console.error('[Stream Error]', err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('FULL AI ERROR:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.status === 400 ? 'Parameters error' : 'Server error'
        }, { status: 500 });
    }
}
