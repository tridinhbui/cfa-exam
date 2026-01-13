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

        const body = await req.json();
        const { messages, question, explanation, topic } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const systemMessage = {
            role: 'system',
            content: `You are an expert CFA tutor at MentisAI. 
            Context: The student is working on the question: "${question}".
            Official Explanation: "${explanation}".
            
            INSTRUCTIONS:
            1. If the user just says "Hi", "Hello", "Yo", or basic greetings, just greet them back briefly and ask how you can help with THIS specific question. DO NOT explain the question or provide formulas yet.
            2. Only provide deep explanations if the student asks a specific question about the concepts or the problem.
            3. Keep all responses extremely concise and structured.
            4. Use LaTeX for ALL mathematical formulas and variables. 
               - Use double dollar signs for block formulas: $$formula$$.
               - Use single dollar signs for inline variables or short formulas: $variable$.
               - NEVER use plain parentheses ( ) or square brackets [ ] for math formulas.
            5. If the student asks something unrelated to CFA or this question, politely redirect them back.`
        };

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [systemMessage, ...messages] as any,
            max_completion_tokens: 2048,
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
