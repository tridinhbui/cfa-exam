'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/loading-screen';
import { Starfield } from '@/components/starfield';
import { PricingSection } from '@/components/pricing-section';

// Extracted Components
import { LandingNavbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero';
import { MissionSection } from '@/components/landing/mission';
import { FeaturesSection } from '@/components/landing/features';
import { WhyChooseUsSection } from '@/components/landing/why-choose-us';
import { CurriculumSection } from '@/components/landing/curriculum';
import { CTASection } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

type LoadingState = 'loading' | 'exiting' | 'complete';

export default function LandingPage() {
  const { user, preloaderSeen, setPreloaderSeen } = useAuth();
  const dbUser = useUserStore((state) => state.user);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (preloaderSeen) {
      setLoadingState('complete');
      return;
    }

    const exitTimer = setTimeout(() => setLoadingState('exiting'), 1500);
    const completeTimer = setTimeout(() => {
      setLoadingState('complete');
      setPreloaderSeen(true);
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [preloaderSeen, setPreloaderSeen]);

  return (
    <div className="min-h-screen relative bg-slate-950 light:bg-slate-50 transition-colors duration-500">
      {mounted && theme === 'dark' && <Starfield />}

      <AnimatePresence>
        {loadingState !== 'complete' && <LoadingScreen isExiting={loadingState === 'exiting'} />}
      </AnimatePresence>

      {loadingState === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <LandingNavbar
            user={user}
            dbUserSubscription={dbUser?.subscription}
            loadingState={loadingState}
          />

          <main>
            <HeroSection user={user} />
            <MissionSection />
            <FeaturesSection />
            <WhyChooseUsSection />
            <CurriculumSection user={user} />

            {/* Pricing Section - Hide if user is PRO */}
            {dbUser?.subscription !== 'PRO' && <PricingSection />}

            <CTASection user={user} />
          </main>

          <Footer />
        </motion.div>
      )}
    </div>
  );
}
