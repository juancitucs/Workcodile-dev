const config = require('./src/config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

async function seed() {
  await mongoose.connect(config.mongo.uri)
  console.log('Connected to MongoDB')

  const User = require('./src/models/User')
  const Course = require('./src/models/Course')

  const existingUser = await User.findOne({ email: 'test@test.com' })
  if (existingUser) {
    console.log('Seed user already exists')
  } else {
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash('123456', salt)

    await User.create({
      name: 'Usuario de Prueba',
      email: 'test@test.com',
      password,
      isVerified: true,
      bio: 'Estudiante de Ingeniería de Sistemas',
      role: 'student',
    })
    console.log('Seed user created: test@test.com / 123456')
  }

  const courseCount = await Course.countDocuments()
  if (courseCount === 0) {
    const { courses } = require('./src/data/courses')
    await Course.insertMany(courses.map(c => ({ _id: c.id, name: c.name, cycle: c.cycle })))
    console.log(`Seeded ${courses.length} courses`)
  } else {
    console.log(`Courses already exist (${courseCount})`)
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})