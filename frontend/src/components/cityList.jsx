import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityService } from '../services/cityService';
import CityTable from "./cityTable.jsx";
import CityForm from "./cityForm.jsx";
import './CityList.css';

const CityList = () => {
    const navigate = useNavigate(); // Хук для навигации

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

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);

    const intervalRef = useRef(null);

    const goToSpecialFunctions = () => {
        navigate('/special-functions');
    };

    useEffect(() => {
        fetchCities();

        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchCities();
            }, 2000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentPage, autoRefresh]);

    const fetchCities = async () => {
        try {
            if (!cities.cities || cities.cities.length === 0) {
                setLoading(true);
            }

            console.log('Fetching cities, page:', currentPage, 'size:', itemsPerPage);
            const data = await cityService.getAllCities(currentPage, itemsPerPage);
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
                        Special Functions
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

                                    {Array.from({ length: cities.totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

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
                            <p>There are no cities to display at the moment.</p>
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
