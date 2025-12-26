// Global State
let currentView = 'landing'; // Start with landing page
const charts = {};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Initial content population
    populateKPIs();
    populateInventory();
    populateMaintenance();

    // Initialize Charts
    initCharts();

    // Always start at landing page to avoid dashboard flash
    navigateTo('landing');

    // Setup Navigation Listeners (if any distinct from onclick)
    console.log("AccraAgro System Initialized - Welcome to Landing Page");
});

// Navigation Logic
function navigateTo(viewId) {
    // Determine target view ID (some buttons might pass 'landing' but the view is 'view-landing')
    const targetId = `view-${viewId}`;
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
        console.error(`View ${viewId} not found`);
        return;
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        }
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none'; // Ensure fully hidden
    });

    // Show target view
    targetSection.style.display = 'block'; // Or flex/grid depending on view, but block is safe for containers
    // Trigger reflow for animation if needed
    setTimeout(() => {
        targetSection.classList.add('active');
    }, 10);
    
    // Scroll to top of the new view
    const viewsContainer = document.getElementById('views-container');
    if (viewsContainer) {
        viewsContainer.scrollTop = 0;
    }

    // Specific logic for Landing Page (hide sidebar/header?)
    // For this design, let's keep sidebar/header hidden if it's the landing page
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('main-header');
    const main = document.querySelector('.main-content'); // Actually main content wrapper

    if (viewId === 'landing') {
        sidebar.style.transform = 'translateX(-100%)';
        header.style.display = 'none';
        main.style.marginLeft = '0';
        document.body.style.overflowY = 'auto'; // Allow scroll on landing
    } else {
        // Restore layout for dashboard pages
        if (window.innerWidth > 768) {
            sidebar.style.transform = 'translateX(0)';
            main.style.marginLeft = 'var(--sidebar-width)';
        }
        header.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Fixed dashboard
    }

    // Update Header Text
    const titles = {
        'dashboard': 'Operations Dashboard',
        'inventory': 'Inventory Control',
        'energy': 'Energy Systems',
        'maintenance': 'Machine Maintenance',
        'byproducts': 'Sustainability & Circularity'
    };
    const headerTitle = document.getElementById('page-title-text');
    if (headerTitle && titles[viewId]) headerTitle.innerText = titles[viewId];

    currentView = viewId;
    
    // Update URL hash (only if not landing to keep clean URL)
    if (viewId === 'landing') {
        // Clear hash for landing page
        if (window.location.hash) {
            history.pushState('', document.title, window.location.pathname);
        }
    } else {
        window.location.hash = viewId;
    }

    // Resize charts if needed
    if (viewId === 'dashboard' && charts.production) charts.production.resize();
    if (viewId === 'energy' && charts.energy) charts.energy.resize();
    
    // Re-initialize Lucide icons for the new view
    lucide.createIcons();
}

// Sidebar Mobile Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const isOpen = sidebar.classList.contains('open');

    if (isOpen) {
        sidebar.classList.remove('open');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    } else {
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.opacity = '1', 10);
        sidebar.classList.add('open');
    }
}

// Data Population - KPIs
function populateKPIs() {
    const kpiData = [
        { id: 'production', label: 'Daily Output', value: '1,240T', trend: '+12%', icon: 'package' },
        { id: 'energy', label: 'Grid Independence', value: '87%', trend: '+5%', icon: 'zap' },
        { id: 'maintenance', label: 'Active Lines', value: '11/12', trend: '-1', icon: 'activity', trendColor: 'red' },
        { id: 'revenue', label: 'Est. Revenue', value: '₵ 450k', trend: '+8%', icon: 'dollar-sign' }
    ];

    kpiData.forEach(kpi => {
        const el = document.querySelector(`.kpi-card[data-kpi="${kpi.id}"]`);
        if (el) {
            const trendClass = kpi.trendColor === 'red' ? 'trend-down' : 'trend-up';
            const trendIcon = kpi.trendColor === 'red' ? 'arrow-down-right' : 'arrow-up-right';

            el.innerHTML = `
                <div class="kpi-header">
                    <div class="kpi-icon"><i data-lucide="${kpi.icon}"></i></div>
                    <span class="kpi-trend ${trendClass}">
                        ${kpi.trend} <i data-lucide="${trendIcon}" width="14"></i>
                    </span>
                </div>
                <div class="kpi-title">${kpi.label}</div>
                <div class="kpi-value">${kpi.value}</div>
            `;
        }
    });
    lucide.createIcons();
}

// Data Population - Inventory
function populateInventory() {
    const inventoryData = [
        { name: 'Yellow Maize (Raw)', type: 'Grain', qty: '450 Tons', status: 'OK', last: '2h ago' },
        { name: 'Cassava Tubers', type: 'Root', qty: '120 Tons', status: 'LOW', last: '45m ago' },
        { name: 'Processed Starch', type: 'Finished', qty: '800 Bags', status: 'OK', last: '10m ago' },
        { name: 'Biomass Fuel', type: 'Energy', qty: '20 Tons', status: 'CRIT', last: '1d ago' },
        { name: 'Pkg Materials', type: 'Supply', qty: '5000 Units', status: 'OK', last: '5h ago' }
    ];

    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;

    tbody.innerHTML = inventoryData.map(item => {
        let badgeClass = 'ok';
        if (item.status === 'LOW') badgeClass = 'low';
        if (item.status === 'CRIT') badgeClass = 'crit';

        return `
            <tr>
                <td><span style="font-weight:600; color:#fff">${item.name}</span></td>
                <td>${item.type}</td>
                <td>${item.qty}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                <td style="color:var(--text-muted)">${item.last}</td>
            </tr>
        `;
    }).join('');
}

// Data Population - Maintenance (Machines)
function populateMaintenance() {
    const machines = [
        { name: 'Grinder Unit A', status: 'on', detail: 'Running at 98% efficiency' },
        { name: 'Conveyor Belt 4', status: 'fix', detail: 'Vibration detected in motor' },
        { name: 'Solar Inverter 2', status: 'on', detail: 'Optimal output' },
        { name: 'Drying Silo B', status: 'off', detail: 'Scheduled cleaning' },
        { name: 'Packaging Line 1', status: 'on', detail: 'Batch #4022 in progress' },
        { name: 'Water Pump Sys', status: 'on', detail: 'Pressure stable' }
    ];

    const grid = document.getElementById('machines-grid');
    if (!grid) return;

    grid.innerHTML = machines.map(m => `
        <div class="machine-card">
            <div class="m-header">
                <span class="m-title">${m.name}</span>
                <div class="m-status ${m.status}"></div>
            </div>
            <div class="m-detail">
                <span>Status: ${m.status.toUpperCase()}</span>
                <span>${m.detail}</span>
            </div>
            <button class="m-btn" onclick="showToast('Diagnostics initiated for ${m.name}', 'info')">Check Diagnostics</button>
        </div>
    `).join('');
}


// Charts Initialization
function initCharts() {
    // 1. Production Chart
    const ctxProd = document.getElementById('productionChart');
    if (ctxProd) {
        charts.production = new Chart(ctxProd, {
            type: 'line',
            data: {
                labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                datasets: [
                    {
                        label: 'Target',
                        data: [80, 85, 90, 90, 90, 85, 80],
                        borderColor: '#64748b',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Actual',
                        data: [75, 82, 94, 88, 92, 89, 85],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false, color: '#334155' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 2. Energy Chart
    const ctxEnergy = document.getElementById('energyChart');
    if (ctxEnergy) {
        charts.energy = new Chart(ctxEnergy, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Solar (kWh)',
                        data: [450, 520, 480, 550, 590, 600, 580],
                        backgroundColor: '#f59e0b',
                        borderRadius: 4
                    },
                    {
                        label: 'Grid (kWh)',
                        data: [200, 150, 180, 120, 100, 50, 80],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, stacked: true }
                }
            }
        });
    }

    // 3. Sustainability Chart
    const ctxBio = document.getElementById('byproductsChart');
    if (ctxBio) {
        charts.byproducts = new Chart(ctxBio, {
            type: 'doughnut',
            data: {
                labels: ['Biomass Fuel', 'Animal Feed', 'Compost', 'Landfill'],
                datasets: [{
                    data: [45, 30, 20, 5],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { color: '#e2e8f0' } }
                }
            }
        });
    }
}


// Interactive Functions
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let iconName = 'check-circle';
    if (type === 'info') iconName = 'info';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Animate out
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function runDiagnostics() {
    const btn = document.getElementById('diagnostic-btn');
    const text = document.getElementById('diagnostic-text');

    if (btn.disabled) return;

    btn.disabled = true;
    const originalText = text.innerText;
    text.innerText = "Running Checks...";

    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step === 1) showToast('Checking Sensor Grid...', 'info');
        if (step === 2) showToast('Verifying Power Output...', 'info');
        if (step === 3) showToast('Ping Latency: 12ms', 'info');

        if (step >= 4) {
            clearInterval(interval);
            showToast('System Integrity Verified: 100%', 'success');
            text.innerText = "Diagnostics Complete";
            setTimeout(() => {
                text.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }, 800);
}

function logout() {
    if (confirm("Secure Logout: End Session?")) {
        navigateTo('landing');
        showToast('Session Ended Securely', 'info');
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        navigateTo(hash);
    } else {
        navigateTo('landing');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentView) {
        // Refresh charts when page becomes visible
        if (charts[currentView]) {
            charts[currentView].resize();
        }
    }
});
