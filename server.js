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
app.use(express.static(__dirname)); // Serve landing page and other assets
app.use('/videos', express.static(path.join(__dirname, 'videos'))); // Serve local video files

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
    const { fullName, email, course } = req.body;

    if (!fullName || !email || !course) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const db = readDB();
    const newEnrollment = {
        id: Date.now(), // Simple ID
        type: 'enrollment',
        fullName,
        email,
        course,
        date: new Date().toISOString()
    };

    db.enrollments.push(newEnrollment);
    writeDB(db);

    console.log(`[ENROLL] New enrollment: ${fullName} for ${course}`);
    res.json({ message: 'Enrollment received successfully!' });
});

// 2. Registration (Detailed Form)
app.post('/api/register', (req, res) => {
    const { fullName, email, gender, subject } = req.body;

    if (!fullName || !email || !gender || !subject) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const db = readDB();

    // Check if valid user (optional logic)

    const newRegistration = {
        id: Date.now(),
        type: 'registration',
        fullName,
        email,
        gender,
        subject,
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

    // For demo purposes, we accept any login if fields are filled
    // In a real app, you would check the password against a hashed value in the DB
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password required.' });
    }

    // Optional: Check if email exists in registrations
    const db = readDB();
    const userExists = db.registrations.find(u => u.email === email);

    // We'll allow login even if not strictly found for this demo, 
    // or you can enforce: if (!userExists) return res.status(401).json({message: 'User not found'});

    console.log(`[LOGIN] User logged in: ${email}`);
    res.json({ message: 'Login successful', redirect: 'student_dashboard.html' });
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
