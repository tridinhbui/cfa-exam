
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const videoUrl = 'https://www.youtube.com/watch?v=FmVBqrMYreM';

    // Find all modules with code 10.2 or 10.3 that belong to book-1
    const modules = await prisma.module.findMany({
        where: {
            code: { in: ['10.2', '10.3'] },
            reading: {
                bookId: 'book-1'
            }
        },
        include: {
            reading: true
        }
    });

    console.log(`Found ${modules.length} modules in Book 1 with codes 10.2 or 10.3`);

    for (const module of modules) {
        try {
            // Check if lessonContent exists for this module
            const existing = await (prisma.lessonContent as any).findUnique({
                where: { moduleId: module.id }
            });

            if (existing) {
                // Update only the videoUrl field
                await (prisma.lessonContent as any).update({
                    where: { moduleId: module.id },
                    data: { videoUrl: videoUrl }
                });
                console.log(`✅ Updated videoUrl for module ${module.code} (${module.id})`);
            } else {
                // Create new record with only videoUrl (content will be null/empty)
                await (prisma.lessonContent as any).create({
                    data: {
                        moduleId: module.id,
                        videoUrl: videoUrl
                    }
                });
                console.log(`✅ Created lessonContent with videoUrl for module ${module.code} (${module.id})`);
            }
        } catch (error) {
            console.error(`❌ Error updating module ${module.code}:`, (error as any).message);
        }
    }

    console.log('Video URL update completed for Book 1 modules 10.2 and 10.3');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
