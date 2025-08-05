// NovaNest/client/src/pages/ThinkTrekPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../store/authStore';
import useNoteStore from '../store/useNoteStore';
import NoteForm from '../components/thinktrek/NoteForm';
import Modal from '../components/common/Modal'; // <-- 1. Import Modal
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ThinkTrekPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const notesFromStore = useNoteStore((state) => state.notes);
  const isLoading = useNoteStore((state) => state.isLoading);
  const error = useNoteStore((state) => state.error);
  const fetchAllNotes = useNoteStore((state) => state.fetchAllNotes);
  const clearNoteError = useNoteStore((state) => state.clearNoteError);
  const removeNoteAction = useNoteStore((state) => state.removeNote);

  const [isNoteFormModalOpen, setIsNoteFormModalOpen] = useState(false); // <-- 2. Renamed state for modal
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllNotes();
    }
    return () => {
      clearNoteError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const { pinnedNotes, unpinnedNotes } = useMemo(() => { /* ... (no change) ... */
    const pinned = [];
    const unpinned = [];
    notesFromStore.forEach(note => {
      if (note.isPinned) {
        pinned.push(note);
      } else {
        unpinned.push(note);
      }
    });
    return { pinnedNotes: pinned, unpinnedNotes: unpinned };
  }, [notesFromStore]);


  const handleDeleteNote = async (noteId) => { /* ... (no change) ... */
    if (window.confirm('Are you sure you want to move this note to trash?')) {
      try {
        await removeNoteAction(noteId);
      } catch (err) {
        console.error("Failed to delete note from page:", err);
      }
    }
  };

  const handleOpenEditForm = (note) => {
    setEditingNote(note);
    setIsNoteFormModalOpen(true); // <-- 3. Open modal
  };

  const handleOpenCreateForm = () => {
    setEditingNote(null);
    setIsNoteFormModalOpen(true); // <-- 3. Open modal
  };

  const handleFormClose = () => {
    setIsNoteFormModalOpen(false); // <-- 3. Close modal
    setEditingNote(null);
    clearNoteError();
  };

  const handleFormSubmitSuccess = () => {
    // NoteForm handles clearing itself on create.
    // For both create and edit, we close the modal.
    handleFormClose();
    // Optionally, fetchAllNotes() again if optimistic update isn't perfect or to ensure consistency
    // but store updates should handle it.
  };

  const renderNoteItem = (note, isPinnedItem = false) => { /* ... (no change to this function's content from the reverted simpler version) ... */
    return (
    <li
      key={note._id}
      className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
                  ${isPinnedItem ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}
    >
      <h3 className={`text-lg font-semibold mb-1 break-words ${isPinnedItem ? 'text-indigo-700' : 'text-indigo-600'}`}>
        {note.title || "Untitled Note"}
        {isPinnedItem && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.083l4.674 1.246a1 1 0 01.84 1.17l-.742 4.455a1 1 0 01-.97.846H4.2a1 1 0 01-.97-.846l-.742-4.455a1 1 0 01.84-1.17L7.917 5.083V4a1 1 0 011-1zm0 4.667L5.414 9.252l.371 2.228h8.43l.371-2.228L10 7.667z" clipRule="evenodd" />
          </svg>
        )}
      </h3>
      <div className="prose prose-sm max-w-none text-gray-700 break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>
      <div className={`mt-2 text-xs flex flex-wrap gap-x-3 gap-y-1 items-center text-gray-500`}>
         {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            Tags:
            {note.tags.map(tag => (
              <span key={tag} className={`px-2 py-0.5 rounded-full text-xs ${isPinnedItem ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>{tag}</span>
            ))}
          </div>
        )}
        <span>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
        {note.folderName && <span className="italic">(Folder: {note.folderName})</span>}
      </div>
      <div className="mt-3 space-x-2 flex justify-end">
        <button onClick={() => handleOpenEditForm(note)} className="text-sm text-blue-600 hover:text-blue-800 font-medium py-1 px-3 rounded-md hover:bg-blue-100 transition-colors">Edit</button>
        <button onClick={() => handleDeleteNote(note._id)} disabled={isLoading} className="text-sm text-red-600 hover:text-red-800 font-medium py-1 px-3 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50">Delete</button>
      </div>
    </li>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">ThinkTrek - Your Journal & Thoughts</h1>
        <p className="text-gray-600">Capture your ideas, reflections, and connect your knowledge.</p>
      </header>

      <div className="mb-8 text-center">
        <button
          onClick={handleOpenCreateForm}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse"
        >
          ✨ + Add New Note
        </button>
      </div>

      {/* --- 4. Render Modal for NoteForm --- */}
      <Modal
        isOpen={isNoteFormModalOpen}
        onClose={handleFormClose}
        title={editingNote ? 'Edit Note' : 'Create New Note'}
      >
        <NoteForm
          noteToEdit={editingNote}
          onFormSubmit={handleFormSubmitSuccess} // Called after successful create/edit
          onFormClose={handleFormClose}         // Passed to NoteForm's cancel button
        />
      </Modal>
      {/* --- End of Modal for NoteForm --- */}


      {/* Pinned Notes Section and Other Notes Section (no changes to their JSX structure) */}
      {isLoading && pinnedNotes.length === 0 && unpinnedNotes.length === 0 && <p className="text-indigo-500">Loading your brilliant thoughts...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && pinnedNotes.length > 0 && (
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.083l4.674 1.246a1 1 0 01.84 1.17l-.742 4.455a1 1 0 01-.97.846H4.2a1 1 0 01-.97-.846l-.742-4.455a1 1 0 01.84-1.17L7.917 5.083V4a1 1 0 011-1zm0 4.667L5.414 9.252l.371 2.228h8.43l.371-2.228L10 7.667z" clipRule="evenodd" /></svg>
            📌 Pinned Notes
          </h2>
          <ul className="space-y-4">
            {pinnedNotes.map((note, index) => (
              <div key={note._id} style={{ animationDelay: `${index * 0.1}s` }}>
                {renderNoteItem(note, true)}
              </div>
            ))}
          </ul>
        </div>
      )}

      <div className="p-6 bg-white shadow-lg rounded-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              {pinnedNotes.length > 0 ? '📝 Other Notes' : '📝 Your Notes'}
            </h2>
            <button onClick={() => isAuthenticated && fetchAllNotes()} disabled={isLoading} className="text-sm text-indigo-500 hover:text-indigo-700 disabled:text-gray-400 transition-colors" title="Refresh notes">
                🔄
            </button>
        </div>
        {!isLoading && !error && notesFromStore.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-bounce">📝</div>
            <p className="text-gray-500">No notes yet. Time to jot down some ideas!</p>
          </div>
        )}
        {!isLoading && !error && unpinnedNotes.length > 0 && (
          <ul className="space-y-4">
            {unpinnedNotes.map((note, index) => (
              <div key={note._id} style={{ animationDelay: `${index * 0.1}s` }}>
                {renderNoteItem(note, false)}
              </div>
            ))}
          </ul>
        )}
        {!isLoading && !error && pinnedNotes.length > 0 && unpinnedNotes.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-bounce">📌</div>
            <p className="text-gray-500">All your notes are pinned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkTrekPage;