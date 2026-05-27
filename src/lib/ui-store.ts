import { create } from "zustand";

type UIState = {
  isIntelligenceOpen: boolean;
  setIntelligenceOpen: (open: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  isIntelligenceOpen: false,
  setIntelligenceOpen: (open) => set({ isIntelligenceOpen: open }),
}));
