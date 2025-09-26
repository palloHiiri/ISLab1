import React from 'react';

const CityTable = ({ cities, onEdit, onDelete }) => {
    if (!cities || cities.length === 0) {
        return <div className="no-data">No cities found</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="city-table-container">
            <table className="city-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Coordinates</th>
                    <th>Creation Date</th>
                    <th>Area</th>
                    <th>Population</th>
                    <th>Establishment Date</th>
                    <th>Capital</th>
                    <th>Meters Above Sea Level</th>
                    <th>Timezone</th>
                    <th>Car Code</th>
                    <th>Government</th>
                    <th>Governor</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {cities.map((city) => (
                    <tr key={city.id}>
                        <td>{city.id}</td>
                        <td>{city.name}</td>
                        <td>({city.coordinates?.x}, {city.coordinates?.y})</td>
                        <td>{formatDate(city.creationDate)}</td>
                        <td>{city.area}</td>
                        <td>{city.population?.toLocaleString()}</td>
                        <td>{formatDate(city.establishmentDate)}</td>
                        <td>{city.capital ? 'Yes' : 'No'}</td>
                        <td>{city.metersAboveSeaLevel || 'N/A'}</td>
                        <td>{city.timezone}</td>
                        <td>{city.carCode || 'N/A'}</td>
                        <td>{city.government}</td>
                        <td>{city.governor?.name || 'N/A'}</td>
                        <td className="actions">
                            <button onClick={() => onEdit(city)} className="btn-edit">Edit</button>
                            <button onClick={() => onDelete(city.id)} className="btn-delete">Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityTable;