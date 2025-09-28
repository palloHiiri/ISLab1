import React, { useState } from 'react';
import { cityService } from '../services/cityService';
import { useNotification } from './ErrorNotification';
import './specialFunctions.css';

const SpecialFunctions = () => {
    const { showError, showSuccess, showWarning, showInfo, NotificationComponent } = useNotification();

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [timezoneInput, setTimezoneInput] = useState('');
    const [loadingFunctions, setLoadingFunctions] = useState({});

    const executeFunction = async (functionName, inputValue = null) => {
        try {
            setLoadingFunctions(prev => ({ ...prev, [functionName]: true }));

            let result;
            let successMessage = '';

            switch (functionName) {
                case 'sumTimezones':
                    result = await cityService.getSumOfTimezones();
                    successMessage = `Sum of timezones calculated: ${result}`;
                    setResults(prev => ({ ...prev, sumTimezones: result }));
                    break;

                case 'averageCarCode':
                    result = await cityService.getAverageCarCode();
                    successMessage = `Average car code calculated: ${result?.toFixed(2)}`;
                    setResults(prev => ({ ...prev, averageCarCode: result }));
                    break;

                case 'citiesWithTimezoneLess':
                    if (!inputValue || isNaN(inputValue)) {
                        showError('Please enter a valid timezone value');
                        return;
                    }

                    const timezoneValue = Number(inputValue);
                    if (timezoneValue < -13 || timezoneValue > 15) {
                        showError('Timezone must be between -13 and 15');
                        return;
                    }

                    result = await cityService.getCitiesWithTimezoneLessThan(timezoneValue);
                    successMessage = `Found ${result.length} cities with timezone greater than ${timezoneValue}`;
                    setResults(prev => ({ ...prev, citiesWithTimezoneLess: result }));
                    break;

                case 'distanceToMostPopulated':
                    result = await cityService.getDistanceToMostPopulated();
                    successMessage = `Distance to most populated city: ${result?.toFixed(2)} units`;
                    setResults(prev => ({ ...prev, distanceToMostPopulated: result }));
                    break;

                case 'distanceToNewest':
                    result = await cityService.getDistanceToNearest();
                    successMessage = `Distance to newest city: ${result?.toFixed(2)} units`;
                    setResults(prev => ({ ...prev, distanceToNewest: result }));
                    break;

                default:
                    showError('Unknown function requested');
                    return;
            }

            // showSuccess(successMessage);
            console.log(`${functionName} result:`, result);

        } catch (error) {
            console.error('Function execution error:', error);
            showError(error.message || `Failed to execute ${functionName}`);
        } finally {
            setLoadingFunctions(prev => ({ ...prev, [functionName]: false }));
        }
    };

    const goBackToCities = () => {
        window.location.href = '/';
    };

    const clearResults = () => {
        setResults({});
        setTimezoneInput('');
        // showInfo('All results cleared');
    };

    const handleTimezoneInputChange = (e) => {
        const value = e.target.value;
        setTimezoneInput(value);

        // Clear previous results when input changes
        if (results.citiesWithTimezoneLess) {
            setResults(prev => ({ ...prev, citiesWithTimezoneLess: undefined }));
        }
    };

    const FunctionCard = ({ title, description, onExecute, isLoading, result, children }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="function-header mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>

            <div className="function-actions mb-4">
                {children}
                <button
                    onClick={onExecute}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isLoading
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Execute'
                    )}
                </button>
            </div>

            {result !== undefined && (
                <div className="result p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    {typeof result === 'number' ? (
                        <p className="text-green-800">
                            <strong>Result:</strong> {result.toFixed(2)}
                        </p>
                    ) : Array.isArray(result) ? (
                        <div className="text-green-800">
                            <p className="font-semibold mb-2">Found {result.length} cities:</p>
                            {result.length > 0 ? (
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {result.map((city, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                            <span className="font-medium">{city.name}</span>
                                            <span className="text-gray-600">Timezone: {city.timezone}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No cities match the criteria</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-green-800">
                            <strong>Result:</strong> {result}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            <NotificationComponent />

            <div className="special-functions p-6 max-w-7xl mx-auto">
                <div className="header mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Special City Functions</h1>
                    <div className="header-controls flex gap-3">
                        <button
                            onClick={goBackToCities}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            ← Back to Cities
                        </button>
                        <button
                            onClick={clearResults}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Clear Results
                        </button>
                    </div>
                </div>

                <div className="functions-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <FunctionCard
                        title="🌍 Sum of Timezones"
                        description="Calculate the sum of all city timezones"
                        onExecute={() => executeFunction('sumTimezones')}
                        isLoading={loadingFunctions.sumTimezones}
                        result={results.sumTimezones}
                    />

                    <FunctionCard
                        title="🚗 Average Car Code"
                        description="Calculate the average car code across all cities"
                        onExecute={() => executeFunction('averageCarCode')}
                        isLoading={loadingFunctions.averageCarCode}
                        result={results.averageCarCode}
                    />

                    <FunctionCard
                        title="⏰ Cities by Timezone"
                        description="Find cities with timezone greater than specified value"
                        onExecute={() => executeFunction('citiesWithTimezoneLess', timezoneInput)}
                        isLoading={loadingFunctions.citiesWithTimezoneLess}
                        result={results.citiesWithTimezoneLess}
                    >
                        <div className="mb-3">
                            <input
                                type="number"
                                placeholder="Enter timezone value (-13 to 15)"
                                value={timezoneInput}
                                onChange={handleTimezoneInputChange}
                                min="-13"
                                max="15"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {timezoneInput && (isNaN(timezoneInput) || timezoneInput < -13 || timezoneInput > 15) && (
                                <p className="text-red-500 text-xs mt-1">Please enter a valid timezone between -13 and 15</p>
                            )}
                        </div>
                    </FunctionCard>

                    <FunctionCard
                        title="📏 Distance to Most Populated"
                        description="Calculate distance from origin to the most populated city"
                        onExecute={() => executeFunction('distanceToMostPopulated')}
                        isLoading={loadingFunctions.distanceToMostPopulated}
                        result={results.distanceToMostPopulated}
                    />

                    <FunctionCard
                        title="🆕 Distance to Newest City"
                        description="Calculate distance from origin to the newest city"
                        onExecute={() => executeFunction('distanceToNewest')}
                        isLoading={loadingFunctions.distanceToNewest}
                        result={results.distanceToNewest}
                    />

                    {/* Summary Card */}
                    {Object.keys(results).length > 0 && (
                        <div className="col-span-full">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Results Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {results.sumTimezones !== undefined && (
                                        <div className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-700">Sum of Timezones</div>
                                            <div className="text-2xl font-bold text-blue-600">{results.sumTimezones}</div>
                                        </div>
                                    )}
                                    {results.averageCarCode !== undefined && (
                                        <div className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-700">Average Car Code</div>
                                            <div className="text-2xl font-bold text-blue-600">{results.averageCarCode?.toFixed(2)}</div>
                                        </div>
                                    )}
                                    {results.citiesWithTimezoneLess !== undefined && (
                                        <div className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-700">Cities Found</div>
                                            <div className="text-2xl font-bold text-blue-600">{results.citiesWithTimezoneLess.length}</div>
                                        </div>
                                    )}
                                    {results.distanceToMostPopulated !== undefined && (
                                        <div className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-700">Distance to Most Populated</div>
                                            <div className="text-2xl font-bold text-blue-600">{results.distanceToMostPopulated?.toFixed(2)} units</div>
                                        </div>
                                    )}
                                    {results.distanceToNewest !== undefined && (
                                        <div className="bg-white p-3 rounded border">
                                            <div className="font-medium text-gray-700">Distance to Newest</div>
                                            <div className="text-2xl font-bold text-blue-600">{results.distanceToNewest?.toFixed(2)} units</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Loading Overlay */}
                {Object.values(loadingFunctions).some(loading => loading) && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-gray-700 font-medium">Processing request...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SpecialFunctions;