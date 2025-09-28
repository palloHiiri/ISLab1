import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityService } from '../services/cityService';
import CityForm from "./cityForm.jsx";
import { useNotification } from './ErrorNotification';
import './CityList.css';

const CityList = () => {
    const navigate = useNavigate();
    const { showError, showSuccess, showWarning, showInfo, NotificationComponent } = useNotification();

    const [cities, setCities] = useState({ cities: [], totalItems: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [editingCity, setEditingCity] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchedCity, setSearchedCity] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Filters for each column
    const [filters, setFilters] = useState({
        id: '',
        name: '',
        coordinatesX: '',
        coordinatesY: '',
        creationDate: '',
        area: '',
        population: '',
        establishmentDate: '',
        capital: '',
        metersAboveSeaLevel: '',
        timezone: '',
        carCode: '',
        government: '',
        governor: ''
    });

    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);

    const intervalRef = useRef(null);
    const filterTimeoutRef = useRef(null);

    const goToSpecialFunctions = () => {
        navigate('/special-functions');
    };

    useEffect(() => {
        fetchCities();

        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchCities(true); // silent refresh
            }, 10000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
    }, [currentPage, filters, sortBy, sortDirection, autoRefresh]);

    const fetchCities = async (silent = false) => {
        try {
            if (!silent && (!cities.cities || cities.cities.length === 0)) {
                setLoading(true);
            }

            const data = await cityService.getAllCities(
                currentPage,
                itemsPerPage,
                filters,
                sortBy,
                sortDirection
            );

            setCities(data);

            if (!silent && data.cities && data.cities.length > 0) {
                // showInfo(`Loaded ${data.cities.length} cities (${data.totalItems} total)`, 2000);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError(error.message || 'Failed to fetch cities');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(0);

        if (filterTimeoutRef.current) {
            clearTimeout(filterTimeoutRef.current);
        }

        filterTimeoutRef.current = setTimeout(() => {
            fetchCities();
        }, 800);
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
        setCurrentPage(0);
    };

    const clearAllFilters = () => {
        setFilters({
            id: '',
            name: '',
            coordinatesX: '',
            coordinatesY: '',
            creationDate: '',
            area: '',
            population: '',
            establishmentDate: '',
            capital: '',
            metersAboveSeaLevel: '',
            timezone: '',
            carCode: '',
            government: '',
            governor: ''
        });
        setCurrentPage(0);
        // showInfo('All filters cleared');
    };

    const clearFilter = (field) => {
        setFilters(prev => ({ ...prev, [field]: '' }));
        setCurrentPage(0);
        // showInfo(`${field} filter cleared`);
    };

    const handleSearchById = async () => {
        if (!searchId.trim()) {
            showWarning('Please enter a city ID to search');
            return;
        }

        if (isNaN(searchId) || Number(searchId) <= 0) {
            showError('Please enter a valid city ID (positive number)');
            return;
        }

        try {
            setSearchLoading(true);
            const city = await cityService.getCityById(searchId);
            setSearchedCity(city);
            setShowSearchModal(true);
            // showSuccess('City found successfully!');
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'City not found');
            setSearchedCity(null);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddCity = () => {
        setEditingCity(null);
        setShowForm(true);
    };

    const handleEditCity = (city) => {
        setEditingCity(city);
        setShowForm(true);
    };

    const handleDeleteCity = async (id) => {
        if (!window.confirm('Are you sure you want to delete this city? This action cannot be undone.')) {
            return;
        }

        try {
            await cityService.deleteCity(id);
            // showSuccess('City deleted successfully!');
            await fetchCities();
        } catch (error) {
            console.error('Delete error:', error);
            showError(error.message || 'Failed to delete city');
        }
    };

    const handleSaveCity = async () => {
        setShowForm(false);
        setEditingCity(null);
        await fetchCities();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCity(null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < cities.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchedCity(null);
        setSearchId('');
    };

    const handleManualRefresh = async () => {
        // showInfo('Refreshing cities list...');
        setLoading(true);
        await fetchCities();
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
        // showInfo(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
    const activeFiltersCount = Object.values(filters).filter(filter => filter !== '').length;

    const TableHeader = ({ field, label, filterType = 'text', options = [] }) => (
        <th className="px-4 py-2 text-left">
            <div className="column-header">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-700">{label}</span>
                    <button
                        onClick={() => handleSortChange(field)}
                        className={`sort-btn px-2 py-1 rounded text-sm ${
                            sortBy === field ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        } hover:bg-blue-200 transition-colors`}
                        title={`Sort by ${label}`}
                    >
                        {getSortIcon(field)}
                    </button>
                </div>
                <div className="column-filter relative">
                    {filterType === 'select' ? (
                        <select
                            value={filters[field] || ''}
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All</option>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={filterType}
                            placeholder={`Filter ${label.toLowerCase()}...`}
                            value={filters[field] || ''}
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    )}
                    {filters[field] && (
                        <button
                            onClick={() => clearFilter(field)}
                            className="absolute right-1 top-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Clear filter"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </th>
    );

    if (loading && (!cities.cities || cities.cities.length === 0)) {
        return (
            <>
                <NotificationComponent />
                <div className="city-list p-6">
                    <div className="loading flex flex-col items-center justify-center min-h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading cities...</h2>
                        <p className="text-gray-500">Please wait while we fetch the data.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NotificationComponent />

            <div className="city-list p-6 max-w-7xl mx-auto">
                <div className="header mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Cities Management</h1>

                    <div className="header-controls flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="controls-left flex flex-col sm:flex-row gap-4">
                            <div className="search-container flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Enter city ID"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSearchById}
                                    disabled={!searchId.trim() || searchLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {searchLoading ? 'Searching...' : 'Search by ID'}
                                </button>
                            </div>
                        </div>

                        <div className="controls-right flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            {hasActiveFilters && (
                                <div className="filter-indicator flex items-center gap-2">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                                    </span>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-red-600 hover:text-red-800 underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddCity}
                                    disabled={showForm}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Add New City
                                </button>

                                <button
                                    onClick={goToSpecialFunctions}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Special Functions
                                </button>

                                <button
                                    onClick={toggleAutoRefresh}
                                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                        autoRefresh
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title={`Auto-refresh is ${autoRefresh ? 'enabled' : 'disabled'}`}
                                >
                                    {autoRefresh ? '🔄' : '⏸️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showForm ? (
                    <CityForm
                        city={editingCity}
                        onSave={handleSaveCity}
                        onCancel={handleCancel}
                    />
                ) : (
                    <>
                        <div className="stats mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="font-medium">Total Cities: {cities.totalItems || 0}</span>
                                {hasActiveFilters && (
                                    <span className="text-blue-600">Filtered ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''})</span>
                                )}
                                <span>Sorted by: {sortBy} ({sortDirection})</span>
                                <span>Page {currentPage + 1} of {cities.totalPages || 1}</span>
                                <span>Showing {cities.cities ? cities.cities.length : 0} cities</span>
                                <span className="text-xs">
                                    Last updated: {new Date().toLocaleTimeString()}
                                </span>
                            </div>
                        </div>

                        {cities.cities && cities.cities.length > 0 ? (
                            <>
                                <div className="table-container overflow-x-auto bg-white rounded-lg shadow">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <TableHeader field="id" label="ID" filterType="number" />
                                            <TableHeader field="name" label="Name" />
                                            <TableHeader field="coordinatesX" label="Coord X" filterType="number" />
                                            <TableHeader field="coordinatesY" label="Coord Y" filterType="number" />
                                            <TableHeader field="creationDate" label="Creation Date" />
                                            <TableHeader field="area" label="Area" filterType="number" />
                                            <TableHeader field="population" label="Population" filterType="number" />
                                            <TableHeader field="establishmentDate" label="Est. Date" />
                                            <TableHeader
                                                field="capital"
                                                label="Capital"
                                                filterType="select"
                                                options={[
                                                    { value: 'true', label: 'Yes' },
                                                    { value: 'false', label: 'No' }
                                                ]}
                                            />
                                            <TableHeader field="metersAboveSeaLevel" label="Meters Above SL" filterType="number" />
                                            <TableHeader field="timezone" label="Timezone" filterType="number" />
                                            <TableHeader field="carCode" label="Car Code" filterType="number" />
                                            <TableHeader field="government" label="Government" />
                                            <TableHeader field="governor" label="Governor" />
                                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {cities.cities.map(city => (
                                            <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm">{city.id}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{city.name}</td>
                                                <td className="px-4 py-3 text-sm">{city.coordinates?.x}</td>
                                                <td className="px-4 py-3 text-sm">{city.coordinates?.y}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {city.creationDate ? new Date(city.creationDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{city.area}</td>
                                                <td className="px-4 py-3 text-sm">{city.population?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {city.establishmentDate ? new Date(city.establishmentDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            city.capital ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {city.capital ? 'Yes' : 'No'}
                                                        </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{city.metersAboveSeaLevel || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{city.timezone}</td>
                                                <td className="px-4 py-3 text-sm">{city.carCode || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{city.government}</td>
                                                <td className="px-4 py-3 text-sm">{city.governor?.name || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditCity(city)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="Edit city"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCity(city.id)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                            title="Delete city"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {cities.totalPages > 1 && (
                                    <div className="pagination flex justify-center items-center mt-6 gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: Math.min(cities.totalPages, 5) }, (_, i) => {
                                            let pageNum;
                                            if (cities.totalPages <= 5) {
                                                pageNum = i;
                                            } else {
                                                const start = Math.max(0, Math.min(currentPage - 2, cities.totalPages - 5));
                                                pageNum = start + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === cities.totalPages - 1}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-data text-center py-12 bg-white rounded-lg shadow">
                                <div className="text-gray-400 text-6xl mb-4">🏙️</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No cities found</h3>
                                {hasActiveFilters ? (
                                    <div className="space-y-2">
                                        <p className="text-gray-500">No cities match the current filters.</p>
                                        <button
                                            onClick={clearAllFilters}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mb-4">There are no cities to display at the moment.</p>
                                )}
                                <button
                                    onClick={handleManualRefresh}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Refresh List
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Search Modal */}
                {showSearchModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeSearchModal}>
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">City Details</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                    onClick={closeSearchModal}
                                >
                                    ×
                                </button>
                            </div>

                            {searchedCity && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><strong>ID:</strong> {searchedCity.id}</div>
                                        <div><strong>Name:</strong> {searchedCity.name}</div>
                                        <div><strong>Coordinates:</strong> X: {searchedCity.coordinates?.x}, Y: {searchedCity.coordinates?.y}</div>
                                        <div><strong>Area:</strong> {searchedCity.area}</div>
                                        <div><strong>Population:</strong> {searchedCity.population?.toLocaleString()}</div>
                                        <div><strong>Creation Date:</strong> {searchedCity.creationDate ? new Date(searchedCity.creationDate).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Establishment Date:</strong> {searchedCity.establishmentDate ? new Date(searchedCity.establishmentDate).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Capital:</strong> {searchedCity.capital ? 'Yes' : 'No'}</div>
                                        <div><strong>Meters Above Sea Level:</strong> {searchedCity.metersAboveSeaLevel || 'N/A'}</div>
                                        <div><strong>Timezone:</strong> {searchedCity.timezone}</div>
                                        <div><strong>Car Code:</strong> {searchedCity.carCode || 'N/A'}</div>
                                        <div><strong>Government:</strong> {searchedCity.government}</div>
                                        <div><strong>Governor:</strong> {searchedCity.governor?.name || 'N/A'}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6">
                                {searchedCity && (
                                    <button
                                        onClick={() => {
                                            handleEditCity(searchedCity);
                                            closeSearchModal();
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Edit This City
                                    </button>
                                )}
                                <button
                                    onClick={closeSearchModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CityList;