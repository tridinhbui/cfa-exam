
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'finbud.app@gmail.com';

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                subscription: 'PRO'
            },
        });
        console.log(`Successfully promoted ${email} to ADMIN`);
        console.log(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error promoting user: ${message}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
