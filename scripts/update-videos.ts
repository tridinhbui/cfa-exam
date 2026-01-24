
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const videoData = [
        {
            moduleId: 'cmk8lppl90001l1bx18x8f0f0', // Module 1.1
            videoUrl: 'https://www.youtube.com/watch?v=QIl6JH_PuW8',
            title: 'Rates and Returns'
        },
        {
            moduleId: 'cmk8lppoj0003l1bxrttf1igy', // Module 1.2
            videoUrl: 'https://www.youtube.com/watch?v=gz8oox7NRxU',
            title: 'Money-Weighted and Time-Weighted Returns'
        },
        {
            moduleId: 'cmk8lpprq0005l1bx2v8sbx9t', // Module 1.3
            videoUrl: 'https://www.youtube.com/watch?v=kL7SjhDCMQM',
            title: 'Other Return Measures'
        }
    ];

    console.log('Updating video URLs and content placeholders...');

    for (const item of videoData) {
        try {
            const existing = await prisma.lessonContent.findUnique({ where: { moduleId: item.moduleId } });
            const newContent = existing?.content.includes('Video Lecture:')
                ? existing.content
                : `${existing?.content || ''}\n\n---\n**Video Lecture:** ${item.videoUrl}`;

            await prisma.lessonContent.upsert({
                where: { moduleId: item.moduleId },
                update: {
                    videoUrl: item.videoUrl,
                    content: newContent
                },
                create: {
                    moduleId: item.moduleId,
                    videoUrl: item.videoUrl,
                    content: `# ${item.title}\n\n**Video Lecture:** ${item.videoUrl}\n\nContent for this module is being enriched.`
                }
            });
            console.log(`✅ Upserted video/content for module ${item.moduleId}`);
        } catch (error) {
            console.error(`❌ Failed to process module ${item.moduleId}:`, error.message);
        }
    }

    console.log('Update completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
