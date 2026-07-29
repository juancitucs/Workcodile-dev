const config = require('./src/config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seed() {
    if (config.nodeEnv === 'production') {
        console.error('Refusing to seed in production');
        process.exit(1);
    }

    await mongoose.connect(config.mongo.uri);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User');
    const Course = require('./src/models/Course');
    const Post = require('./src/models/Post');

    // Seed user
    const existingUser = await User.findOne({ email: 'test@test.com' });
    let userId;
    if (existingUser) {
        console.log('Seed user already exists');
        userId = existingUser._id;
    } else {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Test1234', salt);
        const user = await User.create({
            name: 'Usuario de Prueba',
            email: 'test@test.com',
            password,
            isVerified: true,
            bio: 'Estudiante de Ingenieria de Sistemas',
            role: 'student',
        });
        userId = user._id;
        console.log('Seed user created: test@test.com / Test1234');
    }

    // Seed courses
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
        const { courses } = require('./src/data/courses');
        await Course.insertMany(courses.map((c) => ({ _id: c.id, name: c.name, cycle: c.cycle })));
        console.log(`Seeded ${courses.length} courses`);
    } else {
        console.log(`Courses already exist (${courseCount})`);
    }

    // Seed sample post
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
        await Post.create({
            title: 'Bienvenido a WorkCodile Foro',
            content: 'Este es un post de ejemplo para probar la plataforma. Puedes crear tus propios posts, comentar y votar.',
            author: userId,
            course_id: 'IS-524',
            hashtags: ['bienvenida', 'ejemplo'],
            attachments: [],
            views: 0,
            upvote_count: 0,
            downvote_count: 0,
            comments: [],
        });
        console.log('Sample post created');
    } else {
        console.log(`Posts already exist (${postCount})`);
    }

    await mongoose.disconnect();
    console.log('Seed complete');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});