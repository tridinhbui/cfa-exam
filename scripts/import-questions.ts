import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const jsonPath = path.join(process.cwd(), 'question.json');
        if (!fs.existsSync(jsonPath)) {
            console.error('File question.json not found!');
            return;
        }

        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const questions = JSON.parse(fileContent);

        console.log(`Starting import of ${questions.length} questions...`);

        for (const q of questions) {
            const result = await prisma.question.create({
                data: {
                    content: q.content,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || '',
                    difficulty: q.difficulty || 'MEDIUM',
                    topicId: q.topicId,
                    cfaLevel: q.cfaLevel || 'LEVEL_1',
                    formula: q.formula,
                    losId: q.losId
                }
            });
            console.log(`✅ Imported: ${result.id}`);
        }

        console.log('--- Import completed successfully ---');
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
