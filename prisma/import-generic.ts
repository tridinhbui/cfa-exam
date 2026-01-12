import { PrismaClient, CFALevel, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'question.json');
    if (!fs.existsSync(filePath)) {
        console.error('File question.json not found!');
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    try {
        const rawQuestions = JSON.parse(fileContent);

        console.log(`Found ${rawQuestions.length} questions to import.`);

        for (let i = 0; i < rawQuestions.length; i++) {
            const q = rawQuestions[i];

            // Map strings to Enums
            const difficulty = (q.difficulty as string).toUpperCase() as Difficulty;
            const cfaLevel = (q.cfaLevel as string).toUpperCase() as CFALevel;

            // Generate a unique ID based on topic and index if not provided, 
            // but here we use a consistent naming to avoid duplicates
            const questionId = `imported-${q.topicId}-${i + 1}`;

            await prisma.question.upsert({
                where: {
                    id: questionId
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
                    topicId: q.topicId === 'fixed_income' ? 'fixed-income' : q.topicId, // Normalize fixed-income slug
                    cfaLevel: cfaLevel,
                },
                create: {
                    id: questionId,
                    content: q.content,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    formula: q.formula,
                    difficulty: difficulty,
                    topicId: q.topicId === 'fixed_income' ? 'fixed-income' : q.topicId, // Normalize fixed-income slug
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
