// NovaNest/client/src/services/authService.js

const API_BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL

// Helper function to handle responses and errors
async function handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        // Handle non-JSON responses if necessary, or assume error for now
        // For example, if the server sends plain text for some errors
        const textData = await response.text();
        // If response is not OK and we got text, maybe it's an error message
        if (!response.ok) throw new Error(textData || `HTTP error! status: ${response.status}`);
        data = { message: textData }; // Or however you want to structure non-JSON success
    }

    if (!response.ok) {
        // Prefer error message from JSON body if available
        const error = (data && data.msg) || (data && data.message) || (data && data.errors ? JSON.stringify(data.errors) : response.statusText);
        throw new Error(error);
    }
    return data;
}

// Registration API call
export const register = async (userData) => {
    // userData should be an object: { username, email, password }
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

// Login API call
export const login = async (credentials) => {
    // credentials should be an object: { email, password }
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

// Get current user data (protected route)
export const getMe = async (token) => {
    if (!token) {
        throw new Error('No token provided for getMe request.');
    }
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token, // Expects the full "Bearer <token>" string
        },
    });
    return handleResponse(response);
};

// We can add more auth-related API calls here later (e.g., forgot password, reset password)