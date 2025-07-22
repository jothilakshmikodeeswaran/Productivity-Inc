import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { authMiddleware } from "../utils/auth.js";

const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);


// POST /api/projects/:projectId/tasks  = Create a task under a project
//localhost:3000/api/tasks/projects/687fae82f44a02534a0f4147/tasks/
router.post('/projects/:projectId/tasks', async (req, res) => {
    try {

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to add task to this project.' });
        }
        const { title, description, status } = req.body;

        const createdTask = await Task.create({
            title,
            description,
            status,
            project: project._id
        });

        res.status(201).json(createdTask);
    } catch (err) {
        res.status(500).json({ message: 'Error creating task.' });
    }
});

// GET GET /api/projects/:projectId/tasks - Get all tasks for a specific project
router.get('/projects/:projectId/tasks', async (req, res) => {
    try {

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view tasks for this project.' });
        }
        const tasks = await Task.find({ project: project._id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks.' });
    }
});


// PUT /api/tasks/:taskId: -Update a single task
router.put('/:taskId', async (req, res) => {
    try {

        const task = await Task.findById(req.params.taskId).populate('project');

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const project = task.project;

        if (!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this task.' });
        }
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            {
                title: req.body.title || task.title,
                description: req.body.description || task.description,
                status: req.body.status || task.status
            },
            { new: true, runValidators: true }
        );

        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: 'Error updating task.' });
    }
});

//DELETE /api/tasks/:taskId - Delete a single task
router.delete('/:taskId', async (req, res) => {
    try {

        const task = await Task.findById(req.params.taskId).populate('project');

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const project = task.project;

        if (!project || project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this task.' });
        }
        await Task.findByIdAndDelete(req.params.taskId);
        res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task.' });
    }
});

export default router;