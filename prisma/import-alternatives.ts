import { PrismaClient, CFALevel, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'altsinvest.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Fix malformed JSON (multiple arrays [][][]) into a single array
    let normalizedContent = fileContent
        .trim()
        .replace(/\]\s*\[/g, ',');

    // Remove any trailing characters after the last ']'
    const lastBracketIndex = normalizedContent.lastIndexOf(']');
    if (lastBracketIndex !== -1) {
        normalizedContent = normalizedContent.substring(0, lastBracketIndex + 1);
    }

    try {
        const rawQuestions = JSON.parse(normalizedContent);

        console.log(`Found ${rawQuestions.length} Alternative Investments questions to import.`);

        for (let i = 0; i < rawQuestions.length; i++) {
            const q = rawQuestions[i];

            // Map strings to Enums
            const difficulty = (q.difficulty as string).toUpperCase() as Difficulty;
            const cfaLevel = (q.cfaLevel as string).toUpperCase() as CFALevel;

            // Target topic ID is 'alts' (matching the slug in seed.ts)
            const targetTopicId = 'alts';

            await prisma.question.upsert({
                where: {
                    id: `alt-l1-${i + 1}`
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
                    id: `alt-l1-${i + 1}`,
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

        console.log('Alternative Investments import successful!');
    } catch (error) {
        console.error('Failed to parse or import Alternative Investments questions:', error);
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
