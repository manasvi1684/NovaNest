// NovaNest/server/models/Issue.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    userId: { // Denormalizing userId here for easier querying of a user's issues across all projects
              // and for permission checks if accessing an issue directly.
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Issue title is required.'],
        trim: true
    },
    description: { // Detailed description, can support Markdown if rendered appropriately on frontend
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'in_review', 'closed', 'reopened'], // Customizable statuses
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    tags: { // For categorizing issues
        type: [String],
        default: []
    },
    assigneeId: { // Optional: To whom this issue is assigned (could be the user themselves for personal tracker)
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reporterId: { // Who reported this issue (usually the current user for a personal tracker)
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    // For issue linking (V2 feature):
    // linkedIssues: [{
    //     linkType: { type: String, enum: ['relates_to', 'blocks', 'is_blocked_by', 'duplicates'] },
    //     issueId: { type: Schema.Types.ObjectId, ref: 'Issue' }
    // }],
    // For Git commit linking (V2/V3 feature):
    // linkedCommits: [{ commitHash: String, repositoryUrl: String, message: String }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficiently fetching issues for a specific project
issueSchema.index({ projectId: 1, createdAt: -1 }); // Sort by newest within a project
issueSchema.index({ userId: 1, status: 1 }); // For a user to see their issues by status

const Issue = mongoose.model('Issue', issueSchema);
// Mongoose will create an 'issues' collection

module.exports = Issue;