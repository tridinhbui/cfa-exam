import { create } from 'zustand';

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

interface QuizState {
  // Quiz setup
  quizId: string | null;
  isActive: boolean;
  mode: 'PRACTICE' | 'TIMED' | 'EXAM';
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
  savedExamSession: {
    quizId: string | null;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: Record<string, string>;
    flaggedQuestions: string[];
    timeRemaining: number;
    startTime: number | null;
    studyPlanItemId: string | null;
  } | null;

  // Actions
  startQuiz: (quizId: string | null, questions: QuizQuestion[], mode: 'PRACTICE' | 'TIMED' | 'EXAM', timeLimit?: number, studyPlanItemId?: string | null) => void;
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
  resumeExamSession: () => void;
  clearSavedExam: () => void;
}

import { persist, createJSONStorage } from 'zustand/middleware';

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
      savedExamSession: null,
      flaggedQuestions: [],

      startQuiz: (quizId, questions, mode, timeLimit, studyPlanItemId) => { // Correctly wrapped startQuiz logic
        const upperMode = mode.toUpperCase() as 'PRACTICE' | 'TIMED' | 'EXAM';
        const time = timeLimit ? timeLimit * 60 : questions.length * 90;

        const state = get();
        // If we are currently in an EXAM and starting something else, SAVE the exam progress
        if (state.isActive && state.mode === 'EXAM' && upperMode !== 'EXAM') {
          set({
            savedExamSession: {
              quizId: state.quizId,
              questions: state.questions,
              currentIndex: state.currentIndex,
              answers: state.answers,
              flaggedQuestions: state.flaggedQuestions,
              timeRemaining: state.timeRemaining,
              startTime: state.startTime,
              studyPlanItemId: state.studyPlanItemId,
            }
          });
        }

        // If we are already active on THIS specific quiz, don't reset answers
        if (state.isActive && state.quizId === quizId) {
          set({ questions });
          return;
        }

        set({
          quizId,
          isActive: true,
          mode: upperMode,
          timeLimit: timeLimit || null,
          questions,
          currentIndex: 0,
          answers: {},
          flaggedQuestions: [],
          timeRemaining: upperMode === 'PRACTICE' ? 0 : time,
          isTimerRunning: upperMode !== 'PRACTICE',
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
        const { startTime, mode } = get();
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        set({
          isCompleted: true,
          isActive: false,
          isTimerRunning: false,
          timeSpent,
        });

        // If we completed an exam, we should clear any saved exam session
        if (mode === 'EXAM') {
          set({ savedExamSession: null });
        }
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

      resumeExamSession: () => {
        const { savedExamSession } = get();
        if (!savedExamSession) {
          // If no background saved session, but current active IS an exam, we just stay
          const state = get();
          if (state.isActive && state.mode === 'EXAM') return;
          return;
        }

        set({
          ...savedExamSession,
          isActive: true,
          mode: 'EXAM',
          isCompleted: false,
          isTimerRunning: true,
          isSynced: false,
          showExplanation: false,
          savedExamSession: null, // Move from background to active
        });
      },

      clearSavedExam: () => {
        set({ savedExamSession: null });
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
        savedExamSession: state.savedExamSession,
      }),
    }
  )
);
