// NovaNest/client/src/pages/BugTracePage.jsx
import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useBugTraceStore from '../store/useBugTraceStore';
import ProjectFormModal from '../components/bugtrace/ProjectFormModal';
import IssueFormModal from '../components/bugtrace/IssueFormModal';

const BugTracePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const {
    projects,
    currentProject,
    issues,
    isLoadingProjects,
    isLoadingIssues,
    isLoadingMutation,
    error,
    fetchProjects,
    selectProject,
    clearBugTraceError,
    deleteProjectAndIssues,
    deleteIssueFromCurrentProject,
  } = useBugTraceStore();

  // State for modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);


  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
    return () => {
      clearBugTraceError(); // Clear errors when component unmounts
      // useBugTraceStore.getState().clearCurrentProjectAndIssues(); // Optional: clear selected project on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // fetchProjects is stable from Zustand

  const handleSelectProject = (projectId) => {
    selectProject(projectId);
  };

  const handleOpenProjectForm = (project = null) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenIssueForm = (issue = null) => {
    setEditingIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all its issues.')) {
      try {
        await deleteProjectAndIssues(projectId);
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await deleteIssueFromCurrentProject(issueId);
      } catch (err) {
        console.error("Failed to delete issue:", err);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800',
      reopened: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700">BugTrace - Personal Issue Tracker</h1>
        <p className="text-gray-600">Organize your development tasks and track bugs across your personal projects.</p>
      </header>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Column for Projects */}
        <div className="md:col-span-1 lg:col-span-1 p-4 bg-white shadow-lg rounded-xl h-fit animate-fade-in"> {/* h-fit to make it not too tall */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-700">Your Projects</h2>
            {/* Add refresh button for projects */}
            <button
                onClick={() => isAuthenticated && fetchProjects()}
                disabled={isLoadingProjects}
                className="text-sm text-teal-500 hover:text-teal-700 disabled:text-gray-400"
                title="Refresh projects"
            >
                ↻
            </button>
          </div>
          <button 
            onClick={() => handleOpenProjectForm()} 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline mb-4 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ✨ + New Project
          </button>
          
          {isLoadingProjects && <p className="text-teal-500">Loading projects...</p>}
          {!isLoadingProjects && projects.length === 0 && !error && (
            <p className="text-gray-500">No projects yet. Create one to get started!</p>
          )}
          {!isLoadingProjects && projects.length > 0 && (
            <ul className="space-y-2">
              {projects.map(project => (
                <li key={project._id} className="relative group">
                  <button
                    onClick={() => handleSelectProject(project._id)}
                    className={`w-full text-left p-3 rounded-md transition-colors
                                ${currentProject?._id === project._id 
                                  ? 'bg-teal-500 text-white shadow-md' 
                                  : 'bg-gray-100 hover:bg-teal-100 text-gray-700'}`}
                  >
                    <span className="font-medium">{project.name}</span>
                    {project.description && <p className="text-xs opacity-75 truncate">{project.description}</p>}
                  </button>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProjectForm(project);
                      }}
                      className="text-xs text-gray-500 hover:text-teal-600 mr-1"
                      title="Edit project"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                      className="text-xs text-gray-500 hover:text-red-600"
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column for Issues of Selected Project */}
        <div className="md:col-span-2 lg:col-span-3 p-4 bg-white shadow-lg rounded-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {currentProject ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentProject.name}</h2>
                    <p className="text-sm text-gray-500">{currentProject.description}</p>
                </div>
                <button 
                    onClick={() => handleOpenIssueForm()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    🐛 + Add Issue
                </button>
              </div>
              
              {/* Issue List Placeholder */}
              {isLoadingIssues && <p className="text-teal-500">Loading issues for {currentProject.name}...</p>}
              {!isLoadingIssues && issues.length === 0 && !error && (
                <p className="text-gray-500">No issues in this project yet. Add one!</p>
              )}
              {!isLoadingIssues && issues.length > 0 && (
                <ul className="space-y-3">
                  {issues.map((issue, index) => (
                    <li key={issue._id} className="p-4 border rounded-lg bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleOpenIssueForm(issue)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                            title="Edit issue"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="text-xs text-red-600 hover:text-red-800"
                            title="Delete issue"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {issue.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      
                      {issue.tags && issue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {issue.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {issue.dueDate && (
                          <span className="mr-3">Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a project from the list to view its issues, or create a new project.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectFormModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        projectToEdit={editingProject} 
      />
      
      <IssueFormModal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)} 
        issueToEdit={editingIssue} 
      />
    </div>
  );
};

export default BugTracePage;