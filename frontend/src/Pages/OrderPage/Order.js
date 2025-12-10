import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import './Order.css';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

const Order = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // State for orders
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for filters
    const [activeTab, setActiveTab] = useState('Order'); // Order, Pending, Processing, Shipped, Delivered, Cancelled
    const [timePeriod, setTimePeriod] = useState('past3months'); // last30days, past3months, thisyear, lastyear
    const [searchQuery, setSearchQuery] = useState('');

    // Status mapping
    const statusMapping = {
        1: 'Pending',
        2: 'Processing',
        3: 'Shipped',
        4: 'Delivered',
        5: 'Cancelled'
    };

    // Time period labels
    const timePeriodLabels = {
        'last30days': 'last 30 days',
        'past3months': 'past 3 months',
        'thisyear': 'this year',
        'lastyear': 'last year'
    };

    // Fetch orders from backend
    const fetchOrders = async () => {
        if (!user?.email_address) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/order/history', {
                user_email: user.email_address
            });

            if (response.data.orders && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Load orders on mount
    useEffect(() => {
        if (isAuthenticated && user?.email_address) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user?.email_address]);

    // Filter orders based on active tab, time period, and search query
    useEffect(() => {
        let filtered = [...orders];

        // Filter by status
        if (activeTab !== 'Order') {
            filtered = filtered.filter(order => {
                const statusName = statusMapping[order.order_status_id];
                return statusName === activeTab;
            });
        }

        // Filter by time period
        const now = new Date();
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.order_date);

            switch (timePeriod) {
                case 'last30days':
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return orderDate >= thirtyDaysAgo;
                case 'past3months':
                    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    return orderDate >= threeMonthsAgo;
                case 'thisyear':
                    return orderDate.getFullYear() === now.getFullYear();
                case 'lastyear':
                    return orderDate.getFullYear() === now.getFullYear() - 1;
                default:
                    return true;
            }
        });

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => {
                // Search by order ID
                if (order.order_id.toString().includes(query)) return true;
                // Search by product name in order lines
                if (order.items && order.items.some(item =>
                    item.product_name?.toLowerCase().includes(query)
                )) return true;
                return false;
            });
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        setFilteredOrders(filtered);
    }, [orders, activeTab, timePeriod, searchQuery]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already reactive via useEffect
    };

    // Tab items
    const tabs = ['Order', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="order-page">
                <NavBar />
                <div className="order-page__container">
                    <div className="order-page__title">Your Orders</div>
                    <div className="order-page__empty">
                        <p>Please <Link to="/SignIn">sign in</Link> to view your orders.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="order-page">
                <NavBar />
                <div className="order-page__container">
                    <div className="order-page__title">Your Orders</div>
                    <div className="order-page__loading">Loading your orders...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="order-page">
            <NavBar />
            <div className="order-page__container">
                {/* Header with title and search */}
                <div className="order-page__header">
                    <h1 className="order-page__title">Your Orders</h1>
                    <div className="order-page__search">
                        <form onSubmit={handleSearch} className="order-page__search-form">
                            <input
                                type="text"
                                placeholder="Search all orders"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="order-page__search-input"
                            />
                            {/* <button type="submit" className="order-page__search-button">
                                <SearchOutlinedIcon sx={{ fontSize: 20 }} />
                                Search Orders
                            </button> */}
                        </form>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="order-page__tabs">
                    {tabs.map((tab) => (
                        <div
                            key={tab}
                            className={`order-page__tab ${activeTab === tab ? 'order-page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'Order' ? 'Orders' : tab}
                        </div>
                    ))}
                </div>

                {/* Order count and time period */}
                <div className="order-page__filter-info">
                    <span className="order-page__count">{filteredOrders.length}</span>
                    <span> orders placed in </span>
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="order-page__period-dropdown"
                    >
                        <option value="last30days">last 30 days</option>
                        <option value="past3months">past 3 months</option>
                        <option value="thisyear">this year</option>
                        <option value="lastyear">last year</option>
                    </select>
                </div>

                {/* Orders list or empty state */}
                <div className="order-page__orders">
                    {filteredOrders.length === 0 ? (
                        <div className="order-page__empty">
                            <p>Looks like you haven't placed an order in the {timePeriodLabels[timePeriod]}.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.order_id} className="order-card">
                                <div className="order-card__header">
                                    <div className="order-card__header-left">
                                        <div className="order-card__info-group">
                                            <span className="order-card__label">ORDER PLACED</span>
                                            <span className="order-card__value">{new Date(order.order_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                        <div className="order-card__info-group">
                                            <span className="order-card__label">TOTAL</span>
                                            <span className="order-card__value">${parseFloat(order.order_total).toFixed(2)}</span>
                                        </div>
                                        <div className="order-card__info-group">
                                            <span className="order-card__label">SHIP TO</span>
                                            <span className="order-card__value">{user?.user_name || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="order-card__header-right">
                                        <span className="order-card__label">ORDER # {order.order_id}</span>
                                        <div className="order-card__status" data-status={statusMapping[order.order_status_id]?.toLowerCase()}>
                                            {statusMapping[order.order_status_id] || 'Unknown'}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card__body">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <div key={index} className="order-card__item">
                                                <div className="order-card__item-image">
                                                    <img
                                                        src={item.product_image || '/placeholder-image.png'}
                                                        alt={item.product_name || 'Product'}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                                                    />
                                                </div>
                                                <div className="order-card__item-details">
                                                    <Link to={`/Item/${item.product_id}`} className="order-card__item-name">
                                                        {item.product_name || `Product ID: ${item.product_id}`}
                                                    </Link>
                                                    <div className="order-card__item-info">
                                                        <span>Qty: {item.qty}</span>
                                                        <span>Price: ${parseFloat(item.price).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="order-card__no-items">
                                            No item details available
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Order;
