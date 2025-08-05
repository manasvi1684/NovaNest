const API_BASE_URL = 'http://localhost:3001/api/teamsync';

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is not JSON (e.g., HTML error page), throw a generic error
    throw new Error('Unexpected server response. Please try again or contact support.');
  }
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Team Management
export const getTeams = async () => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const createTeam = async (teamData) => {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(teamData)
  });
  return handleResponse(response);
};

export const getTeamDetails = async (teamId) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const updateTeam = async (teamId, teamData) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(teamData)
  });
  return handleResponse(response);
};

export const inviteUserToTeam = async (teamId, email, role = 'member') => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, role })
  });
  return handleResponse(response);
};

export const removeUserFromTeam = async (teamId, userId) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

// Shared Goals
export const getSharedGoals = async (teamId) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/goals`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const createSharedGoal = async (teamId, goalData) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/goals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(goalData)
  });
  return handleResponse(response);
};

export const updateSharedGoal = async (teamId, goalId, goalData) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/goals/${goalId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(goalData)
  });
  return handleResponse(response);
};

export const addGoalLog = async (teamId, goalId, content) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/goals/${goalId}/logs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  return handleResponse(response);
};

// Team Analytics
export const getTeamAnalytics = async (teamId) => {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/analytics`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
}; 