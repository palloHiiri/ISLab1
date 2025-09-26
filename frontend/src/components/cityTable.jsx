import React from "react";

const CityTable = ({cities, onEdit, onDelete}) => {
    if (!cities || cities.length === 0) {
        return( <div>No cities available.</div> );
    }

    return (
        <div className="city-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Coordinates</th>
                        <th>CreationDate</th>
                        <th>Area</th>
                        <th>Population</th>
                        <th>EstablishmentDate</th>
                        <th>Capital</th>
                        <th>MetersAboveSeaLevel</th>
                        <th>Timezone</th>
                        <th>CarCode</th>
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
                            <td>{`(${city.coordinates.x}, ${city.coordinates.y})`}</td>
                            <td>{new Date(city.creationDate).toLocaleDateString()}</td>
                            <td>{city.area}</td>
                            <td>{city.population}</td>
                            <td>{new Date(city.establishmentDate).toLocaleDateString()}</td>
                            <td>{city.capital ? 'Yes' : 'No'}</td>
                            <td>{city.metersAboveSeaLevel}</td>
                            <td>{city.timezone}</td>
                            <td>{city.carCode}</td>
                            <td>{city.government}</td>
                            <td>{city.governor ? city.governor.name : 'N/A'}</td>
                            <td>
                                <button onClick={() => onEdit(city)}>Edit</button>
                                <button onClick={() => onDelete(city.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityTable;