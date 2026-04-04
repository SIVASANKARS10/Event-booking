/**
 * Seed script — creates an admin user + demo student + sample events
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');

const SAMPLE_EVENTS = [
  {
    title: 'National Hackathon 2025',
    description: 'A 24-hour hackathon where teams of 2–4 build innovative solutions to real-world problems. Open to all engineering branches. Themes will be revealed at the start of the event.',
    category: 'hackathon',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '9:00 AM – 9:00 AM (24 hrs)',
    venue: 'Innovation Hub, Block C',
    price: 200,
    totalSeats: 80,
    rules: '• Teams of 2–4 members\n• All work must be done during the event\n• Use of pre-existing code allowed with disclosure\n• Judging based on innovation, execution and presentation',
    prizes: '🥇 1st Place: ₹15,000\n🥈 2nd Place: ₹8,000\n🥉 3rd Place: ₹4,000\n🎖 Best UI: ₹2,000',
    maxTeamSize: 4,
    tags: ['hackathon', 'coding', 'innovation', '24hr']
  },
  {
    title: 'Code Sprint — DSA Challenge',
    description: 'Competitive programming contest focusing on data structures and algorithms. Solve 5 problems of increasing difficulty within 3 hours. Individual participation only.',
    category: 'coding',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: '10:00 AM – 1:00 PM',
    venue: 'Computer Lab 1 & 2, Block B',
    price: 100,
    totalSeats: 60,
    rules: '• Individual participation only\n• External IDEs allowed; internet not permitted\n• Languages: C, C++, Java, Python\n• No communication between participants',
    prizes: '🥇 ₹5,000 + Trophy\n🥈 ₹3,000\n🥉 ₹1,500\nTop 10 receive certificates',
    maxTeamSize: 1,
    tags: ['dsa', 'algorithms', 'competitive', 'coding']
  },
  {
    title: 'Research Paper Presentation',
    description: 'Present your research to a panel of faculty and industry experts. Papers must be original work related to CS/IT/ECE domains. Prior abstract submission required.',
    category: 'paper_presentation',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: '9:30 AM – 4:30 PM',
    venue: 'Seminar Hall, Admin Block',
    price: 150,
    totalSeats: 40,
    rules: '• Teams of 1–3 members\n• Paper must be original and not previously published\n• 15 min presentation + 5 min Q&A\n• IEEE format required',
    prizes: '🥇 Best Paper: ₹8,000\n🥈 Runner Up: ₹4,000\n Publication opportunity for top 3 papers',
    maxTeamSize: 3,
    tags: ['research', 'ieee', 'paper', 'academic']
  },
  {
    title: 'Web Dev Workshop: Full Stack with MERN',
    description: 'An intensive hands-on workshop covering MongoDB, Express, React and Node.js. Build a complete web application from scratch. Laptop mandatory, all software will be provided.',
    category: 'workshop',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '10:00 AM – 5:00 PM',
    venue: 'Workshop Lab, Block D',
    price: 250,
    totalSeats: 30,
    rules: '• Bring your own laptop\n• Node.js & VS Code must be pre-installed\n• Individual participation\n• Certificate of completion awarded',
    prizes: 'Completion Certificate\nProject deployed on live server',
    maxTeamSize: 1,
    tags: ['web', 'mern', 'react', 'nodejs', 'workshop']
  },
  {
    title: 'TechQuiz Olympiad',
    description: 'Battle of the brains — test your knowledge in Computer Science, Electronics, and General Technology. Three rounds: MCQ, Buzzer, and Final Face-off.',
    category: 'quiz',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    time: '2:00 PM – 6:00 PM',
    venue: 'Main Auditorium',
    price: 0,
    totalSeats: 100,
    rules: '• Teams of 2 members\n• No phones during rounds\n• Quizmaster\'s decision is final\n• Three elimination rounds',
    prizes: '🥇 ₹3,000 + Trophy\n🥈 ₹1,500\n🥉 ₹750',
    maxTeamSize: 2,
    tags: ['quiz', 'cs', 'electronics', 'general-knowledge', 'free']
  },
  {
    title: 'AI/ML Workshop: Build Your First Model',
    description: 'Learn the fundamentals of Machine Learning and build your first classification model using Python, scikit-learn and TensorFlow. No prior ML experience required.',
    category: 'workshop',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    time: '9:00 AM – 4:00 PM',
    venue: 'AI Research Lab, Block E',
    price: 300,
    totalSeats: 25,
    rules: '• Laptop with Python 3.8+ required\n• Anaconda/Jupyter recommended\n• Individual participation\n• Hands-on project included',
    prizes: 'Certificate + GitHub portfolio project\nBest project featured on college website',
    maxTeamSize: 1,
    tags: ['ai', 'ml', 'python', 'tensorflow', 'workshop']
  }
];

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@techsym.com',
      password: 'admin123',
      role: 'admin',
      college: 'TechSymposium College',
      phone: '+91 9000000001'
    });
    console.log('👤 Admin created:', admin.email);

    // Create demo student
    const student = await User.create({
      name: 'Demo Student',
      email: 'student@techsym.com',
      password: 'student123',
      role: 'student',
      college: 'Sample Engineering College',
      phone: '+91 9000000002'
    });
    console.log('👤 Student created:', student.email);

    // Create events
    const events = await Event.insertMany(
      SAMPLE_EVENTS.map(e => ({ ...e, availableSeats: e.totalSeats, createdBy: admin._id }))
    );
    console.log(`🎯 Created ${events.length} events`);

    console.log('\n✨ Seed complete!\n');
    console.log('─────────────────────────────────');
    console.log('  Admin:   admin@techsym.com / admin123');
    console.log('  Student: student@techsym.com / student123');
    console.log('─────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
