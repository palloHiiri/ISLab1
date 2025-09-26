const API_BASE = '/api/cities';

class CityService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body) {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Для DELETE без контента
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    async getAllCities(page = 0, size = 5) {
        return this.request(`/all?page=${page}&size=${size}`);
    }

    async getCityById(id) {
        return this.request(`/get-by-id/${id}`);
    }

    async createCity(city) {
        return this.request('/add', {
            method: 'POST',
            body: city,
        });
    }

    async updateCity(id, city) {
        return this.request(`/update-by-id/${id}`, {
            method: 'PUT',
            body: city,
        });
    }

    async deleteCity(id) {
        return this.request(`/delete-by-id/${id}`, {
            method: 'DELETE',
        });
    }

    // Специальные операции
    async getSumOfTimezones() {
        return this.request('/sum-of-timezones');
    }

    async getAverageCarCode() {
        return this.request('/average-car-code');
    }

    async getCitiesWithTimezoneLessThan(timezone) {
        return this.request(`/timezone-less-than/${timezone}`);
    }

    async getDistanceToMostPopulated() {
        return this.request('/distance-to-most-populated');
    }

    async getDistanceToNearest() {
        return this.request('/distance-to-newest');
    }
}

export const cityService = new CityService();
