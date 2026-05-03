let currentPage = 1;
let currentSearch = '';
let currentCategory = '';
let categories = [];

// Initialize Page
async function initProducts() {
    await fetchCategories();
    await loadProducts();
    
    // Search Debounce
    const searchInput = document.getElementById('productSearch');
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentSearch = e.target.value;
            currentPage = 1;
            loadProducts();
        }, 500);
    });

    // Category Filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        loadProducts();
    });

    // Form Submit
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/home/categories'); // Using existing home API
        const result = await response.json();
        if (result.success) {
            categories = result.data.categories;
            const filter = document.getElementById('categoryFilter');
            const select = document.getElementById('categoryId');
            
            const options = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
            filter.innerHTML += options;
            select.innerHTML = '<option value="">Select Category</option>' + options;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function loadProducts() {
    try {
        const token = auth.getToken();
        const url = `/api/admin/products?page=${currentPage}&search=${currentSearch}&category=${currentCategory}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderProductsTable(result.data.products, result.data.pagination);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to load products');
    }
}

function renderProductsTable(products, pagination) {
    const tableBody = document.getElementById('products-table-body');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">No products found</td></tr>';
        return;
    }

    tableBody.innerHTML = products.map((p, index) => `
        <tr>
            <td>${(pagination.page - 1) * pagination.limit + index + 1}</td>
            <td><img src="${p.image_url}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"></td>
            <td style="font-weight: 600;">${p.name}</td>
            <td>${p.Category ? p.Category.name : '-'}</td>
            <td>${formatter.format(p.price)}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick='openEditModal(${JSON.stringify(p).replace(/'/g, "&apos;")})' class="action-btn btn-edit" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="action-btn btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    renderPagination(pagination);
}

function renderPagination(pagination) {
    document.getElementById('pagination-info').innerText = `${pagination.total}`;
    const container = document.getElementById('pagination-buttons');
    container.innerHTML = '';

    for (let i = 1; i <= pagination.totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.onclick = () => {
            currentPage = i;
            loadProducts();
        };
        container.appendChild(btn);
    }
}

// Modal Controls
function openAddModal() {
    document.getElementById('modalTitle').innerText = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').src = 'https://via.placeholder.com/100';
    document.getElementById('productModal').style.display = 'flex';
}

function openEditModal(product) {
    document.getElementById('modalTitle').innerText = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('stock').value = product.stock;
    document.getElementById('categoryId').value = product.categoryId;
    document.getElementById('image_url').value = product.image_url;
    document.getElementById('imagePreview').src = product.image_url;
    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function previewImage(url) {
    const preview = document.getElementById('imagePreview');
    preview.src = url || 'https://via.placeholder.com/100';
    preview.onerror = () => preview.src = 'https://via.placeholder.com/100';
}

async function saveProduct() {
    try {
        const token = auth.getToken();
        const id = document.getElementById('productId').value;
        const mode = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
        
        const data = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: document.getElementById('price').value,
            stock: document.getElementById('stock').value,
            categoryId: document.getElementById('categoryId').value,
            image_url: document.getElementById('image_url').value
        };

        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';

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
            alert(id ? 'Product updated!' : 'Product added!');
            closeModal();
            loadProducts();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('An error occurred while saving');
    } finally {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product';
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const token = auth.getToken();
        const response = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (result.success) {
            alert('Product deleted!');
            loadProducts();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Failed to delete product');
    }
}

// Initializing
initProducts();
