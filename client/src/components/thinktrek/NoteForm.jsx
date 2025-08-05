// NovaNest/client/src/components/thinktrek/NoteForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useCallback, useMemo
import useNoteStore from '../../store/useNoteStore';
import SimpleMdeReact from "react-simplemde-editor"; // <-- 1. Import the editor

const NoteForm = ({ noteToEdit, onFormSubmit, onFormClose }) => {
  const addNote = useNoteStore((state) => state.addNote);
  const editNoteAction = useNoteStore((state) => state.editNote);
  const isLoading = useNoteStore((state) => state.isLoading);
  const error = useNoteStore((state) => state.error);
  const clearNoteError = useNoteStore((state) => state.clearNoteError);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // This will now be managed by SimpleMDE
  const [tags, setTags] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);

  const [formError, setFormError] = useState('');

  const isEditMode = Boolean(noteToEdit);

  useEffect(() => {
    if (isEditMode && noteToEdit) {
      setTitle(noteToEdit.title || '');
      setContent(noteToEdit.content || ''); // Set initial content for the editor
      setTags(noteToEdit.tags ? noteToEdit.tags.join(', ') : '');
      setFolderName(noteToEdit.folderName || '');
      setIsPinned(noteToEdit.isPinned || false);
      setIsTemplate(noteToEdit.isTemplate || false);
      setFormError('');
      if (error) clearNoteError();
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setFolderName('');
      setIsPinned(false);
      setIsTemplate(false);
      setFormError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteToEdit, isEditMode]);

  // --- 2. Handle content changes from SimpleMDE ---
  // useCallback is used to memoize the function so it doesn't cause unnecessary re-renders of SimpleMDE
  const onContentChange = useCallback((value) => {
    setContent(value);
    if (formError && value.trim()) setFormError(''); // Clear error if content is added
  }, [formError]); // formError is a dependency to allow clearing it

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (error) clearNoteError();

    if (!content.trim()) {
      setFormError('Note content cannot be empty.');
      return;
    }

    const noteDataPayload = {
      title: title.trim(),
      content: content.trim(), // content state is now from SimpleMDE
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      folderName: folderName.trim() || null,
      isPinned,
      isTemplate,
    };

    try {
      if (isEditMode && noteToEdit) {
        await editNoteAction(noteToEdit._id, noteDataPayload);
      } else {
        await addNote(noteDataPayload);
      }
      if (!isEditMode) { // Only clear form fully for create mode
        setTitle('');
        setContent(''); // This will clear the SimpleMDE editor too
        setTags('');
        setFolderName('');
        setIsPinned(false);
        setIsTemplate(false);
      }
      if (onFormSubmit) onFormSubmit();
      if (onFormClose && isEditMode) onFormClose();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} note from form:`, err);
    }
  };

  // --- 3. Optional: Memoize editor options to prevent re-renders ---
  const editorOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false, // Disable SimpleMDE's spell checker if you prefer browser's
      // You can customize toolbar items, status bar, etc. here
      // See EasyMDE documentation for available options: https://easymde.tk/options
      // status: ["lines", "words"], // Example: show lines and words in status bar
      toolbar: [
        "bold", "italic", "heading", "|",
        "quote", "unordered-list", "ordered-list", "|",
        "link", "image", "|", // You might need to handle image uploads separately
        "preview", "side-by-side", "fullscreen", "|",
        "guide"
      ],
    };
  }, []); // Empty dependency array means options are created once


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}

      <div>
        <label htmlFor="form-note-title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text" id="form-note-title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter note title"
        />
      </div>

      <div>
        <label htmlFor="form-note-content" className="block text-sm font-medium text-gray-700">Content</label>
        {/* --- 4. Replace textarea with SimpleMdeReact --- */}
        <SimpleMdeReact
          id="form-note-content"
          value={content}
          onChange={onContentChange}
          options={editorOptions} // Pass memoized options
          className="mt-1" // Add some margin if needed
        />
        {/* --- End of editor replacement --- */}
      </div>

      <div>
        <label htmlFor="form-note-tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
        <input
          type="text" id="form-note-tags" value={tags} onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., work, idea, journal"
        />
      </div>

      <div>
        <label htmlFor="form-note-folderName" className="block text-sm font-medium text-gray-700">Folder Name</label>
        <input
          type="text" id="form-note-folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Daily Reflections"
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input id="form-note-isPinned" type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="form-note-isPinned" className="ml-2 block text-sm text-gray-900">Pin this note</label>
        </div>
        <div className="flex items-center">
          <input id="form-note-isTemplate" type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="form-note-isTemplate" className="ml-2 block text-sm text-gray-900">Save as template</label>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading || (!isEditMode && !content.trim())}
          className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Note' : 'Save Note')}
        </button>
        {onFormClose && (
             <button type="button" onClick={onFormClose}
                className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            Cancel
            </button>
        )}
      </div>
    </form>
  );
};

export default NoteForm;