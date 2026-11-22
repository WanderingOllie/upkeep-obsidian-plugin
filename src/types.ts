export type Habit = {
    id: string;
    text: string;
};

export type Completion = {
    lastDate: string;    // 'YYYY-MM-DD', local time
    streak: number;      // consecutive days, including lastDate
    prevStreak?: number; // streak before today's check-in
};

export type PluginData = {
    habits: Habit[];
    completions: Record<string, Completion>; // keyed by Habit.id
};

export const DEFAULT_DATA: PluginData = {
    habits: [],
    completions: {},
};
