let currentPaymentFilter = '';

async function initTransactions() {
    loadTransactions();

    document.getElementById('paymentStatusFilter').addEventListener('change', (e) => {
        currentPaymentFilter = e.target.value;
        loadTransactions();
    });
}

async function loadTransactions() {
    try {
        const token = auth.getToken();
        const tableBody = document.getElementById('transactions-table-body');
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;"><div class="loader"></div></td></tr>';

        const url = `/api/admin/transactions?paymentStatus=${currentPaymentFilter}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderTransactionsTable(result.data.transactions);
            updateStats(result.data.stats);
        }
    } catch (error) {
        alert('Failed to load transactions');
    }
}

function updateStats(stats) {
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    document.getElementById('stat-total-revenue').innerText = formatter.format(stats.totalRevenue);
    document.getElementById('stat-total-transactions').innerText = stats.totalTransactions;
    document.getElementById('stat-pending-transactions').innerText = stats.pendingTransactions;
    document.getElementById('stat-failed-transactions').innerText = stats.failedTransactions;
}

function renderTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactions-table-body');
    
    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">No transactions found</td></tr>';
        return;
    }

    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    tableBody.innerHTML = transactions.map(tx => {
        return `
            <tr>
                <td style="font-family: monospace; font-weight: 700;">${tx.midtransOrderId}</td>
                <td>
                    <div style="font-weight: 700;">${tx.User.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${tx.User.email}</div>
                </td>
                <td style="font-weight: 700;">${formatter.format(tx.totalAmount)}</td>
                <td><span class="badge badge-${tx.paymentStatus}">${tx.paymentStatus}</span></td>
                <td>
                    <div class="order-status">
                        <div class="status-dot" style="background: ${getStatusColor(tx.status)}"></div>
                        <span>${tx.status}</span>
                    </div>
                </td>
                <td>${new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                <td>
                    <button onclick="checkStatus('${tx.id}', this)" class="btn-action-sm" style="background: white; border: 1px solid var(--border); padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 700;">
                        <i class="fas fa-sync"></i> Cek Status
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function checkStatus(orderId, btn) {
    try {
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

        const token = auth.getToken();
        const response = await fetch(`/api/admin/transactions/${orderId}/retry-webhook`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            alert(`Status updated: ${result.data.midtransStatus}`);
            loadTransactions();
        } else {
            alert(result.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } catch (error) {
        alert('Failed to check status');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function syncAllTransactions() {
    const btn = document.getElementById('syncAllBtn');
    const originalText = btn.innerHTML;
    
    if (!confirm('Sync semua transaksi yang pending? Ini akan memakan waktu beberapa saat.')) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

        const token = auth.getToken();
        const response = await fetch('/api/admin/transactions/sync-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            const { total, updated, failed } = result.data;
            alert(`Sync Selesai!\nTotal dicek: ${total}\nBerhasil update: ${updated}\nGagal: ${failed}`);
            loadTransactions();
        }
    } catch (error) {
        alert('Gagal melakukan sync massal');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function getStatusColor(status) {
    const colors = {
        'pending': '#FFA800',
        'processing': '#009EF7',
        'shipped': '#8950FC',
        'delivered': '#50CD89',
        'cancelled': '#F1416C'
    };
    return colors[status] || '#ccc';
}

initTransactions();
