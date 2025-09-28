import React, { useState, useEffect } from 'react';
import { cityService } from '../services/cityService';
import { useNotification } from './ErrorNotification';
import './CityForm.css';

const CityForm = ({ city, onSave, onCancel }) => {
    const { showError, showSuccess, showWarning, NotificationComponent } = useNotification();

    const [formData, setFormData] = useState(   {
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

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
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
            const errorMessages = Object.values(newErrors).join(', ');
            showError(`Please fix the following errors: ${errorMessages}`);
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
            showError(error.message || 'An unexpected error occurred while saving the city');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isLoading) {
            showWarning('Please wait for the current operation to complete');
            return;
        }
        onCancel();
    };

    return (
        <>
            <NotificationComponent />

            <div className="city-form bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {city ? 'Edit City' : 'Add New City'}
                </h2>

                <div className="space-y-6">
                    <div className="form-section">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Area *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.area ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.area && <span className="text-red-500 text-xs mt-1">{errors.area}</span>}
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Population *
                                </label>
                                <input
                                    type="number"
                                    name="population"
                                    value={formData.population}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.population ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.population && <span className="text-red-500 text-xs mt-1">{errors.population}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Coordinates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    X (≤913) *
                                </label>
                                <input
                                    type="number"
                                    name="coordinates.x"
                                    value={formData.coordinates.x}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.coordX ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.coordX && <span className="text-red-500 text-xs mt-1">{errors.coordX}</span>}
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Y (>-243) *
                                </label>
                                <input
                                    type="number"
                                    name="coordinates.y"
                                    value={formData.coordinates.y}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.coordY ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.coordY && <span className="text-red-500 text-xs mt-1">{errors.coordY}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Government</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Government Type *
                                </label>
                                <select
                                    name="government"
                                    value={formData.government}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ARISTOCRACY">Aristocracy</option>
                                    <option value="MATRIARCHY">Matriarchy</option>
                                    <option value="NOOCRACY">Noocracy</option>
                                    <option value="PATRIARCHY">Patriarchy</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="capital"
                                        checked={formData.capital}
                                        onChange={handleChange}
                                        className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Capital City</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Establishment Date
                                </label>
                                <input
                                    type="date"
                                    name="establishmentDate"
                                    value={formData.establishmentDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meters Above Sea Level
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="metersAboveSeaLevel"
                                    value={formData.metersAboveSeaLevel || ''}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Timezone (-13 to 15) *
                                </label>
                                <input
                                    type="number"
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    min="-13"
                                    max="15"
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.timezone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.timezone && <span className="text-red-500 text-xs mt-1">{errors.timezone}</span>}
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Car Code (1-1000)
                                </label>
                                <input
                                    type="number"
                                    name="carCode"
                                    value={formData.carCode || ''}
                                    onChange={handleChange}
                                    min="1"
                                    max="1000"
                                    placeholder="Optional"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.carCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.carCode && <span className="text-red-500 text-xs mt-1">{errors.carCode}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Governor</h3>
                        <div className="form-group max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Governor Name *
                            </label>
                            <input
                                type="text"
                                name="governor.name"
                                value={formData.governor.name}
                                onChange={handleChange}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.governorName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.governorName && <span className="text-red-500 text-xs mt-1">{errors.governorName}</span>}
                        </div>
                    </div>

                    <div className="form-actions flex space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`flex-1 px-6 py-3 rounded-md font-medium text-white transition-colors duration-200 ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {city ? 'Updating...' : 'Creating...'}
                                </span>
                            ) : (
                                `${city ? 'Update' : 'Create'} City`
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                                isLoading
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500'
                            }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CityForm;