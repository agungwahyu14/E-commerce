document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const adminLayout = document.getElementById('admin-layout');
    const authLayout = document.getElementById('auth-layout');
    const sideName = document.getElementById('side-name');
    const sideAvatar = document.getElementById('side-avatar');
    const topName = document.getElementById('top-name');
    const topAvatar = document.getElementById('top-avatar');
    const pageTitle = document.getElementById('current-page-title');

    // Page mapping for titles
    const titles = {
        'dashboard': '📊 Dashboard Overview',
        'products': '📦 Products Management',
        'orders': '🛍️ Orders History',
        'users': '👥 Users List',
        'settings': '⚙️ General Settings'
    };

    async function router() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        
        // Handle Login Route
        if (hash === 'login') {
            adminLayout.style.display = 'none';
            authLayout.style.display = 'block';
            authLayout.innerHTML = await fetchPage('/admin/pages/login.html');
            // Execute scripts in login page
            const scripts = authLayout.getElementsByTagName('script');
            for (let script of scripts) {
                eval(script.innerText);
            }
            return;
        }

        // Protected Routes Check
        if (!auth.checkAuth()) {
            return;
        }

        // Show Admin Layout
        authLayout.style.display = 'none';
        adminLayout.style.display = 'flex';

        // Update Admin Info
        const user = auth.getUser();
        if (user) {
            sideName.innerText = user.name;
            topName.innerText = user.name;
            const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`;
            sideAvatar.src = avatarUrl;
            topAvatar.src = avatarUrl;
        }

        // Update Page Title
        pageTitle.innerText = titles[hash] || 'Admin Panel';

        // Update Sidebar Active State
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show Loader
        appContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

        // Render Page Content
        setTimeout(async () => {
            if (hash === 'dashboard') {
                const html = await fetchPage('/admin/pages/dashboard.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            if (hash === 'products') {
                const html = await fetchPage('/admin/pages/products.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            if (hash === 'orders') {
                const html = await fetchPage('/admin/pages/orders.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            if (hash === 'transactions') {
                const html = await fetchPage('/admin/pages/transactions.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            if (hash === 'users') {
                const html = await fetchPage('/admin/pages/users.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            if (hash === 'chatbot') {
                const html = await fetchPage('/admin/pages/chatbot.html');
                appContent.innerHTML = html;
                executePageScripts(appContent);
                return;
            }

            switch(hash) {
                case 'products': appContent.innerHTML = renderProducts(); break;
                case 'orders': appContent.innerHTML = renderOrders(); break;
                case 'users': appContent.innerHTML = renderUsers(); break;
                case 'settings': appContent.innerHTML = renderSettings(); break;
                default: appContent.innerHTML = renderDashboardPlaceholder();
            }
        }, 300);
    }

    async function fetchPage(url) {
        const response = await fetch(url);
        return await response.text();
    }

    function executePageScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    // Event Listeners
    window.addEventListener('hashchange', router);
    document.getElementById('logoutBtn').addEventListener('click', auth.logout);
    
    // Sidebar Toggles
    const sidebar = document.getElementById('sidebar');
    document.getElementById('mobileToggle').addEventListener('click', () => sidebar.classList.add('open'));
    document.getElementById('closeSidebar').addEventListener('click', () => sidebar.classList.remove('open'));

    // Dashboard Template Placeholder
    function renderDashboardPlaceholder() {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-shopping-bag"></i></div>
                    <div class="stat-info"><h3>Total Sales</h3><div class="value">Rp 128.450.000</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info"><h3>Orders</h3><div class="value">1,240</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><i class="fas fa-users"></i></div>
                    <div class="stat-info"><h3>Customers</h3><div class="value">856</div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow"><i class="fas fa-star"></i></div>
                    <div class="stat-info"><h3>Avg. Rating</h3><div class="value">4.8 / 5</div></div>
                </div>
            </div>
            <div class="data-card">
                <div class="card-header"><h2 class="card-title">Recent Orders</h2></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr><td>#ORD-7721</td><td>John Doe</td><td>Rp 24.999.000</td><td><span class="badge badge-success">Delivered</span></td></tr>
                            <tr><td>#ORD-7720</td><td>Jane Smith</td><td>Rp 1.729.000</td><td><span class="badge badge-warning">Processing</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Other renders (Placeholder)
    function renderProducts() { return '<div class="data-card" style="padding:40px; text-align:center;"><h3>📦 Products List Loading...</h3></div>'; }
    function renderOrders() { return '<div class="data-card" style="padding:40px; text-align:center;"><h3>🛍️ Orders List Loading...</h3></div>'; }
    function renderUsers() { return '<div class="data-card" style="padding:40px; text-align:center;"><h3>👥 Users List Loading...</h3></div>'; }
    function renderSettings() { return '<div class="data-card" style="padding:40px; text-align:center;"><h3>⚙️ Settings Loading...</h3></div>'; }

    // Initial load
    router();
});
