import { create } from 'zustand';
import * as teamSyncService from '../services/teamSyncService';

const useTeamSyncStore = create((set, get) => ({
  // State
  teams: [],
  selectedTeam: null,
  sharedGoals: [],
  teamAnalytics: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Team Management
  fetchTeams: async () => {
    try {
      set({ loading: true, error: null });
      const teams = await teamSyncService.getTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createTeam: async (teamData) => {
    try {
      set({ loading: true, error: null });
      const newTeam = await teamSyncService.createTeam(teamData);
      set(state => ({
        teams: [...state.teams, newTeam],
        loading: false
      }));
      return newTeam;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectTeam: async (teamId) => {
    try {
      set({ loading: true, error: null });
      const team = await teamSyncService.getTeamDetails(teamId);
      set({ selectedTeam: team, loading: false });
      // Also fetch shared goals for this team
      get().fetchSharedGoals(teamId);
      get().fetchTeamAnalytics(teamId);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateTeam: async (teamId, teamData) => {
    try {
      set({ loading: true, error: null });
      const updatedTeam = await teamSyncService.updateTeam(teamId, teamData);
      set(state => ({
        teams: state.teams.map(team => 
          team._id === teamId ? updatedTeam : team
        ),
        selectedTeam: state.selectedTeam?._id === teamId ? updatedTeam : state.selectedTeam,
        loading: false
      }));
      return updatedTeam;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  inviteUser: async (teamId, email, role) => {
    try {
      set({ loading: true, error: null });
      await teamSyncService.inviteUserToTeam(teamId, email, role);
      // Refresh team details
      await get().selectTeam(teamId);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeUser: async (teamId, userId) => {
    try {
      set({ loading: true, error: null });
      await teamSyncService.removeUserFromTeam(teamId, userId);
      // Refresh team details
      await get().selectTeam(teamId);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Shared Goals
  fetchSharedGoals: async (teamId) => {
    try {
      set({ loading: true, error: null });
      const goals = await teamSyncService.getSharedGoals(teamId);
      set({ sharedGoals: goals, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createSharedGoal: async (teamId, goalData) => {
    try {
      set({ loading: true, error: null });
      const newGoal = await teamSyncService.createSharedGoal(teamId, goalData);
      set(state => ({
        sharedGoals: [...state.sharedGoals, newGoal],
        loading: false
      }));
      return newGoal;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSharedGoal: async (teamId, goalId, goalData) => {
    try {
      set({ loading: true, error: null });
      const updatedGoal = await teamSyncService.updateSharedGoal(teamId, goalId, goalData);
      set(state => ({
        sharedGoals: state.sharedGoals.map(goal => 
          goal._id === goalId ? updatedGoal : goal
        ),
        loading: false
      }));
      return updatedGoal;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addGoalLog: async (teamId, goalId, content) => {
    try {
      set({ loading: true, error: null });
      const newLog = await teamSyncService.addGoalLog(teamId, goalId, content);
      set(state => ({
        sharedGoals: state.sharedGoals.map(goal => 
          goal._id === goalId 
            ? { ...goal, logs: [...goal.logs, newLog], totalXp: goal.totalXp + 5 }
            : goal
        ),
        loading: false
      }));
      return newLog;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Team Analytics
  fetchTeamAnalytics: async (teamId) => {
    try {
      set({ loading: true, error: null });
      const analytics = await teamSyncService.getTeamAnalytics(teamId);
      set({ teamAnalytics: analytics, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Utility
  clearTeamData: () => {
    set({
      selectedTeam: null,
      sharedGoals: [],
      teamAnalytics: null
    });
  }
}));

export default useTeamSyncStore; 