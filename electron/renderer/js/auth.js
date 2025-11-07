class Auth {
    constructor() {
        this.currentUser = null;
    }

    async login(username, password) {
        // Simple authentication for demo
        const users = {
            'admin': { password: 'admin123', name: 'System Administrator', role: 'admin' },
            'station': { password: 'station123', name: 'Fuel Station', role: 'station' }
        };

        if (users[username] && users[username].password === password) {
            this.currentUser = {
                username,
                name: users[username].name,
                role: users[username].role
            };
            localStorage.setItem('halal_user', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        throw new Error('Invalid credentials');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('halal_user');
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('halal_user');
            this.currentUser = stored ? JSON.parse(stored) : null;
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
}

const auth = new Auth();
