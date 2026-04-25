// ==================== STORAGE MANAGEMENT ====================

class StorageManager {
    constructor() {
        this.usersKey = 'gestion_stock_users';
        this.productsKey = 'gestion_stock_products';
        this.currentUserKey = 'gestion_stock_current_user';
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize with default users
        if (!localStorage.getItem(this.usersKey)) {
            const defaultUsers = [
                { id: 1, name: 'Admin', username: 'admin', password: 'admin123', email: 'admin@gestion.com' },
                { id: 2, name: 'User', username: 'user', password: 'user123', email: 'user@gestion.com' }
            ];
            localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
        }

        // Initialize with default products
        if (!localStorage.getItem(this.productsKey)) {
            const defaultProducts = [
                { id: 1, name: 'Laptop Dell', category: 'Électronique', quantity: 15, price: 899.99, status: 'En stock' },
                { id: 2, name: 'Souris Logitech', category: 'Accessoires', quantity: 45, price: 29.99, status: 'En stock' },
                { id: 3, name: 'Clavier Mécanique', category: 'Accessoires', quantity: 8, price: 149.99, status: 'Faible stock' },
                { id: 4, name: 'Moniteur 27"', category: 'Électronique', quantity: 0, price: 349.99, status: 'Rupture' },
                { id: 5, name: 'Câble HDMI', category: 'Câbles', quantity: 120, price: 12.99, status: 'En stock' }
            ];
            localStorage.setItem(this.productsKey, JSON.stringify(defaultProducts));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = Math.max(...users.map(u => u.id), 0) + 1;
        users.push(user);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        return user;
    }

    getProducts() {
        return JSON.parse(localStorage.getItem(this.productsKey)) || [];
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = Math.max(...products.map(p => p.id), 0) + 1;
        products.push(product);
        localStorage.setItem(this.productsKey, JSON.stringify(products));
        return product;
    }

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            localStorage.setItem(this.productsKey, JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem(this.productsKey, JSON.stringify(products));
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    clearCurrentUser() {
        localStorage.removeItem(this.currentUserKey);
    }
}

// ==================== LOGIN PAGE LOGIC ====================

const storage = new StorageManager();

// Check if user is already logged in
function checkLoginStatus() {
    const currentUser = storage.getCurrentUser();
    if (currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

// Login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const users = storage.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            storage.setCurrentUser(user);
            showNotification('Connexion réussie!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Nom d\'utilisateur ou mot de passe incorrect!', 'error');
        }
    });
}

// Signup modal
const signupLink = document.getElementById('signupLink');
const signupModal = document.getElementById('signupModal');
const closeModal = document.getElementById('closeModal');

if (signupLink) {
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.add('active');
    });
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        signupModal.classList.remove('active');
    });
}

if (signupModal) {
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            signupModal.classList.remove('active');
        }
    });
}

// Signup form submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        
        const users = storage.getUsers();
        if (users.find(u => u.username === username)) {
            showNotification('Ce nom d\'utilisateur existe déjà!', 'error');
            return;
        }
        
        storage.addUser({ name, email, username, password });
        showNotification('Compte créé avec succès! Connectez-vous maintenant.', 'success');
        signupModal.classList.remove('active');
        signupForm.reset();
    });
}

// ==================== DASHBOARD PAGE LOGIC ====================

// Check if user is logged in
function checkDashboardAccess() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize dashboard
function initializeDashboard() {
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;
    
    updateStats();
    renderProductsTable();
    setupEventListeners();
}

// Update statistics
function updateStats() {
    const products = storage.getProducts();
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    const statsData = [
        { title: 'Total Produits', value: totalProducts, icon: 'fa-box', change: '+2.5%' },
        { title: 'Valeur Stock', value: `$${totalValue.toFixed(2)}`, icon: 'fa-dollar-sign', change: '+5.2%' },
        { title: 'Faible Stock', value: lowStock, icon: 'fa-exclamation-triangle', change: '-1.2%' },
        { title: 'Rupture', value: outOfStock, icon: 'fa-times-circle', change: '+0.8%' }
    ];
    
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = statsData.map(stat => `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">${stat.title}</span>
                    <div class="stat-card-icon">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                </div>
                <div class="stat-card-value">${stat.value}</div>
                <div class="stat-card-change">${stat.change}</div>
            </div>
        `).join('');
    }
}

// Render products table
function renderProductsTable() {
    const products = storage.getProducts();
    const tableBody = document.querySelector('table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-name">
                    <div class="product-badge">${product.name.charAt(0).toUpperCase()}</div>
                    <span>${product.name}</span>
                </div>
            </td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(product.status)}">
                    ${product.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'En stock': return 'badge-success';
        case 'Faible stock': return 'badge-warning';
        case 'Rupture': return 'badge-danger';
        default: return 'badge-success';
    }
}

// Setup event listeners
function setupEventListeners() {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }
    
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const searchBox = document.querySelector('.search-box input');
    if (searchBox) {
        searchBox.addEventListener('input', searchProducts);
    }
}

// Open add product modal
function openAddProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        document.getElementById('productForm').reset();
        document.getElementById('productFormTitle').textContent = 'Ajouter un produit';
        document.getElementById('productId').value = '';
        modal.classList.add('active');
    }
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Edit product
function editProduct(id) {
    const product = storage.getProducts().find(p => p.id === id);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    if (modal) {
        document.getElementById('productFormTitle').textContent = 'Modifier le produit';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStatus').value = product.status;
        modal.classList.add('active');
    }
}

// Delete product
function deleteProduct(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        storage.deleteProduct(id);
        renderProductsTable();
        updateStats();
        showNotification('Produit supprimé avec succès!', 'success');
    }
}

// Save product
function saveProduct(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const price = parseFloat(document.getElementById('productPrice').value);
    const status = document.getElementById('productStatus').value;
    
    const product = { name, category, quantity, price, status };
    
    if (productId) {
        storage.updateProduct(parseInt(productId), product);
        showNotification('Produit modifié avec succès!', 'success');
    } else {
        storage.addProduct(product);
        showNotification('Produit ajouté avec succès!', 'success');
    }
    
    closeProductModal();
    renderProductsTable();
    updateStats();
}

// Search products
function searchProducts(e) {
    const searchTerm = e.target.value.toLowerCase();
    const products = storage.getProducts();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = filtered.map(product => `
        <tr>
            <td>
                <div class="product-name">
                    <div class="product-badge">${product.name.charAt(0).toUpperCase()}</div>
                    <span>${product.name}</span>
                </div>
            </td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(product.status)}">
                    ${product.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Logout
function logout() {
    storage.clearCurrentUser();
    window.location.href = 'index.html';
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal close on outside click
document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('.modal-form');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    const closeButtons = document.querySelectorAll('.modal-form-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeProductModal);
    });
    
    checkLoginStatus();
    checkDashboardAccess();
    initializeDashboard();
});

// Add notification styles dynamically
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: -100px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        transition: bottom 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        bottom: 20px;
    }
    
    .notification-success {
        border-color: var(--success-color);
    }
    
    .notification-success i {
        color: var(--success-color);
    }
    
    .notification-error {
        border-color: var(--danger-color);
    }
    
    .notification-error i {
        color: var(--danger-color);
    }
    
    .notification-info {
        border-color: var(--info-color);
    }
    
    .notification-info i {
        color: var(--info-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);