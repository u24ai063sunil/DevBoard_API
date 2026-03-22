const express = require('express');
const router = express.Router({ mergeParams: true }); // ← mergeParams gets :projectId from parent
const {
  getAllTasks, getTask, createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;