const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''  // Only add Authorization if token exists
    };
};

// Handle API responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        // If the token is invalid, clear it and throw error
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        throw new Error(data.message || 'API request failed');
    }
    return data;
};

export const api = {
    // Auth
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(response);
        // Store the token
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        return data;
    },

    logout: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            await handleResponse(response);
        } finally {
            // Always clear local storage on logout attempt
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Company Profile
    getCompanyProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile/company`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    updateCompanyProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile/company`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    },

    // Bank Profile
    getBankProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile/bank`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    updateBankProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile/bank`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    }
};
