import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import './AdminOverview.css';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const AdminOverview = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Tab state
    const [activeTab, setActiveTab] = useState('Overview');
    const tabs = [
        'Overview',
        'User Management',
        'Supplier Management',
        'Delivery Person Management',
        'Product Management',
        'Order Management',
        'Sales Analytics'
    ];

    // Statistics state
    const [stats, setStats] = useState({
        total_customers: 0,
        total_orders: 0,
        total_revenue: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Trending products state
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [trendingPage, setTrendingPage] = useState(1);
    const [trendingTotalPages, setTrendingTotalPages] = useState(1);
    const [trendingLoading, setTrendingLoading] = useState(true);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotalPages, setOrdersTotalPages] = useState(1);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8000/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch trending products
    const fetchTrendingProducts = async (page = 1) => {
        try {
            setTrendingLoading(true);
            const response = await axios.get(`http://localhost:8000/admin/trending-products?page=${page}&per_page=5`);
            setTrendingProducts(response.data.products);
            setTrendingTotalPages(response.data.total_pages);
            setTrendingPage(page);
        } catch (error) {
            console.error('Error fetching trending products:', error);
        } finally {
            setTrendingLoading(false);
        }
    };

    // Fetch orders
    const fetchOrders = async (page = 1, search = '') => {
        try {
            setOrdersLoading(true);
            const response = await axios.get(
                `http://localhost:8000/admin/orders?page=${page}&per_page=10&search=${search}`
            );
            setOrders(response.data.orders);
            setOrdersTotalPages(response.data.total_pages);
            setOrdersTotal(response.data.total);
            setOrdersPage(page);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (isAuthenticated && user?.role === 1) {
            fetchStats();
            fetchTrendingProducts();
            fetchOrders();
        }
    }, [isAuthenticated, user?.role]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders(1, searchQuery);
    };

    // Handle search input change with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders(1, searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Redirect if not admin
    if (!isAuthenticated) {
        return (
            <div className="admin-page">
                <NavBar />
                <div className="admin-page__container">
                    <div className="admin-page__title">System Management</div>
                    <div className="admin-page__empty">
                        <p>Please <Link to="/SignIn">sign in</Link> to access this page.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (user?.role !== 1) {
        return (
            <div className="admin-page">
                <NavBar />
                <div className="admin-page__container">
                    <div className="admin-page__title">Access Denied</div>
                    <div className="admin-page__empty">
                        <p>You do not have permission to access this page.</p>
                        <p><Link to="/">Return to Home</Link></p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Render Coming Soon for non-Overview tabs
    const renderTabContent = () => {
        if (activeTab !== 'Overview') {
            return (
                <div className="admin-page__coming-soon">
                    <h2>Coming Soon</h2>
                    <p>The {activeTab} feature is currently under development.</p>
                </div>
            );
        }

        return (
            <div className="admin-page__overview">
                {/* Top Section: Stats Cards + Trending Products */}
                <div className="admin-page__top-section">
                    {/* Statistics Cards */}
                    <div className="admin-page__stats">
                        <div className="stat-card">
                            <div className="stat-card__icon stat-card__icon--customers">
                                <PeopleIcon />
                            </div>
                            <div className="stat-card__content">
                                <div className="stat-card__label">Total Customers</div>
                                <div className="stat-card__value">
                                    {statsLoading ? '...' : stats.total_customers.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card__icon stat-card__icon--orders">
                                <ShoppingCartIcon />
                            </div>
                            <div className="stat-card__content">
                                <div className="stat-card__label">Total Orders</div>
                                <div className="stat-card__value">
                                    {statsLoading ? '...' : stats.total_orders.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card__icon stat-card__icon--revenue">
                                <AttachMoneyIcon />
                            </div>
                            <div className="stat-card__content">
                                <div className="stat-card__label">Total Revenue</div>
                                <div className="stat-card__sublabel">(Delivered Orders)</div>
                                <div className="stat-card__value">
                                    ${statsLoading ? '...' : stats.total_revenue.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trending Products */}
                    <div className="admin-page__trending">
                        <div className="trending-header">
                            <TrendingUpIcon />
                            <h3>Trending Products</h3>
                        </div>
                        <div className="trending-list">
                            {trendingLoading ? (
                                <div className="trending-loading">Loading...</div>
                            ) : (
                                trendingProducts.map((product, index) => (
                                    <div key={product.product_id} className="trending-item">
                                        <span className="trending-rank">#{(trendingPage - 1) * 5 + index + 1}</span>
                                        <div className="trending-info">
                                            <Link to={`/Item/${product.product_id}`} className="trending-name">
                                                {product.product_name}
                                            </Link>
                                            <div className="trending-rating">
                                                <StarIcon className="star-icon" />
                                                <span>{product.ratings.toFixed(1)}</span>
                                                <span className="rating-count">({product.no_of_ratings.toLocaleString()} ratings)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Trending Pagination */}
                        {trendingTotalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination__btn"
                                    disabled={trendingPage === 1}
                                    onClick={() => fetchTrendingProducts(trendingPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className="pagination__info">
                                    Page {trendingPage} of {trendingTotalPages}
                                </span>
                                <button
                                    className="pagination__btn"
                                    disabled={trendingPage === trendingTotalPages}
                                    onClick={() => fetchTrendingProducts(trendingPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Last Orders Section */}
                <div className="admin-page__orders-section">
                    <div className="orders-header">
                        <h3>Last Orders</h3>
                        <form onSubmit={handleSearch} className="orders-search">
                            <input
                                type="text"
                                placeholder="Search by order ID, user ID, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="orders-search__input"
                            />
                        </form>
                    </div>

                    <div className="orders-table-container">
                        {ordersLoading ? (
                            <div className="orders-loading">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="orders-empty">No orders found.</div>
                        ) : (
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td>#{order.order_id}</td>
                                            <td>
                                                <div className="order-customer">
                                                    <span className="customer-name">{order.user_name}</span>
                                                    <span className="customer-id">ID: {order.user_id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {order.order_date
                                                    ? new Date(order.order_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="order-amount">${order.order_total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Orders Pagination */}
                    {ordersTotalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination__btn"
                                disabled={ordersPage === 1}
                                onClick={() => fetchOrders(ordersPage - 1, searchQuery)}
                            >
                                Previous
                            </button>
                            <span className="pagination__info">
                                Page {ordersPage} of {ordersTotalPages} ({ordersTotal} orders)
                            </span>
                            <button
                                className="pagination__btn"
                                disabled={ordersPage === ordersTotalPages}
                                onClick={() => fetchOrders(ordersPage + 1, searchQuery)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page">
            <NavBar />
            <div className="admin-page__container">
                {/* Header */}
                <div className="admin-page__header">
                    <h1 className="admin-page__title">Your System Management</h1>
                </div>

                {/* Navigation Tabs */}
                <div className="admin-page__tabs">
                    {tabs.map((tab) => (
                        <div
                            key={tab}
                            className={`admin-page__tab ${activeTab === tab ? 'admin-page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
            <Footer />
        </div>
    );
};

export default AdminOverview;
