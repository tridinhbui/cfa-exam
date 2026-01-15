import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string | null;
  cfaLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  subscription: 'FREE' | 'PRO';
  coins: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  dailyQuestionsUsed: number;
  lastQuestionDate: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  incrementDailyQuestions: () => void;
  canAnswerQuestion: () => boolean;
  getDailyLimit: () => number;
  getRemainingQuestions: () => number;
}

const DAILY_FREE_LIMIT = 30;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      dailyQuestionsUsed: 0,
      lastQuestionDate: null,

      setUser: (user) => set({ user, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),

      incrementDailyQuestions: () => {
        const today = new Date().toDateString();
        const { lastQuestionDate, dailyQuestionsUsed } = get();

        if (lastQuestionDate !== today) {
          set({ dailyQuestionsUsed: 1, lastQuestionDate: today });
        } else {
          set({ dailyQuestionsUsed: dailyQuestionsUsed + 1 });
        }
      },

      canAnswerQuestion: () => {
        const { user, dailyQuestionsUsed, lastQuestionDate } = get();
        const today = new Date().toDateString();

        // Premium users have unlimited access
        if (user?.subscription !== 'FREE') return true;

        // Reset count if new day
        if (lastQuestionDate !== today) return true;

        return dailyQuestionsUsed < DAILY_FREE_LIMIT;
      },

      getDailyLimit: () => {
        const { user } = get();
        return user?.subscription === 'FREE' ? DAILY_FREE_LIMIT : Infinity;
      },

      getRemainingQuestions: () => {
        const { user, dailyQuestionsUsed, lastQuestionDate } = get();
        const today = new Date().toDateString();

        if (user?.subscription !== 'FREE') return Infinity;
        if (lastQuestionDate !== today) return DAILY_FREE_LIMIT;

        return Math.max(0, DAILY_FREE_LIMIT - dailyQuestionsUsed);
      },
    }),
    {
      name: 'cfa-user-store',
      partialize: (state) => ({
        dailyQuestionsUsed: state.dailyQuestionsUsed,
        lastQuestionDate: state.lastQuestionDate,
      }),
    }
  )
);


