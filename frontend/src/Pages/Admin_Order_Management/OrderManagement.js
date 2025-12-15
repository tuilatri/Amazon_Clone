import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './OrderManagement.css';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// OrderManagement - Admin tab for managing orders
// Fetches orders from database and displays in a table matching Product Management layout
const OrderManagement = () => {
    // Orders data state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(0); // 0 = All statuses

    // Sorting state
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination state
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Status options for filter (numeric values for API)
    const statusOptions = [
        { value: 0, label: 'All' },
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Processing' },
        { value: 3, label: 'Shipped' },
        { value: 4, label: 'Delivered' },
        { value: 5, label: 'Cancelled' },
        { value: 6, label: 'Returned' }
    ];

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/admin/orders', {
                params: {
                    page,
                    per_page: perPage,
                    search: searchQuery,
                    status: statusFilter,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });
            let fetchedOrders = response.data.orders;

            // Client-side sorting for quantity (since it's computed)
            if (sortBy === 'quantity') {
                fetchedOrders = [...fetchedOrders].sort((a, b) => {
                    if (sortOrder === 'asc') {
                        return a.quantity - b.quantity;
                    } else {
                        return b.quantity - a.quantity;
                    }
                });
            }

            setOrders(fetchedOrders);
            setTotal(response.data.total);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchQuery, statusFilter, sortBy, sortOrder]);

    // Fetch orders on mount and when dependencies change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page !== 1) {
                setPage(1);
            } else {
                fetchOrders();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle sort (matching Product Management pattern)
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Get status badge class
    const getStatusClass = (status) => {
        const statusLower = status.toLowerCase();
        return `order-status order-status--${statusLower}`;
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter(0);
        setSortBy('');
        setSortOrder('desc');
        setPage(1);
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(parseInt(e.target.value));
        setPage(1);
    };

    // Handle per page change
    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    // Handle export (placeholder)
    const handleExport = () => {
        console.log('Export orders clicked - will be implemented with API');
    };

    // Calculate pagination info
    const startIndex = total > 0 ? (page - 1) * perPage + 1 : 0;
    const endIndex = Math.min(page * perPage, total);

    return (
        <div className="admin-page__ordermanagement">
            {/* Table Structure */}
            <div className="order-table">
                {/* Table Header */}
                <div className="order-table__header">
                    {/* Order ID Column */}
                    <div className="order-table__cell order-table__cell--id">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Order ID</span>
                        </div>
                        <div className="order-table__filter">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="order-table__search"
                            />
                        </div>
                    </div>

                    {/* Customer Column */}
                    <div className="order-table__cell order-table__cell--customer">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Customer</span>
                        </div>
                    </div>

                    {/* Phone Number Column */}
                    <div className="order-table__cell order-table__cell--phone">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Phone</span>
                        </div>
                    </div>

                    {/* Quantity Column - SORTABLE */}
                    <div className="order-table__cell order-table__cell--quantity">
                        <div className="sortable-header" onClick={() => handleSort('quantity')}>
                            <span className="order-table__header-label">Qty</span>
                            {sortBy === 'quantity' && (
                                <span className="sort-icon">
                                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Amount Column - SORTABLE */}
                    <div className="order-table__cell order-table__cell--amount">
                        <div className="sortable-header" onClick={() => handleSort('order_total')}>
                            <span className="order-table__header-label">Amount</span>
                            {sortBy === 'order_total' && (
                                <span className="sort-icon">
                                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Column */}
                    <div className="order-table__cell order-table__cell--payment">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Payment</span>
                        </div>
                    </div>

                    {/* Shipping Method Column */}
                    <div className="order-table__cell order-table__cell--shipping">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Shipping</span>
                        </div>
                    </div>

                    {/* Status Column */}
                    <div className="order-table__cell order-table__cell--status">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Status</span>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            className="order-table__select"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions Column */}
                    <div className="order-table__cell order-table__cell--actions">
                        <button className="reset-filters-btn" onClick={handleResetFilters} title="Reset Filters">
                            <RestartAltIcon />
                        </button>
                    </div>
                </div>

                {/* Table Body */}
                <div className="order-table__body">
                    {loading ? (
                        <div className="order-table__loading">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="order-table__empty">No orders found.</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.order_id} className="order-table__row">
                                {/* Order ID */}
                                <div className="order-table__cell order-table__cell--id">
                                    <span className="order-id">#{order.order_id}</span>
                                </div>

                                {/* Customer */}
                                <div className="order-table__cell order-table__cell--customer">
                                    <span className="customer-name">{order.user_name}</span>
                                </div>

                                {/* Phone Number */}
                                <div className="order-table__cell order-table__cell--phone">
                                    <span className="phone-number">{order.phone_number || '-'}</span>
                                </div>

                                {/* Quantity */}
                                <div className="order-table__cell order-table__cell--quantity">
                                    <span className="quantity">{order.quantity}</span>
                                </div>

                                {/* Amount */}
                                <div className="order-table__cell order-table__cell--amount">
                                    <span className="amount">${order.order_total.toFixed(2)}</span>
                                </div>

                                {/* Payment Method */}
                                <div className="order-table__cell order-table__cell--payment">
                                    <span className="payment-method">{order.payment_method}</span>
                                </div>

                                {/* Shipping Method */}
                                <div className="order-table__cell order-table__cell--shipping">
                                    <span className="shipping-method">{order.shipping_method}</span>
                                </div>

                                {/* Status */}
                                <div className="order-table__cell order-table__cell--status">
                                    <span className={getStatusClass(order.status)}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Actions (placeholder) */}
                                <div className="order-table__cell order-table__cell--actions">
                                    {/* Future: action menu */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination - Matching Product Management */}
            <div className="user-pagination">
                <div className="user-pagination__info">
                    <div className="user-pagination__per-page">
                        <span>Show</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="user-pagination__select"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>per page</span>
                    </div>
                    <div className="user-pagination__range">
                        Showing {startIndex} - {endIndex} of {total}
                    </div>
                </div>
                <div className="user-pagination__controls">
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                    >
                        <FirstPageIcon />
                    </button>
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeftIcon />
                    </button>

                    {/* Page numbers */}
                    {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }
                        return (
                            <button
                                key={pageNum}
                                className={`user-pagination__page ${page === pageNum ? 'user-pagination__page--active' : ''}`}
                                onClick={() => setPage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(totalPages)}
                    >
                        <LastPageIcon />
                    </button>
                </div>
            </div>

            {/* Export Section */}
            <div className="export-section">
                <button className="export-btn" onClick={handleExport}>
                    <FileDownloadIcon />
                    Export Orders
                </button>
            </div>
        </div>
    );
};

export default OrderManagement;
