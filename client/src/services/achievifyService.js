// NovaNest/client/src/services/achievifyService.js
import useAuthStore from '../store/authStore';

const API_BASE_URL = 'http://localhost:3001/api/achievify';

// Reusable helper
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

// --- Goal Service Functions ---
export const fetchGoals = async (filters = {}) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    
    const url = queryParams.toString() ? `${API_BASE_URL}/goals?${queryParams}` : `${API_BASE_URL}/goals`;
    
    const response = await fetch(url, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const createGoal = async (goalData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(goalData),
    });
    return handleResponse(response);
};

export const fetchGoalById = async (goalId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

export const updateGoal = async (goalId, goalData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(goalData),
    });
    return handleResponse(response);
};

export const deleteGoal = async (goalId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

// --- Milestone Service Functions ---
export const addMilestone = async (goalId, milestoneData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(milestoneData),
    });
    return handleResponse(response);
};

export const updateMilestone = async (goalId, milestoneId, milestoneData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(milestoneData),
    });
    return handleResponse(response);
};

export const deleteMilestone = async (goalId, milestoneId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

// --- Log Service Functions ---
export const addLog = async (goalId, logData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(logData),
    });
    return handleResponse(response);
};

export const deleteLog = async (goalId, logId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/logs/${logId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
};

// --- Stats Service Functions ---
export const fetchStats = async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: { 'Authorization': token },
    });
    return handleResponse(response);
}; 