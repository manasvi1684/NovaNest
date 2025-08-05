// NovaNest/client/src/store/useAchievifyStore.js
import { create } from 'zustand';
import * as achievifyService from '../services/achievifyService';
import { toast } from 'react-toastify';

const useAchievifyStore = create((set, get) => ({
  // --- State ---
  goals: [],
  selectedGoal: null,
  stats: null,
  isLoadingGoals: false,
  isLoadingStats: false,
  isLoadingMutation: false,
  error: null,

  // --- Goal Actions ---
  fetchGoals: async (filters = {}) => {
    set({ isLoadingGoals: true, error: null });
    try {
      const fetchedGoals = await achievifyService.fetchGoals(filters);
      set({ goals: fetchedGoals, isLoadingGoals: false });
    } catch (err) {
      const msg = `Failed to load goals: ${err.message}`;
      set({ error: msg, isLoadingGoals: false, goals: [] });
      toast.error(msg);
    }
  },

  createGoal: async (goalData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const newGoal = await achievifyService.createGoal(goalData);
      set((state) => ({
        goals: [newGoal, ...state.goals],
        isLoadingMutation: false,
      }));
      toast.success('Goal created successfully!');
      return newGoal;
    } catch (err) {
      const msg = `Failed to create goal: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  selectGoal: async (goalId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const goalDetails = await achievifyService.fetchGoalById(goalId);
      set({ selectedGoal: goalDetails, isLoadingMutation: false });
    } catch (err) {
      const msg = `Failed to load goal details: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
    }
  },

  updateGoal: async (goalId, goalData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.updateGoal(goalId, goalData);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Goal updated successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to update goal: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  deleteGoal: async (goalId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      await achievifyService.deleteGoal(goalId);
      set((state) => ({
        goals: state.goals.filter(g => g._id !== goalId),
        selectedGoal: state.selectedGoal?._id === goalId ? null : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Goal deleted successfully!');
    } catch (err) {
      const msg = `Failed to delete goal: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  // --- Milestone Actions ---
  addMilestone: async (goalId, milestoneData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.addMilestone(goalId, milestoneData);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Milestone added successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to add milestone: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  updateMilestone: async (goalId, milestoneId, milestoneData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.updateMilestone(goalId, milestoneId, milestoneData);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Milestone updated successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to update milestone: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  deleteMilestone: async (goalId, milestoneId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.deleteMilestone(goalId, milestoneId);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Milestone deleted successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to delete milestone: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  // --- Log Actions ---
  addLog: async (goalId, logData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.addLog(goalId, logData);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Log added successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to add log: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  deleteLog: async (goalId, logId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedGoal = await achievifyService.deleteLog(goalId, logId);
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        selectedGoal: state.selectedGoal?._id === goalId ? updatedGoal : state.selectedGoal,
        isLoadingMutation: false,
      }));
      toast.success('Log deleted successfully!');
      return updatedGoal;
    } catch (err) {
      const msg = `Failed to delete log: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  // --- Stats Actions ---
  fetchStats: async () => {
    set({ isLoadingStats: true, error: null });
    try {
      const fetchedStats = await achievifyService.fetchStats();
      set({ stats: fetchedStats, isLoadingStats: false });
    } catch (err) {
      const msg = `Failed to load stats: ${err.message}`;
      set({ error: msg, isLoadingStats: false });
      toast.error(msg);
    }
  },

  // --- Utility Actions ---
  clearAchievifyError: () => {
    set({ error: null });
  },

  clearSelectedGoal: () => {
    set({ selectedGoal: null });
  },

  // --- Computed Values ---
  getActiveGoals: () => {
    return get().goals.filter(goal => goal.status === 'active');
  },

  getCompletedGoals: () => {
    return get().goals.filter(goal => goal.status === 'completed');
  },

  getGoalsByCategory: (category) => {
    return get().goals.filter(goal => goal.category === category);
  },

  getTotalXp: () => {
    return get().goals.reduce((sum, goal) => sum + goal.totalXp, 0);
  },

  getLongestStreak: () => {
    return Math.max(...get().goals.map(goal => goal.streakDays), 0);
  }
}));

export default useAchievifyStore; 