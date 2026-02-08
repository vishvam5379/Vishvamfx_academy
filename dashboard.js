document.addEventListener('DOMContentLoaded', () => {

    // --- USER SESSION HANDLING ---
    const userProfile = JSON.parse(localStorage.getItem('currentUser'));
    if (userProfile) {
        // Update Sidebar Info
        const sidebarName = document.querySelector('.user-profile-summary .name');
        const sidebarAvatar = document.querySelector('.user-profile-summary .avatar-circle');

        if (sidebarName) sidebarName.innerText = userProfile.fullName;
        if (sidebarAvatar) {
            const initials = userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
            sidebarAvatar.innerText = initials;
        }
    } else {
        // Optional: Redirect to login if no user found
        // window.location.href = 'register.html';
    }

    // --- TAB NAVIGATION ---
    const navBtns = document.querySelectorAll('.nav-btn[data-tab]');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            navBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            // Show target section
            document.getElementById(`view-${tabName}`).classList.add('active');

            // Update Header Title
            const iconHTML = btn.querySelector('i').outerHTML;
            pageTitle.innerHTML = `${iconHTML} &nbsp; ${btn.innerText.trim()}`;
        });
    });

    // --- SETTINGS FORM HANDLING ---
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm && userProfile) {
        const nameInput = document.getElementById('settings-name');
        const emailInput = document.getElementById('settings-email');
        const passInput = document.getElementById('settings-password');
        const confirmPassInput = document.getElementById('settings-confirm-password');

        // Pre-fill form
        nameInput.value = userProfile.fullName;
        emailInput.value = userProfile.email;

        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validation
            if (passInput.value && passInput.value !== confirmPassInput.value) {
                alert('Passwords do not match!');
                return;
            }

            const updatedData = {
                fullName: nameInput.value,
                email: emailInput.value,
                password: passInput.value || undefined
            };

            const btn = settingsForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Saving...';

            try {
                // In a real app, you would send a PATCH/POST request to the backend
                // For this demo, we'll update localStorage and show success
                localStorage.setItem('currentUser', JSON.stringify({
                    ...userProfile,
                    fullName: updatedData.fullName,
                    email: updatedData.email
                }));

                setTimeout(() => {
                    alert('Profile updated successfully!');
                    btn.innerText = originalText;
                    // Refresh sidebar
                    const sidebarName = document.querySelector('.user-profile-summary .name');
                    const sidebarAvatar = document.querySelector('.user-profile-summary .avatar-circle');
                    if (sidebarName) sidebarName.innerText = updatedData.fullName;
                    if (sidebarAvatar) {
                        const initials = updatedData.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
                        sidebarAvatar.innerText = initials;
                    }
                    passInput.value = '';
                    confirmPassInput.value = '';
                }, 800);

            } catch (error) {
                alert('An error occurred while saving.');
                btn.innerText = originalText;
            }
        });
    }

    // --- LOAD COURSES DYNAMICALLY ---
    const coursesContainer = document.getElementById('courses-list-container');
    const playerContainer = document.querySelector('.video-player-container');
    const videoFrame = document.getElementById('main-video-frame');
    const videoTitle = document.getElementById('video-title');

    async function loadCourses() {
        try {
            const response = await fetch('/api/courses');

            // Fallback for demo if backend offline
            if (!response.ok) throw new Error('Backend offline');

            const data = await response.json();
            renderCourses(data.modules);

        } catch (error) {
            console.warn('Could not load courses from backend, using dummy data.');
            // Dummy data fallback
        }
    }

    function renderCourses(modules) {
        coursesContainer.innerHTML = '';
        totalLessonsCount = 0; // Reset count

        modules.forEach(mod => {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = `course-module ${mod.status === 'completed' ? 'completed' : mod.status === 'active' ? 'active-module' : 'locked-module'}`;

            const badgeClass = mod.status === 'completed' ? 'success' : mod.status === 'active' ? 'warning' : '';
            const badgeText = mod.status === 'completed' ? 'Completed' : mod.status === 'active' ? 'In Progress' : 'Locked';

            const liveBadgeHTML = mod.type === 'live' ? `<div class="badge-live" style="position:static; padding: 2px 8px; font-size:0.6rem;"><span class="pulse-dot"></span> LIVE</div>` : '';

            let lessonsHTML = '';
            if (mod.lessons) {
                mod.lessons.forEach(lesson => {
                    totalLessonsCount++; // Count every lesson

                    const isCompleted = userProfile && userProfile.completedLessons && userProfile.completedLessons.includes(lesson.id);
                    const icon = mod.status === 'locked' ? 'fa-lock' : (isCompleted ? 'fa-circle-check' : (lesson.isLive ? 'fa-broadcast-tower' : 'fa-circle-play'));
                    const iconColor = isCompleted ? '#10b981' : (lesson.isLive ? 'var(--live-red)' : '#3b82f6');

                    const lockedClass = mod.status === 'locked' ? 'locked' : '';
                    const liveIndicator = lesson.isLive ? `<span style="color:var(--live-red); font-size:0.7rem; margin-left:10px; font-weight:bold;">LIVE SESSION</span>` : '';

                    lessonsHTML += `
                        <div class="lesson-item ${lockedClass}" onclick="playVideo('${lesson.videoUrl}', '${lesson.title}', ${mod.status === 'locked'}, ${lesson.id}, '${mod.title.replace(/'/g, "\\'")}')">
                            <i class="fa-solid ${icon}" style="color: ${iconColor}"></i> ${lesson.title} ${liveIndicator}
                            <span style="margin-left:auto; font-size:0.8rem; color:${lesson.isLive ? 'var(--live-red)' : '#999'};">${lesson.duration}</span>
                        </div>
                    `;
                });
            }

            moduleDiv.innerHTML = `
                <div class="module-header" style="justify-content: space-between; align-items: center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <h4>${mod.title}</h4>
                        ${liveBadgeHTML}
                    </div>
                </div>
                <div class="module-body">
                    ${lessonsHTML}
                </div>
            `;

            coursesContainer.appendChild(moduleDiv);
        });

        updateProgressUI(); // Update stats after calculating totalLessonsCount
        updateContinueLearningUI();
    }

    // --- PROGRESS TRACKING ---
    let totalLessonsCount = 0;

    function updateProgressUI() {
        if (!userProfile) return;

        const completed = userProfile.completedLessons || [];
        const percent = totalLessonsCount > 0 ? Math.round((completed.length / totalLessonsCount) * 100) : 0;

        // Update Overview Progress
        const progressVal = document.querySelector('#view-overview .stat-val');
        const progressFill = document.querySelector('#view-overview .fill');

        if (progressVal) progressVal.innerText = `${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;
    }

    // Helper to format YouTube URL
    function getEmbedUrl(url) {
        let videoId = '';
        if (url.includes('youtube.com/embed/')) {
            return url;
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else {
            return url; // Return original if not recognized
        }
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    // --- CONTINUE LEARNING LOGIC ---
    function updateContinueLearningUI() {
        if (!userProfile || !userProfile.lastWatched) {
            // Default to first lesson if nothing watched
            return;
        }

        const last = userProfile.lastWatched;
        const contModule = document.getElementById('continue-module');
        const contLesson = document.getElementById('continue-lesson');
        const resumeBtn = document.getElementById('continue-resume-btn');

        if (contModule) contModule.innerText = last.moduleTitle;
        if (contLesson) contLesson.innerText = last.lessonTitle;

        if (resumeBtn) {
            resumeBtn.onclick = () => {
                // 1. Switch to courses tab
                const coursesTabBtn = document.querySelector('.nav-btn[data-tab="courses"]');
                if (coursesTabBtn) coursesTabBtn.click();

                // 2. Play the video
                playVideo(last.url, last.lessonTitle, false, last.id, last.moduleTitle);

                // 3. Ensure player is visible and scroll to it
                setTimeout(() => {
                    const player = document.querySelector('.video-player-container');
                    if (player) {
                        player.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            };
        }
    }

    // Expose playVideo to global scope
    let currentLessonId = null;
    window.playVideo = (url, title, isLocked, lessonId, moduleTitle) => {
        if (isLocked) {
            alert('This module is locked. Complete previous modules first.');
            return;
        }

        currentLessonId = lessonId;

        // Save Last Watched
        if (userProfile) {
            userProfile.lastWatched = {
                id: lessonId,
                url: url,
                lessonTitle: title,
                moduleTitle: moduleTitle || 'Forex Training'
            };
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            updateContinueLearningUI();
        }

        playerContainer.style.display = 'block';
        const wrapper = document.querySelector('.video-wrapper');
        const markBtn = document.getElementById('mark-complete-btn');

        // Show/Hide mark complete button
        if (markBtn) {
            const isCompleted = userProfile && userProfile.completedLessons && userProfile.completedLessons.includes(lessonId);
            markBtn.style.display = 'block';
            markBtn.innerText = isCompleted ? 'Completed ✓' : 'Mark as Completed';
            markBtn.disabled = isCompleted;
            markBtn.style.opacity = isCompleted ? '0.6' : '1';
        }

        // Output clean player
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const embedUrl = getEmbedUrl(url);
            wrapper.innerHTML = `<iframe id="main-video-frame" src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>`;
        } else {
            // Assume Local File (mp4/webm)
            wrapper.innerHTML = `<video id="main-video-frame" src="${url}" controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background:black;"></video>`;
            const videoElement = wrapper.querySelector('video');
            videoElement.play();
        }

        videoTitle.innerText = title;
        playerContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle "Mark as Completed" button click
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', () => {
            if (!userProfile) return;
            if (!userProfile.completedLessons) userProfile.completedLessons = [];

            if (currentLessonId && !userProfile.completedLessons.includes(currentLessonId)) {
                userProfile.completedLessons.push(currentLessonId);
                localStorage.setItem('currentUser', JSON.stringify(userProfile));

                markCompleteBtn.innerText = 'Completed ✓';
                markCompleteBtn.disabled = true;
                markCompleteBtn.style.opacity = '0.6';

                updateProgressUI();

                // Re-render courses to update checkmarks
                loadCourses();
            }
        });
    }

    // Initialize loading
    loadCourses();


    // --- DOUBT STATION CHAT LOGIC ---
    const sendBtn = document.getElementById('send-doubt');
    const doubtInput = document.getElementById('doubt-input');
    const chatMessages = document.getElementById('chat-messages');

    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar-sm';

        if (type === 'student') {
            const initials = userProfile ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'ST';
            avatar.innerText = initials;
        } else {
            avatar.innerText = 'M';
        }

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerText = text;

        if (type === 'student') {
            msgDiv.appendChild(bubble);
            msgDiv.appendChild(avatar);
        } else {
            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubble);
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll
    }

    sendBtn.addEventListener('click', () => {
        const text = doubtInput.value.trim();
        if (text) {
            // Add student message
            addMessage(text, 'student');
            doubtInput.value = '';

            // Simulate mentor response
            setTimeout(() => {
                const responses = [
                    "That's a great question! Let me pull up a chart to explain.",
                    "Check the module regarding 'Order Blocks', it explains this exact scenario.",
                    "The stop loss should typically go 5-10 pips below the swing low.",
                    "I'll have a senior trader look at this timestamp for you."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'mentor');
            }, 1500 + Math.random() * 2000);
        }
    });

    doubtInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

});
