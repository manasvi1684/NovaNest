// NovaNest/client/src/store/useBugTraceStore.js
import { create } from 'zustand';
import * as bugTraceService from '../services/bugTraceService';
import { toast } from 'react-toastify';

const useBugTraceStore = create((set, get) => ({
  // --- State ---
  projects: [],
  currentProject: null, // Holds the full project object when selected
  issues: [],           // Issues for the currentProject
  isLoadingProjects: false,
  isLoadingProjectDetails: false, // For fetching a single project's details
  isLoadingIssues: false,
  isLoadingMutation: false, // For CUD operations on projects/issues
  error: null,

  // --- Project Actions ---
  fetchProjects: async () => {
    set({ isLoadingProjects: true, error: null });
    try {
      const fetchedProjects = await bugTraceService.fetchProjects();
      set({ projects: fetchedProjects, isLoadingProjects: false });
    } catch (err) {
      const msg = `Failed to load projects: ${err.message}`;
      set({ error: msg, isLoadingProjects: false, projects: [] });
      toast.error(msg);
    }
  },

  createProject: async (projectData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const newProject = await bugTraceService.createProject(projectData);
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoadingMutation: false,
      }));
      toast.success('Project created successfully!');
      return newProject;
    } catch (err) {
      const msg = `Failed to create project: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  // Action to fetch a single project and its issues, then set it as current
  selectProject: async (projectId) => {
    set({ isLoadingProjectDetails: true, isLoadingIssues: true, currentProject: null, issues: [], error: null });
    try {
      const projectDetails = await bugTraceService.fetchProjectById(projectId);
      set({ currentProject: projectDetails, isLoadingProjectDetails: false });
      // After fetching project details, fetch its issues
      const projectIssues = await bugTraceService.fetchIssuesForProject(projectId);
      set({ issues: projectIssues, isLoadingIssues: false });
    } catch (err) {
      const msg = `Failed to load project details or issues: ${err.message}`;
      set({ error: msg, isLoadingProjectDetails: false, isLoadingIssues: false });
      toast.error(msg);
    }
  },

  updateProjectDetails: async (projectId, projectData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedProject = await bugTraceService.updateProject(projectId, projectData);
      set((state) => ({
        projects: state.projects.map(p => p._id === projectId ? updatedProject : p),
        currentProject: state.currentProject?._id === projectId ? updatedProject : state.currentProject,
        isLoadingMutation: false,
      }));
      toast.success('Project updated successfully!');
      return updatedProject;
    } catch (err) {
      const msg = `Failed to update project: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  deleteProjectAndIssues: async (projectId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      await bugTraceService.deleteProject(projectId); // Backend handles deleting associated issues
      set((state) => ({
        projects: state.projects.filter(p => p._id !== projectId),
        currentProject: state.currentProject?._id === projectId ? null : state.currentProject,
        issues: state.currentProject?._id === projectId ? [] : state.issues, // Clear issues if current project deleted
        isLoadingMutation: false,
      }));
      toast.success('Project and its issues deleted successfully!');
    } catch (err) {
      const msg = `Failed to delete project: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },


  // --- Issue Actions ---
  fetchIssues: async (projectId) => { // Can be called by selectProject or directly
    if (!projectId) {
        set({ issues: [], error: "No project ID provided to fetch issues."});
        return;
    }
    set({ isLoadingIssues: true, error: null });
    try {
      const fetchedIssues = await bugTraceService.fetchIssuesForProject(projectId);
      set({ issues: fetchedIssues, isLoadingIssues: false });
    } catch (err) {
      const msg = `Failed to load issues: ${err.message}`;
      set({ error: msg, isLoadingIssues: false, issues: [] });
      toast.error(msg);
    }
  },

  createIssueInCurrentProject: async (issueData) => {
    const currentProjectId = get().currentProject?._id;
    if (!currentProjectId) {
      const msg = "No project selected to add an issue to.";
      set({ error: msg });
      toast.error(msg);
      throw new Error(msg);
    }
    set({ isLoadingMutation: true, error: null });
    try {
      const newIssue = await bugTraceService.createIssue(currentProjectId, issueData);
      set((state) => ({
        issues: [newIssue, ...state.issues],
        isLoadingMutation: false,
      }));
      toast.success('Issue created successfully!');
      return newIssue;
    } catch (err) {
      const msg = `Failed to create issue: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  updateIssueDetails: async (issueId, issueData) => {
    set({ isLoadingMutation: true, error: null });
    try {
      const updatedIssue = await bugTraceService.updateIssue(issueId, issueData);
      set((state) => ({
        issues: state.issues.map(i => i._id === issueId ? updatedIssue : i),
        isLoadingMutation: false,
      }));
      toast.success('Issue updated successfully!');
      return updatedIssue;
    } catch (err) {
      const msg = `Failed to update issue: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  deleteIssueFromCurrentProject: async (issueId) => {
    set({ isLoadingMutation: true, error: null });
    try {
      await bugTraceService.deleteIssue(issueId);
      set((state) => ({
        issues: state.issues.filter(i => i._id !== issueId),
        isLoadingMutation: false,
      }));
      toast.success('Issue deleted successfully!');
    } catch (err) {
      const msg = `Failed to delete issue: ${err.message}`;
      set({ error: msg, isLoadingMutation: false });
      toast.error(msg);
      throw err;
    }
  },

  clearBugTraceError: () => {
    set({ error: null });
  },

  clearCurrentProjectAndIssues: () => { // Useful when navigating away or deselecting
    set({ currentProject: null, issues: [] });
  }

}));

export default useBugTraceStore;