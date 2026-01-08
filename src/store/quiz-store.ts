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
}

interface QuizState {
  // Quiz setup
  isActive: boolean;
  mode: 'PRACTICE' | 'TIMED' | 'EXAM';
  timeLimit: number | null;

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

  // Actions
  startQuiz: (questions: QuizQuestion[], mode: 'PRACTICE' | 'TIMED' | 'EXAM', timeLimit?: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  toggleExplanation: () => void;
  tick: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  isActive: false,
  mode: 'PRACTICE',
  timeLimit: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: 0,
  isTimerRunning: false,
  isCompleted: false,
  showExplanation: false,
  startTime: null,
  timeSpent: 0,

  startQuiz: (questions, mode, timeLimit) => {
    const upperMode = mode.toUpperCase() as 'PRACTICE' | 'TIMED' | 'EXAM';
    const time = timeLimit ? timeLimit * 60 : questions.length * 90; // 90 seconds per question default
    set({
      isActive: true,
      mode: upperMode,
      timeLimit: timeLimit || null,
      questions,
      currentIndex: 0,
      answers: {},
      timeRemaining: upperMode === 'PRACTICE' ? 0 : time,
      isTimerRunning: upperMode !== 'PRACTICE',
      isCompleted: false,
      showExplanation: false,
      startTime: Date.now(),
      timeSpent: 0,
    });
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
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
    const { startTime } = get();
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    set({
      isCompleted: true,
      isTimerRunning: false,
      timeSpent,
    });
  },

  resetQuiz: () => {
    set({
      isActive: false,
      mode: 'PRACTICE',
      timeLimit: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeRemaining: 0,
      isTimerRunning: false,
      isCompleted: false,
      showExplanation: false,
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
}));


