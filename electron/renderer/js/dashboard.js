class Dashboard {
    constructor() {
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async init() {
        await this.loadDashboardData();
        this.setupEventListeners();
    }

    async loadDashboardData() {
        try {
            // Load dashboard stats
            const statsResponse = await api.getDashboardStats();
            if (statsResponse.success) {
                this.updateStats(statsResponse.data);
            }

            // Load riders
            await this.loadRiders();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateStats(stats) {
        if (stats) {
            document.getElementById('totalRiders').textContent = stats.totalRiders || 0;
            document.getElementById('activeStations').textContent = stats.activeStations || 0;
            document.getElementById('todayTransactions').textContent = stats.todayTransactions || 0;
        }
    }

    setupEventListeners() {
        // Add search functionality
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search riders...';
        searchInput.style.marginRight = '10px';
        searchInput.style.padding = '8px';
        searchInput.oninput = (e) => {
            this.currentSearch = e.target.value;
            this.loadRiders();
        };

        const sectionHeader = document.querySelector('.section-header');
        sectionHeader.insertBefore(searchInput, sectionHeader.querySelector('.btn'));
    }

    async loadRiders() {
        try {
            const response = await api.getRiders(this.currentPage, this.currentSearch);
            this.displayRiders(response.data);
        } catch (error) {
            console.error('Failed to load riders:', error);
            this.displayRiders([]);
        }
    }

    displayRiders(riders) {
        const tbody = document.getElementById('ridersTableBody');
        
        if (!riders || riders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No riders found</td></tr>';
            return;
        }

        tbody.innerHTML = riders.map(rider => `
            <tr>
                <td>${rider.rider_id}</td>
                <td>${rider.full_name}</td>
                <td>${rider.phone_number}</td>
                <td>${rider.boda_plate}</td>
                <td>${rider.wallet_balance} UGX</td>
                <td><span class="status-${rider.status}">${rider.status}</span></td>
            </tr>
        `).join('');
    }
}

// Global functions
async function loadRiders() {
    const dashboard = new Dashboard();
    await dashboard.loadRiders();
}

function startQRTransaction() {
    alert('QR Transaction feature will be implemented here!');
    // This will open QR scanner interface
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.init();
});
