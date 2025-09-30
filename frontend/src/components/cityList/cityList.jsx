import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityService } from '../../services/cityService.js';
import CityForm from "../cityForm/cityForm.jsx";
import CityTableWithPagination from "../сityTableWithPagination/CityTableWithPagination.jsx";
import { useNotification } from '../errorNotification/errorNotification.jsx';
import CitySearchModal from "../сitySearchModal/сitySearchModal.jsx";
import './CityList.css';
import {websocketService} from "../../services/websocketService.js";

const CityList = () => {
    const navigate = useNavigate();
    const { showError, showWarning, NotificationComponent } = useNotification();
    const [cities, setCities] = useState({ cities: [], totalItems: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [editingCity, setEditingCity] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchedCity, setSearchedCity] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
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
        fetchCities()
        websocketService.connect();

        const handleCityAdded = (city) => {
            console.log('Город добавлен:', city);
            fetchCities(true);
        };

        const handleCityUpdated = (city) => {
            console.log('Город обновлен:', city);
            fetchCities(true);
        };

        const handleCitiesDeletedCascade = (city) => {
            console.log('Каскадное удаление городов:', city);
            fetchCities(true);
        };

        // Подписка на события
        websocketService.addListener('CITY_ADDED', handleCityAdded);
        websocketService.addListener('CITY_UPDATED', handleCityUpdated);
        websocketService.addListener('CITY_DELETED', handleCitiesDeletedCascade);

        return () => {
            // Отписка от событий
            websocketService.removeListener('CITY_ADDED', handleCityAdded);
            websocketService.removeListener('CITY_UPDATED', handleCityUpdated);
            websocketService.removeListener('CITY_DELETED', handleCitiesDeletedCascade);

            websocketService.disconnect();

            // Убираем интервал, так как теперь используем WebSocket
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
    },[])


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
    };

    const clearFilter = (field) => {
        setFilters(prev => ({ ...prev, [field]: '' }));
        setCurrentPage(0);
    };

    const handleSearchById = async () => {
        if (isNaN(searchId) || Number(searchId) <= 0) {
            showError('Please enter a valid city ID');
            return;
        }

        try {
            setSearchLoading(true);
            const city = await cityService.getCityById(searchId);
            setSearchedCity(city);
            setShowSearchModal(true);
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

    const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
    const activeFiltersCount = Object.values(filters).filter(filter => filter !== '').length;

    return (
        <>
            <NotificationComponent />
            <div className="city-list">
                <div className="header ">
                    <h1 className="">Cities Management</h1>

                    <div className="header-controls">
                        <div className="controls-left">
                            <div className="search-container">
                                <input
                                    type="number"
                                    placeholder="Enter city ID"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    // onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
                                    className=""
                                />
                                <button
                                    onClick={handleSearchById}
                                    disabled={!searchId.trim() || searchLoading}
                                    className=""
                                >
                                    {searchLoading ? 'Searching...' : 'Search by ID'}
                                </button>
                            </div>
                        </div>

                        <div className="controls-right">
                            {hasActiveFilters && (
                                <div className="filter-indicator">
                                    <span className="">
                                        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                                    </span>
                                    <button
                                        onClick={clearAllFilters}
                                        className=""
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            <div className="">
                                <button
                                    onClick={handleAddCity}
                                    disabled={showForm}
                                    className=""
                                >
                                    Add New City
                                </button>

                                <button
                                    onClick={goToSpecialFunctions}
                                    className=""
                                >
                                    Special Functions
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
                        <CityTableWithPagination
                            cities={cities.cities}
                            totalPages={cities.totalPages}
                            currentPage={currentPage}
                            onSortChange={handleSortChange}
                            onFilterChange={handleFilterChange}
                            onClearFilter={clearFilter}
                            filters={filters}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            onEdit={handleEditCity}
                            onDelete={handleDeleteCity}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                <CitySearchModal
                    isOpen={showSearchModal}
                    city={searchedCity}
                    onClose={closeSearchModal}
                    onEdit={handleEditCity}
                />
            </div>
        </>
    );
};

export default CityList;