const API_BASE = '/api/cities';

export const cityService  = {
    getAllCities: async () => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch cities');
        }
        return response.json();
    },

    getCityById: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch city');
        }
        return response.json();
    },

    createCity: async (city) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(city),
        });
        if (!response.ok) {
            throw new Error('Failed to create city');
        }
        return response.json();
    },

    updateCity: async (id, city) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(city),
        });
        if (!response.ok) {
            throw new Error('Failed to update city');
        }
        return response.json();
    },

    deleteCity: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete city');
        }

        const contentLength = response.headers.get('Content-Length');
        if (response.status === 204 || contentLength === '0') {
            return null;
        }
        return response.json();
    }
};