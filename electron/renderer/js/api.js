class API {
    constructor() {
        this.baseURL = 'https://halal-ventures-api-d9kq.onrender.com'; // Update with your Railway URL
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            };

            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Riders
    async getRiders(page = 1, search = '') {
        const params = new URLSearchParams({ page, search });
        return this.request(`/api/riders?${params}`);
    }

    async createRider(riderData) {
        return this.request('/api/riders', {
            method: 'POST',
            body: JSON.stringify(riderData),
        });
    }

    // Transactions
    async processFuelPurchase(purchaseData) {
        return this.request('/api/transactions/fuel-purchase', {
            method: 'POST',
            body: JSON.stringify(purchaseData),
        });
    }

    // Stations
    async getStations() {
        return this.request('/api/stations');
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/api/dashboard/stats');
    }
}

const api = new API();
