
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Patterns that indicate likely formatting issues based on our recent debugging
const SUSPICIOUS_PATTERNS = [
    {
        name: 'Escaped Block Math',
        regex: /\\\$\\\$/g,
        desc: 'Contains \\$\\$ (escaped $$), causing raw text display'
    },
    {
        name: 'Escaped Math Command',
        regex: /\\\$\s*\\/g,
        desc: 'Contains \\$\\ (e.g. \\$\\frac), preventing math rendering'
    },
    {
        name: 'Nested Math Delimiters',
        regex: /\(\s*\$/g,
        desc: 'Contains ($ pattern'
    },
    {
        name: 'Back-to-Back Math',
        regex: /\$\)\s*\(/g,
        desc: 'Contains $) ( pattern'
    },
    {
        name: 'Mixed Math/Currency Confusion',
        regex: /\\\$(?=[0-9])(?=.*\\frac)/g, // Heuristic: Escaped dollar before number, but string also has fractions
        desc: 'Currency \\$ and Math \\frac mixed in same string (manual review advised)'
    }
];

async function main() {
    console.log('🔍 Starting Comprehensive Question Audit...');

    const questions = await prisma.moduleQuizQuestion.findMany({
        include: {
            header: {
                include: {
                    module: true
                }
            }
        }
    });

    console.log(`Loaded ${questions.length} questions. Scanning...`);
    console.log('------------------------------------------------');

    let issuesFound = 0;
    let questionsWithIssues = 0;

    for (const q of questions) {
        let qHasIssues = false;
        const fieldsToCheck = {
            Prompt: q.prompt,
            Explanation: q.explanation || '',
            OptionA: q.optionA,
            OptionB: q.optionB,
            OptionC: q.optionC
        };

        const foundInThisQ: string[] = [];

        for (const [fieldName, content] of Object.entries(fieldsToCheck)) {
            if (!content) continue;

            for (const pattern of SUSPICIOUS_PATTERNS) {
                if (pattern.regex.test(content)) {
                    foundInThisQ.push(`[${fieldName}] ${pattern.name}: ${pattern.desc}`);
                    issuesFound++;
                    qHasIssues = true;
                }
            }
        }

        if (qHasIssues) {
            questionsWithIssues++;
            console.log(`\n🚩 Issue in QID: ${q.id}`);
            console.log(`   Module: ${q.header.module.title} (${q.header.module.code})`);
            foundInThisQ.forEach(msg => console.log(`   - ${msg}`));
            // Preview context (first 100 chars of flagged content)
            // console.log(`   Context: ${q.prompt.substring(0, 100)}...`);
        }
    }

    console.log('------------------------------------------------');
    console.log('Audit Complete.');
    console.log(`Questions Scanned: ${questions.length}`);
    console.log(`Questions with Issues: ${questionsWithIssues}`);
    console.log(`Total Issues Found: ${issuesFound}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
