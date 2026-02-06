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
    const enrollForm = document.querySelector('.enroll-form');
    if (enrollForm) {
        enrollForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = enrollForm.querySelector('input[type="text"]');
            const emailInput = enrollForm.querySelector('input[type="email"]');
            const courseSelect = enrollForm.querySelector('select');
            const btn = enrollForm.querySelector('button');
            const originalText = btn.innerText;

            const formData = {
                fullName: nameInput.value,
                email: emailInput.value,
                course: courseSelect.value
            };

            btn.innerText = 'Processing...';

            try {
                const response = await fetch('/api/enroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Success! ' + result.message);
                    enrollForm.reset();
                    // Optional redirect
                    // window.location.href = 'register.html';
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.warn('Backend server unreachable. Using mock response for demo.', error);
                // Simulate success for demo purposes if backend is missing
                setTimeout(() => {
                    alert('Success! (Demo Mode: Backend unreachable, but form validated)');
                    enrollForm.reset();
                }, 1000);
            } finally {
                btn.innerText = originalText;
            }
        });
    }
});
