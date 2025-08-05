// NovaNest/client/src/store/useNoteStore.js
import { create } from 'zustand';
import * as noteService from '../services/noteService'; // Import all functions from noteService

const useNoteStore = create((set, get) => ({
  // --- State ---
  notes: [],                // Array to hold the user's notes
  currentNote: null,        // For viewing/editing a single note (optional for now)
  isLoading: false,         // Loading state for note operations
  error: null,              // Error state for note operations

  // --- Actions ---

  // Fetch all notes for the user
  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedNotes = await noteService.fetchNotes();
      set({ notes: fetchedNotes, isLoading: false });
    } catch (err) {
      console.error("Error fetching notes in store:", err);
      set({ error: err.message, isLoading: false, notes: [] }); // Clear notes on error
    }
  },

  // Add a new note
  addNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await noteService.createNote(noteData);
      set((state) => ({
        notes: [newNote, ...state.notes], // Add new note to the beginning of the array
        isLoading: false,
      }));
      return newNote; // Return the created note, might be useful for UI
    } catch (err) {
      console.error("Error adding note in store:", err);
      set({ error: err.message, isLoading: false });
      throw err; // Re-throw to allow component to handle if needed
    }
  },

  // Update an existing note
  editNote: async (noteId, noteData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(noteId, noteData);
      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === noteId ? updatedNote : note
        ),
        isLoading: false,
        currentNote: state.currentNote?._id === noteId ? updatedNote : state.currentNote, // Update currentNote if it's the one being edited
      }));
      return updatedNote;
    } catch (err) {
      console.error("Error updating note in store:", err);
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Delete a note (soft delete by backend, UI will remove or update status)
  removeNote: async (noteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await noteService.deleteNote(noteId); // Backend handles soft delete
      // After successful soft delete, we can either refetch all notes
      // or update the local state to reflect the 'trash' status or remove it.
      // For simplicity now, let's remove it from the main list.
      // A more advanced setup might filter by status or move to a 'trash' list.
      set((state) => ({
        notes: state.notes.filter((note) => note._id !== noteId),
        isLoading: false,
      }));
      return response; // Contains { msg, note (with status: 'trash') }
    } catch (err) {
      console.error("Error deleting note in store:", err);
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Fetch a single note and set it as currentNote (optional for now)
  fetchAndSetCurrentNote: async (noteId) => {
    set({ isLoading: true, error: null, currentNote: null });
    try {
      const note = await noteService.fetchNoteById(noteId);
      set({ currentNote: note, isLoading: false });
    } catch (err) {
      console.error("Error fetching single note in store:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  clearNoteError: () => {
    set({ error: null });
  }

}));

export default useNoteStore;