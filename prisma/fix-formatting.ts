import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing unescaped dollar signs in quiz questions...');

    // Fetch all questions
    const questions = await prisma.moduleQuizQuestion.findMany();
    let fixCount = 0;

    for (const q of questions) {
        let updatedPrompt = q.prompt;
        let updatedOptionA = q.optionA;
        let updatedOptionB = q.optionB;
        let updatedOptionC = q.optionC;
        let updatedExplanation = q.explanation;

        // Function to escape unescaped dollar signs
        // It replaces $ with \$ ONLY if it's not already \$
        const escape$ = (text: string) => {
            if (!text) return text;
            // Negative lookbehind for \ is not supported in all environments, 
            // so we use a simpler regex or a split-join approach.
            // Split by \$ to keep them intact, then replace $ in the parts.
            return text.split('\\$')
                .map(part => part.replace(/\$/g, '\\$'))
                .join('\\$');
        };

        updatedPrompt = escape$(q.prompt);
        updatedOptionA = escape$(q.optionA);
        updatedOptionB = escape$(q.optionB);
        updatedOptionC = escape$(q.optionC);
        updatedExplanation = escape$(q.explanation);

        if (
            updatedPrompt !== q.prompt ||
            updatedOptionA !== q.optionA ||
            updatedOptionB !== q.optionB ||
            updatedOptionC !== q.optionC ||
            updatedExplanation !== q.explanation
        ) {
            await prisma.moduleQuizQuestion.update({
                where: { id: q.id },
                data: {
                    prompt: updatedPrompt,
                    optionA: updatedOptionA,
                    optionB: updatedOptionB,
                    optionC: updatedOptionC,
                    explanation: updatedExplanation
                }
            });
            fixCount++;
        }
    }

    console.log(`Finished. Fixed ${fixCount} questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
