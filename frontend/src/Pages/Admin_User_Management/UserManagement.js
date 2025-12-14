import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './UserManagement.css';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const UserManagement = () => {
    // Users state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [emailSearch, setEmailSearch] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [registeredDate, setRegisteredDate] = useState('');
    const [lastActiveDate, setLastActiveDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Action menu state
    const [activeMenu, setActiveMenu] = useState(null);

    // Add User Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [newUser, setNewUser] = useState({
        user_name: '',
        email_address: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: 'Male',
        city: ''
    });

    // User Profile Modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderPeriod, setOrderPeriod] = useState('');
    const [orderStats, setOrderStats] = useState({ total_orders: 0, total_spent: 0 });
    const [profileLoading, setProfileLoading] = useState(false);

    // Fetch user detail
    const fetchUserDetail = async (userId) => {
        setProfileLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/admin/users/${userId}/detail`);
            setSelectedUser(response.data);
            setShowProfileModal(true);
            // Also fetch orders
            fetchUserOrders(userId, '');
        } catch (error) {
            console.error('Error fetching user detail:', error);
            alert('Failed to fetch user details');
        } finally {
            setProfileLoading(false);
        }
    };

    // Fetch user orders
    const fetchUserOrders = async (userId, period) => {
        setOrdersLoading(true);
        try {
            const params = new URLSearchParams({ period });
            const response = await axios.get(`http://localhost:8000/admin/users/${userId}/orders?${params}`);
            setUserOrders(response.data.orders);
            setOrderStats({
                total_orders: response.data.total_orders,
                total_spent: response.data.total_spent
            });
        } catch (error) {
            console.error('Error fetching user orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Handle order period filter change
    const handleOrderPeriodChange = (period) => {
        setOrderPeriod(period);
        if (selectedUser) {
            fetchUserOrders(selectedUser.user_id, period);
        }
    };

    // Close profile modal
    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedUser(null);
        setUserOrders([]);
        setOrderPeriod('');
        setOrderStats({ total_orders: 0, total_spent: 0 });
    };

    // Reset form
    const resetForm = () => {
        setNewUser({
            user_name: '',
            email_address: '',
            phone_number: '',
            password: '',
            confirmPassword: '',
            age: '',
            gender: 'Male',
            city: ''
        });
        setFormError('');
        setFieldErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    // Handle form input change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
        // Clear specific field error when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (formError) setFormError('');
    };

    // Handle add user submit
    const handleAddUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setFieldErrors({});

        // Validation with inline errors
        const errors = {};

        if (!newUser.user_name.trim()) {
            errors.user_name = 'Username is required';
        }

        if (!newUser.email_address.trim()) {
            errors.email_address = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email_address)) {
            errors.email_address = 'Please enter a valid email address';
        }

        if (!newUser.phone_number.trim()) {
            errors.phone_number = 'Phone number is required';
        } else if (newUser.phone_number.length !== 10 || !/^\d+$/.test(newUser.phone_number)) {
            errors.phone_number = 'Phone number must be exactly 10 digits';
        }

        if (!newUser.password) {
            errors.password = 'Password is required';
        } else if (newUser.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!newUser.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (newUser.password !== newUser.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // If there are any errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFormLoading(true);
        try {
            await axios.post('http://localhost:8000/postRegister/', {
                user_name: newUser.user_name.trim(),
                email_address: newUser.email_address.trim(),
                phone_number: newUser.phone_number.trim(),
                password: newUser.password,
                age: parseInt(newUser.age) || 0,
                gender: newUser.gender,
                city: newUser.city.trim(),
                role: 2 // Always create as normal user
            });

            // Success - close modal and refresh list
            setShowAddModal(false);
            resetForm();
            fetchUsers(1); // Refresh to show new user at top
        } catch (error) {
            console.error('Error adding user:', error);
            setFormError(error.response?.data?.detail || 'Failed to add user. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    // Fetch users - always filter by role=2 (User only)
    const fetchUsers = useCallback(async (
        pageNum = 1,
        filters = {}
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum,
                per_page: filters.perPage || perPage,
                search: filters.search ?? searchQuery,
                email_search: filters.emailSearch ?? emailSearch,
                phone_search: filters.phoneSearch ?? phoneSearch,
                status: filters.status ?? statusFilter,
                registered_date: filters.registeredDate ?? registeredDate,
                last_active_date: filters.lastActiveDate ?? lastActiveDate,
                role: 2 // Always filter by Role = 2 (User only)
            });
            const response = await axios.get(`http://localhost:8000/admin/users?${params}`);
            setUsers(response.data.users);
            setTotalPages(response.data.total_pages);
            setTotal(response.data.total);
            setPage(response.data.page);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [perPage, searchQuery, emailSearch, phoneSearch, statusFilter, registeredDate, lastActiveDate]);

    // Initial fetch
    useEffect(() => {
        fetchUsers(1);
    }, []);

    // Refetch when perPage changes
    useEffect(() => {
        fetchUsers(1);
    }, [perPage]);

    // Handle username search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        const timeoutId = setTimeout(() => {
            fetchUsers(1, { search: value });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Handle email search
    const handleEmailSearch = (e) => {
        const value = e.target.value;
        setEmailSearch(value);
        const timeoutId = setTimeout(() => {
            fetchUsers(1, { emailSearch: value });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Handle phone search
    const handlePhoneSearch = (e) => {
        const value = e.target.value;
        setPhoneSearch(value);
        const timeoutId = setTimeout(() => {
            fetchUsers(1, { phoneSearch: value });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    // Handle registered date filter
    const handleRegisteredDate = (e) => {
        const value = e.target.value;
        setRegisteredDate(value);
        fetchUsers(1, { registeredDate: value });
    };

    // Handle last active date filter
    const handleLastActiveDate = (e) => {
        const value = e.target.value;
        setLastActiveDate(value);
        fetchUsers(1, { lastActiveDate: value });
    };

    // Handle status filter change
    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        fetchUsers(1, { status: value });
    };

    // Handle items per page change
    const handlePerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setPerPage(value);
    };

    // Handle pagination
    const handleFirstPage = () => {
        if (page > 1) {
            fetchUsers(1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            fetchUsers(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            fetchUsers(page + 1);
        }
    };

    const handleLastPage = () => {
        if (page < totalPages) {
            fetchUsers(totalPages);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await axios.put(`http://localhost:8000/admin/users/${userId}/status`, {
                status: newStatus
            });
            // Refresh the list
            fetchUsers(page);
            setActiveMenu(null);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert(error.response?.data?.detail || 'Failed to update user status');
        }
    };

    // Toggle action menu
    const toggleMenu = (userId) => {
        setActiveMenu(activeMenu === userId ? null : userId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeMenu]);

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'status-badge--active';
            case 'locked': return 'status-badge--locked';
            case 'disabled': return 'status-badge--disabled';
            default: return 'status-badge--active';
        }
    };

    // Calculate displayed range
    const startItem = total > 0 ? (page - 1) * perPage + 1 : 0;
    const endItem = Math.min(page * perPage, total);

    return (
        <div className="admin-page__usermanagement">
            {/* Table Header with Filters */}
            <div className="user-table">
                <div className="user-table__header">
                    <div className="user-table__cell user-table__cell--username">
                        <span className="user-table__header-label">User name</span>
                        <div className="user-table__filter">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="user-table__search"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--email">
                        <span className="user-table__header-label">Email</span>
                        <div className="user-table__filter">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={emailSearch}
                                onChange={handleEmailSearch}
                                className="user-table__search"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--phone">
                        <span className="user-table__header-label">Phone Number</span>
                        <div className="user-table__filter">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={phoneSearch}
                                onChange={handlePhoneSearch}
                                className="user-table__search"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--registered">
                        <span className="user-table__header-label">Registered</span>
                        <div className="user-table__filter user-table__filter--date">
                            <CalendarTodayIcon className="search-icon" />
                            <input
                                type="date"
                                value={registeredDate}
                                onChange={handleRegisteredDate}
                                className="user-table__search user-table__search--date"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--lastactive">
                        <span className="user-table__header-label">Last active</span>
                        <div className="user-table__filter user-table__filter--date">
                            <CalendarTodayIcon className="search-icon" />
                            <input
                                type="date"
                                value={lastActiveDate}
                                onChange={handleLastActiveDate}
                                className="user-table__search user-table__search--date"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--status">
                        <span className="user-table__header-label">Status</span>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className="user-table__select"
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="locked">Locked</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    <div className="user-table__cell user-table__cell--actions">
                        <button
                            className="add-user-btn"
                            onClick={() => setShowAddModal(true)}
                            title="Add new user"
                        >
                            <PersonAddAlt1Icon />
                        </button>
                        <button
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setEmailSearch('');
                                setPhoneSearch('');
                                setRegisteredDate('');
                                setLastActiveDate('');
                                setStatusFilter('');
                                setPerPage(20);
                                fetchUsers(1, {
                                    search: '',
                                    emailSearch: '',
                                    phoneSearch: '',
                                    status: '',
                                    registeredDate: '',
                                    lastActiveDate: '',
                                    perPage: 20
                                });
                            }}
                            title="Reset all filters"
                        >
                            <RestartAltIcon />
                        </button>
                    </div>
                </div>

                {/* Table Body */}
                <div className="user-table__body">
                    {loading ? (
                        <div className="user-table__loading">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="user-table__empty">No users found</div>
                    ) : (
                        users.map((user) => (
                            <div key={user.user_id} className="user-table__row">
                                <div className="user-table__cell user-table__cell--username">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <PersonIcon />
                                        </div>
                                        <div className="user-details">
                                            <span
                                                className="user-name user-name--clickable"
                                                onClick={() => fetchUserDetail(user.user_id)}
                                            >
                                                {user.user_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="user-table__cell user-table__cell--email">
                                    <span className="cell-text">{user.email_address || '—'}</span>
                                </div>
                                <div className="user-table__cell user-table__cell--phone">
                                    <span className="cell-text">{user.phone_number || '—'}</span>
                                </div>
                                <div className="user-table__cell user-table__cell--registered">
                                    {user.created_at || '—'}
                                </div>
                                <div className="user-table__cell user-table__cell--lastactive">
                                    {user.last_login_at || '—'}
                                </div>
                                <div className="user-table__cell user-table__cell--status">
                                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                                        • {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </span>
                                </div>
                                <div className="user-table__cell user-table__cell--actions">
                                    <div className="action-menu-container">
                                        <button
                                            className="action-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(user.user_id);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </button>
                                        {activeMenu === user.user_id && (
                                            <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="action-menu__item action-menu__item--active"
                                                    onClick={() => handleStatusUpdate(user.user_id, 'active')}
                                                    disabled={user.status === 'active'}
                                                >
                                                    <CheckCircleIcon /> Set Active
                                                </button>
                                                <button
                                                    className="action-menu__item action-menu__item--locked"
                                                    onClick={() => handleStatusUpdate(user.user_id, 'locked')}
                                                    disabled={user.status === 'locked'}
                                                >
                                                    <LockIcon /> Lock Account
                                                </button>
                                                <button
                                                    className="action-menu__item action-menu__item--disabled"
                                                    onClick={() => handleStatusUpdate(user.user_id, 'disabled')}
                                                    disabled={user.status === 'disabled'}
                                                >
                                                    <BlockIcon /> Disable Account
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

            {/* Pagination */}
            <div className="user-pagination">
                <div className="user-pagination__info">
                    <span className="user-pagination__per-page">
                        Items per page:
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="user-pagination__select"
                        >
                            <option value={20}>20</option>
                            <option value={40}>40</option>
                            <option value={100}>100</option>
                        </select>
                    </span>
                    <span className="user-pagination__range">
                        {startItem}-{endItem} of {total}
                    </span>
                </div>
                <div className="user-pagination__controls">
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        onClick={handleFirstPage}
                        disabled={page <= 1}
                        title="First page"
                    >
                        <FirstPageIcon />
                    </button>
                    <button
                        className="user-pagination__btn"
                        onClick={handlePrevPage}
                        disabled={page <= 1}
                    >
                        Prev
                    </button>
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
                                onClick={() => fetchUsers(pageNum, searchQuery, statusFilter, perPage)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="user-pagination__btn"
                        onClick={handleNextPage}
                        disabled={page >= totalPages}
                    >
                        Next
                    </button>
                    <button
                        className="user-pagination__btn user-pagination__btn--icon"
                        onClick={handleLastPage}
                        disabled={page >= totalPages}
                        title="Last page"
                    >
                        <LastPageIcon />
                    </button>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="add-user-overlay" onClick={() => { setShowAddModal(false); resetForm(); }}>
                    <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="add-user-modal__header">
                            <h3>Add New User</h3>
                            <button
                                className="add-user-modal__close"
                                onClick={() => { setShowAddModal(false); resetForm(); }}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="add-user-modal__body">
                            {formError && (
                                <div className="add-user-modal__error">
                                    {formError}
                                </div>
                            )}
                            <div className={`add-user-modal__field ${fieldErrors.user_name ? 'has-error' : ''}`}>
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={newUser.user_name}
                                    onChange={handleFormChange}
                                    placeholder="Enter username"
                                    disabled={formLoading}
                                />
                                {fieldErrors.user_name && <span className="field-error">{fieldErrors.user_name}</span>}
                            </div>
                            <div className={`add-user-modal__field ${fieldErrors.email_address ? 'has-error' : ''}`}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email_address"
                                    value={newUser.email_address}
                                    onChange={handleFormChange}
                                    placeholder="Enter email address"
                                    disabled={formLoading}
                                />
                                {fieldErrors.email_address && <span className="field-error">{fieldErrors.email_address}</span>}
                            </div>
                            <div className={`add-user-modal__field ${fieldErrors.phone_number ? 'has-error' : ''}`}>
                                <label>Phone Number *</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={newUser.phone_number}
                                    onChange={handleFormChange}
                                    placeholder="10-digit phone number"
                                    maxLength={10}
                                    disabled={formLoading}
                                />
                                {fieldErrors.phone_number && <span className="field-error">{fieldErrors.phone_number}</span>}
                            </div>
                            <div className="add-user-modal__row">
                                <div className={`add-user-modal__field ${fieldErrors.password ? 'has-error' : ''}`}>
                                    <label>Password *</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={newUser.password}
                                            onChange={handleFormChange}
                                            placeholder="Min 8 characters"
                                            disabled={formLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                                </div>
                                <div className={`add-user-modal__field ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                                    <label>Confirm Password *</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={newUser.confirmPassword}
                                            onChange={handleFormChange}
                                            placeholder="Confirm password"
                                            disabled={formLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                                </div>
                            </div>
                            <div className="add-user-modal__row">
                                <div className="add-user-modal__field">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={newUser.age}
                                        onChange={handleFormChange}
                                        placeholder="Age"
                                        min={1}
                                        max={120}
                                        disabled={formLoading}
                                    />
                                </div>
                                <div className="add-user-modal__field">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={newUser.gender}
                                        onChange={handleFormChange}
                                        disabled={formLoading}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="add-user-modal__field">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={newUser.city}
                                    onChange={handleFormChange}
                                    placeholder="Enter city"
                                    disabled={formLoading}
                                />
                            </div>
                            <div className="add-user-modal__footer">
                                <button
                                    type="button"
                                    className="add-user-modal__cancel"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="add-user-modal__submit"
                                    disabled={formLoading}
                                >
                                    {formLoading ? 'Adding...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="user-profile-overlay" onClick={closeProfileModal}>
                    <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-profile-modal__header">
                            <h3>User Profile</h3>
                            <button className="user-profile-modal__close" onClick={closeProfileModal}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="user-profile-modal__content">
                            {/* Left Side - User Information */}
                            <div className="user-profile-modal__left">
                                <div className="profile-section">
                                    <div className="profile-avatar">
                                        <PersonIcon />
                                    </div>
                                    <h4 className="profile-name">{selectedUser.user_name}</h4>
                                    <span className={`profile-status ${getStatusClass(selectedUser.status)}`}>
                                        {selectedUser.status}
                                    </span>
                                </div>

                                <div className="profile-info">
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">User ID</span>
                                        <span className="profile-info__value">#{selectedUser.user_id}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Email</span>
                                        <span className="profile-info__value">{selectedUser.email_address || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Phone</span>
                                        <span className="profile-info__value">{selectedUser.phone_number || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Role</span>
                                        <span className="profile-info__value">{selectedUser.role}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Age</span>
                                        <span className="profile-info__value">{selectedUser.age || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Gender</span>
                                        <span className="profile-info__value">{selectedUser.gender || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">City</span>
                                        <span className="profile-info__value">{selectedUser.city || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Registered</span>
                                        <span className="profile-info__value">{selectedUser.created_at || '—'}</span>
                                    </div>
                                    <div className="profile-info__item">
                                        <span className="profile-info__label">Last Active</span>
                                        <span className="profile-info__value">{selectedUser.last_login_at || '—'}</span>
                                    </div>
                                </div>

                                {/* Addresses */}
                                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                    <div className="profile-addresses">
                                        <h5>Addresses</h5>
                                        {selectedUser.addresses.map((addr, idx) => (
                                            <div key={idx} className="profile-address">
                                                {addr.is_default && <span className="address-default">Default</span>}
                                                <p>{addr.address_line1}</p>
                                                {addr.address_line2 && <p>{addr.address_line2}</p>}
                                                <p>{addr.region} {addr.postal_code}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Side - Order History */}
                            <div className="user-profile-modal__right">
                                <div className="order-history-header">
                                    <h4>Order History</h4>
                                    <div className="order-period-tabs">
                                        <button
                                            className={`period-tab ${orderPeriod === '' ? 'active' : ''}`}
                                            onClick={() => handleOrderPeriodChange('')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`period-tab ${orderPeriod === 'day' ? 'active' : ''}`}
                                            onClick={() => handleOrderPeriodChange('day')}
                                        >
                                            Day
                                        </button>
                                        <button
                                            className={`period-tab ${orderPeriod === 'week' ? 'active' : ''}`}
                                            onClick={() => handleOrderPeriodChange('week')}
                                        >
                                            Week
                                        </button>
                                        <button
                                            className={`period-tab ${orderPeriod === 'month' ? 'active' : ''}`}
                                            onClick={() => handleOrderPeriodChange('month')}
                                        >
                                            Month
                                        </button>
                                        <button
                                            className={`period-tab ${orderPeriod === 'year' ? 'active' : ''}`}
                                            onClick={() => handleOrderPeriodChange('year')}
                                        >
                                            Year
                                        </button>
                                    </div>
                                </div>

                                <div className="order-stats">
                                    <div className="order-stat">
                                        <span className="order-stat__value">{orderStats.total_orders}</span>
                                        <span className="order-stat__label">Orders</span>
                                    </div>
                                    <div className="order-stat">
                                        <span className="order-stat__value">${orderStats.total_spent.toLocaleString()}</span>
                                        <span className="order-stat__label">Total Spent</span>
                                    </div>
                                </div>

                                <div className="order-list">
                                    {ordersLoading ? (
                                        <div className="order-list__loading">Loading orders...</div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="order-list__empty">No orders found</div>
                                    ) : (
                                        userOrders.map((order) => (
                                            <div key={order.order_id} className="order-item">
                                                <div className="order-item__header">
                                                    <span className="order-item__id">#{order.order_id}</span>
                                                    <span className="order-item__date">{order.order_date}</span>
                                                </div>
                                                <div className="order-item__body">
                                                    <span className="order-item__total">${order.order_total.toLocaleString()}</span>
                                                    <span className={`order-item__status order-item__status--${order.status?.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                {order.payment_method && (
                                                    <div className="order-item__meta">
                                                        <span>{order.payment_method}</span>
                                                        {order.shipping_method && <span> • {order.shipping_method}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
