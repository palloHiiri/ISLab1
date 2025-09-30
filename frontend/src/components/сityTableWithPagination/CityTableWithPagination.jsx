import CityTable from "../cityTable/cityTable.jsx";
import React from 'react';

const CityTableWithPagination = ({
                                     cities,
                                     totalPages,
                                     currentPage,
                                     onSortChange,
                                     onFilterChange,
                                     onClearFilter,
                                     filters,
                                     sortBy,
                                     sortDirection,
                                     onEdit,
                                     onDelete,
                                     onPageChange
                                 }) => {
    return (
        <>
            <CityTable
                cities={cities}
                filters={filters}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onEdit={onEdit}
                onDelete={onDelete}
                onSortChange={onSortChange}
                onFilterChange={onFilterChange}
                onClearFilter={onClearFilter}
            />

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        >
                        Previous
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i;
                        } else {
                            const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                            pageNum = start + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className=""
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
};

export default CityTableWithPagination;