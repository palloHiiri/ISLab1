import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityService } from '../services/cityService';
import CityTable from "./cityTable.jsx";
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

    // Отдельные фильтры для каждого столбца
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
            }, 10000); // Автообновление каждые 10 секунд
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

    // Обработчик изменения фильтра с задержкой
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(0);

        if (filterTimeoutRef.current) {
            clearTimeout(filterTimeoutRef.current);
        }

        filterTimeoutRef.current = setTimeout(() => {
            fetchCities();
        }, 800); // Задержка 800мс для избежания лишних запросов
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

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
    const activeFiltersCount = Object.values(filters).filter(filter => filter !== '').length;

    return (
        <div className="city-list">
            <div className="header">
                <h1>Cities Management</h1>

                {/* Контролы фильтрации по столбцам */}
                <div className="filters-section">
                    <div className="filters-header">
                        <h3>🔍 Filters by Column</h3>
                        <div className="filter-actions">
                            {hasActiveFilters && (
                                <span className="active-filters-badge">
                                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                                </span>
                            )}
                            <button onClick={clearAllFilters} className="btn-clear-all">
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    <div className="column-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>ID</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by ID..."
                                        value={filters.id}
                                        onChange={(e) => handleFilterChange('id', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.id && (
                                        <button onClick={() => clearFilter('id')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Name</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by name..."
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.name && (
                                        <button onClick={() => clearFilter('name')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Coordinates X</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by X coordinate..."
                                        value={filters.coordinatesX}
                                        onChange={(e) => handleFilterChange('coordinatesX', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.coordinatesX && (
                                        <button onClick={() => clearFilter('coordinatesX')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Coordinates Y</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by Y coordinate..."
                                        value={filters.coordinatesY}
                                        onChange={(e) => handleFilterChange('coordinatesY', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.coordinatesY && (
                                        <button onClick={() => clearFilter('coordinatesY')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Creation Date</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by creation date (YYYY-MM-DD)..."
                                        value={filters.creationDate}
                                        onChange={(e) => handleFilterChange('creationDate', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.creationDate && (
                                        <button onClick={() => clearFilter('creationDate')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Area</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by area..."
                                        value={filters.area}
                                        onChange={(e) => handleFilterChange('area', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.area && (
                                        <button onClick={() => clearFilter('area')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Population</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by population..."
                                        value={filters.population}
                                        onChange={(e) => handleFilterChange('population', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.population && (
                                        <button onClick={() => clearFilter('population')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Establishment Date</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by establishment date..."
                                        value={filters.establishmentDate}
                                        onChange={(e) => handleFilterChange('establishmentDate', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.establishmentDate && (
                                        <button onClick={() => clearFilter('establishmentDate')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Capital</label>
                                <div className="filter-input-container">
                                    <select
                                        value={filters.capital}
                                        onChange={(e) => handleFilterChange('capital', e.target.value)}
                                        className="column-filter-input"
                                    >
                                        <option value="">All</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                    {filters.capital && (
                                        <button onClick={() => clearFilter('capital')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Meters Above Sea Level</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by meters above sea level..."
                                        value={filters.metersAboveSeaLevel}
                                        onChange={(e) => handleFilterChange('metersAboveSeaLevel', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.metersAboveSeaLevel && (
                                        <button onClick={() => clearFilter('metersAboveSeaLevel')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Timezone</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by timezone (-13 to 15)..."
                                        value={filters.timezone}
                                        onChange={(e) => handleFilterChange('timezone', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.timezone && (
                                        <button onClick={() => clearFilter('timezone')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Car Code</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by car code (1-1000)..."
                                        value={filters.carCode}
                                        onChange={(e) => handleFilterChange('carCode', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.carCode && (
                                        <button onClick={() => clearFilter('carCode')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Government</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by government..."
                                        value={filters.government}
                                        onChange={(e) => handleFilterChange('government', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.government && (
                                        <button onClick={() => clearFilter('government')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Governor</label>
                                <div className="filter-input-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by governor name..."
                                        value={filters.governor}
                                        onChange={(e) => handleFilterChange('governor', e.target.value)}
                                        className="column-filter-input"
                                    />
                                    {filters.governor && (
                                        <button onClick={() => clearFilter('governor')} className="clear-filter-btn">✕</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Контролы сортировки по всем столбцам */}
                <div className="sort-section">
                    <div className="sort-header">
                        <h3>📊 Sort by Column</h3>
                        <span className="current-sort">
                            Currently: <strong>{sortBy}</strong> ({sortDirection})
                        </span>
                    </div>

                    <div className="sort-buttons-grid">
                        {[
                            { field: 'id', label: 'ID' },
                            { field: 'name', label: 'Name' },
                            { field: 'coordinatesX', label: 'Coordinates X' },
                            { field: 'coordinatesY', label: 'Coordinates Y' },
                            { field: 'coordinates', label: 'Coordinates (X,Y)' },
                            { field: 'creationDate', label: 'Creation Date' },
                            { field: 'area', label: 'Area' },
                            { field: 'population', label: 'Population' },
                            { field: 'establishmentDate', label: 'Establishment Date' },
                            { field: 'capital', label: 'Capital' },
                            { field: 'metersAboveSeaLevel', label: 'Meters Above Sea Level' },
                            { field: 'timezone', label: 'Timezone' },
                            { field: 'carCode', label: 'Car Code' },
                            { field: 'government', label: 'Government' },
                            { field: 'governor', label: 'Governor' }
                        ].map(({ field, label }) => (
                            <button
                                key={field}
                                onClick={() => handleSortChange(field)}
                                className={`sort-btn ${sortBy === field ? 'active' : ''}`}
                            >
                                {label} {getSortIcon(field)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="header-controls">
                    <div className="refresh-controls">
                        <button
                            onClick={toggleAutoRefresh}
                            className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
                        >
                            {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
                        </button>
                        <button
                            onClick={handleManualRefresh}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : '🔄 Manual Refresh'}
                        </button>
                    </div>

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

                    <button onClick={handleAddCity} disabled={showForm} className="btn-primary">
                        Add New City
                    </button>

                    <button onClick={goToSpecialFunctions} className="btn-special">
                        📊 Special Functions
                    </button>
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
                            <CityTable
                                cities={cities.cities}
                                onEdit={handleEditCity}
                                onDelete={handleDeleteCity}
                                onSort={handleSortChange}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                            />

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

            {/* Модальное окно поиска */}
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
