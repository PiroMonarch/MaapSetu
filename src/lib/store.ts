import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  currentReportId: string | null;
  setCurrentReportId: (id: string | null) => void;
  reportData: any;
  updateReportData: (data: any) => void;
  testResults: any[];
  updateTestResults: (results: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  currentReportId: null,
  setCurrentReportId: (id) => set({ currentReportId: id }),
  reportData: {},
  updateReportData: (data) => set((state) => ({ reportData: { ...state.reportData, ...data } })),
  testResults: [],
  updateTestResults: (results) => set({ testResults: results }),
}));
