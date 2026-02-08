document.addEventListener('DOMContentLoaded', () => {

    // --- Soft Scroll Animation ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.course-card, .hero-content, .hero-visual, .funded-text, .form-container');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });

    // --- Form Handling (Index Page) ---
    const enrollForm = document.getElementById('enrollment-form');
    if (enrollForm) {
        enrollForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('enroll-name');
            const emailInput = document.getElementById('enroll-email');
            const passwordInput = document.getElementById('enroll-password');
            const courseSelect = document.getElementById('enroll-course-select');
            const selectedOption = courseSelect.options[courseSelect.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const btn = document.getElementById('enroll-submit-btn');
            const originalText = btn.innerText;

            const formData = {
                fullName: nameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                course: courseSelect.value,
                price: price
            };

            btn.innerText = 'Processing...';

            try {
                const response = await fetch('/api/enroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Redirect to payment if price > 0
                    if (parseInt(price) > 0) {
                        const params = new URLSearchParams({
                            name: formData.fullName,
                            email: formData.email,
                            course: formData.course,
                            price: price
                        });
                        window.location.href = `payment.html?${params.toString()}`;
                    } else {
                        alert('Enrollment successful for Forex Basics (Free Content). Redirecting to dashboard...');
                        window.location.href = 'student_dashboard.html';
                    }
                } else {
                    const result = await response.json();
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.warn('Backend server unreachable. Using local flow for demo.', error);

                // Demo flow: redirect to payment anyway
                if (parseInt(price) > 0) {
                    const params = new URLSearchParams({
                        name: formData.fullName,
                        email: formData.email,
                        course: formData.course,
                        price: price
                    });
                    window.location.href = `payment.html?${params.toString()}`;
                } else {
                    alert('Enrollment successful! Redirecting to dashboard...');
                    window.location.href = 'student_dashboard.html';
                }
            } finally {
                btn.innerText = originalText;
            }
        });
    }
});
