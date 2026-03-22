const express = require('express');
const router = express.Router();
const {
  getAllProjects, getProject, createProject,
  updateProject, deleteProject, addMember,
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema } = require('../validators/projectValidators');

// All project routes require authentication
router.use(protect);

router.route('/')
  .get(getAllProjects)
  .post(validate(createProjectSchema), createProject);

router.route('/:id')
  .get(getProject)
  .patch(validate(updateProjectSchema), updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);

module.exports = router;