import { PrismaClient, CFALevel, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'ethicquestion.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Fix malformed JSON (multiple arrays [][][]) into a single array
    // We'll replace "]\n[" with "," and wrap or just parse objects
    // A safer way: find all objects {...}
    const questions: any[] = [];

    // The file is likely multiple arrays. Let's try to normalize it.
    const normalizedContent = fileContent
        .trim()
        .replace(/\]\s*\[/g, ',');

    try {
        const rawQuestions = JSON.parse(normalizedContent);

        console.log(`Found ${rawQuestions.length} questions to import.`);

        for (let i = 0; i < rawQuestions.length; i++) {
            const q = rawQuestions[i];

            // Map strings to Enums
            const difficulty = q.difficulty as Difficulty;
            const cfaLevel = q.cfaLevel as CFALevel;

            // Use 'ethics' as the topicId since that's what we have in DB
            const targetTopicId = 'ethics';

            await prisma.question.upsert({
                where: {
                    // Since the JSON doesn't provide IDs, we'll generate one or use content hash
                    // For now, let's generate a unique ID based on index or content to avoid duplicates if run twice
                    id: `ethics-l1-${i + 1}`
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
                    id: `ethics-l1-${i + 1}`,
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

        console.log('Import successful!');
    } catch (error) {
        console.error('Failed to parse or import questions:', error);
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
