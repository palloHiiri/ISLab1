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
        metersAboveSeaLevel: null,
        timezone: 0,
        carCode: null,
        government: 'ARISTOCRACY',
        governor: { name: '' }
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (city) {
            setFormData({
                ...city,
                establishmentDate: city.establishmentDate || '',
                metersAboveSeaLevel: city.metersAboveSeaLevel || null,
                carCode: city.carCode || null
            });
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
                    [child]: type === 'number' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? Number(value) : value
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.population || formData.population <= 0) newErrors.population = 'Population must be > 0';
        if (!formData.area || formData.area <= 0) newErrors.area = 'Area must be > 0';
        if (formData.timezone < -13 || formData.timezone > 15) newErrors.timezone = 'Timezone must be between -13 and 15';
        if (!formData.governor?.name?.trim()) newErrors.governorName = 'Governor name is required';

        if (formData.coordinates.x > 913) newErrors.coordX = 'X must be ≤ 913';
        if (formData.coordinates.y <= -243) newErrors.coordY = 'Y must be > -243';

        if (formData.carCode !== null && (formData.carCode <= 0 || formData.carCode > 1000)) {
            newErrors.carCode = 'Car code must be between 1 and 1000';
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
                carCode: formData.carCode || null,
                metersAboveSeaLevel: formData.metersAboveSeaLevel || null
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

                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Name *</label>
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
                            <label>Area *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                required
                            />
                            {errors.area && <span className="error">{errors.area}</span>}
                        </div>

                        <div className="form-group">
                            <label>Population *</label>
                            <input
                                type="number"
                                name="population"
                                value={formData.population}
                                onChange={handleChange}
                                required
                            />
                            {errors.population && <span className="error">{errors.population}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Coordinates</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>X (≤913) *</label>
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
                            <label>Y (>-243) *</label>
                            <input
                                type="number"
                                name="coordinates.y"
                                value={formData.coordinates.y}
                                onChange={handleChange}
                                required
                            />
                            {errors.coordY && <span className="error">{errors.coordY}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Government</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Government Type *</label>
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
                            <label>Capital</label>
                            <input
                                type="checkbox"
                                name="capital"
                                checked={formData.capital}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Additional Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Establishment Date</label>
                            <input
                                type="date"
                                name="establishmentDate"
                                value={formData.establishmentDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Meters Above Sea Level</label>
                            <input
                                type="number"
                                step="0.1"
                                name="metersAboveSeaLevel"
                                value={formData.metersAboveSeaLevel || ''}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="form-group">
                            <label>Timezone (-13 to 15) *</label>
                            <input
                                type="number"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                min="-13"
                                max="15"
                                required
                            />
                            {errors.timezone && <span className="error">{errors.timezone}</span>}
                        </div>

                        <div className="form-group">
                            <label>Car Code (1-1000)</label>
                            <input
                                type="number"
                                name="carCode"
                                value={formData.carCode || ''}
                                onChange={handleChange}
                                min="1"
                                max="1000"
                                placeholder="Optional"
                            />
                            {errors.carCode && <span className="error">{errors.carCode}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Governor</h3>
                    <div className="form-group">
                        <label>Governor Name *</label>
                        <input
                            type="text"
                            name="governor.name"
                            value={formData.governor.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.governorName && <span className="error">{errors.governorName}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Saving...' : (city ? 'Update' : 'Create')} City
                    </button>
                    <button type="button" onClick={onCancel} disabled={isLoading} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CityForm;