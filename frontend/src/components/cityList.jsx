import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityService } from '../services/cityService';
import CityForm from "./cityForm.jsx";
import './CityList.css';

const CityList = () => {
    const navigate = useNavigate();

    const [cities, setCities] = useState({ cities: [], totalItems: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingCity, setEditingCity] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchedCity, setSearchedCity] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Фильтры для каждого столбца
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
                fetchCities();
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

    const fetchCities = async () => {
        try {
            if (!cities.cities || cities.cities.length === 0) {
                setLoading(true);
            }

            console.log('Fetching cities with params:', {
                page: currentPage,
                size: itemsPerPage,
                filters,
                sortBy,
                sortDirection
            });

            const data = await cityService.getAllCities(
                currentPage,
                itemsPerPage,
                filters,
                sortBy,
                sortDirection
            );

            console.log('Received data:', data);
            setCities(data);
            setError('');
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to fetch cities: ' + error.message);
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
    };

    const clearFilter = (field) => {
        setFilters(prev => ({ ...prev, [field]: '' }));
        setCurrentPage(0);
    };

    const handleSearchById = async () => {
        if (!searchId.trim()) return;

        try {
            setSearchLoading(true);
            setSearchError('');
            console.log('Searching for city ID:', searchId);
            const city = await cityService.getCityById(searchId);
            console.log('Found city:', city);
            setSearchedCity(city);
            setShowSearchModal(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('City not found or error fetching city: ' + error.message);
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
        if (window.confirm('Are you sure you want to delete this city?')) {
            try {
                await cityService.deleteCity(id);
                await fetchCities();
            } catch (error) {
                setError('Failed to delete city: ' + error.message);
            }
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
        setSearchError('');
        setSearchId('');
    };

    const handleManualRefresh = async () => {
        setLoading(true);
        await fetchCities();
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
    const activeFiltersCount = Object.values(filters).filter(filter => filter !== '').length;

    const TableHeader = ({ field, label, filterType = 'text', options = [] }) => (
        <th>
            <div className="column-header">
                <div className="column-title">
                    <span>{label}</span>
                    <button
                        onClick={() => handleSortChange(field)}
                        className={`sort-btn ${sortBy === field ? 'active' : ''}`}
                    >
                        {getSortIcon(field)}
                    </button>
                </div>
                <div className="column-filter">
                    {filterType === 'select' ? (
                        <select
                            value={filters[field] || ''}
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                            className="filter-input"
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
                            className="filter-input"
                        />
                    )}
                    {filters[field] && (
                        <button
                            onClick={() => clearFilter(field)}
                            className="clear-filter-btn"
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
            <div className="city-list">
                <div className="loading">
                    <h2>Loading cities...</h2>
                    <p>Please wait while we fetch the data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="city-list">
            <div className="header">
                <h1>Cities Management</h1>

                <div className="header-controls">
                    <div className="controls-left">

                        <div className="search-container">
                            <input
                                type="number"
                                placeholder="Enter city ID"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
                                className="search-input"
                            />
                            <button
                                onClick={handleSearchById}
                                disabled={!searchId.trim() || searchLoading}
                                className="btn-secondary"
                            >
                                {searchLoading ? 'Searching...' : 'Search by ID'}
                            </button>
                        </div>
                    </div>

                    <div className="controls-right">
                        {hasActiveFilters && (
                            <div className="filter-indicator">
                                <span className="active-filters-badge">
                                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                                </span>
                                <button onClick={clearAllFilters} className="btn-clear-all">
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        <button onClick={handleAddCity} disabled={showForm} className="btn-primary">
                            Add New City
                        </button>

                        <button onClick={goToSpecialFunctions} className="btn-special">
                            📊 Special Functions
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">Error: {error}</div>}

            {showForm ? (
                <CityForm
                    city={editingCity}
                    onSave={handleSaveCity}
                    onCancel={handleCancel}
                />
            ) : (
                <>
                    <div className="stats">
                        <span>Total Cities: {cities.totalItems || 0}</span>
                        {hasActiveFilters && (
                            <span>🔍 Filtered ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''})</span>
                        )}
                        <span>📊 Sorted by: {sortBy} ({sortDirection})</span>
                        <span>Page {currentPage + 1} of {cities.totalPages || 1}</span>
                        <span>Showing {cities.cities ? cities.cities.length : 0} cities</span>
                        <span className="last-updated">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>

                    {cities.cities && cities.cities.length > 0 ? (
                        <>
                            <div className="table-container">
                                <table className="city-table">
                                    <thead>
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
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cities.cities.map(city => (
                                        <tr key={city.id}>
                                            <td>{city.id}</td>
                                            <td>{city.name}</td>
                                            <td>{city.coordinates?.x}</td>
                                            <td>{city.coordinates?.y}</td>
                                            <td>{city.creationDate ? new Date(city.creationDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>{city.area}</td>
                                            <td>{city.population?.toLocaleString()}</td>
                                            <td>{city.establishmentDate ? new Date(city.establishmentDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>{city.capital ? 'Yes' : 'No'}</td>
                                            <td>{city.metersAboveSeaLevel || 'N/A'}</td>
                                            <td>{city.timezone}</td>
                                            <td>{city.carCode || 'N/A'}</td>
                                            <td>{city.government}</td>
                                            <td>{city.governor?.name || 'N/A'}</td>
                                            <td className="actions">
                                                <button
                                                    onClick={() => handleEditCity(city)}
                                                    className="btn-edit"
                                                    title="Edit city"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCity(city.id)}
                                                    className="btn-delete"
                                                    title="Delete city"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {cities.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="pagination-btn"
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
                                                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === cities.totalPages - 1}
                                        className="pagination-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-data">
                            <h3>No cities found</h3>
                            {hasActiveFilters ? (
                                <p>No cities match the current filters. <button onClick={clearAllFilters} className="btn-secondary">Clear All Filters</button></p>
                            ) : (
                                <p>There are no cities to display at the moment.</p>
                            )}
                            <button onClick={handleManualRefresh} className="btn-secondary">
                                Refresh List
                            </button>
                        </div>
                    )}
                </>
            )}

            {showSearchModal && (
                <div className="modal-overlay" onClick={closeSearchModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>City Details</h2>
                            <button className="close-btn" onClick={closeSearchModal}>×</button>
                        </div>

                        {searchError && (
                            <div className="error-message">{searchError}</div>
                        )}

                        {searchedCity && (
                            <div className="city-details">
                                <div className="detail-row">
                                    <strong>ID:</strong> {searchedCity.id}
                                </div>
                                <div className="detail-row">
                                    <strong>Name:</strong> {searchedCity.name}
                                </div>
                                <div className="detail-row">
                                    <strong>Coordinates:</strong>
                                    X: {searchedCity.coordinates?.x}, Y: {searchedCity.coordinates?.y}
                                </div>
                                <div className="detail-row">
                                    <strong>Area:</strong> {searchedCity.area}
                                </div>
                                <div className="detail-row">
                                    <strong>Population:</strong> {searchedCity.population?.toLocaleString()}
                                </div>
                                <div className="detail-row">
                                    <strong>Creation Date:</strong> {searchedCity.creationDate ? new Date(searchedCity.creationDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Establishment Date:</strong> {searchedCity.establishmentDate ? new Date(searchedCity.establishmentDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Capital:</strong> {searchedCity.capital ? 'Yes' : 'No'}
                                </div>
                                <div className="detail-row">
                                    <strong>Meters Above Sea Level:</strong> {searchedCity.metersAboveSeaLevel || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Timezone:</strong> {searchedCity.timezone}
                                </div>
                                <div className="detail-row">
                                    <strong>Car Code:</strong> {searchedCity.carCode || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Government:</strong> {searchedCity.government}
                                </div>
                                <div className="detail-row">
                                    <strong>Governor:</strong> {searchedCity.governor?.name || 'N/A'}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            {searchedCity && (
                                <button
                                    onClick={() => {
                                        handleEditCity(searchedCity);
                                        closeSearchModal();
                                    }}
                                    className="btn-primary"
                                >
                                    Edit This City
                                </button>
                            )}
                            <button onClick={closeSearchModal} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityList;