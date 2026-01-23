import { PrismaClient, Difficulty, CFALevel } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'equity.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(fileContent);

        console.log(`Found ${questions.length} questions in JSON file.`);

        let count = 0;
        let skipped = 0;
        for (const q of questions) {
            const existingQuestion = await prisma.question.findFirst({
                where: {
                    content: q.content,
                    topicId: q.topicId
                }
            });

            if (existingQuestion) {
                console.log(`Skipping existing question: ${q.content.substring(0, 30)}...`);
                skipped++;
                continue;
            }

            await prisma.question.create({
                data: {
                    content: q.content,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty as Difficulty,
                    topicId: q.topicId,
                    cfaLevel: q.cfaLevel as CFALevel,
                }
            });
            count++;
            console.log(`Imported question ${count}: ${q.content.substring(0, 50)}...`);
        }

        console.log(`Summary: Imported ${count} new questions. Skipped ${skipped} existing questions.`);

    } catch (error) {
        console.error('Error importing questions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
