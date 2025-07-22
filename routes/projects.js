import express from "express";
import Project from "../models/Project.js";
import { authMiddleware } from "../utils/auth.js";

const router = express.Router();

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);


// POST /api/projects - Create a new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = await Project.create({
      name,
      description,
      user: req.user._id
    });
    console.log(newProject);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project.' });
  }
});

// GET /api/projects - Get all project for the logged-in user
router.get("/", async (req, res) => {
  try {
    const getallProject = await Project.find({ user: req.user._id })
    res.json(getallProject);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects.' });
  }
});

// GET /api/projects - Get a single project by ID 

router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching project with ID:', req.params.id);
    const project = await Project.findById(req.params.id);
    //.populate('user', 'username');
    if (!project) return res.status(404).json({ message: 'Project not found.' });

   if (!project.user || project.user._id.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Unauthorized access.' });
}

    res.json(project);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Error fetching project.' });
  }
});


// PUT/api/projects/:id - Update a single project by ID
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project)
      { 
        return res.status(404).json({ message: 'Project not found.' });
      }

    if (project.user.toString() !== req.user._id.toString())
    {
      return res.status(403).json({ message: 'Unauthorized to update this project.' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || project.name,
        description: req.body.description || project.description
      },
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project.' });
  }
});

// DELETE /api/projects/:id  - Delete a project
router.delete("/:id", authMiddleware, async (req, res) => {

  try {
    const deleteProject = await Project.findByIdAndDelete(req.params.id);
    if (!deleteProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    // Authorization check
    if (!deleteProject.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this project.' });
    }
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project.' });
  }

});

export default router;