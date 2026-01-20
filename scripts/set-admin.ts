
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
        console.error(`Error promoting user: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
