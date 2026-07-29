const express = require('express')
const router = express.Router()
const { param } = require('express-validator')
const { getSettings, updateSettings, getCompletedCourses, addCompletedCourse, removeCompletedCourse } = require('../controllers/settingsController')
const auth = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')

const courseIdParam = [param('courseId').trim().notEmpty().withMessage('Course ID is required')]

router.get('/', auth, getSettings)
router.put('/', auth, updateSettings)
router.get('/completed-courses', auth, getCompletedCourses)
router.post('/completed-courses', auth, addCompletedCourse)
router.delete('/completed-courses/:courseId', auth, courseIdParam, validate, removeCompletedCourse)

module.exports = router