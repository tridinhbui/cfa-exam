import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { uid, email, password } = await req.json();
        console.log('Update Password Request:', { uid, email, hasPassword: !!password });

        if (!password || (!uid && !email)) {
            return NextResponse.json({ error: 'Missing information for password reset' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.user.update({
                where: uid ? { id: uid } : { email: email.toLowerCase() },
                data: { password: hashedPassword },
            });
            console.log('Password updated in Supabase for:', user.email);
            return NextResponse.json({ message: 'Password updated successfully' });
        } catch (prismaError: any) {
            console.error('Prisma Update Error:', prismaError);
            if (prismaError.code === 'P2025') {
                return NextResponse.json({ error: 'User not found in database. Please make sure the email is correct.' }, { status: 404 });
            }
            throw prismaError;
        }
    } catch (error) {
        console.error('Global API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
