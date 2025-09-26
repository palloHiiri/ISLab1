import { cityService } from "../services/cityService.js";
import CityForm from "./cityForm.jsx";
import CityTable from "./cityTable.jsx";
import React from "react";

const CityList = () => {
    const [cities, setCities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [editingCity, setEditingCity] = React.useState(null);
    const [showForm, setShowForm] = React.useState(false);
    const [searchId, setSearchId] = React.useState('');
    const [searchedCity, setSearchedCity] = React.useState(null);
    const [showSearchModal, setShowSearchModal] = React.useState(false);
    const [searchLoading, setSearchLoading] = React.useState(false);
    const [searchError, setSearchError] = React.useState('');

    // Пагинация
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(5);

    React.useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            setLoading(true);
            const data = await cityService.getAllCities();
            setCities(data);
            setError('');
        } catch (error) {
            setError('Failed to fetch cities');
        } finally {
            setLoading(false);
        }
    };

    // Расчет данных для пагинации
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCities = cities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(cities.length / itemsPerPage);

    const handleSearchById = async () => {
        if (!searchId.trim()) return;

        try {
            setSearchLoading(true);
            setSearchError('');
            const city = await cityService.getCityById(searchId);
            setSearchedCity(city);
            setShowSearchModal(true);
        } catch (error) {
            setSearchError('City not found or error fetching city');
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
                // Если удалили последний элемент на странице - переходим на предыдущую
                if (currentCities.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                setError('Failed to delete city');
            }
        }
    };

    const handleSaveCity = async () => {
        setShowForm(false);
        await fetchCities();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCity(null);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchedCity(null);
        setSearchError('');
        setSearchId('');
    };

    // Функции для пагинации
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Генерация номеров страниц
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="city-list">
            <div className="header">
                <h1>Cities</h1>

                {/* Поиск по ID */}
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
                        className="search-btn"
                    >
                        {searchLoading ? 'Searching...' : 'Search by ID'}
                    </button>
                </div>

                <button onClick={handleAddCity} disabled={showForm}>
                    Add City
                </button>
            </div>

            {showForm ? (
                <CityForm
                    city={editingCity}
                    onSave={handleSaveCity}
                    onCancel={handleCancel}
                />
            ) : (
                <>
                    <div className="stats">
                        <p>Total Cities: {cities.length}</p>
                        <p>Showing {currentCities.length} of {cities.length} cities</p>
                        <p>Page {currentPage} of {totalPages}</p>
                    </div>

                    <CityTable
                        cities={currentCities}
                        onEdit={handleEditCity}
                        onDelete={handleDeleteCity}
                    />

                    {/* Пагинация */}
                    {cities.length > itemsPerPage && (
                        <div className="pagination">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>

                            {getPageNumbers().map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
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
                            <div className="error">{searchError}</div>
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
                                    <strong>Population:</strong> {searchedCity.population}
                                </div>
                                <div className="detail-row">
                                    <strong>Area:</strong> {searchedCity.area}
                                </div>
                                {searchedCity.coordinates && (
                                    <div className="detail-row">
                                        <strong>Coordinates:</strong>
                                        X: {searchedCity.coordinates.x},
                                        Y: {searchedCity.coordinates.y}
                                    </div>
                                )}
                                {searchedCity.creationDate && (
                                    <div className="detail-row">
                                        <strong>Creation Date:</strong> {new Date(searchedCity.creationDate).toLocaleDateString()}
                                    </div>
                                )}
                                {searchedCity.establishmentDate && (
                                <div className="detail-row">
                                    <strong>Establishment Date:</strong> {new Date(searchedCity.establishmentDate).toLocaleDateString()}
                                </div>
                                )}
                                {searchedCity.capital !== undefined && (
                                    <div className="detail-row">
                                        <strong>Capital:</strong> {searchedCity.capital ? 'Yes' : 'No'}
                                    </div>
                                )}
                                {searchedCity.metersAboveSeaLevel !== undefined && (
                                    <div className="detail-row">
                                        <strong>Meters Above Sea Level:</strong> {searchedCity.metersAboveSeaLevel}
                                    </div>
                                )
                                }

                            </div>
                        )}

                        <div className="modal-actions">
                            {searchedCity && (
                                <button
                                    onClick={() => {
                                        handleEditCity(searchedCity);
                                        closeSearchModal();
                                    }}
                                    className="edit-btn"
                                >
                                    Edit This City
                                </button>
                            )}
                            <button onClick={closeSearchModal} className="cancel-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .search-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .search-input {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    width: 150px;
                }

                .search-btn {
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .search-btn:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .stats {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                }

                .stats p {
                    margin: 0;
                    padding: 8px 12px;
                    background-color: gray;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                }

                .pagination-btn {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    background-color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    min-width: 40px;
                    transition: all 0.2s;
                }

                .pagination-btn:hover:not(:disabled) {
                    background-color: #f8f9fa;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-btn.active {
                    background-color: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: dimgray;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                }

                .close-btn:hover {
                    color: #333;
                }

                .city-details {
                    margin: 20px 0;
                }

                .detail-row {
                    margin: 10px 0;
                    padding: 8px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .edit-btn {
                    background-color: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .cancel-btn {
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .search-container {
                        justify-content: center;
                    }
                    
                    .stats {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .pagination {
                        gap: 4px;
                    }
                    
                    .pagination-btn {
                        padding: 6px 10px;
                        min-width: 35px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CityList;