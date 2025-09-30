// src/components/citySearchModal/CitySearchModal.jsx
import React from 'react';
import './CitySearchModal.css';

const CitySearchModal = ({ isOpen, city, onClose, onEdit }) => {
    if (!isOpen) return null;

    return (
        <div className="city-search-modal-overlay" onClick={onClose}>
            <div className="city-search-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="city-search-modal-header">
                    <h2>City Details</h2>
                </div>

                <div className="city-search-modal-body">
                    {city ? (
                        <div>
                            <div><strong>ID:</strong> {city.id}</div>
                            <div><strong>Name:</strong> {city.name}</div>
                            <div><strong>Coordinates:</strong> X: {city.coordinates?.x}, Y: {city.coordinates?.y}</div>
                            <div><strong>Area:</strong> {city.area}</div>
                            <div><strong>Population:</strong> {city.population?.toLocaleString()}</div>
                            <div><strong>Creation Date:</strong> {city.creationDate ? new Date(city.creationDate).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Establishment Date:</strong> {city.establishmentDate ? new Date(city.establishmentDate).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Capital:</strong> {city.capital ? 'Yes' : 'No'}</div>
                            <div><strong>Meters Above Sea Level:</strong> {city.metersAboveSeaLevel || 'N/A'}</div>
                            <div><strong>Timezone:</strong> {city.timezone}</div>
                            <div><strong>Car Code:</strong> {city.carCode || 'N/A'}</div>
                            <div><strong>Government:</strong> {city.government}</div>
                            <div><strong>Governor:</strong> {city.governor?.name || 'N/A'}</div>
                        </div>
                    ) : (
                        <div>No city data available.</div>
                    )}
                </div>

                <div className="city-search-modal-footer">
                    {city && (
                        <button
                            onClick={() => {
                                onEdit(city);
                                onClose();
                            }}
                        >
                            Edit This City
                        </button>
                    )}
                    <button onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CitySearchModal;