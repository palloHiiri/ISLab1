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

    // Данные для выбора существующих значений
    const [existingData, setExistingData] = useState({
        governors: [],
        coordinates: [],
        timezones: [],
        carCodes: []
    });
    const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);

    // Состояния для режима выбора/ввода
    const [inputModes, setInputModes] = useState({
        governor: 'input', // 'select' или 'input'
        coordinates: 'input',
        timezone: 'input',
        carCode: 'input'
    });

    useEffect(() => {
        if (city) {
            setFormData({
                ...city,
                establishmentDate: city.establishmentDate || '',
                metersAboveSeaLevel: city.metersAboveSeaLevel || null,
                carCode: city.carCode || null
            });
        }
        loadExistingData();
    }, [city]);

    const loadExistingData = async () => {
        setIsLoadingExistingData(true);
        try {
            const [governors, coordinates] = await Promise.all([
                cityService.getGovernors(),
                cityService.getCoordinates()
            ]);

            // Извлекаем уникальные значения timezone и carCode из координат и других данных
            const timezones = [...new Set(coordinates.map(coord => coord.timezone))].sort((a, b) => a - b);
            const carCodes = [...new Set(coordinates.map(coord => coord.carCode).filter(code => code !== null))].sort((a, b) => a - b);

            setExistingData({
                governors: governors.map(g => g.name).filter(name => name && name.trim()),
                coordinates: coordinates,
                timezones,
                carCodes
            });
        } catch (error) {
            console.error('Error loading existing data:', error);
            showError('Failed to load existing data');
        } finally {
            setIsLoadingExistingData(false);
        }
    };

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

    const handleSelectChange = (field, value) => {
        switch (field) {
            case 'governor':
                setFormData(prev => ({
                    ...prev,
                    governor: { name: value }
                }));
                if (errors.governorName) {
                    setErrors(prev => ({ ...prev, governorName: null }));
                }
                break;
            case 'coordinates':
                const selectedCoord = existingData.coordinates.find(coord =>
                    coord.x === value.x && coord.y === value.y
                );
                if (selectedCoord) {
                    setFormData(prev => ({
                        ...prev,
                        coordinates: { x: selectedCoord.x, y: selectedCoord.y },
                        timezone: selectedCoord.timezone,
                        carCode: selectedCoord.carCode
                    }));
                }
                break;
            case 'timezone':
                setFormData(prev => ({
                    ...prev,
                    timezone: Number(value)
                }));
                if (errors.timezone) {
                    setErrors(prev => ({ ...prev, timezone: null }));
                }
                break;
            case 'carCode':
                setFormData(prev => ({
                    ...prev,
                    carCode: value === '' ? null : Number(value)
                }));
                if (errors.carCode) {
                    setErrors(prev => ({ ...prev, carCode: null }));
                }
                break;
            default:
                break;
        }
    };

    const toggleInputMode = (field) => {
        setInputModes(prev => ({
            ...prev,
            [field]: prev[field] === 'input' ? 'select' : 'input'
        }));
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

    // Функция для форматирования координат для отображения
    const formatCoordinates = (coord) => `(${coord.x}, ${coord.y})`;

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
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Coordinates</h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleInputMode('coordinates')}
                                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        {inputModes.coordinates === 'input' ? 'Choose Existing' : 'Enter Manually'}
                                    </button>
                                </div>

                                {inputModes.coordinates === 'input' ? (
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
                                ) : (
                                    <div className="form-group">
                                        <label>Select Existing Coordinates</label>
                                        {isLoadingExistingData ? (
                                            <div className="text-gray-500">Loading coordinates...</div>
                                        ) : existingData.coordinates.length > 0 ? (
                                            <select
                                                value={`${formData.coordinates.x},${formData.coordinates.y}`}
                                                onChange={(e) => {
                                                    const [x, y] = e.target.value.split(',').map(Number);
                                                    handleSelectChange('coordinates', { x, y });
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            >
                                                <option value="">Select coordinates...</option>
                                                {existingData.coordinates.map((coord, index) => (
                                                    <option key={index} value={`${coord.x},${coord.y}`}>
                                                        {formatCoordinates(coord)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-gray-500">No existing coordinates found</div>
                                        )}
                                    </div>
                                )}
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
                            <div className="space-y-4">
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
                        </div>

                        {/* Governor */}
                        <div className={`city-form-modal-section ${activeTab === 'governor' ? 'active' : ''}`}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Governor</h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleInputMode('governor')}
                                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        {inputModes.governor === 'input' ? 'Choose Existing' : 'Enter Manually'}
                                    </button>
                                </div>

                                {inputModes.governor === 'input' ? (
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
                                ) : (
                                    <div className="form-group max-w-md">
                                        <label>Select Existing Governor</label>
                                        {isLoadingExistingData ? (
                                            <div className="text-gray-500">Loading governors...</div>
                                        ) : existingData.governors.length > 0 ? (
                                            <select
                                                value={formData.governor.name}
                                                onChange={(e) => handleSelectChange('governor', e.target.value)}
                                                className={getError('governorName') ? 'border-red-500' : ''}
                                            >
                                                <option value="">Select governor...</option>
                                                {existingData.governors.map((governor, index) => (
                                                    <option key={index} value={governor}>
                                                        {governor}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-gray-500">No existing governors found</div>
                                        )}
                                        {getError('governorName') && <span className="text-red-500">{getError('governorName')}</span>}
                                    </div>
                                )}
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
                            {city ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CityForm;