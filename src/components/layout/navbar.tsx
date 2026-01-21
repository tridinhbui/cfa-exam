'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  Crown,
  Home,
  Key,
  Coins,
  Bot,
  Library,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/lib/auth-utils';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, CreditCard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUserStore } from '@/store/user-store';
import { ProfileModal } from '@/components/profile-modal';
import { GlobalChatbot } from '@/components/chat/global-chatbot';
import { FeedbackModal } from '@/components/feedback-modal';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/lessons', label: 'Lessons', icon: Library },
  { href: '/quiz', label: 'Quiz', icon: BookOpen },
  { href: '/item-sets', label: 'Item Sets', icon: FileText },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const dbUser = useUserStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const [imgError, setImgError] = useState(false);
  const [chatLimit, setChatLimit] = useState<{ remaining: number, limit: number, type: string } | null>(null);

  const fetchChatLimit = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/quiz/chat/limit', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.remaining !== undefined) setChatLimit(data);
    } catch (err) {
      console.error('Failed to fetch chat limit', err);
    }
  };

  useEffect(() => {
    const handleRefresh = () => {
      console.log('Navbar: chat-limit-updated event received, refreshing...');
      setTimeout(fetchChatLimit, 100);
    };
    window.addEventListener('chat-limit-updated', handleRefresh);
    fetchChatLimit();
    return () => window.removeEventListener('chat-limit-updated', handleRefresh);
  }, [user]); // Removed pathname to stop spamming API on navigation

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              layoutId="brand-logo"
              className="flex h-10 w-10 items-center justify-center"
            >
              <Image
                src="/logo-brain-v3.png"
                alt="Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain brightness-125 saturate-150 drop-shadow-[0_0_8px_rgba(34,197,253,0.5)]"
              />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                Mentis<span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Master Your Exam</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-foreground border border-indigo-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {dbUser?.subscription === 'PRO' ? (
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 cursor-default">
                <Crown className="h-4 w-4 fill-cyan-400" />
                Pro Plan
              </Button>
            ) : (
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground">
                  <Crown className="h-4 w-4 text-amber-400" />
                  Upgrade
                </Button>
              </Link>
            )}

            {/* Coins Display */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0 rounded-full overflow-hidden">
                <img src="/images/coin-icon.png" alt="Coins" className="w-full h-full object-cover scale-150" />
              </div>
              <span className="text-xs sm:text-sm font-bold">{dbUser?.coins || 0}</span>
            </motion.div>

            {/* Chat Credits Stats */}
            {chatLimit && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-colors",
                  chatLimit.remaining > 0
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                )}
                title={chatLimit.type === 'PRO' ? "Daily AI Credits (60 per day)" : "Trial Credits (3 per day)"}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
                  <img src="/images/ai-avatar.png" alt="AI" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs sm:text-sm font-bold">{chatLimit.remaining}/{chatLimit.limit}</span>
              </motion.div>
            )}

            <ThemeToggle />

            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all shadow-lg shadow-indigo-500/5 group"
              onClick={() => setIsChatOpen(true)}
            >
              <div className="w-full h-full p-1.5 group-hover:scale-110 transition-transform">
                <img src="/images/ai-avatar.png" alt="Chat" className="w-full h-full object-contain" />
              </div>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80 transition-colors overflow-hidden border border-border ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {user?.photoURL && !imgError ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <User className="h-5 w-5 text-slate-300" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border text-foreground" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <Link href="/">
                  <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                </Link>
                {user?.providerData.some(provider => provider.providerId === 'password') && (
                  <Link href="/reset-password">
                    <DropdownMenuItem
                      className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Reset Password</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-accent hover:bg-accent/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <GlobalChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-background"
        >
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              Feedback
            </button>

            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
