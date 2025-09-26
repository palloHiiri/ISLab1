import React, { useState, useEffect } from 'react';
import { cityService } from '../services/cityService';

const CityForm = ({ city, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        coordinates: { x: 0, y: 0 },
        area: 0,
        population: 0,
        establishmentDate: '',
        capital: false,
        metersAboveSeaLevel: '',
        timezone: 0,
        carCode: '',
        government: 'ARISTOCRACY',
        governor: { name: '' }
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (city) {

            const cityData = { ...city };
            if (city.establishmentDate) {
                cityData.establishmentDate = city.establishmentDate;
            }
            setFormData(cityData);
        }
    }, [city]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? (value === '' ? '' : Number(value)) : value
                }
            }));
        } else {
            const processedValue = type === 'checkbox' ? checked :
                type === 'number' ? (value === '' ? '' : Number(value)) :
                    value;

            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.coordinates.x === null || formData.coordinates.x === '') {
            newErrors.coordX = 'X coordinate is required';
        } else if (formData.coordinates.x > 913) {
            newErrors.coordX = 'X must be ≤ 913';
        }

        if (formData.coordinates.y === null || formData.coordinates.y === '') {
            newErrors.coordY = 'Y coordinate is required';
        } else if (formData.coordinates.y <= -243) {
            newErrors.coordY = 'Y must be > -243';
        }

        if (formData.area <= 0) {
            newErrors.area = 'Area must be > 0';
        }

        if (!formData.population || formData.population <= 0) {
            newErrors.population = 'Population must be > 0';
        }

        if (formData.timezone <= -13 || formData.timezone > 15) {
            newErrors.timezone = 'Timezone must be between -12 and 15';
        }

        if (formData.carCode !== null && formData.carCode !== '') {
            const carCodeNum = Number(formData.carCode);
            if (carCodeNum <= 0 || carCodeNum > 1000) {
                newErrors.carCode = 'Car code must be between 1 and 1000';
            }
        }

        if (!formData.governor.name.trim()) {
            newErrors.governorName = 'Governor name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const submitData = {
                ...formData,
                coordinates: {
                    x: Number(formData.coordinates.x),
                    y: Number(formData.coordinates.y)
                },
                area: Number(formData.area),
                population: Number(formData.population),
                timezone: Number(formData.timezone),
                carCode: formData.carCode === '' ? null : Number(formData.carCode),
                metersAboveSeaLevel: formData.metersAboveSeaLevel === '' ?
                    null : Number(formData.metersAboveSeaLevel)
            };

            if (city) {
                await cityService.updateCity(city.id, submitData);
            } else {
                await cityService.createCity(submitData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving city:', error);
            alert(`Error saving city: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="city-form">
            <h2>{city ? 'Edit City' : 'Add New City'}</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Basic Information</legend>

                    <div className="form-group">
                        <label>Name *:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Area *:</label>
                        <input
                            type="number"
                            step="0.1"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            required
                        />
                        {errors.area && <span className="error">{errors.area}</span>}
                    </div>

                    <div className="form-group">
                        <label>Population *:</label>
                        <input
                            type="number"
                            name="population"
                            value={formData.population}
                            onChange={handleChange}
                            required
                        />
                        {errors.population && <span className="error">{errors.population}</span>}
                    </div>
                </fieldset>

                {/* Coordinates */}
                <fieldset>
                    <legend>Coordinates</legend>

                    <div className="form-group">
                        <label>X Coordinate * ({"<="}913):</label>
                        <input
                            type="number"
                            name="coordinates.x"
                            value={formData.coordinates.x}
                            onChange={handleChange}
                            required
                        />
                        {errors.coordX && <span className="error">{errors.coordX}</span>}
                    </div>

                    <div className="form-group">
                        <label>Y Coordinate * ({'>'}-243):</label>
                        <input
                            type="number"
                            name="coordinates.y"
                            value={formData.coordinates.y}
                            onChange={handleChange}
                            required
                        />
                        {errors.coordY && <span className="error">{errors.coordY}</span>}
                    </div>
                </fieldset>

                {/* Dates and Location */}
                <fieldset>
                    <legend>Dates and Location</legend>

                    <div className="form-group">
                        <label>Establishment Date:</label>
                        <input
                            type="date"
                            name="establishmentDate"
                            value={formData.establishmentDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Meters Above Sea Level:</label>
                        <input
                            type="number"
                            step="0.1"
                            name="metersAboveSeaLevel"
                            value={formData.metersAboveSeaLevel}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="form-group">
                        <label>Timezone * (-13 to 15):</label>
                        <input
                            type="number"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                            min="-12"
                            max="15"
                            required
                        />
                        {errors.timezone && <span className="error">{errors.timezone}</span>}
                    </div>
                </fieldset>

                {/* Government and Codes */}
                <fieldset>
                    <legend>Government and Codes</legend>

                    <div className="form-group">
                        <label>Car Code (1-1000, optional):</label>
                        <input
                            type="number"
                            name="carCode"
                            value={formData.carCode}
                            onChange={handleChange}
                            min="1"
                            max="1000"
                            placeholder="Optional"
                        />
                        {errors.carCode && <span className="error">{errors.carCode}</span>}
                    </div>

                    <div className="form-group">
                        <label>Government *:</label>
                        <select
                            name="government"
                            value={formData.government}
                            onChange={handleChange}
                            required
                        >
                            <option value="ARISTOCRACY">Aristocracy</option>
                            <option value="MATRIARCHY">Matriarchy</option>
                            <option value="NOOCRACY">Noocracy</option>
                            <option value="PATRIARCHY">Patriarchy</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Capital:</label>
                        <input
                            type="checkbox"
                            name="capital"
                            checked={formData.capital}
                            onChange={handleChange}
                        />
                    </div>
                </fieldset>

                {/* Governor */}
                <fieldset>
                    <legend>Governor</legend>

                    <div className="form-group">
                        <label>Governor Name *:</label>
                        <input
                            type="text"
                            name="governor.name"
                            value={formData.governor.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.governorName && <span className="error">{errors.governorName}</span>}
                    </div>
                </fieldset>

                <div className="form-actions">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (city ? 'Update' : 'Add')} City
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CityForm;