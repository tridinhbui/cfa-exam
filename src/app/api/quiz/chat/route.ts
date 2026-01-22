import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { persistentChatLimit } from '@/lib/rate-limit';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        // 1. Parallel Step: Start Auth and Body parsing simultaneously
        const [authResult, body] = await Promise.all([
            verifyAuth(req),
            req.json()
        ]);

        if (authResult.error) {
            return authErrorResponse(authResult as { error: string, status: number });
        }
        const userId = authResult.uid as string;
        const { messages, question, explanation, topic, options, isGlobal, image, sessionId } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const lastMessageText = messages[messages.length - 1]?.content || '';

        // 2. Parallel Step: Fetch User and Generate Embedding together
        // Building this early saves hundreds of milliseconds
        const [user, embedResponse] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { subscription: true }
            }),
            lastMessageText.length > 5
                ? openai.embeddings.create({ model: 'text-embedding-3-small', input: lastMessageText })
                : Promise.resolve(null)
        ]);

        const isFree = !user || user.subscription === 'FREE';
        const isPro = user?.subscription === 'PRO';

        // 3. Parallel Step: Start Rate Limit check AND Vector Search at the same time
        // We trigger both and wait for all to finish before calling AI
        const limitCheckPromise = isFree
            ? persistentChatLimit(userId, { limit: 3, window: 86400000 })
            : persistentChatLimit(userId, { limit: 60, window: 86400000 });

        let relatedContext = '';
        if (embedResponse) {
            const queryVector = embedResponse.data[0].embedding;
            const vectorStr = `[${queryVector.join(',')}]`;

            // Parallel lookup in all sources using indices
            const [questions, quizQuestions, lessonChunks] = await Promise.all([
                prisma.$queryRawUnsafe<any[]>(`
                    SELECT content, explanation, 'Practice Question' as source, '' as metadata, (embedding <=> $1::vector) as distance
                    FROM "Question" WHERE embedding IS NOT NULL ORDER BY embedding <=> $1::vector LIMIT 7
                `, vectorStr),
                prisma.$queryRawUnsafe<any[]>(`
                    SELECT prompt as content, explanation, 'Module Quiz' as source, '' as metadata, (embedding <=> $1::vector) as distance
                    FROM "ModuleQuizQuestion" WHERE embedding IS NOT NULL ORDER BY embedding <=> $1::vector LIMIT 7
                `, vectorStr),
                prisma.$queryRawUnsafe<any[]>(`
                    SELECT lc.content, '' as explanation, CONCAT('Lesson: ', m.code, ' - ', m.title) as source, lc.type::text as metadata, (lc.embedding <=> $1::vector) as distance
                    FROM "LessonChunk" lc JOIN "Module" m ON lc."moduleId" = m.id
                    WHERE lc.embedding IS NOT NULL ORDER BY lc.embedding <=> $1::vector LIMIT 7
                `, vectorStr)
            ]);

            const combinedResults = [...questions, ...quizQuestions, ...lessonChunks]
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 6);

            if (combinedResults.length > 0) {
                relatedContext = "\n\nAUTHORITATIVE CFA KNOWLEDGE BASE SEGMENTS:\n" +
                    combinedResults.map(q =>
                        `[Source: ${q.source}]${q.metadata ? ` [Type: ${q.metadata}]` : ''}\nContent: ${q.content.substring(0, 1000)}\n${q.explanation ? `Expert Note: ${q.explanation}\n` : ''}`
                    ).join('\n---\n');
            }
        }

        // Now we MUST ensure the rate limit check has finished before proceeding
        const limitResult = await limitCheckPromise;
        if (!limitResult.success) {
            return NextResponse.json({
                error: isFree
                    ? 'Free tier quota: 3 messages per 24 hours. Upgrade to PRO for 60/day!'
                    : 'PRO tier daily quota: 60 messages per day reached.',
                isFree,
                isPro
            }, { status: 429 });
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
            - IF THE STUDENT EXPLICITLY ASKS FOR THE ANSWER (e.g., "give me the answer", "what is the correct option", "reveal the answer"), you MUST provide the correct answer (A, B, or C) and explain the logic clearly. 
            - Otherwise, prioritize guiding them to the answer without revealing it immediately.
            - NO SUGGESTIVE QUESTIONS at the end (e.g., "Do you want to know more?"). Stop immediately after giving the response.
            - FOR BROAD TOPICS: If the user asks about a wide subject (like a whole Reading title), provide a HIGH-LEVEL SUMMARY (bullet points) of the 3-5 most important concepts first.
            - USE SIMPLE ANALOGIES for complex financial concepts.
            - FOR GLOBAL ADVISOR: Focus on high-level strategy, connecting different CFA topics, and providing deep conceptual clarity.
            - FOR QUIZ ASSISTANT: Focus on the logic of the specific question and clarifying the official explanation.
            - BRAND IDENTITY: If the user asks what model you are using or who programmed/created you, ALWAYS answer that you are a product "developed by the MentisAI team". Do not mention OpenAI or specific model names like GPT.
            - CITE SOURCES: If you used information from the RAG Knowledge Base to answer, YOU *MUST* APPEND a citation line at the very end of your response. Format: "**Source:** [Reading X, Module Y] - [Title]". Use the information provided in the "Source" field of the context segments.`
        };

        // Prepare conservation history
        const conversationHistory = messages.slice(0, -1);

        // Prepare final message
        const finalContent: any[] = [
            { type: 'text', text: lastMessageText || "Please explain this image for me." }
        ];

        if (image) {
            finalContent.push({
                type: 'image_url',
                image_url: { url: image }
            });
        }

        // 5. Select Model Based on Subscription
        const chatModel = isPro ? 'gpt-4o-mini' : 'gpt-4o-mini';

        console.log(`[Chat API] Model: ${chatModel}, isGlobal: ${isGlobal}, hasImage: ${!!image}, User: ${isPro ? 'PRO' : 'FREE'}`);

        // 6. Call OpenAI with Caching-optimized structure
        // We put System Prompt and RAG context (the heaviest parts) at the TOP
        // This ensures subsequent follow-up questions hit the Input Cache (75% discount)
        const chatMessages: any[] = [systemMessage];

        // If we have RAG context, we provide it as a dedicated context block early on
        if (relatedContext) {
            chatMessages.push({
                role: 'system',
                content: `SYSTEM KNOWLEDGE BASE (Use this content as the authoritative source for your response): \n\n${relatedContext}`
            });
        }

        // Then we add conversation history and the final user message
        chatMessages.push(...conversationHistory);
        chatMessages.push({ role: 'user', content: finalContent });

        const response = await openai.chat.completions.create({
            model: chatModel,
            messages: chatMessages as any,
            max_completion_tokens: 4096,
            stream: true,
            // temperature: 0.3, // REMOVED: o-series models don't support temperature
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
