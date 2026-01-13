'use client';

import Image from 'next/image';

export function Footer() {
    return (
        <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                            <Image
                                src="/logo-brain-v3.png"
                                alt="Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6 object-contain dark:brightness-125 dark:saturate-125"
                            />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-300">MentisAI</span>
                    </div>

                    <div className="flex gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>

                    <p className="text-sm text-slate-600">
                        © 2024 MentisAI. Not affiliated with CFA Institute.
                    </p>
                </div>
            </div>
        </footer>
    );
}
