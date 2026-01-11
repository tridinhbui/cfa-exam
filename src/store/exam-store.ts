import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExamState {
    date: Date | null;
    label: string;
    setExam: (date: Date, label: string) => void;
    daysRemaining: () => number;
}

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            date: null,
            label: 'Select Date',
            setExam: (date, label) => set({ date, label }),
            daysRemaining: () => {
                const { date } = get();
                if (!date) return 0;
                const now = new Date();
                const diffTime = new Date(date).getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0;
            },
        }),
        {
            name: 'cfa-exam-storage', // unique name for localStorage
            partialize: (state) => ({ date: state.date, label: state.label }), // persist date and label
        }
    )
);
