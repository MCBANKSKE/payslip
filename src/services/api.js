const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Handle API responses
const handleResponse = async (response) => {
    if (response.status === 204) {
        return null;
    }
    
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
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
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    logout: async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    },

    // Company Profile
    getCompanyProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/profile/company`, {
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
    },

    // Employees
    getEmployees: async () => {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    createEmployee: async (employeeData) => {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(employeeData)
        });
        return handleResponse(response);
    },

    updateEmployee: async (id, employeeData) => {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(employeeData)
        });
        return handleResponse(response);
    },

    deleteEmployee: async (id) => {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    // Payslips
    getRecentPayslips: async () => {
        const response = await fetch(`${API_BASE_URL}/payslips/recent`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    // Bank Statements
    getRecentStatements: async () => {
        const response = await fetch(`${API_BASE_URL}/statements/recent`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};
