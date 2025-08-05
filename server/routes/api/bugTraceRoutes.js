// NovaNest/server/routes/api/bugTraceRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose'); // For checking valid ObjectId

// Load Models
const Project = require('../../models/Project');
const Issue = require('../../models/Issue');

// --- PROJECTS ---
// (Existing Project routes from previous step - POST, GET all, GET one, PUT, DELETE)
// ... (Keep all your existing project routes here) ...
// @route   POST api/bugtrace/projects
router.post('/projects', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) return res.status(400).json({ name: 'Project name is required.' });
        const newProject = new Project({ userId: req.user.id, name, description: description || '', status: status || 'active' });
        const project = await newProject.save();
        res.status(201).json(project);
    } catch (err) {
        console.error('Error creating project:', err.message);
        if (err.name === 'ValidationError') return res.status(400).json(err.errors);
        res.status(500).send('Server Error while creating project');
    }
});

// @route   GET api/bugtrace/projects
router.get('/projects', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err.message);
        res.status(500).send('Server Error while fetching projects');
    }
});

// @route   GET api/bugtrace/projects/:projectId
router.get('/projects/:projectId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid Project ID format.' });
        }
        const project = await Project.findOne({ _id: req.params.projectId, userId: req.user.id });
        if (!project) return res.status(404).json({ msg: 'Project not found or access denied.' });
        res.json(project);
    } catch (err) {
        console.error('Error fetching single project:', err.message);
        // CastError for projectId is handled by the isValid check now
        res.status(500).send('Server Error while fetching project');
    }
});

// @route   PUT api/bugtrace/projects/:projectId
router.put('/projects/:projectId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid Project ID format.' });
        }
        const { name, description, status } = req.body;
        let project = await Project.findOne({ _id: req.params.projectId, userId: req.user.id });
        if (!project) return res.status(404).json({ msg: 'Project not found or access denied for update.' });

        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (status && ['active', 'archived', 'completed'].includes(status)) project.status = status;
        if (name !== undefined && !name.trim()) return res.status(400).json({ name: 'Project name cannot be empty.' });
        
        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err) {
        console.error('Error updating project:', err.message);
        if (err.name === 'ValidationError') return res.status(400).json(err.errors);
        res.status(500).send('Server Error while updating project');
    }
});

// @route   DELETE api/bugtrace/projects/:projectId
router.delete('/projects/:projectId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid Project ID format.' });
        }
        const project = await Project.findOne({ _id: req.params.projectId, userId: req.user.id });
        if (!project) return res.status(404).json({ msg: 'Project not found or access denied for deletion.' });
        
        await Issue.deleteMany({ projectId: req.params.projectId, userId: req.user.id });
        await Project.findByIdAndDelete(req.params.projectId);
        res.json({ msg: 'Project and its issues successfully deleted.' });
    } catch (err) {
        console.error('Error deleting project:', err.message);
        res.status(500).send('Server Error while deleting project');
    }
});


// --- ISSUES ---

// @route   POST api/bugtrace/projects/:projectId/issues
// @desc    Create a new issue for a specific project
// @access  Private
router.post(
    '/projects/:projectId/issues',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const projectId = req.params.projectId;
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({ msg: 'Invalid Project ID format.' });
            }

            // Check if project exists and belongs to user
            const project = await Project.findOne({ _id: projectId, userId: req.user.id });
            if (!project) {
                return res.status(404).json({ msg: 'Project not found or access denied.' });
            }

            const { title, description, status, priority, tags, assigneeId, dueDate } = req.body;

            if (!title) {
                return res.status(400).json({ title: 'Issue title is required.' });
            }

            // Validate assigneeId if provided
            if (assigneeId && !mongoose.Types.ObjectId.isValid(assigneeId)) {
                return res.status(400).json({ msg: 'Invalid Assignee ID format.' });
            }
            // Here you might also want to check if the assigneeId is a valid user,
            // or part of the project team if you implement teams later.
            // For a personal tracker, assignee might often be req.user.id or null.

            const newIssue = new Issue({
                projectId,
                userId: req.user.id, // User who owns this issue (same as project owner for now)
                reporterId: req.user.id, // User who is creating/reporting this issue
                title,
                description: description || '',
                status: status || 'open',
                priority: priority || 'medium',
                tags: tags || [],
                assigneeId: assigneeId || null, // Can be null
                dueDate: dueDate || null,
            });

            const issue = await newIssue.save();
            res.status(201).json(issue);
        } catch (err) {
            console.error('Error creating issue:', err.message);
            if (err.name === 'ValidationError') {
                return res.status(400).json(err.errors);
            }
            res.status(500).send('Server Error while creating issue');
        }
    }
);

// @route   GET api/bugtrace/projects/:projectId/issues
// @desc    Get all issues for a specific project
// @access  Private
router.get(
    '/projects/:projectId/issues',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const projectId = req.params.projectId;
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({ msg: 'Invalid Project ID format.' });
            }

            // Check if project exists and belongs to user (important for security)
            const project = await Project.findOne({ _id: projectId, userId: req.user.id });
            if (!project) {
                return res.status(404).json({ msg: 'Project not found or access denied.' });
            }

            const issues = await Issue.find({ projectId: projectId, userId: req.user.id }) // Ensure issues also belong to the user
                                      .sort({ createdAt: -1 }); // Or sort by priority, status, etc.
            res.json(issues);
        } catch (err) {
            console.error('Error fetching issues for project:', err.message);
            res.status(500).send('Server Error while fetching issues');
        }
    }
);

// @route   GET api/bugtrace/issues/:issueId
// @desc    Get a specific issue by its ID
// @access  Private (user must own the project the issue belongs to)
router.get(
    '/issues/:issueId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const issueId = req.params.issueId;
            if (!mongoose.Types.ObjectId.isValid(issueId)) {
                return res.status(400).json({ msg: 'Invalid Issue ID format.' });
            }

            const issue = await Issue.findOne({ _id: issueId, userId: req.user.id });

            if (!issue) {
                return res.status(404).json({ msg: 'Issue not found or access denied.' });
            }
            
            // Optional: Further check if the issue's project still belongs to the user, though userId on issue helps.
            // const project = await Project.findOne({ _id: issue.projectId, userId: req.user.id });
            // if (!project) {
            //    return res.status(404).json({ msg: 'Issue found, but parent project access denied or missing.' });
            // }

            res.json(issue);
        } catch (err) {
            console.error('Error fetching single issue:', err.message);
            res.status(500).send('Server Error while fetching issue');
        }
    }
);


// @route   PUT api/bugtrace/issues/:issueId
// @desc    Update an issue
// @access  Private (user must own the project the issue belongs to)
router.put(
    '/issues/:issueId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const issueId = req.params.issueId;
            if (!mongoose.Types.ObjectId.isValid(issueId)) {
                return res.status(400).json({ msg: 'Invalid Issue ID format.' });
            }

            const { title, description, status, priority, tags, assigneeId, dueDate } = req.body;

            let issue = await Issue.findOne({ _id: issueId, userId: req.user.id });
            if (!issue) {
                return res.status(404).json({ msg: 'Issue not found or access denied for update.' });
            }

            // Update fields if provided
            if (title !== undefined) issue.title = title;
            if (description !== undefined) issue.description = description;
            if (status && ['open', 'in_progress', 'in_review', 'closed', 'reopened'].includes(status)) issue.status = status;
            if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) issue.priority = priority;
            if (tags !== undefined) issue.tags = tags;
            if (dueDate !== undefined) issue.dueDate = dueDate === '' ? null : dueDate; // Handle clearing due date

            // Handle assigneeId: allow setting to null to unassign
            if (assigneeId !== undefined) {
                if (assigneeId === null || assigneeId === '') {
                    issue.assigneeId = null;
                } else if (mongoose.Types.ObjectId.isValid(assigneeId)) {
                    issue.assigneeId = assigneeId;
                    // Optional: check if assigneeId is a valid user
                } else {
                    return res.status(400).json({ msg: 'Invalid Assignee ID format for update.' });
                }
            }
            
            if (title !== undefined && !title.trim()) {
                 return res.status(400).json({ title: 'Issue title cannot be empty when updating.' });
            }


            const updatedIssue = await issue.save();
            res.json(updatedIssue);

        } catch (err) {
            console.error('Error updating issue:', err.message);
            if (err.name === 'ValidationError') {
                return res.status(400).json(err.errors);
            }
            res.status(500).send('Server Error while updating issue');
        }
    }
);

// @route   DELETE api/bugtrace/issues/:issueId
// @desc    Delete an issue
// @access  Private (user must own the project the issue belongs to)
router.delete(
    '/issues/:issueId',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const issueId = req.params.issueId;
            if (!mongoose.Types.ObjectId.isValid(issueId)) {
                return res.status(400).json({ msg: 'Invalid Issue ID format.' });
            }

            const issue = await Issue.findOne({ _id: issueId, userId: req.user.id });
            if (!issue) {
                return res.status(404).json({ msg: 'Issue not found or access denied for deletion.' });
            }

            await Issue.findByIdAndDelete(issueId);
            // Or using instance: await issue.deleteOne();

            res.json({ msg: 'Issue successfully deleted.' });
        } catch (err) {
            console.error('Error deleting issue:', err.message);
            res.status(500).send('Server Error while deleting issue');
        }
    }
);

module.exports = router;