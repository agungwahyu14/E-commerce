const auth = {
    getToken: () => localStorage.getItem('admin_token'),
    setToken: (token) => localStorage.setItem('admin_token', token),
    removeToken: () => localStorage.removeItem('admin_token'),
    setUser: (user) => localStorage.setItem('admin_user', JSON.stringify(user)),
    getUser: () => JSON.parse(localStorage.getItem('admin_user')),
    
    checkAuth: () => {
        const token = auth.getToken();
        if (!token) {
            window.location.hash = '#login';
            return false;
        }
        return true;
    },

    login: async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Login failed');
            }

            const { token, user } = result.data;

            // Important: Check if role is admin
            if (user.role !== 'admin') {
                throw new Error('Access denied. Admin only.');
            }

            auth.setToken(token);
            auth.setUser(user);
            window.location.hash = '#dashboard';
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    logout: () => {
        auth.removeToken();
        localStorage.removeItem('admin_user');
        window.location.hash = '#login';
    }
};

window.auth = auth;
