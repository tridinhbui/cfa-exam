'use client';

import { motion } from 'framer-motion';
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

const features = [
  {
    icon: BookOpen,
    title: 'MCQ Practice',
    description: 'Thousands of practice questions organized by topic with detailed explanations.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: FileText,
    title: 'Item Set Simulator',
    description: 'Practice Level II style vignettes with real exam-like conditions.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: GraduationCap,
    title: 'Essay Grading',
    description: 'AI-powered scoring for Level III constructed responses with detailed feedback.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Track your progress and identify weak areas with performance insights.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description: '3-month structured roadmap tailored to your exam date.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI Explanations',
    description: 'Get instant, personalized explanations for every question.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CFA Practice</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="absolute top-60 -left-40 w-80 h-80 rounded-full bg-violet-500/20 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered CFA Preparation
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Master Your{' '}
              <span className="gradient-text">CFA Exam</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
            >
              Practice with real exam-style questions, get instant AI feedback, 
              and track your progress. Join thousands of successful CFA candidates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <Button size="xl" className="w-full sm:w-auto">
                  Start Practicing Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                View Demo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Free 30 Questions Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Real Exam Timing</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <span>LOS Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>50,000+ Users</span>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    className="text-3xl sm:text-4xl font-bold gradient-text"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Pass
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our comprehensive platform covers all CFA levels with tools designed 
              to maximize your learning efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">All Levels</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Prepare for Any CFA Level
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Badge variant={level.color} className="mb-4">
                      {level.level}
                    </Badge>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      CFA {level.level}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                      {level.topics}
                    </p>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full">
                        Start {level.level}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your CFA Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of successful candidates. Start with 30 free questions daily.
            </p>
            <Link href="/dashboard">
              <Button size="xl" className="glow-indigo">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">CFA Practice Platform</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 CFA Practice. Not affiliated with CFA Institute.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
