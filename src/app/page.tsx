'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Clock,
  Target,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroAnalytics } from '@/components/hero-analytics';
import { HeroQuiz } from '@/components/hero-quiz';
import { MissionChat } from '@/components/mission-chat';
import { CyclingBadge } from '@/components/cycling-badge';
import { LoadingScreen } from '@/components/loading-screen';
import { ThreeDCard } from '@/components/three-d-card';
import { Starfield } from '@/components/starfield';
import { FeatureCard } from '@/components/features/feature-card';
import { MockExam, MockAnalytics, MockPlanner, MockEssay, MockItemSet } from '@/components/features/mockups';
import { PricingSection } from '@/components/pricing-section';

import { useAuth } from '@/context/auth-context';
import { logout } from '@/lib/auth-utils';

const features = [
  {
    icon: BookOpen,
    title: 'MCQ Practice',
    description: 'Thousands of practice questions organized by topic with detailed explanations.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    className: 'md:col-span-2',
  },
  {
    icon: FileText,
    title: 'Item Set Simulator',
    description: 'Practice Level II style vignettes with real exam-like conditions. Master the art of extracting relevant data from complex case studies.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    className: 'md:col-span-1 md:row-span-2',
  },
  {
    icon: GraduationCap,
    title: 'Essay Grading',
    description: 'AI-powered scoring for Level III constructed responses.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    className: 'md:col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Track your progress and identify weak areas.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    className: 'md:col-span-1',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description: '3-month structured roadmap tailored to your exam date. Dynamic adjustments based on your pace.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    className: 'md:col-span-2',
  },
  {
    icon: Sparkles,
    title: 'AI Explanations',
    description: 'Get instant, personalized explanations.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    className: 'md:col-span-1',
  },
];

const stats = [
  { value: '10,000+', label: 'Practice Questions' },
  { value: '500+', label: 'Item Sets' },
  { value: '200+', label: 'Essay Prompts' },
  { value: '92%', label: 'Pass Rate' },
];

const levels = [
  { level: 'Level I', topics: 'Ethics, Quant, Economics, FRA, Corporate, Equity, Fixed Income, Derivatives, Alts, PM', color: 'level1' as const },
  { level: 'Level II', topics: 'Advanced Valuation, Financial Reporting, Risk Management, Item Set Focus', color: 'level2' as const },
  { level: 'Level III', topics: 'Portfolio Management, Wealth Planning, Essay Writing, Ethics Integration', color: 'level3' as const },
];


type LoadingState = 'loading' | 'exiting' | 'complete';

export default function LandingPage() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const { user } = useAuth();

  useEffect(() => {
    const exitTimer = setTimeout(() => setLoadingState('exiting'), 2500);
    const completeTimer = setTimeout(() => setLoadingState('complete'), 3100);
    return () => { clearTimeout(exitTimer); clearTimeout(completeTimer); };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Starfield />
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
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* 
                   Logo Container 
                   Only render the motion logo when loading is complete to enable layout animation 
                   from the central loading logo to here
                */}
                  {loadingState === 'complete' && (
                    <motion.div
                      layoutId="brand-logo"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      style={{ opacity: 1 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
                      transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <GraduationCap className="h-6 w-6 text-white" />
                    </motion.div>
                  )}

                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg font-bold text-white tracking-tight"
                  >
                    CFA <span className="text-indigo-400">Prep</span> AI
                  </motion.span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                  <Link href="#mission" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Mission</Link>
                  <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                  <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-300 hidden sm:inline-block">Hi, {user.displayName?.split(' ')[0]}</span>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">Dashboard</Button>
                      </Link>
                      <Button
                        onClick={() => logout()}
                        variant="ghost"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">Sign In</Button>
                      </Link>
                      <Link href={user ? "/dashboard" : "/login"}>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-[1.02]">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="relative pt-16 pb-20 lg:pt-24 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-[100%] blur-[120px] opacity-50 mix-blend-screen" />
              <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] opacity-30" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400 mr-2" />
                  <span className="text-indigo-200 text-sm font-medium">AI-Powered CFA Preparation</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8"
                >
                  Study CFA® <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Smarter.</span> <br className="hidden sm:block" />
                  Not Harder.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                  Master the curriculum with an intelligent platform that
                  <span className="text-slate-200 font-medium"> adapts to your learning style</span>,
                  closes knowledge gaps efficiently, and makes studying actually feel rewarding.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
                >
                  <Link href={user ? "/dashboard" : "/login"}>
                    <Button size="xl" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105 rounded-full">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="xl" className="h-14 px-8 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm rounded-full">
                    See How It Works
                  </Button>
                </motion.div>
              </div>

              {/* Floating Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto max-w-5xl perspective-[2000px] group"
              >
                {/* Glowing background blob */}
                <div className="absolute -inset-10 bg-indigo-500/20 blur-[60px] -z-10 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

                {/* Stacked 3D Mockups */}
                <div className="relative w-full aspect-[16/10] lg:aspect-[16/9]">
                  {/* Layer 1: Dashboard (Nằm dưới) */}
                  <ThreeDCard
                    perspective={2000}
                    rotateX={15}
                    rotateY={20}
                    rotateZ={-5}
                    scale={0.9}
                    className="absolute inset-0 w-full h-full"
                  >
                    <HeroAnalytics />
                  </ThreeDCard>

                  {/* Layer 2: Quiz (Nằm trên - Dịch xuống dưới và sang phải một chút) */}
                  <ThreeDCard
                    perspective={2000}
                    rotateX={15}
                    rotateY={20}
                    rotateZ={-5}
                    scale={0.9}
                    className="absolute inset-0 w-full h-full translate-x-8 translate-y-16 z-20"
                  >
                    <HeroQuiz />
                  </ThreeDCard>
                </div>
              </motion.div>

              {/* Proof Highlights Row */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                    <span className="text-slate-400 font-medium whitespace-nowrap">Free 30 Questions Daily</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-amber-400" />
                    <span className="text-slate-400 font-medium whitespace-nowrap">Real Exam Timing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-indigo-400" />
                    <span className="text-slate-400 font-medium whitespace-nowrap">LOS Aligned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-violet-400" />
                    <span className="text-slate-400 font-medium whitespace-nowrap">50,000+ Users</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section from Image */}
          <section className="relative py-12 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full p-8 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm text-center transition-all duration-300 group-hover:bg-slate-900/60 group-hover:border-white/10 group-hover:-translate-y-1">
                      <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-2">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-slate-500 tracking-wide uppercase group-hover:text-slate-400 transition-colors">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section id="mission" className="py-24 bg-slate-950/50 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-4">Our Mission</p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    Making CFA® Prep <br />
                    <span className="text-indigo-400 leading-relaxed">Accessible</span> &
                    <CyclingBadge />
                  </h2>


                  <div className="space-y-6 mb-10">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      <p className="text-slate-400"><span className="text-slate-200 font-medium">Curated Content:</span> Rigorously reviewed by charterholders to ensure accuracy and relevance.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                      <p className="text-slate-400"><span className="text-slate-200 font-medium">Real Conditions:</span> Interface designed to mirror the actual computer-based testing environment.</p>
                    </div>
                  </div>

                </motion.div>

                {/* Mission Visual - Replaced with Chat UI */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <MissionChat />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 relative bg-slate-900/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">Features</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-6">
                  Designed for CFA® Exam Success
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Our comprehensive platform covers all CFA levels with AI-driven tools designed
                  to maximize your learning efficiency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
                {/* Visual Bento Grid */}

                {/* 1. Practice Questions (Mock Exam) */}
                <FeatureCard
                  title="MCQ Practice"
                  description="Thousands of practice questions organized by topic with detailed explanations."
                  icon={BookOpen}
                  iconColor="text-indigo-400"
                  className="md:col-span-2"
                  delay={0}
                >
                  <MockExam />
                </FeatureCard>

                {/* 2. Smart Analytics */}
                <FeatureCard
                  title="Smart Analytics"
                  description="Track your progress and identify weak areas instantly."
                  icon={BarChart3}
                  iconColor="text-emerald-400"
                  className="md:col-span-1"
                  delay={0.1}
                >
                  <MockAnalytics />
                </FeatureCard>

                {/* 3. Item Set Simulator */}
                <FeatureCard
                  title="Item Set Simulator"
                  description="Practice Level II style vignettes with real exam-like conditions."
                  icon={FileText}
                  iconColor="text-purple-400"
                  className="md:col-span-1 md:row-span-2"
                  delay={0.2}
                >
                  <MockItemSet />
                </FeatureCard>

                {/* 4. Study Planner */}
                <FeatureCard
                  title="Dynamic Study Planner"
                  description="3-month structured roadmap tailored to your exam date."
                  icon={Calendar}
                  iconColor="text-rose-400"
                  className="md:col-span-2"
                  delay={0.3}
                >
                  <MockPlanner />
                </FeatureCard>

                {/* 5. AI Essay Grading */}
                <FeatureCard
                  title="Essay Grading"
                  description="AI-powered scoring for Level III constructed responses."
                  icon={GraduationCap}
                  iconColor="text-amber-400"
                  className="md:col-span-1"
                  delay={0.4}
                >
                  <MockEssay />
                </FeatureCard>

                {/* 6. Simple Text Card (or repurpose) */}
                <FeatureCard
                  title="AI Explanations"
                  description="Get instant, personalized explanations for any concept."
                  icon={Sparkles}
                  iconColor="text-cyan-400"
                  className="md:col-span-1"
                  delay={0.5}
                >
                  {/* Using a smaller version of MissionChat essentially */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 w-full max-w-[250px] shadow-lg">
                      <div className="flex gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-xs text-slate-300">
                          Can you explain <span className="text-indigo-400">convexity</span>?
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 leading-relaxed border border-white/5">
                        Convexity measures the curvature in the relationship between bond prices and yields...
                      </div>
                    </div>
                  </div>
                </FeatureCard>
              </div>
            </div>

          </section>

          {/* Levels Section */}
          <section className="py-24 bg-slate-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">Curriculum</span>
                <h2 className="text-4xl font-bold text-white mt-3 mb-6">
                  Prepare for Any CFA® Level
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {levels.map((level, index) => {
                  const badgeColors = {
                    level1: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                    level2: "bg-violet-500/10 text-violet-400 border-violet-500/20",
                    level3: "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }[level.color];

                  return (
                    <motion.div
                      key={level.level}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="h-full relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-900/60 group-hover:border-white/10 group-hover:-translate-y-1 flex flex-col">
                        <div className="flex justify-start mb-6">
                          <Badge className={`${badgeColors} border px-3 py-1 font-medium rounded-full text-xs`}>
                            {level.level}
                          </Badge>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4">
                          CFA {level.level}
                        </h3>

                        <p className="text-slate-400 text-sm mb-10 leading-relaxed flex-grow">
                          {level.topics}
                        </p>

                        <Link href={user ? "/dashboard" : "/login"} className="block w-full">
                          <Button variant="outline" className="w-full h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium flex items-center justify-center gap-2 rounded-xl transition-all">
                            Start {level.level}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <PricingSection />

          {/* CTA Section */}
          <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                  Ready to Crush Your Exam?
                </h2>
                <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                  Join thousands of successful candidates who trusted our AI-driven platform.
                  Start with 30 free questions today.
                </p>
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button size="xl" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-14 px-10 rounded-full shadow-2xl shadow-indigo-900/50 hover:scale-105 transition-transform">
                    Get Started for Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 bg-slate-950 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 opacity-80 decoration-clone">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-300">CFA Prep AI</span>
                </div>

                <div className="flex gap-8 text-sm text-slate-500">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>

                <p className="text-sm text-slate-600">
                  © 2024 CFA Prep AI. Not affiliated with CFA Institute.
                </p>
              </div>
            </div>
          </footer>
        </motion.div>
      )
      }
    </div >
  );
}
