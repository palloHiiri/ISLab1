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

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    async getAllCities(page = 0, size = 5, filters = {}, sortBy = 'id', sortDirection = 'asc') {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy: sortBy,
            sortDirection: sortDirection
        });

        // Используем имена фильтров, которые ожидает бэкенд (с суффиксом Filter)
        if (filters.id) params.append('idFilter', filters.id);
        if (filters.name) params.append('nameFilter', filters.name);
        if (filters.coordinatesX) params.append('coordinatesXFilter', filters.coordinatesX);
        if (filters.coordinatesY) params.append('coordinatesYFilter', filters.coordinatesY);
        if (filters.creationDate) params.append('creationDateFilter', filters.creationDate);
        if (filters.area) params.append('areaFilter', filters.area);
        if (filters.population) params.append('populationFilter', filters.population);
        if (filters.establishmentDate) params.append('establishmentDateFilter', filters.establishmentDate);
        if (filters.capital) params.append('capitalFilter', filters.capital);
        if (filters.metersAboveSeaLevel) params.append('metersAboveSeaLevelFilter', filters.metersAboveSeaLevel);
        if (filters.timezone) params.append('timezoneFilter', filters.timezone);
        if (filters.carCode) params.append('carCodeFilter', filters.carCode);
        if (filters.government) params.append('governmentFilter', filters.government);
        if (filters.governor) params.append('governorFilter', filters.governor);

        console.log('Request URL:', `/all?${params.toString()}`);

        return this.request(`/all?${params}`);
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