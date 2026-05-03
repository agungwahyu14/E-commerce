let currentCategoryFilter = '';

async function initChatbot() {
    loadRules();

    // Tab Filtering
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategoryFilter = btn.getAttribute('data-category');
            loadRules();
        });
    });

    // Form Submit
    document.getElementById('ruleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveRule();
    });
}

async function loadRules() {
    try {
        const token = auth.getToken();
        const tableBody = document.getElementById('rules-table-body');
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;"><div class="loader"></div></td></tr>';

        const response = await fetch('/api/admin/chatbot/rules', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            let rules = result.data.rules;
            if (currentCategoryFilter) {
                rules = rules.filter(r => r.category === currentCategoryFilter);
            }
            renderRulesTable(rules);
            
            // Update Stats
            document.getElementById('stat-total-rules').innerText = result.data.stats.total;
            document.getElementById('stat-active-rules').innerText = result.data.stats.active;
            document.getElementById('stat-inactive-rules').innerText = result.data.stats.inactive;
        }
    } catch (error) {
        alert('Gagal memuat chatbot rules');
    }
}

function renderRulesTable(rules) {
    const tableBody = document.getElementById('rules-table-body');
    
    if (rules.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">Tidak ada rule ditemukan</td></tr>';
        return;
    }

    tableBody.innerHTML = rules.map((rule, index) => {
        const keywords = rule.keywords;
        const keywordDisplay = keywords.slice(0, 3).map(k => `<span class="keyword-chip">${k}</span>`).join('');
        const moreCount = keywords.length - 3;

        return `
            <tr>
                <td>${index + 1}</td>
                <td><span class="category-badge cat-${rule.category}">${rule.category}</span></td>
                <td>
                    ${keywordDisplay}
                    ${moreCount > 0 ? `<span class="keyword-chip" style="background:#6C5CE7; color:white;">+${moreCount} lagi</span>` : ''}
                </td>
                <td title="${rule.response}">${rule.response.length > 80 ? rule.response.substring(0, 80) + '...' : rule.response}</td>
                <td><div style="font-weight:700;">${rule.priority}</div></td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${rule.isActive ? 'checked' : ''} onchange="toggleRuleActive('${rule.id}')">
                        <span class="slider round"></span>
                    </label>
                </td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button onclick='openEditModal(${JSON.stringify(rule).replace(/'/g, "&apos;")})' class="action-btn btn-edit" title="Edit"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteRule('${rule.id}')" class="action-btn btn-delete" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddModal() {
    document.getElementById('modalTitle').innerText = 'Tambah Chatbot Rule';
    document.getElementById('ruleForm').reset();
    document.getElementById('ruleId').value = '';
    document.getElementById('ruleModal').style.display = 'flex';
}

function openEditModal(rule) {
    document.getElementById('modalTitle').innerText = 'Edit Chatbot Rule';
    document.getElementById('ruleId').value = rule.id;
    document.getElementById('category').value = rule.category;
    document.getElementById('priority').value = rule.priority;
    document.getElementById('keywords').value = rule.keywords.join('\n');
    document.getElementById('response').value = rule.response;
    document.getElementById('isActive').checked = rule.isActive;
    document.getElementById('ruleModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('ruleModal').style.display = 'none';
}

async function saveRule() {
    try {
        const token = auth.getToken();
        const id = document.getElementById('ruleId').value;
        const mode = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/chatbot/rules/${id}` : '/api/admin/chatbot/rules';
        
        const keywords = document.getElementById('keywords').value.split('\n').map(k => k.trim()).filter(k => k);
        
        const data = {
            category: document.getElementById('category').value,
            priority: document.getElementById('priority').value,
            keywords: keywords,
            response: document.getElementById('response').value,
            isActive: document.getElementById('isActive').checked
        };

        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Menyimpan...';

        const response = await fetch(url, {
            method: mode,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            closeModal();
            loadRules();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Gagal menyimpan rule');
    } finally {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = false;
        saveBtn.innerText = 'Simpan Rule';
    }
}

async function deleteRule(id) {
    if (!confirm('Hapus rule ini?')) return;
    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/chatbot/rules/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) loadRules();
    } catch (error) {
        alert('Gagal menghapus rule');
    }
}

async function toggleRuleActive(id) {
    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/chatbot/rules/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) loadRules();
    } catch (error) {
        alert('Gagal mengubah status');
    }
}

async function testMessage() {
    const message = document.getElementById('testMessageInput').value;
    if (!message) return;

    try {
        const token = auth.getToken();
        const container = document.getElementById('testResult');
        container.style.display = 'block';
        container.innerHTML = '<div class="loader"></div>';

        const response = await fetch('/api/admin/chatbot/test', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ message })
        });
        
        const result = await response.json();
        if (result.success) {
            const data = result.data;
            if (data.match) {
                container.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <div>
                            <div style="font-size:12px; color:var(--text-muted);">Matched Category</div>
                            <span class="category-badge cat-${data.rule.category}">${data.rule.category}</span>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:12px; color:var(--text-muted);">Priority</div>
                            <div style="font-weight:700; color:var(--primary);">${data.rule.priority}</div>
                        </div>
                    </div>
                    <div style="margin-bottom:15px;">
                        <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">Keywords Matched</div>
                        <div>${data.rule.keywords.map(k => `<span class="keyword-chip">${k}</span>`).join('')}</div>
                    </div>
                    <div style="background:var(--bg); padding:15px; border-radius:10px; border-left:4px solid var(--primary);">
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:5px; text-transform:uppercase; font-weight:700;">Preview Response</div>
                        <div style="font-size:14px; line-height:1.6; white-space:pre-line;">${data.previewResponse}</div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="text-align:center; padding:10px;">
                        <div style="font-size:30px; margin-bottom:10px;">🤷‍♂️</div>
                        <div style="font-weight:700; color:#ff7675;">Tidak ada rule yang cocok</div>
                        <div style="font-size:13px; color:var(--text-muted); margin-top:5px;">Bot akan mengirimkan default response ke user.</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        alert('Gagal melakukan test');
    }
}

initChatbot();
