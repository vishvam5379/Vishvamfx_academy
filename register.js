const canvas = document.getElementById('canvas-background');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
const STAR_COUNT = 300;
const CONNECTION_DIST = 100;

// Resize canvas
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
}

// Star Class
class Star {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * width; // Depth
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.5 + 0.1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    update() {
        // Move stars
        this.x += this.vx;
        this.y += this.vy;

        // Mouse influence
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
            this.vx += dx * 0.0001;
            this.vy += dy * 0.0001;
        }

        // Friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let mouse = { x: width / 2, y: height / 2 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Parallax Effect on Card
    const card = document.querySelector('.register-card');
    if (card) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Deep Space Gradient Background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    gradient.addColorStop(0, '#100b2e'); // Deep Purple Center
    gradient.addColorStop(1, '#030305'); // Black Edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw Stars and Connections
    stars.forEach((star, index) => {
        star.update();
        star.draw();

        // Connect nearby stars
        for (let j = index + 1; j < stars.length; j++) {
            const other = stars[j];
            const dist = Math.hypot(star.x - other.x, star.y - other.y);

            if (dist < CONNECTION_DIST) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(157, 0, 255, ${1 - dist / CONNECTION_DIST})`; // Violet lines
                ctx.lineWidth = 0.5;
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        }

        // Connect to mouse
        const mouseDist = Math.hypot(star.x - mouse.x, star.y - mouse.y);
        if (mouseDist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 170, 0, ${1 - mouseDist / 150})`; // Gold lines to mouse
            ctx.lineWidth = 0.8;
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();

// --- Form Handling (Registration Page) ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const gender = document.getElementById('gender').value;

            // Handle radio buttons for subject
            const subjectRadio = document.querySelector('input[name="subject"]:checked');
            const subject = subjectRadio ? subjectRadio.value : '';

            const btn = document.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Initializing...';

            const formData = {
                fullName,
                email,
                gender,
                subject
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Registration Successful! Redirecting to Dashboard...');
                    window.location.href = 'student_dashboard.html';
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.warn('Backend server unreachable. Using mock response.', error);

                // Simulate success for demo
                setTimeout(() => {
                    alert('Registration Successful! (Demo Mode: Redirecting...)');
                    window.location.href = 'student_dashboard.html';
                }, 1000);
            } finally {
                btn.innerHTML = originalText;
            }
        });
    }
});
