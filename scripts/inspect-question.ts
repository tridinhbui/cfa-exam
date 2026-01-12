
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Searching for Module 30.1 questions...');

    const module = await prisma.module.findFirst({
        where: {
            OR: [
                { code: { contains: '30.1' } },
                { title: { contains: '30.1' } }
            ]
        },
        include: {
            quizHeader: {
                include: {
                    questions: {
                        orderBy: { questionNo: 'asc' }
                    }
                }
            }
        }
    });

    if (!module) {
        console.log('Module 30.1 not found.');
        return;
    }

    console.log(`Found Module: ${module.title} (${module.code})`);

    if (!module.quizHeader) {
        console.log('No quiz header found for this module.');
        return;
    }

    const questions = module.quizHeader.questions;
    console.log(`Found ${questions.length} questions.`);

    const q2 = questions.find(q => q.questionNo === 2);

    if (q2) {
        console.log('------------------------------------------------');
        console.log(`QUESTION 2 (ID: ${q2.id})`);
        console.log('Raw Prompt:', JSON.stringify(q2.prompt));
        console.log('Raw Explanation:', JSON.stringify(q2.explanation));
        console.log('------------------------------------------------');
    } else {
        console.log('Question 2 not found.');
        questions.forEach(q => console.log(`Q${q.questionNo}: ${q.id.substring(0, 8)}...`));
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
