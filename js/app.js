/* UDN Graphic & Printing - Business Management System */
const CONFIG = {
    adminUsername: 'Sachintha',
    adminPassword: '2003Sachi#',
    currency: 'Rs.',
    dateFormat: 'YYYY-MM-DD'
};

let currentLanguage = 'en';
let incomeExpenseChart = null;
let productChart = null;
let reportPieChart = null;
let reportProductChart = null;

const DEFAULT_SERVICES = [
    { id: 'svc_1', name: 'Logo Design', nameSi: 'Logo Design', price: 5000, description: 'Professional logo design service', descriptionSi: 'Professional logo design service' },
    { id: 'svc_2', name: 'Label Design', nameSi: 'Label Design', price: 3000, description: 'Custom label design + print available', descriptionSi: 'Custom label design + print available' },
    { id: 'svc_3', name: 'Customized Photo Design', nameSi: 'Customized Photo Design', price: 4000, description: 'Design + Print + Frame available', descriptionSi: 'Design + Print + Frame available' },
    { id: 'svc_4', name: 'Digital Painting Photo Design', nameSi: 'Digital Painting Photo Design', price: 6000, description: 'Design + Print + Frame available', descriptionSi: 'Design + Print + Frame available' },
    { id: 'svc_5', name: 'Banner Design', nameSi: 'Banner Design', price: 8000, description: 'Design only (Printing not available)', descriptionSi: 'Design only (Printing not available)' },
    { id: 'svc_6', name: 'Wedding Card Design', nameSi: 'Wedding Card Design', price: 3500, description: 'Design + Print available', descriptionSi: 'Design + Print available' },
    { id: 'svc_7', name: 'Visiting Card Design', nameSi: 'Visiting Card Design', price: 2500, description: 'Design + Print available', descriptionSi: 'Design + Print available' },
    { id: 'svc_8', name: 'T-Shirt Design', nameSi: 'T-Shirt Design', price: 4500, description: 'Design only (Printing not available)', descriptionSi: 'Design only (Printing not available)' },
    { id: 'svc_9', name: 'Social Media Post Design', nameSi: 'Social Media Post Design', price: 2000, description: 'Professional social media graphics', descriptionSi: 'Professional social media graphics' },
    { id: 'svc_10', name: 'Advertising Post Design', nameSi: 'Advertising Post Design', price: 3500, description: 'Eye-catching advertising designs', descriptionSi: 'Eye-catching advertising designs' },
    { id: 'svc_11', name: 'Professional CV Design', nameSi: 'Professional CV Design', price: 3000, description: 'Standout CV/Resume design', descriptionSi: 'Standout CV/Resume design' }
];

const DEFAULT_PRODUCTS = [
    { id: 'prd_1', name: 'Sticker Paper', nameSi: 'Sticker Paper', price: 500 },
    { id: 'prd_2', name: 'Photo Paper', nameSi: 'Photo Paper', price: 300 },
    { id: 'prd_3', name: 'Vinyl Sheet', nameSi: 'Vinyl Sheet', price: 800 },
    { id: 'prd_4', name: 'Card Stock', nameSi: 'Card Stock', price: 400 },
    { id: 'prd_5', name: 'Ink Cartridge', nameSi: 'Ink Cartridge', price: 2500 }
];

const Storage = {
    get(key) {
        try {
            const data = localStorage.getItem('udn_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem('udn_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    remove(key) {
        localStorage.removeItem('udn_' + key);
    },
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('udn_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

function initializeData() {
    if (!Storage.get('services')) Storage.set('services', DEFAULT_SERVICES);
    if (!Storage.get('products')) Storage.set('products', DEFAULT_PRODUCTS);
    if (!Storage.get('income')) Storage.set('income', []);
    if (!Storage.get('expenses')) Storage.set('expenses', []);
    if (Storage.get('startingBalance') === null) Storage.set('startingBalance', 0);
    if (!Storage.get('settings')) Storage.set('settings', { logo: null, language: 'en' });
}

function checkAuth() {
    const isLoggedIn = Storage.get('isLoggedIn');
    if (isLoggedIn) {
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    initializeDashboard();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (username === CONFIG.adminUsername && password === CONFIG.adminPassword) {
        Storage.set('isLoggedIn', true);
        errorDiv.style.display = 'none';
        showMainApp();
        showToast('Login successful!');
    } else {
        errorDiv.textContent = 'Invalid username or password!';
        errorDiv.style.display = 'flex';
    }
}

function logout() {
    Storage.set('isLoggedIn', false);
    showLoginScreen();
    showToast('Logged out successfully!');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'si' : 'en';
    document.getElementById('langText').textContent = currentLanguage === 'en' ? 'EN' : 'SI';
    updateLanguage();
    const settings = Storage.get('settings') || {};
    settings.language = currentLanguage;
    Storage.set('settings', settings);
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-en][data-si]');
    elements.forEach(el => {
        el.textContent = currentLanguage === 'si' ? el.getAttribute('data-si') : el.getAttribute('data-en');
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = titleEl.getAttribute(currentLanguage === 'si' ? 'data-si' : 'data-en');
        }
    }

    updatePlaceholders();
    refreshAllData();
}

function updatePlaceholders() {
    const placeholders = {
        'incomeCustomer': { en: 'Enter customer name', si: 'Enter customer name' },
        'serviceName': { en: 'Enter service name', si: 'Enter service name' },
        'productName': { en: 'Enter product name', si: 'Enter product name' },
        'expenseSupplier': { en: 'Optional', si: 'Optional' }
    };

    Object.keys(placeholders).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.placeholder = placeholders[id][currentLanguage];
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    const pageTitle = document.getElementById('pageTitle');
    const titleMap = {
        'dashboard': { en: 'Dashboard', si: 'Dashboard' },
        'income': { en: 'Income', si: 'Income' },
        'expenses': { en: 'Expenses', si: 'Expenses' },
        'services': { en: 'Services', si: 'Services' },
        'products': { en: 'Products', si: 'Products' },
        'reports': { en: 'Reports', si: 'Reports' },
        'settings': { en: 'Settings', si: 'Settings' }
    };

    if (titleMap[sectionId] && pageTitle) {
        pageTitle.textContent = titleMap[sectionId][currentLanguage];
    }

    if (sectionId === 'dashboard') initializeDashboard();
    else if (sectionId === 'income') { loadIncomeTable(); populateServiceSelect(); }
    else if (sectionId === 'expenses') { loadExpenseTable(); populateProductSelect(); }
    else if (sectionId === 'services') loadServicesGrid();
    else if (sectionId === 'products') loadProductsTable();
    else if (sectionId === 'settings') loadSettings();

    closeMobileSidebar();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            const dateInput = form.querySelector('input[type="date"]');
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        }
        const idField = modal.querySelector('input[type="hidden"]');
        if (idField) idField.value = '';
        updateModalTitle(modalId, false);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function updateModalTitle(modalId, isEdit) {
    const titleMap = {
        'serviceModal': { 
            add: { en: 'Add Service', si: 'Add Service' },
            edit: { en: 'Edit Service', si: 'Edit Service' }
        },
        'productModal': {
            add: { en: 'Add Product', si: 'Add Product' },
            edit: { en: 'Edit Product', si: 'Edit Product' }
        }
    };

    if (titleMap[modalId]) {
        const title = isEdit ? titleMap[modalId].edit : titleMap[modalId].add;
        const titleEl = document.querySelector('#' + modalId + ' .modal-header h3');
        if (titleEl) titleEl.textContent = title[currentLanguage];
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};

function showToast(message, type) {
    type = type || 'success';
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');

    toastMessage.textContent = message;

    if (type === 'error') {
        toast.style.borderLeftColor = 'var(--danger)';
        toastIcon.className = 'fas fa-times-circle';
        toastIcon.style.color = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = 'var(--warning)';
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = 'var(--warning)';
    } else {
        toast.style.borderLeftColor = 'var(--secondary)';
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = 'var(--secondary)';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function initializeDashboard() {
    updateBalanceCards();
    renderIncomeExpenseChart();
    renderProductChart();
    loadLatestActivities();
}

function updateBalanceCards() {
    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];
    const startingBalance = parseFloat(Storage.get('startingBalance')) || 0;

    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const currentBalance = startingBalance + totalIncome - totalExpenses;
    const profit = totalIncome - totalExpenses;

    document.getElementById('currentBalance').textContent = formatCurrency(currentBalance);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('totalProfit').textContent = formatCurrency(profit);
}

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];

    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const profit = totalIncome - totalExpenses;

    if (incomeExpenseChart) incomeExpenseChart.destroy();

    incomeExpenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses', 'Profit'],
            datasets: [{
                data: [totalIncome, totalExpenses, Math.max(0, profit)],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderColor: ['#059669', '#dc2626', '#d97706'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 20, font: { size: 12 } }
                }
            }
        }
    });
}

function renderProductChart() {
    const ctx = document.getElementById('productChart');
    if (!ctx) return;

    const expenses = Storage.get('expenses') || [];
    const productTotals = {};

    expenses.forEach(item => {
        const name = item.product;
        if (!productTotals[name]) productTotals[name] = { quantity: 0, cost: 0 };
        productTotals[name].quantity += parseInt(item.quantity || 0);
        productTotals[name].cost += parseFloat(item.total || 0);
    });

    const labels = Object.keys(productTotals);
    const data = labels.map(label => productTotals[label].cost);

    if (productChart) productChart.destroy();

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

    productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Cost',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#64748b', callback: value => 'Rs. ' + value.toLocaleString() },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                }
            }
        }
    });
}

function loadLatestActivities() {
    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];

    const latestIncome = [...income].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const latestExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const jobsTable = document.getElementById('latestJobsTable');
    if (jobsTable) {
        if (latestIncome.length === 0) {
            jobsTable.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i><p>No data available</p></td></tr>';
        } else {
            jobsTable.innerHTML = latestIncome.map(item => 
                '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.customer) + '</td><td>' + escapeHtml(item.service) + '</td><td>' + formatCurrency(item.total) + '</td></tr>'
            ).join('');
        }
    }

    const purchasesTable = document.getElementById('latestPurchasesTable');
    if (purchasesTable) {
        if (latestExpenses.length === 0) {
            purchasesTable.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i><p>No data available</p></td></tr>';
        } else {
            purchasesTable.innerHTML = latestExpenses.map(item => 
                '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.product) + '</td><td>' + item.quantity + '</td><td>' + formatCurrency(item.total) + '</td></tr>'
            ).join('');
        }
    }
}

function populateServiceSelect() {
    const select = document.getElementById('incomeService');
    if (!select) return;

    const services = Storage.get('services') || [];
    select.innerHTML = '<option value="">Select Service</option>';

    services.forEach(service => {
        const name = service.name;
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = name + ' - ' + CONFIG.currency + ' ' + formatNumber(service.price);
        option.dataset.price = service.price;
        option.dataset.name = service.name;
        option.dataset.nameSi = service.nameSi || service.name;
        select.appendChild(option);
    });
}

function updateIncomePrice() {
    const select = document.getElementById('incomeService');
    const priceInput = document.getElementById('incomePrice');

    if (select && priceInput && select.selectedOptions.length > 0) {
        const price = select.selectedOptions[0].dataset.price;
        if (price) {
            priceInput.value = price;
            calculateIncomeTotal();
        }
    }
}

function calculateIncomeTotal() {
    const quantity = parseFloat(document.getElementById('incomeQuantity').value) || 0;
    const price = parseFloat(document.getElementById('incomePrice').value) || 0;
    document.getElementById('incomeTotal').value = formatCurrency(quantity * price);
}

function saveIncome(e) {
    e.preventDefault();

    const date = document.getElementById('incomeDate').value;
    const customer = document.getElementById('incomeCustomer').value.trim();
    const serviceSelect = document.getElementById('incomeService');
    const quantity = parseInt(document.getElementById('incomeQuantity').value) || 1;
    const price = parseFloat(document.getElementById('incomePrice').value) || 0;

    if (!date || !customer || !serviceSelect.value) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    const selectedOption = serviceSelect.selectedOptions[0];
    const serviceName = selectedOption.dataset.name;
    const serviceNameSi = selectedOption.dataset.nameSi || serviceName;

    const income = Storage.get('income') || [];
    income.push({
        id: 'inc_' + Date.now(),
        date: date,
        customer: customer,
        service: serviceName,
        serviceSi: serviceNameSi,
        quantity: quantity,
        price: price,
        total: quantity * price,
        createdAt: new Date().toISOString()
    });

    Storage.set('income', income);
    closeModal('incomeModal');
    loadIncomeTable();
    updateBalanceCards();
    showToast('Income saved successfully!');
}

function loadIncomeTable() {
    const tbody = document.getElementById('incomeTableBody');
    if (!tbody) return;

    const income = Storage.get('income') || [];

    if (income.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-inbox"></i><p>No income records found</p></td></tr>';
        return;
    }

    const sortedIncome = [...income].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedIncome.map(item => {
        const serviceName = item.service;
        return '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.customer) + '</td><td>' + escapeHtml(serviceName) + '</td><td>' + item.quantity + '</td><td>' + formatCurrency(item.price) + '</td><td>' + formatCurrency(item.total) + '</td><td><div class="table-actions"><button class="btn-action btn-delete" onclick="deleteIncome(\'' + item.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
    }).join('');
}

function deleteIncome(id) {
    const confirmMsg = 'Are you sure you want to delete this income record?';
    if (!confirm(confirmMsg)) return;

    let income = Storage.get('income') || [];
    income = income.filter(item => item.id !== id);
    Storage.set('income', income);

    loadIncomeTable();
    updateBalanceCards();
    showToast('Income record deleted!');
}

function populateProductSelect() {
    const select = document.getElementById('expenseProduct');
    if (!select) return;

    const products = Storage.get('products') || [];
    select.innerHTML = '<option value="">Select Product</option>';

    products.forEach(product => {
        const name = product.name;
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = name + ' - ' + CONFIG.currency + ' ' + formatNumber(product.price);
        option.dataset.price = product.price;
        option.dataset.name = product.name;
        option.dataset.nameSi = product.nameSi || product.name;
        select.appendChild(option);
    });
}

function updateExpensePrice() {
    const select = document.getElementById('expenseProduct');
    const priceInput = document.getElementById('expenseUnitPrice');

    if (select && priceInput && select.selectedOptions.length > 0) {
        const price = select.selectedOptions[0].dataset.price;
        if (price) {
            priceInput.value = price;
            calculateExpenseTotal();
        }
    }
}

function calculateExpenseTotal() {
    const quantity = parseFloat(document.getElementById('expenseQuantity').value) || 0;
    const price = parseFloat(document.getElementById('expenseUnitPrice').value) || 0;
    document.getElementById('expenseTotal').value = formatCurrency(quantity * price);
}

function saveExpense(e) {
    e.preventDefault();

    const date = document.getElementById('expenseDate').value;
    const productSelect = document.getElementById('expenseProduct');
    const quantity = parseInt(document.getElementById('expenseQuantity').value) || 1;
    const unitPrice = parseFloat(document.getElementById('expenseUnitPrice').value) || 0;
    const supplier = document.getElementById('expenseSupplier').value.trim();
    const billFile = document.getElementById('expenseBill').files[0];

    if (!date || !productSelect.value) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    const selectedOption = productSelect.selectedOptions[0];
    const productName = selectedOption.dataset.name;
    const productNameSi = selectedOption.dataset.nameSi || productName;

    const expenses = Storage.get('expenses') || [];
    const newExpense = {
        id: 'exp_' + Date.now(),
        date: date,
        product: productName,
        productSi: productNameSi,
        quantity: quantity,
        unitPrice: unitPrice,
        total: quantity * unitPrice,
        supplier: supplier,
        billFileName: billFile ? billFile.name : null,
        createdAt: new Date().toISOString()
    };

    if (billFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newExpense.billData = e.target.result;
            expenses.push(newExpense);
            Storage.set('expenses', expenses);
            closeModal('expenseModal');
            loadExpenseTable();
            updateBalanceCards();
            showToast('Expense saved successfully!');
        };
        reader.readAsDataURL(billFile);
    } else {
        expenses.push(newExpense);
        Storage.set('expenses', expenses);
        closeModal('expenseModal');
        loadExpenseTable();
        updateBalanceCards();
        showToast('Expense saved successfully!');
    }
}

function loadExpenseTable() {
    const tbody = document.getElementById('expenseTableBody');
    if (!tbody) return;

    const expenses = Storage.get('expenses') || [];

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-inbox"></i><p>No expense records found</p></td></tr>';
        return;
    }

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedExpenses.map(item => {
        const productName = item.product;
        const billBtn = item.billData ? '<button class="btn-action btn-view" onclick="viewBill(\'' + item.id + '\')" title="View Bill"><i class="fas fa-file-alt"></i></button>' : '-';
        return '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(productName) + '</td><td>' + item.quantity + '</td><td>' + formatCurrency(item.unitPrice) + '</td><td>' + formatCurrency(item.total) + '</td><td>' + (escapeHtml(item.supplier) || '-') + '</td><td>' + billBtn + '</td><td><div class="table-actions"><button class="btn-action btn-delete" onclick="deleteExpense(\'' + item.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
    }).join('');
}

function deleteExpense(id) {
    const confirmMsg = 'Are you sure you want to delete this expense record?';
    if (!confirm(confirmMsg)) return;

    let expenses = Storage.get('expenses') || [];
    expenses = expenses.filter(item => item.id !== id);
    Storage.set('expenses', expenses);

    loadExpenseTable();
    updateBalanceCards();
    showToast('Expense record deleted!');
}

function viewBill(expenseId) {
    const expenses = Storage.get('expenses') || [];
    const expense = expenses.find(e => e.id === expenseId);

    if (expense && expense.billData) {
        const newWindow = window.open();
        newWindow.document.write('<html><head><title>Bill - ' + escapeHtml(expense.product) + '</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0f172a;"><img src="' + expense.billData + '" style="max-width:100%;max-height:100vh;" /></body></html>');
    }
}

function loadServicesGrid() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    const services = Storage.get('services') || [];

    if (services.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="fas fa-inbox"></i><p>No services found</p></div>';
        return;
    }

    grid.innerHTML = services.map(service => {
        const name = service.name;
        const desc = service.description;
        return '<div class="service-card"><h4>' + escapeHtml(name) + '</h4><div class="service-price">' + CONFIG.currency + ' ' + formatNumber(service.price) + '</div><div class="service-desc">' + escapeHtml(desc || '') + '</div><div class="service-actions"><button class="btn-action btn-edit" onclick="editService(\'' + service.id + '\')" title="Edit"><i class="fas fa-edit"></i></button><button class="btn-action btn-delete" onclick="deleteService(\'' + service.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
}

function saveService(e) {
    e.preventDefault();

    const id = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const price = parseFloat(document.getElementById('servicePrice').value) || 0;
    const description = document.getElementById('serviceDescription').value.trim();

    if (!name) {
        showToast('Service name is required', 'error');
        return;
    }

    const services = Storage.get('services') || [];

    if (id) {
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = Object.assign({}, services[index], { name, price, description });
            showToast('Service updated successfully!');
        }
    } else {
        services.push({
            id: 'svc_' + Date.now(),
            name: name,
            nameSi: name,
            price: price,
            description: description,
            descriptionSi: description
        });
        showToast('New service added successfully!');
    }

    Storage.set('services', services);
    closeModal('serviceModal');
    loadServicesGrid();
}

function editService(id) {
    const services = Storage.get('services') || [];
    const service = services.find(s => s.id === id);

    if (service) {
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceDescription').value = service.description || '';
        updateModalTitle('serviceModal', true);
        openModal('serviceModal');
    }
}

function deleteService(id) {
    const confirmMsg = 'Are you sure you want to delete this service?';
    if (!confirm(confirmMsg)) return;

    let services = Storage.get('services') || [];
    services = services.filter(s => s.id !== id);
    Storage.set('services', services);

    loadServicesGrid();
    showToast('Service deleted!');
}

function loadProductsTable() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    const products = Storage.get('products') || [];

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><i class="fas fa-inbox"></i><p>No products found</p></td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const name = product.name;
        return '<tr><td>' + escapeHtml(name) + '</td><td>' + formatCurrency(product.price) + '</td><td><div class="table-actions"><button class="btn-action btn-edit" onclick="editProduct(\'' + product.id + '\')" title="Edit"><i class="fas fa-edit"></i></button><button class="btn-action btn-delete" onclick="deleteProduct(\'' + product.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
    }).join('');
}

function saveProduct(e) {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;

    if (!name) {
        showToast('Product name is required', 'error');
        return;
    }

    const products = Storage.get('products') || [];

    if (id) {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = Object.assign({}, products[index], { name, price });
            showToast('Product updated successfully!');
        }
    } else {
        products.push({
            id: 'prd_' + Date.now(),
            name: name,
            nameSi: name,
            price: price
        });
        showToast('New product added successfully!');
    }

    Storage.set('products', products);
    closeModal('productModal');
    loadProductsTable();
}

function editProduct(id) {
    const products = Storage.get('products') || [];
    const product = products.find(p => p.id === id);

    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        updateModalTitle('productModal', true);
        openModal('productModal');
    }
}

function deleteProduct(id) {
    const confirmMsg = 'Are you sure you want to delete this product?';
    if (!confirm(confirmMsg)) return;

    let products = Storage.get('products') || [];
    products = products.filter(p => p.id !== id);
    Storage.set('products', products);

    loadProductsTable();
    showToast('Product deleted!');
}

function generateReport() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;

    if (!fromDate || !toDate) {
        showToast('Please select date range', 'error');
        return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
        showToast('From date must be before to date', 'error');
        return;
    }

    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];

    const filteredIncome = income.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const filteredExpenses = expenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const profit = totalIncome - totalExpenses;

    document.getElementById('reportIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('reportExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('reportProfit').textContent = formatCurrency(profit);

    renderReportPieChart(totalIncome, totalExpenses, profit);
    renderReportProductChart(filteredExpenses);
    renderReportTables(filteredIncome, filteredExpenses);

    document.getElementById('reportSummary').style.display = 'block';

    showToast('Report generated successfully!');
}

function renderReportPieChart(income, expenses, profit) {
    const ctx = document.getElementById('reportPieChart');
    if (!ctx) return;

    if (reportPieChart) reportPieChart.destroy();

    reportPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses', 'Profit'],
            datasets: [{
                data: [income, expenses, Math.max(0, profit)],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderReportProductChart(expenses) {
    const ctx = document.getElementById('reportProductChart');
    if (!ctx) return;

    const productData = {};
    expenses.forEach(item => {
        const name = item.product;
        if (!productData[name]) productData[name] = { quantity: 0, cost: 0 };
        productData[name].quantity += parseInt(item.quantity || 0);
        productData[name].cost += parseFloat(item.total || 0);
    });

    const labels = Object.keys(productData);
    const quantities = labels.map(l => productData[l].quantity);
    const costs = labels.map(l => productData[l].cost);

    if (reportProductChart) reportProductChart.destroy();

    reportProductChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Quantity',
                    data: quantities,
                    backgroundColor: '#6366f1',
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Total Cost',
                    data: costs,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#64748b' },
                    grid: { color: '#334155' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { 
                        color: '#64748b',
                        callback: function(value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    },
                    grid: { display: false }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderReportTables(income, expenses) {
    const incomeTbody = document.getElementById('reportIncomeTableBody');
    const expenseTbody = document.getElementById('reportExpenseTableBody');

    if (incomeTbody) {
        if (income.length === 0) {
            incomeTbody.innerHTML = '<tr><td colspan="4" class="empty-state">No data</td></tr>';
        } else {
            incomeTbody.innerHTML = income.map(item => 
                '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.customer) + '</td><td>' + escapeHtml(item.service) + '</td><td>' + formatCurrency(item.total) + '</td></tr>'
            ).join('');
        }
    }

    if (expenseTbody) {
        if (expenses.length === 0) {
            expenseTbody.innerHTML = '<tr><td colspan="4" class="empty-state">No data</td></tr>';
        } else {
            expenseTbody.innerHTML = expenses.map(item => 
                '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.product) + '</td><td>' + item.quantity + '</td><td>' + formatCurrency(item.total) + '</td></tr>'
            ).join('');
        }
    }
}

function exportReportExcel() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;

    if (!fromDate || !toDate) {
        showToast('Please generate report first', 'error');
        return;
    }

    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];

    const filteredIncome = income.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const filteredExpenses = expenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const wb = XLSX.utils.book_new();

    const incomeData = filteredIncome.map(item => ({
        'Date': item.date,
        'Customer': item.customer,
        'Service': item.service,
        'Quantity': item.quantity,
        'Price': item.price,
        'Total': item.total
    }));

    if (incomeData.length > 0) {
        const ws1 = XLSX.utils.json_to_sheet(incomeData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Income');
    }

    const expenseData = filteredExpenses.map(item => ({
        'Date': item.date,
        'Product': item.product,
        'Quantity': item.quantity,
        'Unit Price': item.unitPrice,
        'Total': item.total,
        'Supplier': item.supplier || ''
    }));

    if (expenseData.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Expenses');
    }

    const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const profit = totalIncome - totalExpenses;

    const summaryData = [
        { 'Report Period': fromDate + ' to ' + toDate },
        { 'Total Income': totalIncome },
        { 'Total Expenses': totalExpenses },
        { 'Profit': profit }
    ];

    const ws3 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

    XLSX.writeFile(wb, 'UDN_Report_' + fromDate + '_to_' + toDate + '.xlsx');
    showToast('Excel report downloaded!');
}

function exportReportPDF() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;

    if (!fromDate || !toDate) {
        showToast('Please generate report first', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const income = Storage.get('income') || [];
    const expenses = Storage.get('expenses') || [];

    const filteredIncome = income.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const filteredExpenses = expenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const profit = totalIncome - totalExpenses;

    doc.setFontSize(20);
    doc.text('UDN Graphic & Printing - Report', 14, 20);

    doc.setFontSize(12);
    doc.text('Period: ' + fromDate + ' to ' + toDate, 14, 30);

    doc.setFontSize(14);
    doc.text('Summary', 14, 45);

    doc.setFontSize(11);
    doc.text('Total Income: Rs. ' + formatNumber(totalIncome), 14, 55);
    doc.text('Total Expenses: Rs. ' + formatNumber(totalExpenses), 14, 62);
    doc.text('Profit: Rs. ' + formatNumber(profit), 14, 69);

    if (filteredIncome.length > 0) {
        doc.setFontSize(14);
        doc.text('Income Details', 14, 85);

        const incomeHeaders = [['Date', 'Customer', 'Service', 'Quantity', 'Total']];
        const incomeData = filteredIncome.map(item => [
            item.date, item.customer, item.service, item.quantity.toString(), 'Rs. ' + formatNumber(item.total)
        ]);

        doc.autoTable({
            head: incomeHeaders,
            body: incomeData,
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });
    }

    if (filteredExpenses.length > 0) {
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 120;

        doc.setFontSize(14);
        doc.text('Expense Details', 14, finalY);

        const expenseHeaders = [['Date', 'Product', 'Quantity', 'Unit Price', 'Total']];
        const expenseData = filteredExpenses.map(item => [
            item.date, item.product, item.quantity.toString(), 'Rs. ' + formatNumber(item.unitPrice), 'Rs. ' + formatNumber(item.total)
        ]);

        doc.autoTable({
            head: expenseHeaders,
            body: expenseData,
            startY: finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [239, 68, 68] }
        });
    }

    doc.save('UDN_Report_' + fromDate + '_to_' + toDate + '.pdf');
    showToast('PDF report downloaded!');
}

function exportAllData() {
    const data = {
        services: Storage.get('services') || [],
        products: Storage.get('products') || [],
        income: Storage.get('income') || [],
        expenses: Storage.get('expenses') || [],
        startingBalance: Storage.get('startingBalance') || 0,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UDN_Backup_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('All data exported!');
}

function loadSettings() {
    const startingBalance = Storage.get('startingBalance') || 0;
    document.getElementById('startingBalance').value = startingBalance;

    const settings = Storage.get('settings') || {};
    if (settings.logo) {
        const preview = document.getElementById('logoPreview');
        preview.innerHTML = '<img src="' + settings.logo + '" alt="Logo">';
    }
}

function saveStartingBalance() {
    const balance = parseFloat(document.getElementById('startingBalance').value) || 0;
    Storage.set('startingBalance', balance);
    updateBalanceCards();
    showToast('Starting balance saved!');
}

function uploadLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoData = e.target.result;
            const settings = Storage.get('settings') || {};
            settings.logo = logoData;
            Storage.set('settings', settings);

            const preview = document.getElementById('logoPreview');
            preview.innerHTML = '<img src="' + logoData + '" alt="Logo">';

            showToast('Logo uploaded!');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearAllData() {
    const confirmMsg = 'Are you sure you want to clear ALL data? This cannot be undone!';
    if (!confirm(confirmMsg)) return;

    const confirmMsg2 = 'Confirm - Do you really want to delete all data?';
    if (!confirm(confirmMsg2)) return;

    Storage.clear();
    initializeData();
    refreshAllData();
    showToast('All data cleared!');
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return CONFIG.currency + ' ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(amount) {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + '/' + month + '/' + year;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function searchTable(tableId, query) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
}

function refreshAllData() {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        if (sectionId === 'dashboard') initializeDashboard();
        else if (sectionId === 'income') loadIncomeTable();
        else if (sectionId === 'expenses') loadExpenseTable();
        else if (sectionId === 'services') loadServicesGrid();
        else if (sectionId === 'products') loadProductsTable();
        else if (sectionId === 'settings') loadSettings();
    }
}

function initMobileMenu() {
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft && !document.querySelector('.mobile-menu-btn')) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileBtn.style.cssText = 'background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;margin-right:12px;display:none;';
        mobileBtn.onclick = function() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('mobile-open');

            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                overlay.onclick = closeMobileSidebar;
            }
            overlay.classList.toggle('active');
        };
        headerLeft.insertBefore(mobileBtn, headerLeft.firstChild);

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        function handleMobile(e) {
            mobileBtn.style.display = e.matches ? 'block' : 'none';
        }
        mediaQuery.addListener(handleMobile);
        handleMobile(mediaQuery);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    checkAuth();

    const settings = Storage.get('settings') || {};
    if (settings.language) {
        currentLanguage = settings.language;
        document.getElementById('langText').textContent = currentLanguage === 'en' ? 'EN' : 'SI';
        updateLanguage();
    }

    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = today;
    });

    initMobileMenu();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDateInput = document.getElementById('reportFromDate');
    const toDateInput = document.getElementById('reportToDate');
    if (fromDateInput) fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (toDateInput) toDateInput.value = today;

    console.log('UDN Business Management System initialized successfully!');
});

window.addEventListener('resize', function() {
    if (incomeExpenseChart) incomeExpenseChart.resize();
    if (productChart) productChart.resize();
    if (reportPieChart) reportPieChart.resize();
    if (reportProductChart) reportProductChart.resize();
});
