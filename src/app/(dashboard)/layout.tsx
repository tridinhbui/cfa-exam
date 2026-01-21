'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { OnboardingTour } from '@/components/layout/onboarding-tour';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportChatModal } from '@/components/support-chat-modal';
import { useUiStore } from '@/store/ui-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isSupportModalOpen, setSupportModalOpen } = useUiStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
          />
          <p className="text-slate-400 font-medium animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <OnboardingTour />
      <main className="pt-16 lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      <SupportChatModal
        isOpen={isSupportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  );
}


