// Demo data for screen recording
const demoSubscriptions = [
    {
        id: 1,
        name: "Netflix Premium",
        provider: "Netflix",
        amount: 55.00,
        nextBilling: "2024-01-15",
        status: "Active",
        icon: "N",
        iconColor: "red"
    },
    {
        id: 2,
        name: "Spotify Premium",
        provider: "Spotify",
        amount: 25.00,
        nextBilling: "2024-01-20",
        status: "Active",
        icon: "S",
        iconColor: "green"
    },
    {
        id: 3,
        name: "Adobe Creative Cloud",
        provider: "Adobe",
        amount: 120.00,
        nextBilling: "2024-01-25",
        status: "Active",
        icon: "A",
        iconColor: "red"
    },
    {
        id: 4,
        name: "Etisalat Mobile",
        provider: "Etisalat",
        amount: 150.00,
        nextBilling: "2024-01-10",
        status: "Active",
        icon: "E",
        iconColor: "blue"
    },
    {
        id: 5,
        name: "Starzplay",
        provider: "Starzplay",
        amount: 35.00,
        nextBilling: "2024-01-18",
        status: "Trial",
        icon: "S",
        iconColor: "black"
    }
];

let subscriptions = [...demoSubscriptions];
let nextId = 6;
let currentPage = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSubscriptions();
    
    // Add form submission handler
    document.getElementById('addSubscriptionForm').addEventListener('submit', handleAddSubscription);
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('addSubscriptionModal');
        if (event.target === modal) {
            closeAddSubscriptionModal();
        }
    }
});

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
    
    currentPage = pageName;
    
    // Load page-specific content
    if (pageName === 'subscriptions') {
        loadSubscriptions();
    }
}

// Load subscriptions into the table
function loadSubscriptions() {
    const tableBody = document.getElementById('subscriptionsTableBody');
    tableBody.innerHTML = '';
    
    if (subscriptions.length === 0) {
        tableBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus-circle"></i>
                <h3>No subscriptions yet</h3>
                <p>Add your first subscription to get started</p>
                <button class="btn-primary" onclick="openAddSubscriptionModal()">
                    <i class="fas fa-plus"></i>
                    Add Subscription
                </button>
            </div>
        `;
        return;
    }
    
    subscriptions.forEach(subscription => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="table-cell">
                <div class="subscription-icon ${subscription.iconColor}">${subscription.icon}</div>
                <div>
                    <div class="subscription-name">${subscription.name}</div>
                    <div class="subscription-provider">${subscription.provider}</div>
                </div>
            </div>
            <div class="table-cell">${subscription.provider}</div>
            <div class="table-cell subscription-amount">AED ${subscription.amount}</div>
            <div class="table-cell subscription-date">${formatDate(subscription.nextBilling)}</div>
            <div class="table-cell">
                <span class="status-badge ${subscription.status.toLowerCase()}">${subscription.status}</span>
            </div>
            <div class="table-cell table-actions">
                <button class="action-btn pause" onclick="pauseSubscription(${subscription.id})" title="Pause">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="action-btn delete" onclick="deleteSubscription(${subscription.id})" title="Delete">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        tableBody.appendChild(row);
    });
}

// Modal functions
function openAddSubscriptionModal() {
    document.getElementById('addSubscriptionModal').style.display = 'block';
}

function closeAddSubscriptionModal() {
    document.getElementById('addSubscriptionModal').style.display = 'none';
    document.getElementById('addSubscriptionForm').reset();
}

// Handle add subscription form
function handleAddSubscription(e) {
    e.preventDefault();
    
    const newSubscription = {
        id: nextId++,
        name: document.getElementById('serviceName').value,
        provider: document.getElementById('provider').value,
        amount: parseFloat(document.getElementById('amount').value),
        nextBilling: document.getElementById('nextBilling').value,
        status: 'Active',
        icon: document.getElementById('serviceName').value.charAt(0).toUpperCase(),
        iconColor: getRandomIconColor()
    };
    
    subscriptions.push(newSubscription);
    
    // Refresh subscriptions if on subscriptions page
    if (currentPage === 'subscriptions') {
        loadSubscriptions();
    }
    
    closeAddSubscriptionModal();
    
    // Show success message
    showNotification('Subscription added successfully!', 'success');
}

// Pause subscription
function pauseSubscription(id) {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (subscription) {
        subscription.status = subscription.status === 'Active' ? 'Paused' : 'Active';
        loadSubscriptions();
        showNotification(`${subscription.name} ${subscription.status.toLowerCase()}`, 'info');
    }
}

// Delete subscription
function deleteSubscription(id) {
    if (confirm('Are you sure you want to delete this subscription?')) {
        const subscription = subscriptions.find(sub => sub.id === id);
        if (subscription) {
            subscriptions = subscriptions.filter(sub => sub.id !== id);
            loadSubscriptions();
            showNotification(`${subscription.name} deleted`, 'success');
        }
    }
}

// Close demo
function closeDemo() {
    if (confirm('Are you sure you want to close the demo?')) {
        window.close();
    }
}

// Go to landing page
function goToLanding() {
    window.location.href = 'landing.html';
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function getRandomIconColor() {
    const colors = ['orange', 'red', 'black', 'green', 'blue', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#365194',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification styles
const notificationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Demo functions for screen recording
function addDemoSubscription() {
    const demoSub = {
        id: nextId++,
        name: "Apple Music",
        provider: "Apple",
        amount: 19.99,
        nextBilling: "2024-02-01",
        status: "Active",
        icon: "A",
        iconColor: "red"
    };
    
    subscriptions.push(demoSub);
    loadSubscriptions();
    showNotification('Apple Music subscription added!', 'success');
}

function deleteDemoSubscription() {
    const netflixSub = subscriptions.find(sub => sub.name === 'Netflix Premium');
    if (netflixSub) {
        subscriptions = subscriptions.filter(sub => sub.id !== netflixSub.id);
        loadSubscriptions();
        showNotification('Netflix Premium subscription deleted!', 'success');
    }
}

// Add demo buttons for screen recording (remove in production)
document.addEventListener('DOMContentLoaded', function() {
    const demoControls = document.createElement('div');
    demoControls.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    `;
    
    demoControls.innerHTML = `
        <button onclick="addDemoSubscription()" style="padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Add Demo Sub
        </button>
        <button onclick="deleteDemoSubscription()" style="padding: 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Delete Demo Sub
        </button>
        <button onclick="showPage('subscriptions')" style="padding: 10px; background: #365194; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Go to Subscriptions
        </button>
    `;
    
    document.body.appendChild(demoControls);
});