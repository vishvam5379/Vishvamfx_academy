let currentAdminPass = '';

function loginAdmin() {
    const password = document.getElementById('admin-pass').value;
    if (!password) {
        alert('Please enter password');
        return;
    }
    currentAdminPass = password;
    fetchData();
}

async function fetchData() {
    try {
        const response = await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminPassword: currentAdminPass })
        });

        if (response.ok) {
            const data = await response.json();
            showDashboard(data);
        } else {
            const err = await response.json();
            alert(err.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to connect to server');
    }
}

function showDashboard(data) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';

    // Smooth background change
    document.body.style.alignItems = 'flex-start';

    // Update Stats
    document.getElementById('total-enrollments').innerText = data.enrollments.length;
    document.getElementById('total-registrations').innerText = data.registrations.length;
    document.getElementById('total-users').innerText = data.enrollments.length + data.registrations.length;

    // Populate Tables
    populateTable('enrollment-table', data.enrollments, 'enrollment');
    populateTable('registration-table', data.registrations, 'registration');
}

function populateTable(tableId, items, type) {
    const tbody = document.getElementById(tableId).querySelector('tbody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const date = new Date(item.date).toLocaleDateString();
        const row = document.createElement('tr');

        if (type === 'enrollment') {
            row.innerHTML = `
                <td>${date}</td>
                <td style="font-weight: 600;">${item.fullName}</td>
                <td>${item.email}</td>
                <td><span style="color: #ffaa00;">${item.course}</span></td>
                <td>${item.price} INR</td>
                <td><code style="background:rgba(255,255,255,0.1); padding:2px 5px; border-radius:4px;">${item.password}</code></td>
                <td><button class="btn-delete" onclick="deleteUser('${item.email}', '${type}')">Delete</button></td>
            `;
        } else {
            row.innerHTML = `
                <td>${date}</td>
                <td style="font-weight: 600;">${item.fullName}</td>
                <td>${item.email}</td>
                <td>${item.gender}</td>
                <td>${item.subject}</td>
                <td><button class="btn-delete" onclick="deleteUser('${item.email}', '${type}')">Delete</button></td>
            `;
        }
        tbody.appendChild(row);
    });
}

async function deleteUser(email, type) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
        const response = await fetch('/api/admin/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminPassword: currentAdminPass,
                email: email,
                type: type
            })
        });

        if (response.ok) {
            alert('Deleted successfully');
            fetchData(); // Refresh
        } else {
            alert('Delete failed');
        }
    } catch (err) {
        alert('Error connecting to server');
    }
}

function logoutAdmin() {
    currentAdminPass = '';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
    document.body.style.alignItems = 'center';
}
