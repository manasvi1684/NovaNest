// NovaNest/server/models/Note.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true,
        index: true // Good to index fields used often in queries
    },
    title: {
        type: String,
        trim: true,
        default: '' // Default to empty string if not provided
    },
    content: {
        type: String,
        required: [true, 'Note content cannot be empty.'],
        trim: true
    },
    tags: {
        type: [String], // An array of strings
        default: [],
        // Consider adding a transform to lowercase/trim tags before saving if needed
        // validate: {
        //     validator: function(arr) {
        //         return arr.every(tag => typeof tag === 'string' && tag.trim().length > 0);
        //     },
        //     message: 'Tags must be non-empty strings.'
        // }
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    folderName: { // Simple folder organization by name
        type: String,
        trim: true,
        default: null // null or empty string can represent 'unfiled' or 'root'
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'trash'],
        default: 'active'
    },
    isTemplate: { // Is this note itself a template for creating other notes?
        type: Boolean,
        default: false
    },
    // We can add more fields later for features like:
    // - createdFromTemplateId: { type: Schema.Types.ObjectId, ref: 'Note' }
    // - wordCount: Number
    // - lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' } (if collaboration)
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Optional: Add an index on tags for faster searching by tags, if that's a common use case.
// noteSchema.index({ tags: 1 });

// Optional: Add an index on folderName if users frequently filter by folder
// noteSchema.index({ userId: 1, folderName: 1 }); // Compound index for user-specific folder queries

const Note = mongoose.model('Note', noteSchema);
// Mongoose will create a 'notes' collection in MongoDB

module.exports = Note;