// NovaNest/client/src/services/bugTraceService.js
import useAuthStore from '../store/authStore';

const API_BASE_URL = 'http://localhost:3001/api/bugtrace';

// Reusable helper (can be moved to a shared util if not already)
async function handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        const textData = await response.text();
        if (!response.ok) throw new Error(textData || `HTTP error! status: ${response.status}`);
        data = { message: textData };
    }

    if (!response.ok) {
        const error = (data && (data.msg || data.message || (data.errors ? JSON.stringify(data.errors) : null))) || response.statusText;
        if (response.status === 401) {
            useAuthStore.getState().logout();
            throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(error);
    }
    return data;
}

// --- Project Service Functions ---
export const fetchProjects = async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const createProject = async (projectData) => {
    // projectData: { name, description?, status? }
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(projectData),
    });
    return handleResponse(response);
};

export const fetchProjectById = async (projectId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const updateProject = async (projectId, projectData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(projectData),
    });
    return handleResponse(response);
};

export const deleteProject = async (projectId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

// --- Issue Service Functions ---
export const fetchIssuesForProject = async (projectId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/issues`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const createIssue = async (projectId, issueData) => {
    // issueData: { title, description?, status?, priority?, tags?, assigneeId?, dueDate? }
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(issueData),
    });
    return handleResponse(response);
};

export const fetchIssueById = async (issueId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const updateIssue = async (issueId, issueData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(issueData),
    });
    return handleResponse(response);
};

export const deleteIssue = async (issueId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};