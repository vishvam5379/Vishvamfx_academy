document.addEventListener('DOMContentLoaded', () => {

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

        modules.forEach(mod => {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = `course-module ${mod.status === 'completed' ? 'completed' : mod.status === 'active' ? 'active-module' : 'locked-module'}`;

            const badgeClass = mod.status === 'completed' ? 'success' : mod.status === 'active' ? 'warning' : '';
            const badgeText = mod.status === 'completed' ? 'Completed' : mod.status === 'active' ? 'In Progress' : 'Locked';

            const liveBadgeHTML = mod.type === 'live' ? `<div class="badge-live" style="position:static; padding: 2px 8px; font-size:0.6rem;"><span class="pulse-dot"></span> LIVE</div>` : '';

            let lessonsHTML = '';
            if (mod.lessons) {
                mod.lessons.forEach(lesson => {
                    const icon = mod.status === 'locked' ? 'fa-lock' : (lesson.isLive ? 'fa-broadcast-tower' : 'fa-circle-play');
                    const lockedClass = mod.status === 'locked' ? 'locked' : '';
                    const liveIndicator = lesson.isLive ? `<span style="color:var(--live-red); font-size:0.7rem; margin-left:10px; font-weight:bold;">LIVE SESSION</span>` : '';

                    lessonsHTML += `
                        <div class="lesson-item ${lockedClass}" onclick="playVideo('${lesson.videoUrl}', '${lesson.title}', ${mod.status === 'locked'})">
                            <i class="fa-solid ${icon}"></i> ${lesson.title} ${liveIndicator}
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
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="module-body">
                    ${lessonsHTML}
                </div>
            `;

            coursesContainer.appendChild(moduleDiv);
        });
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

    // Expose playVideo to global scope
    window.playVideo = (url, title, isLocked) => {
        if (isLocked) {
            alert('This module is locked. Complete previous modules first.');
            return;
        }

        playerContainer.style.display = 'block';
        const wrapper = document.querySelector('.video-wrapper');

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
        avatar.innerText = type === 'student' ? 'VS' : 'M';

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
