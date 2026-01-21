import { create } from 'zustand';

interface UiState {
    isSupportModalOpen: boolean;
    setSupportModalOpen: (open: boolean) => void;
    toggleSupportModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    isSupportModalOpen: false,
    setSupportModalOpen: (open) => set({ isSupportModalOpen: open }),
    toggleSupportModal: () => set((state) => ({ isSupportModalOpen: !state.isSupportModalOpen })),
}));
