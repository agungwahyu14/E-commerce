let currentUserSearch = '';
let currentUserRole = '';

async function initUsers() {
    loadUsers();

    // Search Input
    const searchInput = document.getElementById('userSearch');
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentUserSearch = e.target.value;
            loadUsers();
        }, 500);
    });

    // Role Filter
    document.getElementById('roleFilter').addEventListener('change', (e) => {
        currentUserRole = e.target.value;
        loadUsers();
    });
}

async function loadUsers() {
    try {
        const token = auth.getToken();
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;"><div class="loader"></div></td></tr>';

        const url = `/api/admin/users?search=${currentUserSearch}&role=${currentUserRole}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderUsersTable(result.data.users);
            document.getElementById('stat-active-users').innerText = result.data.stats.totalActive;
            document.getElementById('stat-inactive-users').innerText = result.data.stats.totalInactive;
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to load users');
    }
}

function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    const loggedInAdmin = auth.getUser();

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">No users found</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map((user, index) => {
        const isSelf = loggedInAdmin && user.id === loggedInAdmin.id;
        const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 12px; object-fit: cover;">
                        <div>
                            <div style="font-weight: 700; font-size: 14px;">${user.name} ${isSelf ? '<span style="color:var(--primary); font-size:10px;">(You)</span>' : ''}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>
                    <div class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        <div class="status-dot"></div>
                        <span>${user.isActive ? 'Active' : 'Deactivated'}</span>
                    </div>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                    ${!isSelf ? `
                        <div style="display: flex; gap: 8px;">
                            <button onclick="toggleUserActive('${user.id}', ${user.isActive})" class="btn-action-sm">
                                ${user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onclick="updateUserRole('${user.id}', '${user.role}')" class="btn-action-sm">
                                Change Role
                            </button>
                        </div>
                    ` : '<span style="font-size:12px; color:var(--text-muted);">No actions available</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

async function toggleUserActive(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/users/${userId}/toggle-active`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message);
            loadUsers();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to update user status');
    }
}

async function updateUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const warning = newRole === 'admin' ? 'This will give this user full administrative access.' : 'This will revoke all administrative access.';
    
    if (!confirm(`Are you sure you want to change this user role to ${newRole.toUpperCase()}?\n\n${warning}`)) return;

    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ role: newRole })
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message);
            loadUsers();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to update user role');
    }
}

initUsers();
