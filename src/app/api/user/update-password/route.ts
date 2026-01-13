import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;

        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);
        // Never trust identifying information (like email or uid) sent in the request body 
        // for sensitive operations like password changes.
        const secureUid = authResult.uid;

        console.log('Update Password Request for UID:', secureUid);

        if (!password) {
            return NextResponse.json({ error: 'Missing new password' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.user.update({
                where: { id: secureUid },
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
