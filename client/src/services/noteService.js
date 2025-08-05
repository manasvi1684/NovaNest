// NovaNest/client/src/services/noteService.js
import useAuthStore from '../store/authStore'; // To get the token

const API_BASE_URL = 'http://localhost:3001/api/thinktrek'; // Base URL for ThinkTrek notes

// Helper function to handle responses and errors (can be refactored into a shared utility)
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
        const error = (data && data.msg) || (data && data.message) || (data && data.errors ? JSON.stringify(data.errors) : response.statusText);
        // If it's a 401, it might mean the token is invalid/expired.
        // The authStore's fetchUser on app load handles general token invalidation.
        // Here, if a specific API call fails with 401, we might also trigger a logout.
        if (response.status === 401) {
            useAuthStore.getState().logout(); // Force logout if token is rejected
            throw new Error('Session expired or unauthorized. Please log in again.');
        }
        throw new Error(error);
    }
    return data;
}

// Fetch all notes for the authenticated user
export const fetchNotes = async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    });
    return handleResponse(response);
};

// Create a new note
export const createNote = async (noteData) => {
    // noteData: { title, content, tags?, folderName?, isPinned?, isTemplate? }
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(noteData),
    });
    return handleResponse(response);
};

// Fetch a single note by ID
export const fetchNoteById = async (noteId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    });
    return handleResponse(response);
};

// Update an existing note
export const updateNote = async (noteId, noteData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(noteData),
    });
    return handleResponse(response);
};

// Delete a note (soft delete)
export const deleteNote = async (noteId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No authentication token found.');

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json', // Not strictly necessary for DELETE with no body, but good practice
            'Authorization': token,
        },
    });
    return handleResponse(response);
};