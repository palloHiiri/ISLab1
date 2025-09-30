import React, { useState, useEffect } from 'react';
import { cityService } from '../../services/cityService.js';
import { useNotification } from '../errorNotification/errorNotification.jsx';
import './CityForm.css';

const CityForm = ({ city, onSave, onCancel }) => {
    const { showError, showSuccess } = useNotification();

    const [activeTab, setActiveTab] = useState('basic');
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
                    [child]: type === 'number' ? (value === '' ? null : Number(value)) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? (value === '' ? null : Number(value)) : value
            }));
        }

        if (errors[name] || (name === 'governor.name' && errors.governorName)) {
            setErrors(prev => {
                const newErrors = { ...prev };
                if (name === 'governor.name') {
                    delete newErrors.governorName;
                } else {
                    delete newErrors[name];
                }
                return newErrors;
            });
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

        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            if (['name', 'area', 'population'].includes(firstErrorField)) setActiveTab('basic');
            else if (firstErrorField.startsWith('coord')) setActiveTab('coordinates');
            else if (['government', 'capital'].includes(firstErrorField)) setActiveTab('government');
            else if (['timezone', 'carCode', 'metersAboveSeaLevel', 'establishmentDate'].includes(firstErrorField)) setActiveTab('additional');
            else if (firstErrorField === 'governorName') setActiveTab('governor');

            showError('Please fix the errors in the form');
            return false;
        }
        return true;
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
                showSuccess('City updated successfully!');
            } else {
                await cityService.createCity(submitData);
                showSuccess('City created successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving city:', error);
            showError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isLoading) return;
        onCancel();
    };

    // Вспомогательная функция для отображения ошибок
    const getError = (field) => errors[field] || (field === 'governorName' ? errors.governorName : null);

    return (
        <>
            <div className="city-form-modal-overlay" onClick={handleCancel}>
                <div className="city-form-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="city-form-modal-header">
                        <h2>{city ? 'Edit City' : 'Add New City'}</h2>
                    </div>

                    <div className="city-form-modal-tabs">
                        <div
                            className={`city-form-modal-tab ${activeTab === 'basic' ? 'active' : ''}`}
                            onClick={() => setActiveTab('basic')}
                        >
                            Basic Info
                        </div>
                        <div
                            className={`city-form-modal-tab ${activeTab === 'coordinates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('coordinates')}
                        >
                            Coordinates
                        </div>
                        <div
                            className={`city-form-modal-tab ${activeTab === 'government' ? 'active' : ''}`}
                            onClick={() => setActiveTab('government')}
                        >
                            Government
                        </div>
                        <div
                            className={`city-form-modal-tab ${activeTab === 'additional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('additional')}
                        >
                            Additional
                        </div>
                        <div
                            className={`city-form-modal-tab ${activeTab === 'governor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('governor')}
                        >
                            Governor
                        </div>
                    </div>

                    <div className="city-form-modal-body">
                        {/* Basic Info */}
                        <div className={`city-form-modal-section ${activeTab === 'basic' ? 'active' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={getError('name') ? 'border-red-500' : ''}
                                    />
                                    {getError('name') && <span className="text-red-500">{getError('name')}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Area *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className={getError('area') ? 'border-red-500' : ''}
                                    />
                                    {getError('area') && <span className="text-red-500">{getError('area')}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Population *</label>
                                    <input
                                        type="number"
                                        name="population"
                                        value={formData.population}
                                        onChange={handleChange}
                                        className={getError('population') ? 'border-red-500' : ''}
                                    />
                                    {getError('population') && <span className="text-red-500">{getError('population')}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div className={`city-form-modal-section ${activeTab === 'coordinates' ? 'active' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>X (≤913) *</label>
                                    <input
                                        type="number"
                                        name="coordinates.x"
                                        value={formData.coordinates.x}
                                        onChange={handleChange}
                                        className={getError('coordX') ? 'border-red-500' : ''}
                                    />
                                    {getError('coordX') && <span className="text-red-500">{getError('coordX')}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Y (>-243) *</label>
                                    <input
                                        type="number"
                                        name="coordinates.y"
                                        value={formData.coordinates.y}
                                        onChange={handleChange}
                                        className={getError('coordY') ? 'border-red-500' : ''}
                                    />
                                    {getError('coordY') && <span className="text-red-500">{getError('coordY')}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Government */}
                        <div className={`city-form-modal-section ${activeTab === 'government' ? 'active' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Government Type *</label>
                                    <select
                                        name="government"
                                        value={formData.government}
                                        onChange={handleChange}
                                    >
                                        <option value="ARISTOCRACY">Aristocracy</option>
                                        <option value="MATRIARCHY">Matriarchy</option>
                                        <option value="NOOCRACY">Noocracy</option>
                                        <option value="PATRIARCHY">Patriarchy</option>
                                    </select>
                                </div>
                                <div className="form-group flex items-center">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="capital"
                                            checked={formData.capital}
                                            onChange={handleChange}
                                        />
                                        <span>Capital City</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Additional */}
                        <div className={`city-form-modal-section ${activeTab === 'additional' ? 'active' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        className={getError('timezone') ? 'border-red-500' : ''}
                                    />
                                    {getError('timezone') && <span className="text-red-500">{getError('timezone')}</span>}
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
                                        className={getError('carCode') ? 'border-red-500' : ''}
                                    />
                                    {getError('carCode') && <span className="text-red-500">{getError('carCode')}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Governor */}
                        <div className={`city-form-modal-section ${activeTab === 'governor' ? 'active' : ''}`}>
                            <div className="form-group max-w-md">
                                <label>Governor Name *</label>
                                <input
                                    type="text"
                                    name="governor.name"
                                    value={formData.governor.name}
                                    onChange={handleChange}
                                    className={getError('governorName') ? 'border-red-500' : ''}
                                />
                                {getError('governorName') && <span className="text-red-500">{getError('governorName')}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="city-form-modal-footer">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CityForm;