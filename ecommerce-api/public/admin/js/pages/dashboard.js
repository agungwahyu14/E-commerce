async function loadDashboard() {
    try {
        const token = auth.getToken();
        const response = await fetch('/api/admin/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (result.success) {
            renderStatsCards(result.data.stats);
            renderRevenueChart(result.data.revenueChart);
            renderRecentOrders(result.data.recentOrders);
            renderTopProducts(result.data.topProducts);
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function renderStatsCards(stats) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });

    document.getElementById('stat-revenue').innerText = formatter.format(stats.totalRevenue);
    document.getElementById('stat-orders').innerText = stats.totalOrders.toLocaleString();
    document.getElementById('stat-users').innerText = stats.totalUsers.toLocaleString();
    document.getElementById('stat-products').innerText = stats.totalProducts.toLocaleString();
}

function renderRevenueChart(chartData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const labels = chartData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    });
    const values = chartData.map(d => d.revenue);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (Rp)',
                data: values,
                borderColor: '#6C5CE7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#6C5CE7'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#E4E6EF' },
                    ticks: {
                        callback: (value) => 'Rp ' + (value / 1000000) + 'M'
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderRecentOrders(orders) {
    const tableBody = document.getElementById('recent-orders-table');
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });

    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td style="font-weight: 600;">#${order.id.substring(0, 8)}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>${order.User ? order.User.name : 'Guest'}</td>
            <td>${formatter.format(order.totalAmount)}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
        </tr>
    `).join('');
}

function renderTopProducts(products) {
    const list = document.getElementById('top-products-list');
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });

    list.innerHTML = products.map((product, index) => `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
            <div style="font-weight: 800; color: #B5B5C3; width: 20px;">${index + 1}</div>
            <img src="${product.image_url}" style="width: 45px; height: 45px; border-radius: 10px; object-fit: cover;">
            <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 700; font-size: 13px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${product.name}</div>
                <div style="font-size: 12px; color: #B5B5C3;">${formatter.format(product.price)}</div>
            </div>
            <div style="font-weight: 700; color: #6C5CE7; font-size: 12px;">★ ${product.rating}</div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'delivered': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'processing': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default: return '';
    }
}

// Start Loading
loadDashboard();
