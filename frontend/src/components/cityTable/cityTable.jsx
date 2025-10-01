import React from 'react';

const TableHeader = ({ field, label, filterType = 'text', options = [], filters, sortBy, sortDirection, onSortChange, onFilterChange, onClearFilter }) => {

    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <th className="">
            <div className="column-header">
                <div className="">
                    <span className="">{label}</span>
                    <button
                        onClick={() => onSortChange(field)}
                        className="sort-btn"
                        title={`Sort by ${label}`}
                    >
                        {getSortIcon(field)}
                    </button>
                </div>
                <div className="column-filter">
                    {filterType === 'select' ? (
                        <select
                            value={filters[field] || ''}
                            onChange={(e) => onFilterChange(field, e.target.value)}
                            className=""
                        >
                            <option value="">All</option>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={filterType}
                            placeholder={`Filter ${label.toLowerCase()}...`}
                            value={filters[field] || ''}
                            onChange={(e) => onFilterChange(field, e.target.value)}
                            className=""
                        />
                    )}
                    {filters[field] && (
                        <button
                            onClick={() => onClearFilter(field)}
                            className=""
                            title="Clear filter"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </th>
    );
};

const CityTable = ({
                       cities,
                       filters,
                       sortBy,
                       sortDirection,
                       onEdit,
                       onDelete,
                       onSortChange,
                       onFilterChange,
                       onClearFilter
                   }) => {

    return (
        <div className="table-container">
            <table className="">
                <thead className="">
                <tr>
                    <TableHeader
                        field="id"
                        label="ID"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="name"
                        label="Name"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="coordinatesX"
                        label="Coord X"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="coordinatesY"
                        label="Coord Y"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="creationDate"
                        label="Creation Date"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="area"
                        label="Area"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="population"
                        label="Population"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="establishmentDate"
                        label="Est. Date"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="capital"
                        label="Capital"
                        filterType="select"
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' }
                        ]}
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="metersAboveSeaLevel"
                        label="Meters Above SL"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="timezone"
                        label="Timezone"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="carCode"
                        label="Car Code"
                        filterType="number"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="government"
                        label="Government"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <TableHeader
                        field="governor"
                        label="Governor"
                        filters={filters}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                        onFilterChange={onFilterChange}
                        onClearFilter={onClearFilter}
                    />
                    <th className="">Actions</th>
                </tr>
                </thead>
                <tbody className="">
                {cities.map(city => (
                    <tr key={city.id} className="">
                        <td className="">{city.id}</td>
                        <td className="">{city.name}</td>
                        <td className="">{city.coordinates?.x}</td>
                        <td className="">{city.coordinates?.y}</td>
                        <td className="">
                            {city.creationDate ? new Date(city.creationDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="">{city.area}</td>
                        <td className="">{city.population?.toLocaleString()}</td>
                        <td className="">
                            {city.establishmentDate ? new Date(city.establishmentDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="">
                            <span className="">
                                {city.capital ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="">{city.metersAboveSeaLevel || 'N/A'}</td>
                        <td className="">{city.timezone}</td>
                        <td className="">{city.carCode || 'N/A'}</td>
                        <td className="">{city.government}</td>
                        <td className="">{city.governor?.name || 'N/A'}</td>
                        <td className="">
                            <div className="">
                                <button
                                    onClick={() => onEdit(city)}
                                    className=""
                                    title="Edit city"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(city.id)}
                                    className=""
                                    title="Delete city"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityTable;