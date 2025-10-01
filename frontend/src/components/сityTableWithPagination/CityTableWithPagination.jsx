import CityTable from "../cityTable/cityTable.jsx";
import React from 'react';
import './cityTableWithPagination.css';

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
    const getVisiblePages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const pages = [];
        const start = Math.max(0, currentPage - 3);
        const end = Math.min(totalPages - 1, currentPage + 3);

        if (start > 0) {
            pages.push(0);
            if (start > 1) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) {
            if (end < totalPages - 2) pages.push('...');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div className="city-table-container">
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
                <div className="pagination-wrapper">
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span className="pagination-text">
                                Page <span className="current-page">{currentPage + 1}</span> of <span className="total-pages">{totalPages}</span>
                            </span>
                        </div>

                        <div className="pagination-controls">
                            <button
                                onClick={() => onPageChange(0)}
                                disabled={currentPage === 0}
                                className="pagination-btn first-page-btn"
                                title="First page"
                            >
                                <span className="btn-icon">⏮️</span>
                                First
                            </button>

                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="pagination-btn prev-btn"
                                title="Previous page"
                            >
                                <span className="btn-icon">⬅️</span>
                                Previous
                            </button>

                            <div className="page-numbers">
                                {getVisiblePages().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => onPageChange(page)}
                                            className={`page-number-btn ${currentPage === page ? 'active' : ''}`}
                                        >
                                            {page + 1}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="pagination-btn next-btn"
                                title="Next page"
                            >
                                Next
                                <span className="btn-icon">➡️</span>
                            </button>

                            <button
                                onClick={() => onPageChange(totalPages - 1)}
                                disabled={currentPage === totalPages - 1}
                                className="pagination-btn last-page-btn"
                                title="Last page"
                            >
                                Last
                                <span className="btn-icon">⏭️</span>
                            </button>
                        </div>

                        <div className="pagination-quick-jump">
                            <span className="jump-label">Go to:</span>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                placeholder="Page"
                                className="page-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        const page = parseInt(e.target.value) - 1;
                                        if (page >= 0 && page < totalPages) {
                                            onPageChange(page);
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityTableWithPagination;