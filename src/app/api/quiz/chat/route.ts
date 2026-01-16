import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

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
        const userId = authResult.uid;

        // 2. Check Subscription & Apply Strict Rate Limit for FREE users
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true }
        });

        const isFree = !user || user.subscription === 'FREE';

        if (isFree) {
            const limitResult = rateLimit(`chat_free_${userId}`, {
                limit: 3,         // Only 3 messages
                window: 3600000   // per hour
            });

            if (!limitResult.success) {
                return NextResponse.json({
                    error: 'Free tier quota: 3 messages per hour. Upgrade to PRO to chat as much as you want!',
                    isFree: true
                }, { status: 429 });
            }
        }

        const body = await req.json();
        const { messages, question, explanation, topic, options } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1]?.content || '';
        let relatedContext = '';

        // 3. Perform Vector Search (RAG) if message is substantial
        if (lastMessage.length > 10) {
            try {
                // Generate embedding for current query
                const embedResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: lastMessage,
                });
                const queryVector = embedResponse.data[0].embedding;

                // Search for top related content across all sources:
                // 1. Practice Questions
                // 2. Module Quiz Questions
                // 3. SchweserNotes PDF Chunks
                const relatedResults: any[] = await prisma.$queryRawUnsafe(`
                    WITH all_knowledge AS (
                        SELECT content, explanation, embedding, 'Practice Question' as source FROM "Question"
                        UNION ALL
                        SELECT prompt as content, explanation, embedding, 'Module Quiz' as source FROM "ModuleQuizQuestion"
                        UNION ALL
                        SELECT content, '' as explanation, embedding, "fileName" as source FROM "DocumentChunk"
                    )
                    SELECT content, explanation, source
                    FROM all_knowledge
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> $1::vector 
                    LIMIT 8
                `, `[${queryVector.join(',')}]`);

                if (relatedResults.length > 0) {
                    relatedContext = "\n\nAUTHORTATIVE CFA CONTENT & CONCEPTS FOUND:\n" +
                        relatedResults.map((q, i) =>
                            `[Source: ${q.source}]\nContent: ${q.content.substring(0, 500)}...\n${q.explanation ? `Explanation: ${q.explanation}\n` : ''}`
                        ).join('\n---\n');
                }
            } catch (err) {
                console.error('Vector Search Error:', err);
                // Continue without RAG if it fails
            }
        }

        const systemMessage = {
            role: 'system',
            content: `You are an expert CFA tutor at MentisAI. 
            
            CRITICAL INSTRUCTION: You have access to a specialized Knowledge Base (RAG) containing the actual CFA 2025 Curriculum, SchweserNotes Book 1, Book 2, Book 3, Book 4, and Practice Questions. 
            - ALWAYS prioritize the information provided in the "AUTHORTATIVE CFA CONTENT" section below over your general training data.
            - The provided content is in English, but you should respond in the same language as the student while maintaining technical accuracy.

            Context: The student is working on the question: "${question}".
            Options:
            - A: ${options?.A}
            - B: ${options?.B}
            - C: ${options?.C}
            
            Official Explanation: "${explanation}".
            
            ${relatedContext}
            
            INSTRUCTIONS:
            CRITICAL: JUST ANSWER THE QUESTION. NEVER ASK FOLLOW-UP QUESTIONS OR SUGGESTIVE QUESTIONS AT THE END (e.g., do not ask "Do you want me to check your answer?" or "Do you want to know more?"). 
            STOP IMMEDIATELY after providing the requested explanation.
            NEVER GET DISTRACTED BY UNRELATED QUESTIONS.
            DO NOT REVEAL OR EXPLAIN THE ANSWER CHOICE (A, B, or C) UNLESS THE STUDENT EXPLICITLY ASKS.
            1. If the user just says "Hi", "Hello", "Yo", or basic greetings, just greet them back briefly and STOP.
            2. Only provide deep explanations if requested. Focus on the "Why" and "How" of the underlying financial concepts.
            3. Keep all responses extremely concise, professional, and structured.
            4. Use LaTeX for ALL mathematical formulas and variables. 
               - Use double dollar signs for block formulas: $$formula$$.
               - Use single dollar signs for inline variables: $variable$.
            5. If the student asks something unrelated to CFA, politely redirect them back.
            6. FOR BROAD TOPICS: If the user asks about a wide subject (like a whole Reading title), provide a HIGH-LEVEL SUMMARY (bullet points) of the 3-5 most important concepts first. Do NOT try to explain everything in detail at once. Instead, ask: "Which of these specific areas would you like me to explain more deeply?"
            7. Use simple analogies for complex concepts.
`
        };

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [systemMessage, ...messages] as any,
            max_completion_tokens: 4096,
        });

        const choice = response.choices[0];
        let reply = choice?.message?.content;

        if (choice?.message?.refusal) {
            reply = `Refusal: ${choice.message.refusal}`;
        } else if (!reply) {
            reply = `Empty response. Reason: ${choice?.finish_reason}`;
        }

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('FULL AI ERROR:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.status === 400 ? 'Parameters error' : 'Server error'
        }, { status: 500 });
    }
}
