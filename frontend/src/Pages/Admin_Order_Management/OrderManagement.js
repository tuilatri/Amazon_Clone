import React, { useState } from 'react';
import './OrderManagement.css';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// OrderManagement - Admin tab for managing orders
// UI placeholder matching Product Management table layout
const OrderManagement = () => {
    // State for filters (UI only - no API calls yet)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [shippingFilter, setShippingFilter] = useState('');

    // Pagination state (UI only)
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    // Mock data for UI demonstration
    const mockOrders = [
        {
            order_id: 1001,
            customer_name: 'Hà Minh Trí',
            phone_number: '0000000000',
            quantity: 3,
            amount: 129.99,
            payment_method: 'Credit Card',
            shipping_method: 'Standard',
            status: 'Delivered'
        },
        {
            order_id: 1002,
            customer_name: 'John Doe',
            phone_number: '0123456789',
            quantity: 1,
            amount: 49.50,
            payment_method: 'Cash On Delivery',
            shipping_method: 'Express',
            status: 'Processing'
        },
        {
            order_id: 1003,
            customer_name: 'Jane Smith',
            phone_number: '0987654321',
            quantity: 5,
            amount: 299.00,
            payment_method: 'Credit Card',
            shipping_method: 'Same Day',
            status: 'Pending'
        },
        {
            order_id: 1004,
            customer_name: 'Test User',
            phone_number: '1111111111',
            quantity: 2,
            amount: 79.99,
            payment_method: 'Credit Card',
            shipping_method: 'International',
            status: 'Shipped'
        }
    ];

    // Status options for filter
    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    const paymentOptions = ['Cash On Delivery', 'Credit Card'];
    const shippingOptions = ['Standard', 'Express', 'Same Day', 'International'];

    // Get status badge class
    const getStatusClass = (status) => {
        const statusLower = status.toLowerCase();
        return `order-status order-status--${statusLower}`;
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPaymentFilter('');
        setShippingFilter('');
    };

    // Handle export (placeholder)
    const handleExport = () => {
        console.log('Export orders clicked - will be implemented with API');
    };

    // Calculate pagination info
    const total = mockOrders.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage + 1;
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
                            <span className="order-table__header-label">Phone Number</span>
                        </div>
                    </div>

                    {/* Quantity Column */}
                    <div className="order-table__cell order-table__cell--quantity">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Quantity</span>
                        </div>
                    </div>

                    {/* Amount Column */}
                    <div className="order-table__cell order-table__cell--amount">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Amount</span>
                        </div>
                    </div>

                    {/* Payment Method Column */}
                    <div className="order-table__cell order-table__cell--payment">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Payment Method</span>
                        </div>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="order-table__select"
                        >
                            <option value="">All</option>
                            {paymentOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Shipping Method Column */}
                    <div className="order-table__cell order-table__cell--shipping">
                        <div className="non-sortable-header">
                            <span className="order-table__header-label">Shipping Method</span>
                        </div>
                        <select
                            value={shippingFilter}
                            onChange={(e) => setShippingFilter(e.target.value)}
                            className="order-table__select"
                        >
                            <option value="">All</option>
                            {shippingOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
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
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="order-table__select"
                        >
                            <option value="">All</option>
                            {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
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
                    {mockOrders.length === 0 ? (
                        <div className="order-table__empty">No orders found.</div>
                    ) : (
                        mockOrders.map((order) => (
                            <div key={order.order_id} className="order-table__row">
                                {/* Order ID */}
                                <div className="order-table__cell order-table__cell--id">
                                    <span className="order-id">#{order.order_id}</span>
                                </div>

                                {/* Customer */}
                                <div className="order-table__cell order-table__cell--customer">
                                    <span className="customer-name">{order.customer_name}</span>
                                </div>

                                {/* Phone Number */}
                                <div className="order-table__cell order-table__cell--phone">
                                    <span className="phone-number">{order.phone_number}</span>
                                </div>

                                {/* Quantity */}
                                <div className="order-table__cell order-table__cell--quantity">
                                    <span className="quantity">{order.quantity}</span>
                                </div>

                                {/* Amount */}
                                <div className="order-table__cell order-table__cell--amount">
                                    <span className="amount">${order.amount.toFixed(2)}</span>
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
                            onChange={(e) => setPerPage(Number(e.target.value))}
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        disabled={page === totalPages}
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
