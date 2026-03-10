import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface ActionLog {
    id: string; // The ID of the action itself, for React keys
    snippetId: string;
    type: ActionType;
    previousData?: any;
    newData?: any;
    timestamp: number;
}

interface ActionStore {
    logs: ActionLog[];
    logAction: (action: Omit<ActionLog, 'id' | 'timestamp'>) => void;
    removeLog: (id: string) => void;
    clearLogs: () => void;
    setLogs: (logs: ActionLog[]) => void;
}

export const useActionStore = create<ActionStore>()(
    persist(
        (set) => ({
            logs: [],
            logAction: (action) => set((state) => ({
                // Keep only top 20 recent actions
                logs: [
                    {
                        ...action,
                        id: Math.random().toString(36).substring(2, 9),
                        timestamp: Date.now()
                    },
                    ...state.logs
                ].slice(0, 20)
            })),
            removeLog: (id) => set((state) => ({
                logs: state.logs.filter(log => log.id !== id)
            })),
            clearLogs: () => set({ logs: [] }),
            setLogs: (logs) => set({ logs })
        }),
        {
            name: 'action-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
