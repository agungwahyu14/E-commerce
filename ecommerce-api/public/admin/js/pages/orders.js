let currentStatusFilter = '';
let currentOrderSearch = '';

async function initOrders() {
    loadOrders();

    // Tab Filtering
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.getAttribute('data-status');
            loadOrders();
        });
    });

    // Search Input
    const searchInput = document.getElementById('orderSearch');
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentOrderSearch = e.target.value;
            loadOrders();
        }, 500);
    });
}

async function loadOrders() {
    try {
        const token = auth.getToken();
        const tableBody = document.getElementById('orders-table-body');
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;"><div class="loader"></div></td></tr>';

        const url = `/api/admin/orders?status=${currentStatusFilter}&search=${currentOrderSearch}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderOrdersTable(result.data.orders);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to load orders');
    }
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">No orders found</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td style="font-weight: 700;">#${order.id.substring(0, 8)}</td>
            <td>
                <div style="font-weight: 600;">${order.User ? order.User.name : 'Unknown'}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${order.User ? order.User.email : '-'}</div>
            </td>
            <td style="font-weight: 700;">${formatter.format(order.totalAmount)}</td>
            <td><span class="badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}">${order.paymentStatus}</span></td>
            <td><span class="order-badge badge-${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td>
                <button onclick="openOrderDetail('${order.id}')" style="background: var(--primary); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 12px;">
                    View Detail
                </button>
            </td>
        </tr>
    `).join('');
}

async function openOrderDetail(orderId) {
    try {
        const token = auth.getToken();
        const modal = document.getElementById('orderModal');
        const content = document.getElementById('order-detail-content');
        document.getElementById('detail-id').innerText = `#${orderId.substring(0, 8)}`;
        
        content.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loader"></div></div>';
        modal.style.display = 'flex';

        const response = await fetch(`/api/admin/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderOrderDetail(result.data.order);
        } else {
            alert(result.message);
            closeOrderModal();
        }
    } catch (error) {
        alert('Failed to load order details');
        closeOrderModal();
    }
}

function renderOrderDetail(order) {
    const content = document.getElementById('order-detail-content');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div>
                <h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Customer Info</h3>
                <div style="background: var(--bg); padding: 15px; border-radius: 12px;">
                    <div style="font-weight: 700; margin-bottom: 5px;">${order.User.name}</div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 3px;"><i class="fas fa-envelope"></i> ${order.User.email}</div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 3px;"><i class="fas fa-phone"></i> ${order.User.phone || '-'}</div>
                    <div style="font-size: 13px; color: var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${order.User.address || '-'}</div>
                </div>
            </div>
            <div>
                <h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Manage Order</h3>
                <div style="background: var(--bg); padding: 15px; border-radius: 12px;">
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Update Status</label>
                        <select id="statusUpdate" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); outline: none;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <button onclick="updateOrderStatus('${order.id}')" style="width: 100%; background: var(--primary); color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        Update Status
                    </button>
                </div>
            </div>
        </div>

        <h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Items Ordered</h3>
        <div class="data-card" style="box-shadow: none; border: 1px solid var(--border);">
            <table style="width: 100%;">
                <thead style="background: var(--bg);">
                    <tr>
                        <th style="padding: 10px 15px;">Product</th>
                        <th style="padding: 10px 15px;">Price</th>
                        <th style="padding: 10px 15px;">Qty</th>
                        <th style="padding: 10px 15px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 10px 15px; display: flex; align-items: center; gap: 10px;">
                                <img src="${item.image_url}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                                <span style="font-weight: 600; font-size: 13px;">${item.name}</span>
                            </td>
                            <td style="padding: 10px 15px; font-size: 13px;">${formatter.format(item.price)}</td>
                            <td style="padding: 10px 15px; font-size: 13px;">${item.quantity}</td>
                            <td style="padding: 10px 15px; text-align: right; font-weight: 700; font-size: 13px;">${formatter.format(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot style="background: var(--bg);">
                    <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; font-weight: 700;">Grand Total</td>
                        <td style="padding: 15px; text-align: right; font-weight: 800; color: var(--primary); font-size: 16px;">${formatter.format(order.totalAmount)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        ${order.notes ? `
            <div style="margin-top: 20px;">
                <h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Notes from Customer</h3>
                <div style="background: #FFFCE1; padding: 15px; border-radius: 12px; font-size: 13px; color: #857216;">
                    ${order.notes}
                </div>
            </div>
        ` : ''}
    `;
}

async function updateOrderStatus(orderId) {
    const newStatus = document.getElementById('statusUpdate').value;
    if (!confirm(`Are you sure you want to update order status to ${newStatus}?`)) return;

    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();
        if (result.success) {
            alert('Status updated successfully!');
            closeOrderModal();
            loadOrders();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to update status');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

initOrders();
