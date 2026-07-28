const Course = require('../models/Course')

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).sort({ cycle: 1, _id: 1 })
    res.json(courses)
  } catch (error) {
    next(error)
  }
}

module.exports = { getAllCourses }