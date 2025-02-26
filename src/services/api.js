const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const api = {
    // Company Profile
    getCompanyProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile/company`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch company profile');
        }
        return response.json();
    },

    updateCompanyProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile/company`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update company profile');
        }
        return response.json();
    },

    // Bank Profile
    getBankProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile/bank`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch bank profile');
        }
        return response.json();
    },

    updateBankProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/profile/bank`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update bank profile');
        }
        return response.json();
    }
};
