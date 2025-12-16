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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

// OrderManagement - Admin tab for managing orders
// Fetches orders from database and displays in a table matching Product Management layout
const OrderManagement = () => {
    // Orders data state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(0); // 0 = All statuses
    const [paymentFilter, setPaymentFilter] = useState(''); // '' = All payments
    const [shippingFilter, setShippingFilter] = useState(''); // '' = All shipping

    // Date range filter state
    const [orderDateFrom, setOrderDateFrom] = useState('');
    const [orderDateTo, setOrderDateTo] = useState('');
    const [completeDateFrom, setCompleteDateFrom] = useState('');
    const [completeDateTo, setCompleteDateTo] = useState('');

    // Sorting state
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination state
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Action menu state
    const [activeMenu, setActiveMenu] = useState(null);

    // Order detail modal state
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [orderDetailLoading, setOrderDetailLoading] = useState(false);

    // Bulk selection state
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
    const [pendingBulkStatus, setPendingBulkStatus] = useState(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Payment and shipping method mappings for modal display
    const paymentMethods = {
        1: 'Cash On Delivery',
        2: 'Credit Card'
    };
    const shippingMethods = {
        1: 'Standard Shipping',
        2: 'Express Shipping',
        3: 'Same Day Delivery',
        4: 'International Shipping'
    };

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

    // Payment method options for filter
    const paymentOptions = [
        { value: '', label: 'All' },
        { value: 'Cash On Delivery', label: 'Cash On Delivery' },
        { value: 'Credit Card', label: 'Credit Card' }
    ];

    // Shipping method options for filter
    const shippingOptions = [
        { value: '', label: 'All' },
        { value: 'Standard', label: 'Standard' },
        { value: 'Express', label: 'Express' },
        { value: 'Same Day', label: 'Same Day' },
        { value: 'International', label: 'International' }
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

            // Client-side sorting for created_at
            if (sortBy === 'created_at') {
                fetchedOrders = [...fetchedOrders].sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            }

            // Client-side sorting for completed_at
            if (sortBy === 'completed_at') {
                fetchedOrders = [...fetchedOrders].sort((a, b) => {
                    const dateA = a.completed_at ? new Date(a.completed_at) : new Date(0);
                    const dateB = b.completed_at ? new Date(b.completed_at) : new Date(0);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
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

    // Fetch order detail
    const fetchOrderDetail = async (orderId) => {
        try {
            setOrderDetailLoading(true);
            const response = await axios.get(`http://localhost:8000/order/${orderId}`);
            setSelectedOrderDetail(response.data);
            setShowOrderDetail(true);
        } catch (error) {
            console.error('Error fetching order detail:', error);
            alert('Failed to fetch order details');
        } finally {
            setOrderDetailLoading(false);
        }
    };

    // Close order detail modal
    const closeOrderDetail = () => {
        setShowOrderDetail(false);
        setSelectedOrderDetail(null);
    };

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
        setPaymentFilter('');
        setShippingFilter('');
        setOrderDateFrom('');
        setOrderDateTo('');
        setCompleteDateFrom('');
        setCompleteDateTo('');
        setSortBy('');
        setSortOrder('desc');
        setPage(1);
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(parseInt(e.target.value));
        setPage(1);
    };

    // Handle payment filter change
    const handlePaymentFilterChange = (e) => {
        setPaymentFilter(e.target.value);
    };

    // Handle shipping filter change
    const handleShippingFilterChange = (e) => {
        setShippingFilter(e.target.value);
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

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders(new Set());
        } else {
            const allOrderIds = new Set(filteredOrders.map(o => o.order_id));
            setSelectedOrders(allOrderIds);
        }
        setSelectAll(!selectAll);
    };

    // Handle individual order selection
    const handleSelectOrder = (orderId) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
        setSelectAll(newSelected.size === filteredOrders.length && filteredOrders.length > 0);
    };

    // Show bulk action confirmation modal
    const showBulkConfirmation = (statusId) => {
        if (selectedOrders.size === 0) return;
        setPendingBulkStatus(statusId);
        setShowBulkConfirmModal(true);
    };

    // Get status label from ID
    const getStatusLabel = (statusId) => {
        const status = statusOptions.find(s => s.value === statusId);
        return status ? status.label : 'Unknown';
    };

    // Confirm and execute bulk status update
    const confirmBulkAction = async () => {
        if (selectedOrders.size === 0 || !pendingBulkStatus) {
            setShowBulkConfirmModal(false);
            return;
        }

        setBulkLoading(true);
        try {
            const response = await axios.put('http://localhost:8000/admin/orders/bulk-status', {
                order_ids: Array.from(selectedOrders),
                status_id: pendingBulkStatus
            });

            setShowBulkConfirmModal(false);
            setPendingBulkStatus(null);
            setSelectedOrders(new Set());
            setSelectAll(false);
            fetchOrders();
            alert(response.data.message);
        } catch (error) {
            console.error('Error bulk updating order status:', error);
            alert('Failed to update orders: ' + (error.response?.data?.detail || error.message));
        } finally {
            setBulkLoading(false);
        }
    };

    // Cancel bulk action
    const cancelBulkAction = () => {
        setShowBulkConfirmModal(false);
        setPendingBulkStatus(null);
    };

    // Clear bulk selection
    const clearBulkSelection = () => {
        setSelectedOrders(new Set());
        setSelectAll(false);
    };

    const toggleMenu = (orderId) => {
        setActiveMenu(activeMenu === orderId ? null : orderId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeMenu]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format datetime for display
    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Client-side filtering for payment, shipping, and date ranges
    const filteredOrders = orders.filter(order => {
        if (paymentFilter && order.payment_method !== paymentFilter) return false;
        if (shippingFilter && order.shipping_method !== shippingFilter) return false;

        // Order Date range filter
        if (orderDateFrom) {
            const orderDate = order.created_at ? new Date(order.created_at) : null;
            const fromDate = new Date(orderDateFrom);
            if (!orderDate || orderDate < fromDate) return false;
        }
        if (orderDateTo) {
            const orderDate = order.created_at ? new Date(order.created_at) : null;
            const toDate = new Date(orderDateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            if (!orderDate || orderDate > toDate) return false;
        }

        // Complete Date range filter
        if (completeDateFrom) {
            const completeDate = order.completed_at ? new Date(order.completed_at) : null;
            const fromDate = new Date(completeDateFrom);
            if (!completeDate || completeDate < fromDate) return false;
        }
        if (completeDateTo) {
            const completeDate = order.completed_at ? new Date(order.completed_at) : null;
            const toDate = new Date(completeDateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            if (!completeDate || completeDate > toDate) return false;
        }

        return true;
    });

    // Calculate pagination info
    const startIndex = total > 0 ? (page - 1) * perPage + 1 : 0;
    const endIndex = Math.min(page * perPage, total);

    return (
        <div className="admin-page__ordermanagement">
            {/* Bulk Action Toolbar - shown when orders selected */}
            {selectedOrders.size > 0 && (
                <div className="bulk-action-toolbar">
                    <span className="bulk-action-toolbar__count">
                        {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="bulk-action-toolbar__actions">
                        <button
                            className="bulk-action-btn bulk-action-btn--pending"
                            onClick={() => showBulkConfirmation(1)}
                        >
                            Set Pending
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--processing"
                            onClick={() => showBulkConfirmation(2)}
                        >
                            Set Processing
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--shipped"
                            onClick={() => showBulkConfirmation(3)}
                        >
                            Set Shipped
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--delivered"
                            onClick={() => showBulkConfirmation(4)}
                        >
                            Set Delivered
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--cancelled"
                            onClick={() => showBulkConfirmation(5)}
                        >
                            Set Cancelled
                        </button>
                    </div>
                    <button
                        className="bulk-action-toolbar__deselect"
                        onClick={clearBulkSelection}
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Table Structure */}
            <div className="order-table">
                {/* Table Header */}
                <div className="order-table__header">
                    {/* Checkbox Column */}
                    <div className="order-table__cell order-table__cell--checkbox">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            title="Select all orders on this page"
                        />
                    </div>

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
                        <select
                            value={paymentFilter}
                            onChange={handlePaymentFilterChange}
                            className="order-table__select"
                        >
                            {paymentOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Shipping Method Column */}
                    <div className="order-table__cell order-table__cell--shipping">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Shipping</span>
                        </div>
                        <select
                            value={shippingFilter}
                            onChange={handleShippingFilterChange}
                            className="order-table__select"
                        >
                            {shippingOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
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

                    {/* Order Date Column - SORTABLE with Date Range */}
                    <div className="order-table__cell order-table__cell--orderdate">
                        <div className="sortable-header" onClick={() => handleSort('created_at')}>
                            <span className="order-table__header-label">Order Date</span>
                            {sortBy === 'created_at' && (
                                <span className="sort-icon">
                                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </span>
                            )}
                        </div>
                        <div className="order-table__filter order-table__filter--daterange">
                            <input
                                type="date"
                                value={orderDateFrom}
                                onChange={(e) => setOrderDateFrom(e.target.value)}
                                className="order-table__search order-table__search--date"
                                title="From date"
                            />
                            <span className="date-separator">-</span>
                            <input
                                type="date"
                                value={orderDateTo}
                                onChange={(e) => setOrderDateTo(e.target.value)}
                                className="order-table__search order-table__search--date"
                                title="To date"
                            />
                        </div>
                    </div>

                    {/* Complete Date Column - SORTABLE with Date Range */}
                    <div className="order-table__cell order-table__cell--completedate">
                        <div className="sortable-header" onClick={() => handleSort('completed_at')}>
                            <span className="order-table__header-label">Complete Date</span>
                            {sortBy === 'completed_at' && (
                                <span className="sort-icon">
                                    {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </span>
                            )}
                        </div>
                        <div className="order-table__filter order-table__filter--daterange">
                            <input
                                type="date"
                                value={completeDateFrom}
                                onChange={(e) => setCompleteDateFrom(e.target.value)}
                                className="order-table__search order-table__search--date"
                                title="From date"
                            />
                            <span className="date-separator">-</span>
                            <input
                                type="date"
                                value={completeDateTo}
                                onChange={(e) => setCompleteDateTo(e.target.value)}
                                className="order-table__search order-table__search--date"
                                title="To date"
                            />
                        </div>
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
                    ) : filteredOrders.length === 0 ? (
                        <div className="order-table__empty">No orders found.</div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.order_id}
                                className={`order-table__row ${selectedOrders.has(order.order_id) ? 'order-table__row--selected' : ''}`}
                            >
                                {/* Checkbox */}
                                <div className="order-table__cell order-table__cell--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.has(order.order_id)}
                                        onChange={() => handleSelectOrder(order.order_id)}
                                    />
                                </div>

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

                                {/* Order Date */}
                                <div className="order-table__cell order-table__cell--orderdate">
                                    <span className="date-value">{formatDateTime(order.created_at)}</span>
                                </div>

                                {/* Complete Date */}
                                <div className="order-table__cell order-table__cell--completedate">
                                    <span className="date-value">{formatDateTime(order.completed_at)}</span>
                                </div>

                                {/* Actions */}
                                <div className="order-table__cell order-table__cell--actions">
                                    <div className="action-menu-container">
                                        <button
                                            className="action-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(order.order_id);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </button>
                                        {activeMenu === order.order_id && (
                                            <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="action-menu__item"
                                                    onClick={() => {
                                                        fetchOrderDetail(order.order_id);
                                                        setActiveMenu(null);
                                                    }}
                                                    disabled={orderDetailLoading}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
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

            {/* Order Detail Modal - Two Column Layout */}
            {showOrderDetail && selectedOrderDetail && (
                <div className="order-detail-overlay" onClick={closeOrderDetail}>
                    <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="order-detail-modal__header">
                            <span>Order Details - #{selectedOrderDetail.order_id}</span>
                            <button className="order-detail-modal__close" onClick={closeOrderDetail}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="order-detail-modal__body">
                            {/* Left Column - Products */}
                            <div className="order-detail-modal__products-column">
                                <h4>Products</h4>
                                <div className="order-detail-modal__products">
                                    {selectedOrderDetail.items && selectedOrderDetail.items.length > 0 ? (
                                        selectedOrderDetail.items.map((item, index) => (
                                            <div key={index} className="order-detail-modal__product">
                                                <div className="product-image-container">
                                                    <img
                                                        src={item.product_image || 'https://via.placeholder.com/50x50?text=No+Image'}
                                                        alt={item.product_name}
                                                        className="product-image"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'; }}
                                                    />
                                                </div>
                                                <div className="product-info">
                                                    <span className="product-name" title={item.product_name}>{item.product_name}</span>
                                                    <div className="product-meta">
                                                        <span>Qty: {item.qty}</span>
                                                        <span>${item.price.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No products found.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Order Info */}
                            <div className="order-detail-modal__info-column">
                                <h4>Order Information</h4>
                                <div className="order-detail-modal__info">
                                    <div className="info-row">
                                        <span className="info-label">Status:</span>
                                        <span className={`info-value info-value--status ${(selectedOrderDetail.order_status || '').toLowerCase()}`}>
                                            {selectedOrderDetail.order_status || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Order Date:</span>
                                        <span className="info-value">
                                            {formatDateTime(selectedOrderDetail.created_at || selectedOrderDetail.order_date)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Complete Date:</span>
                                        <span className="info-value">
                                            {selectedOrderDetail.completed_at ? formatDateTime(selectedOrderDetail.completed_at) : '—'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Payment:</span>
                                        <span className="info-value">
                                            {selectedOrderDetail.payment_method || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Shipping:</span>
                                        <span className="info-value">
                                            {selectedOrderDetail.shipping_method || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Order Total:</span>
                                        <span className="info-value info-value--total">
                                            ${selectedOrderDetail.order_total?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-detail-modal__footer">
                            <button className="order-detail-modal__btn" onClick={closeOrderDetail}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Confirmation Modal */}
            {showBulkConfirmModal && (
                <div className="bulk-confirm-overlay" onClick={cancelBulkAction}>
                    <div className="bulk-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bulk-confirm-modal__header">
                            <h3>Confirm Bulk Status Change</h3>
                            <button className="bulk-confirm-modal__close" onClick={cancelBulkAction}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="bulk-confirm-modal__body">
                            <p className="bulk-confirm-modal__message">
                                You are about to change the status of <strong>{selectedOrders.size}</strong> order{selectedOrders.size > 1 ? 's' : ''} to{' '}
                                <span className={`bulk-confirm-modal__status bulk-confirm-modal__status--${getStatusLabel(pendingBulkStatus).toLowerCase()}`}>
                                    {getStatusLabel(pendingBulkStatus)}
                                </span>
                            </p>
                            <p className="bulk-confirm-modal__warning">
                                This action will update all selected orders immediately.
                            </p>
                        </div>
                        <div className="bulk-confirm-modal__footer">
                            <button
                                className="bulk-confirm-modal__btn bulk-confirm-modal__btn--cancel"
                                onClick={cancelBulkAction}
                                disabled={bulkLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="bulk-confirm-modal__btn bulk-confirm-modal__btn--confirm"
                                onClick={confirmBulkAction}
                                disabled={bulkLoading}
                            >
                                {bulkLoading ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
