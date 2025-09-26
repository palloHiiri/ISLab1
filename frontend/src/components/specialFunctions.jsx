import React, { useState } from 'react';
import { cityService } from '../services/cityService';
import './specialFunctions.css';

const SpecialFunctions = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [timezoneInput, setTimezoneInput] = useState('');
    const [error, setError] = useState('');

    const executeFunction = async (functionName, inputValue = null) => {
        try {
            setLoading(true);
            setError('');
            let result;

            switch (functionName) {
                case 'sumTimezones':
                    result = await cityService.getSumOfTimezones();
                    setResults(prev => ({ ...prev, sumTimezones: result }));
                    break;

                case 'averageCarCode':
                    result = await cityService.getAverageCarCode();
                    setResults(prev => ({ ...prev, averageCarCode: result }));
                    break;

                case 'citiesWithTimezoneLess':
                    if (!inputValue || isNaN(inputValue)) {
                        setError('Please enter a valid timezone value');
                        return;
                    }
                    result = await cityService.getCitiesWithTimezoneLessThan(inputValue);
                    setResults(prev => ({ ...prev, citiesWithTimezoneLess: result }));
                    break;

                case 'distanceToMostPopulated':
                    result = await cityService.getDistanceToMostPopulated();
                    setResults(prev => ({ ...prev, distanceToMostPopulated: result }));
                    break;

                case 'distanceToNewest':
                    result = await cityService.getDistanceToNearest();
                    setResults(prev => ({ ...prev, distanceToNewest: result }));
                    break;

                default:
                    setError('Unknown function');
                    return;
            }

            console.log(`${functionName} result:`, result);

        } catch (error) {
            console.error('Function execution error:', error);
            setError(`Error executing ${functionName}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const goBackToCities = () => {
        window.location.href = '/';
    };

    const clearResults = () => {
        setResults({});
        setError('');
    };

    return (
        <div className="special-functions">
            <div className="header">
                <h1>📊 Special City Functions</h1>
                <div className="header-controls">
                    <button onClick={goBackToCities} className="btn-secondary">
                        ← Back to Cities
                    </button>
                    <button onClick={clearResults} className="btn-secondary">
                        Clear Results
                    </button>
                </div>
            </div>

            {error && <div className="error-message">Error: {error}</div>}

            <div className="functions-grid">
                <div className="function-card">
                    <div className="function-header">
                        <h3>🌍 Sum of Timezones</h3>
                        <p>Calculate the sum of all city timezones</p>
                    </div>
                    <div className="function-actions">
                        <button
                            onClick={() => executeFunction('sumTimezones')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Calculating...' : 'Calculate Sum'}
                        </button>
                    </div>
                    {results.sumTimezones !== undefined && (
                        <div className="result">
                            <strong>Result:</strong> {results.sumTimezones}
                        </div>
                    )}
                </div>

                {/* Функция 2: Средний код автомобиля */}
                <div className="function-card">
                    <div className="function-header">
                        <h3>🚗 Average Car Code</h3>
                        <p>Calculate the average car code across all cities</p>
                    </div>
                    <div className="function-actions">
                        <button
                            onClick={() => executeFunction('averageCarCode')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Calculating...' : 'Calculate Average'}
                        </button>
                    </div>
                    {results.averageCarCode !== undefined && (
                        <div className="result">
                            <strong>Result:</strong> {results.averageCarCode?.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Функция 3: Города с таймзоной меньше заданной */}
                <div className="function-card">
                    <div className="function-header">
                        <h3>⏰ Cities by Timezone</h3>
                        <p>Find cities with timezone greater than specified value</p>
                    </div>
                    <div className="function-actions">
                        <input
                            type="number"
                            placeholder="Enter timezone value"
                            value={timezoneInput}
                            onChange={(e) => setTimezoneInput(e.target.value)}
                            className="timezone-input"
                        />
                        <button
                            onClick={() => executeFunction('citiesWithTimezoneLess', timezoneInput)}
                            disabled={loading || !timezoneInput}
                            className="btn-primary"
                        >
                            {loading ? 'Searching...' : 'Find Cities'}
                        </button>
                    </div>
                    {results.citiesWithTimezoneLess && (
                        <div className="result">
                            <strong>Found {results.citiesWithTimezoneLess.length} cities:</strong>
                            <div className="cities-list">
                                {results.citiesWithTimezoneLess.map((city, index) => (
                                    <div key={index} className="city-item">
                                        <span className="city-name">{city.name}</span>
                                        <span className="city-timezone">Timezone: {city.timezone}</span>
                                    </div>
                                ))}
                                {results.citiesWithTimezoneLess.length === 0 && (
                                    <p>No cities found with timezone greater than {timezoneInput}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Функция 4: Расстояние до самого населенного города */}
                <div className="function-card">
                    <div className="function-header">
                        <h3>🏙️ Distance to Most Populated</h3>
                        <p>Calculate distance from origin to the most populated city</p>
                    </div>
                    <div className="function-actions">
                        <button
                            onClick={() => executeFunction('distanceToMostPopulated')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Calculating...' : 'Calculate Distance'}
                        </button>
                    </div>
                    {results.distanceToMostPopulated !== undefined && (
                        <div className="result">
                            <strong>Distance:</strong> {results.distanceToMostPopulated?.toFixed(2)} units
                        </div>
                    )}
                </div>

                {/* Функция 5: Расстояние до самого нового города */}
                <div className="function-card">
                    <div className="function-header">
                        <h3>🆕 Distance to Newest City</h3>
                        <p>Calculate distance from origin to the newest city</p>
                    </div>
                    <div className="function-actions">
                        <button
                            onClick={() => executeFunction('distanceToNewest')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Calculating...' : 'Calculate Distance'}
                        </button>
                    </div>
                    {results.distanceToNewest !== undefined && (
                        <div className="result">
                            <strong>Distance:</strong> {results.distanceToNewest?.toFixed(2)} units
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Processing request...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialFunctions;
