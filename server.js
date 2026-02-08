const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve assets
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Explicit route for landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize Database
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ enrollments: [], registrations: [] }, null, 2));
}

// Helper to read DB
const readDB = () => {
    return JSON.parse(fs.readFileSync(DB_FILE));
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Routes

// 1. Enrollment (Landing Page)
app.post('/api/enroll', (req, res) => {
    const { fullName, email, password, course, price } = req.body;

    if (!fullName || !email || !password || !course) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const db = readDB();

    // Optional: Check if already enrolled
    const existing = db.enrollments.find(e => e.email === email);
    if (existing) {
        return res.status(400).json({ message: 'Email already enrolled. Please login.' });
    }

    const newEnrollment = {
        id: Date.now(),
        type: 'enrollment',
        fullName,
        email,
        password, // In a real app, hash this!
        course,
        price,
        date: new Date().toISOString()
    };

    db.enrollments.push(newEnrollment);
    writeDB(db);

    console.log(`[ENROLL] New enrollment: ${fullName} for ${course} (Amount: ${price})`);
    res.json({ message: 'Enrollment received successfully! You can now login.' });
});

// 2. Registration (Detailed Form)
app.post('/api/register', (req, res) => {
    const { fullName, email, password, gender, subject } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Name, Email and Password are required.' });
    }

    const db = readDB();

    // Check if already exists in registrations OR enrollments
    const existing = db.registrations.find(u => u.email === email) || db.enrollments.find(e => e.email === email);
    if (existing) {
        return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const newRegistration = {
        id: Date.now(),
        type: 'registration',
        fullName,
        email,
        password,
        gender: gender || 'Not specified',
        subject: subject || 'All',
        date: new Date().toISOString()
    };

    db.registrations.push(newRegistration);
    writeDB(db);

    console.log(`[REGISTER] New user registered: ${fullName}`);
    res.json({ message: 'User registered successfully!', redirect: 'student_dashboard.html' });
});

// 3. Login (Student Portal)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password required.' });
    }

    const db = readDB();

    // Search in both collections
    let user = db.enrollments.find(u => u.email === email);
    if (!user) {
        user = db.registrations.find(u => u.email === email);
    }

    if (!user) {
        console.log(`[LOGIN FAILED] User not found: ${email}`);
        return res.status(401).json({ message: 'User not found. Please enroll first.' });
    }

    // Verify Password
    if (user.password !== password) {
        console.log(`[LOGIN FAILED] Incorrect password for: ${email}`);
        return res.status(401).json({ message: 'Incorrect password.' });
    }

    console.log(`[LOGIN] User logged in: ${email}`);
    res.json({
        message: 'Login successful',
        redirect: 'student_dashboard.html',
        user: { fullName: user.fullName, email: user.email }
    });
});

// 4. Get Course Content
app.get('/api/courses', (req, res) => {
    const coursesPath = path.join(__dirname, 'courses.json');
    if (fs.existsSync(coursesPath)) {
        const courses = JSON.parse(fs.readFileSync(coursesPath));
        res.json(courses);
    } else {
        res.status(404).json({ message: 'No courses found' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database file: ${DB_FILE}`);
});
