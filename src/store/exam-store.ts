import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExamState {
    userId: string | null;
    date: Date | null;
    label: string;
    setExam: (userId: string, date: Date, label: string) => void;
    daysRemaining: () => number;
    reset: () => void;
}

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            userId: null,
            date: null,
            label: 'Select Date',
            setExam: (userId, date, label) => set({ userId, date, label }),
            reset: () => set({ userId: null, date: null, label: 'Select Date' }),
            daysRemaining: () => {
                const { date } = get();
                if (!date) return 0;
                // Normalize both to UTC midnight for precise day difference
                const todayStr = new Date().toLocaleDateString('en-CA');
                const today = new Date(todayStr + 'T00:00:00Z');
                const target = new Date(new Date(date).toLocaleDateString('en-CA') + 'T00:00:00Z');

                const diffTime = target.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0;
            },
        }),
        {
            name: 'cfa-exam-storage', // unique name for localStorage
            partialize: (state) => ({ userId: state.userId, date: state.date, label: state.label }), // persist userId, date and label
        }
    )
);
