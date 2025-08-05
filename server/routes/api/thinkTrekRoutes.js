// NovaNest/server/routes/api/thinkTrekRoutes.js

const express = require('express');
const router = express.Router();
const passport = require('passport'); // For protecting routes

// Load Note Model
const Note = require('../../models/Note');

// --- @route   POST api/thinktrek/notes ---
// --- @desc    Create a new note for the logged-in user ---
// --- @access  Private (requires JWT) ---
router.post(
    '/notes',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { title, content, tags, isPinned, folderName, isTemplate } = req.body;

            // Basic validation (Mongoose schema will also validate)
            if (!content) { // Content is required as per our schema
                return res.status(400).json({ msg: 'Note content cannot be empty.' });
            }

            const newNote = new Note({
                userId: req.user.id, // Associate note with the logged-in user
                title: title || '', // Default title to empty if not provided
                content,
                tags: tags || [],
                isPinned: isPinned || false,
                folderName: folderName || null,
                isTemplate: isTemplate || false,
                status: 'active' // Default status
            });

            const savedNote = await newNote.save();
            res.status(201).json(savedNote);

        } catch (err) {
            console.error("Error creating note:", err.message);
            if (err.name === 'ValidationError') {
                return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
            }
            res.status(500).send('Server Error while creating note');
        }
    }
);

// --- @route   GET api/thinktrek/notes ---
// --- @desc    Get all active notes for the logged-in user ---
// --- @access  Private ---
router.get(
    '/notes',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            // Find notes belonging to the current user and are not in 'trash' status
            // We can add pagination and filtering here later (e.g., by folderName, tags)
            const notes = await Note.find({
                userId: req.user.id,
                status: { $ne: 'trash' } // $ne means 'not equal'
            }).sort({ updatedAt: -1 }); // Sort by most recently updated

            res.json(notes);
        } catch (err) {
            console.error("Error fetching notes:", err.message);
            res.status(500).send('Server Error while fetching notes');
        }
    }
);

// --- @route   GET api/thinktrek/notes/:noteId ---
// --- @desc    Get a specific note by ID for the logged-in user ---
// --- @access  Private ---
router.get(
    '/notes/:noteId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const note = await Note.findOne({
                _id: req.params.noteId,
                userId: req.user.id, // Ensure the note belongs to the logged-in user
                // status: { $ne: 'trash' } // Optionally, prevent fetching trashed notes directly
            });

            if (!note) {
                return res.status(404).json({ msg: 'Note not found or access denied' });
            }

            res.json(note);
        } catch (err) {
            console.error("Error fetching single note:", err.message);
            if (err.name === 'CastError') { // Invalid ObjectId format for noteId
                return res.status(400).json({ msg: 'Invalid Note ID format' });
            }
            res.status(500).send('Server Error while fetching note');
        }
    }
);

// --- @route   PUT api/thinktrek/notes/:noteId ---
// --- @desc    Update an existing note by ID for the logged-in user ---
// --- @access  Private ---
router.put(
    '/notes/:noteId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { title, content, tags, isPinned, folderName, status, isTemplate } = req.body;

            // Find the note first to ensure it exists and belongs to the user
            let note = await Note.findOne({
                _id: req.params.noteId,
                userId: req.user.id
            });

            if (!note) {
                return res.status(404).json({ msg: 'Note not found or access denied for update' });
            }

            // Update fields if they are provided in the request body
            if (title !== undefined) note.title = title;
            if (content !== undefined) note.content = content; // Ensure content isn't made empty if required
            if (tags !== undefined) note.tags = tags;
            if (isPinned !== undefined) note.isPinned = isPinned;
            if (folderName !== undefined) note.folderName = folderName;
            if (status !== undefined && ['active', 'archived', 'trash'].includes(status)) note.status = status;
            if (isTemplate !== undefined) note.isTemplate = isTemplate;

            // content is required by schema, prevent it from being empty on update
            if (note.content === '' || note.content === null || note.content === undefined) {
                 if (req.body.content === '' || req.body.content === null || req.body.content === undefined ) {
                    return res.status(400).json({ msg: 'Note content cannot be empty.' });
                 }
            }


            const updatedNote = await note.save(); // This will also trigger Mongoose validation and timestamps
            res.json(updatedNote);

        } catch (err) {
            console.error("Error updating note:", err.message);
            if (err.name === 'CastError') {
                return res.status(400).json({ msg: 'Invalid Note ID format' });
            }
            if (err.name === 'ValidationError') {
                return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
            }
            res.status(500).send('Server Error while updating note');
        }
    }
);

// --- @route   DELETE api/thinktrek/notes/:noteId ---
// --- @desc    Delete a note by ID (soft delete by moving to 'trash') ---
// --- @access  Private ---
router.delete(
    '/notes/:noteId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const note = await Note.findOne({
                _id: req.params.noteId,
                userId: req.user.id
            });

            if (!note) {
                return res.status(404).json({ msg: 'Note not found or access denied for deletion' });
            }

            if (note.status === 'trash') {
                // Option 1: If already in trash, permanently delete (Careful!)
                // await Note.findByIdAndDelete(req.params.noteId);
                // return res.json({ msg: 'Note permanently deleted from trash' });

                // Option 2: Or just confirm it's already in trash / do nothing further
                return res.json({ msg: 'Note is already in trash', note });
            }

            // Soft delete: Set status to 'trash'
            note.status = 'trash';
            await note.save();
            res.json({ msg: 'Note moved to trash', note });

        } catch (err) {
            console.error("Error deleting note:", err.message);
            if (err.name === 'CastError') {
                return res.status(400).json({ msg: 'Invalid Note ID format' });
            }
            res.status(500).send('Server Error while deleting note');
        }
    }
);

module.exports = router;