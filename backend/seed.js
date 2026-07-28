const config = require('./src/config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

async function seed() {
  await mongoose.connect(config.mongo.uri)
  console.log('Connected to MongoDB')

  const User = require('./src/models/User')

  const existing = await User.findOne({ email: 'test@test.com' })
  if (existing) {
    console.log('Seed user already exists')
    await mongoose.disconnect()
    return
  }

  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash('123456', salt)

  await User.create({
    name: 'Usuario de Prueba',
    email: 'test@test.com',
    password,
    isVerified: true,
  })

  console.log('Seed user created: test@test.com / 123456')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})