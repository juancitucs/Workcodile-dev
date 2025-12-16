const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getCompletedCourses, addCompletedCourse, removeCompletedCourse } = require('../controllers/settingsController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);

router.get('/completed-courses', auth, getCompletedCourses);
router.post('/completed-courses', auth, addCompletedCourse);
router.delete('/completed-courses/:courseId', auth, removeCompletedCourse);

module.exports = router;
