// NovaNest/server/models/Project.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Project name is required.'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: { // Optional: e.g., active, archived, completed
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active'
    },
    // We might add other fields later like 'startDate', 'endDate', 'repositoryUrl'
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Optional: If a project is deleted, what happens to its issues?
// We can handle this at the application level (in the DELETE route for projects)
// or using Mongoose middleware (more advanced). For now, we'll handle in the route.

const Project = mongoose.model('Project', projectSchema);
// Mongoose will create a 'projects' collection

module.exports = Project;