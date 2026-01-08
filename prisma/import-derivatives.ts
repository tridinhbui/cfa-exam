import { PrismaClient, CFALevel, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'derivative.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Fix malformed JSON (multiple arrays [][][]) into a single array
    const normalizedContent = fileContent
        .trim()
        .replace(/\]\s*\[/g, ',');

    try {
        const rawQuestions = JSON.parse(normalizedContent);

        console.log(`Found ${rawQuestions.length} Derivatives questions to import.`);

        for (let i = 0; i < rawQuestions.length; i++) {
            const q = rawQuestions[i];

            // Map strings to Enums
            const difficulty = (q.difficulty as string).toUpperCase() as Difficulty;
            const cfaLevel = (q.cfaLevel as string).toUpperCase() as CFALevel;

            // Target topic ID is 'derivatives' (matching the slug in seed.ts)
            const targetTopicId = 'derivatives';

            await prisma.question.upsert({
                where: {
                    id: `derivatives-l1-${i + 1}`
                },
                update: {
                    content: q.content,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    formula: q.formula,
                    difficulty: difficulty,
                    topicId: targetTopicId,
                    cfaLevel: cfaLevel,
                },
                create: {
                    id: `derivatives-l1-${i + 1}`,
                    content: q.content,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    formula: q.formula,
                    difficulty: difficulty,
                    topicId: targetTopicId,
                    cfaLevel: cfaLevel,
                },
            });
        }

        console.log('Derivatives import successful!');
    } catch (error) {
        console.error('Failed to parse or import Derivatives questions:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
