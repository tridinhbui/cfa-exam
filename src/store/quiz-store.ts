import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface QuizQuestion {
  id: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  formula?: string | null;
  topic: {
    id: string;
    name: string;
  };
  isModuleQuiz?: boolean;
}

interface StashedExam {
  quizId: string;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: string[];
  timeRemaining: number;
  startTime: number | null;
  studyPlanItemId: string | null;
}

interface QuizState {
  // Quiz setup
  quizId: string | null;
  isActive: boolean;
  mode: 'PRACTICE' | 'TIMED' | 'EXAM' | 'MISTAKES';
  timeLimit: number | null;
  studyPlanItemId: string | null;

  // Questions
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;

  // Timer
  timeRemaining: number;
  isTimerRunning: boolean;

  // Results
  isCompleted: boolean;
  showExplanation: boolean;
  startTime: number | null;
  timeSpent: number; // in seconds
  flaggedQuestions: string[];
  isSynced: boolean;

  // Multiple stashed exams
  stashedExams: Record<string, StashedExam>;

  // Actions
  startQuiz: (quizId: string | null, questions: QuizQuestion[], mode: 'PRACTICE' | 'TIMED' | 'EXAM' | 'MISTAKES', timeLimit?: number, studyPlanItemId?: string | null) => void;
  setAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => void;
  setSynced: (synced: boolean) => void;
  resetQuiz: () => void;
  toggleExplanation: () => void;
  tick: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resumeExamSession: (quizId: string) => void;
  clearSavedExam: (quizId: string) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizId: null,
      isActive: false,
      mode: 'PRACTICE',
      timeLimit: null,
      studyPlanItemId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeRemaining: 0,
      isTimerRunning: false,
      isCompleted: false,
      showExplanation: false,
      startTime: null,
      timeSpent: 0,
      isSynced: false,
      stashedExams: {},
      flaggedQuestions: [],

      startQuiz: (quizId, questions, mode, timeLimit, studyPlanItemId) => {
        const upperMode = mode.toUpperCase() as 'PRACTICE' | 'TIMED' | 'EXAM' | 'MISTAKES';
        const time = timeLimit ? timeLimit * 60 : questions.length * 90;
        const state = get();

        // 1. Stash current active EXAM if we are starting a different one
        if (state.isActive && state.mode === 'EXAM' && state.quizId && state.quizId !== quizId) {
          set((prev) => ({
            stashedExams: {
              ...prev.stashedExams,
              [state.quizId!]: {
                quizId: state.quizId!,
                questions: state.questions,
                currentIndex: state.currentIndex,
                answers: state.answers,
                flaggedQuestions: state.flaggedQuestions,
                timeRemaining: state.timeRemaining,
                startTime: state.startTime,
                studyPlanItemId: state.studyPlanItemId,
              }
            }
          }));
        }

        // 2. If already active on THIS quiz, just update questions and bail
        if (state.isActive && state.quizId === quizId) {
          set({ questions });
          return;
        }

        // 3. Start fresh or from stash
        set({
          quizId,
          isActive: true,
          mode: upperMode,
          timeLimit: timeLimit || null,
          questions,
          currentIndex: 0,
          answers: {},
          flaggedQuestions: [],
          timeRemaining: (upperMode === 'PRACTICE' || upperMode === 'MISTAKES') ? 0 : time,
          isTimerRunning: (upperMode !== 'PRACTICE' && upperMode !== 'MISTAKES'),
          isCompleted: false,
          isSynced: false,
          showExplanation: false,
          startTime: Date.now(),
          timeSpent: 0,
          studyPlanItemId: studyPlanItemId || null,
        });
      },

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        }));
      },

      toggleFlag: (questionId) => {
        set((state) => {
          const isFlagged = state.flaggedQuestions.includes(questionId);
          return {
            flaggedQuestions: isFlagged
              ? state.flaggedQuestions.filter((id) => id !== questionId)
              : [...state.flaggedQuestions, questionId],
          };
        });
      },

      nextQuestion: () => {
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
          showExplanation: false,
        }));
      },

      prevQuestion: () => {
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
          showExplanation: false,
        }));
      },

      goToQuestion: (index) => {
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
          showExplanation: false,
        }));
      },

      submitQuiz: () => {
        const { startTime, mode, quizId } = get();
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        set((prev) => {
          const newStashed = { ...prev.stashedExams };
          if (quizId) delete newStashed[quizId];

          return {
            isCompleted: true,
            isActive: false,
            isTimerRunning: false,
            timeSpent,
            stashedExams: newStashed,
          };
        });
      },

      setSynced: (synced: boolean) => {
        set({ isSynced: synced });
      },

      resetQuiz: () => {
        set({
          quizId: null,
          isActive: false,
          mode: 'PRACTICE',
          timeLimit: null,
          questions: [],
          currentIndex: 0,
          answers: {},
          flaggedQuestions: [],
          timeRemaining: 0,
          isTimerRunning: false,
          isCompleted: false,
          isSynced: false,
          showExplanation: false,
          studyPlanItemId: null,
        });
      },

      toggleExplanation: () => {
        set((state) => ({ showExplanation: !state.showExplanation }));
      },

      tick: () => {
        const { timeRemaining, isTimerRunning, mode } = get();
        if (isTimerRunning && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isTimerRunning && timeRemaining === 0 && mode !== 'PRACTICE') {
          get().submitQuiz();
        }
      },

      pauseTimer: () => {
        set({ isTimerRunning: false });
      },

      resumeTimer: () => {
        set({ isTimerRunning: true });
      },

      resumeExamSession: (targetQuizId: string) => {
        const state = get();

        // 1. Check if it's already active
        if (state.isActive && state.quizId === targetQuizId) return;

        // 2. Get stashed data
        const stashed = state.stashedExams[targetQuizId];
        if (!stashed) return;

        set((prev) => {
          const newStashed = { ...prev.stashedExams };

          // 3. BEFORE loading the stashed one, if there's an active one, stash IT
          if (prev.isActive && prev.mode === 'EXAM' && prev.quizId && prev.quizId !== targetQuizId) {
            newStashed[prev.quizId] = {
              quizId: prev.quizId,
              questions: prev.questions,
              currentIndex: prev.currentIndex,
              answers: prev.answers,
              flaggedQuestions: prev.flaggedQuestions,
              timeRemaining: prev.timeRemaining,
              startTime: prev.startTime,
              studyPlanItemId: prev.studyPlanItemId,
            };
          }

          // 4. Remove the target from stash and set as active
          delete newStashed[targetQuizId];

          return {
            ...stashed,
            stashedExams: newStashed,
            isActive: true,
            mode: 'EXAM',
            isCompleted: false,
            isTimerRunning: true,
            isSynced: false,
            showExplanation: false,
          };
        });
      },

      clearSavedExam: (targetQuizId: string) => {
        set((prev) => {
          const newStashed = { ...prev.stashedExams };
          delete newStashed[targetQuizId];
          return { stashedExams: newStashed };
        });
      }
    }),
    {
      name: 'quiz-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        quizId: state.quizId,
        isActive: state.isActive,
        mode: state.mode,
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        timeRemaining: state.timeRemaining,
        isCompleted: state.isCompleted,
        isSynced: state.isSynced,
        startTime: state.startTime,
        timeSpent: state.timeSpent,
        studyPlanItemId: state.studyPlanItemId,
        stashedExams: state.stashedExams,
      }),
    }
  )
);
