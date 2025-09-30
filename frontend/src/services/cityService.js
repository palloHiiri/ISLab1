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

        try {
            const response = await fetch(url, config);

            // Handle different response scenarios
            if (response.status === 204) {
                return { success: true };
            }

            // Try to parse response as JSON
            let responseData;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = { message: await response.text() || `HTTP ${response.status} error` };
            }

            if (!response.ok) {
                // If backend sends structured error response, use it
                if (responseData && responseData.message) {
                    throw new Error(responseData.message);
                } else if (responseData && responseData.error) {
                    throw new Error(responseData.error);
                } else {
                    // Fallback error messages
                    switch (response.status) {
                        case 400:
                            throw new Error('Invalid request data. Please check your input.');
                        case 401:
                            throw new Error('Unauthorized. Please check your credentials.');
                        case 403:
                            throw new Error('Access forbidden.');
                        case 404:
                            throw new Error('Resource not found.');
                        case 409:
                            throw new Error('Conflict. The resource already exists.');
                        case 422:
                            throw new Error('Validation error. Please check your input data.');
                        case 500:
                            throw new Error('Internal server error. Please try again later.');
                        case 502:
                            throw new Error('Bad gateway. The server is temporarily unavailable.');
                        case 503:
                            throw new Error('Service unavailable. Please try again later.');
                        default:
                            throw new Error(`HTTP error ${response.status}: ${response.statusText || 'Unknown error'}`);
                    }
                }
            }

            return responseData;

        } catch (error) {
            // Network errors or other fetch errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection and try again.');
            } else if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            } else {
                // Re-throw our custom errors or other errors
                throw error;
            }
        }
    }

    async getAllCities(page = 0, size = 5, filters = {}, sortBy = 'id', sortDirection = 'asc') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy: sortBy,
                sortDirection: sortDirection
            });

            // Add filters with proper names that backend expects
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

            return await this.request(`/all?${params}`);
        } catch (error) {
            throw new Error(`Failed to fetch cities: ${error.message}`);
        }
    }

    async getCityById(id) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid city ID provided');
            }
            return await this.request(`/get-by-id/${id}`);
        } catch (error) {
            throw new Error(`Failed to fetch city: ${error.message}`);
        }
    }

    async createCity(city) {
        try {
            if (!city) {
                throw new Error('City data is required');
            }

            this.validateCityData(city);

            return await this.request('/add', {
                method: 'POST',
                body: city,
            });
        } catch (error) {
            throw new Error(`Failed to create city: ${error.message}`);
        }
    }

    async updateCity(id, city) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid city ID provided');
            }

            if (!city) {
                throw new Error('City data is required');
            }

            // Client-side validation for better UX
            this.validateCityData(city);

            return await this.request(`/update-by-id/${id}`, {
                method: 'PUT',
                body: city,
            });
        } catch (error) {
            throw new Error(`Failed to update city: ${error.message}`);
        }
    }

    async deleteCity(id) {
        try {
            if (!id || id <= 0) {
                throw new Error('Invalid city ID provided');
            }

            return await this.request(`/delete-by-id/${id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            throw new Error(`Failed to delete city: ${error.message}`);
        }
    }

    async getSumOfTimezones() {
        try {
            return await this.request('/sum-of-timezones');
        } catch (error) {
            throw new Error(`Failed to calculate sum of timezones: ${error.message}`);
        }
    }

    async getAverageCarCode() {
        try {
            return await this.request('/average-car-code');
        } catch (error) {
            throw new Error(`Failed to calculate average car code: ${error.message}`);
        }
    }

    async getCitiesWithTimezoneLessThan(timezone) {
        try {
            if (timezone === null || timezone === undefined) {
                throw new Error('Timezone value is required');
            }

            // if (timezone < -13 || timezone > 15) {
            //     throw new Error('Timezone must be between -13 and 15');
            // }

            return await this.request(`/timezone-less-than/${timezone}`);
        } catch (error) {
            throw new Error(`Failed to fetch cities by timezone: ${error.message}`);
        }
    }

    async getDistanceToMostPopulated() {
        try {
            return await this.request('/distance-to-most-populated');
        } catch (error) {
            throw new Error(`Failed to calculate distance to most populated city: ${error.message}`);
        }
    }

    async getDistanceToNearest() {
        try {
            return await this.request('/distance-to-newest');
        } catch (error) {
            throw new Error(`Failed to calculate distance to newest city: ${error.message}`);
        }
    }

    async getGovernors() {
        try {
            return await this.request('/governors');
        } catch (error) {
            throw new Error(`Failed to fetch governors: ${error.message}`);
        }
    }

    async getCoordinates() {
        try {
            return await this.request('/coordinates');
        } catch (error) {
            throw new Error(`Failed to fetch coordinates: ${error.message}`);
        }
    }


    validateCityData(city) {
        const errors = [];

        if (!city.name || !city.name.trim()) {
            errors.push('City name is required');
        }

        if (!city.population || city.population <= 0) {
            errors.push('Population must be greater than 0');
        }

        if (!city.area || city.area <= 0) {
            errors.push('Area must be greater than 0');
        }

        if (!city.coordinates) {
            errors.push('Coordinates are required');
        } else {
            if (city.coordinates.x > 913) {
                errors.push('X coordinate must be ≤ 913');
            }
            if (city.coordinates.y <= -243) {
                errors.push('Y coordinate must be > -243');
            }
        }

        if (city.timezone === null || city.timezone === undefined || city.timezone < -13 || city.timezone > 15) {
            errors.push('Timezone must be between -13 and 15');
        }

        if (city.carCode !== null && city.carCode !== undefined && (city.carCode <= 0 || city.carCode > 1000)) {
            errors.push('Car code must be between 1 and 1000');
        }

        if (!city.governor || !city.governor.name || !city.governor.name.trim()) {
            errors.push('Governor name is required');
        }

        if (errors.length > 0) {
            throw new Error(errors.join('; '));
        }
    }
}

export const cityService = new CityService();