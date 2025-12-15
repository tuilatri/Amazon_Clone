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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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

    // NEW: Sorting state
    const [sortBy, setSortBy] = useState('user_id');
    const [sortOrder, setSortOrder] = useState('desc');

    // NEW: Date range filter states
    const [registeredFrom, setRegisteredFrom] = useState('');
    const [registeredTo, setRegisteredTo] = useState('');
    const [lastActiveFrom, setLastActiveFrom] = useState('');
    const [lastActiveTo, setLastActiveTo] = useState('');

    // NEW: Bulk selection state
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // NEW: Bulk action confirmation modal state
    const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
    const [pendingBulkStatus, setPendingBulkStatus] = useState('');

    // NEW: Quick stats state
    const [stats, setStats] = useState({
        total_customers: 0,
        active_users_today: 0,
        new_customers_this_week: 0
    });

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
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
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
            fetchUserOrders(userId, '', '');
        } catch (error) {
            console.error('Error fetching user detail:', error);
            alert('Failed to fetch user details');
        } finally {
            setProfileLoading(false);
        }
    };

    // Fetch user orders
    const fetchUserOrders = async (userId, period, status) => {
        setOrdersLoading(true);
        try {
            const params = new URLSearchParams({ period, status });
            const response = await axios.get(`http://localhost:8000/admin/users/${userId}/orders?${params}`);
            const orders = response.data.orders;

            // Sort orders by order_id descending (newest first)
            const sortedOrders = [...orders].sort((a, b) => b.order_id - a.order_id);
            setUserOrders(sortedOrders);

            // Calculate total spent from DELIVERED orders only
            const deliveredTotal = sortedOrders
                .filter(o => o.status?.toLowerCase() === 'delivered')
                .reduce((sum, o) => sum + (o.order_total || 0), 0);

            setOrderStats({
                total_orders: response.data.total_orders,
                total_spent: deliveredTotal
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
            fetchUserOrders(selectedUser.user_id, period, orderStatusFilter);
        }
    };

    // Handle order status filter change
    const handleOrderStatusChange = (status) => {
        setOrderStatusFilter(status);
        if (selectedUser) {
            fetchUserOrders(selectedUser.user_id, orderPeriod, status);
        }
    };

    // Close profile modal
    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedUser(null);
        setUserOrders([]);
        setOrderPeriod('');
        setOrderStatusFilter('');
        setOrderStats({ total_orders: 0, total_spent: 0 });
        setEditMode(false);
        setEditForm({});
        setEditLoading(false);
        setSelectedOrderDetail(null);
        setShowOrderDetail(false);
    };

    // Order detail state
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [orderDetailLoading, setOrderDetailLoading] = useState(false);

    // Fetch order detail
    const fetchOrderDetail = async (orderId) => {
        setOrderDetailLoading(true);
        try {
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

    // Close order detail panel
    const closeOrderDetail = () => {
        setShowOrderDetail(false);
        setSelectedOrderDetail(null);
    };

    // Edit user state
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    // Initialize edit form with current user data
    const startEditMode = () => {
        if (selectedUser) {
            setEditForm({
                user_name: selectedUser.user_name || '',
                email_address: selectedUser.email_address || '',
                phone_number: selectedUser.phone_number || '',
                age: selectedUser.age || '',
                gender: selectedUser.gender || '',
                city: selectedUser.city || ''
            });
            setEditErrors({});
            setEditMode(true);
        }
    };

    // Handle edit form changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate edit form (matching SignUp validation)
    const validateEditForm = () => {
        const errors = {};

        // Username validation: 2-50 characters
        if (!editForm.user_name || editForm.user_name.trim().length < 2) {
            errors.user_name = 'Name must be at least 2 characters.';
        } else if (editForm.user_name.trim().length > 50) {
            errors.user_name = 'Name must be 50 characters or less.';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!editForm.email_address || !emailRegex.test(editForm.email_address)) {
            errors.email_address = 'Please enter a valid email address.';
        }

        // Phone validation: 10 digits
        if (editForm.phone_number && !/^\d{10}$/.test(editForm.phone_number)) {
            errors.phone_number = 'Phone number must be exactly 10 digits.';
        }

        // Age validation: 0-122
        if (editForm.age !== '' && editForm.age !== null) {
            const ageNum = parseInt(editForm.age, 10);
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 122) {
                errors.age = 'Age must be between 0 and 122.';
            }
        }

        // City validation (optional but if provided, check length)
        if (editForm.city && editForm.city.length > 100) {
            errors.city = 'City name is too long.';
        }

        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit user update
    const handleUserUpdate = async () => {
        if (!selectedUser) return;

        // Validate before submitting
        if (!validateEditForm()) {
            return;
        }

        setEditLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:8000/admin/users/${selectedUser.user_id}/update`,
                editForm
            );
            if (response.data.success) {
                // Update selectedUser with new data
                setSelectedUser(prev => ({
                    ...prev,
                    ...response.data.user
                }));
                setEditMode(false);
                setEditErrors({});
                alert('User updated successfully!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user: ' + (error.response?.data?.detail || error.message));
        } finally {
            setEditLoading(false);
        }
    };

    // Cancel edit mode
    const cancelEditMode = () => {
        setEditMode(false);
        setEditForm({});
        setEditErrors({});
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
                sort_by: filters.sortBy ?? sortBy,
                sort_order: filters.sortOrder ?? sortOrder,
                registered_from: filters.registeredFrom ?? registeredFrom,
                registered_to: filters.registeredTo ?? registeredTo,
                last_active_from: filters.lastActiveFrom ?? lastActiveFrom,
                last_active_to: filters.lastActiveTo ?? lastActiveTo,
                role: 2 // Always filter by Role = 2 (User only)
            });
            const response = await axios.get(`http://localhost:8000/admin/users?${params}`);
            setUsers(response.data.users);
            setTotalPages(response.data.total_pages);
            setTotal(response.data.total);
            setPage(response.data.page);
            // Clear selections on page/filter change
            setSelectedUsers(new Set());
            setSelectAll(false);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [perPage, searchQuery, emailSearch, phoneSearch, statusFilter, sortBy, sortOrder, registeredFrom, registeredTo, lastActiveFrom, lastActiveTo]);

    // Fetch quick stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/admin/stats');
            setStats({
                total_customers: response.data.total_customers,
                active_users_today: response.data.active_users_today,
                new_customers_this_week: response.data.new_customers_this_week
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchUsers(1);
        fetchStats();
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

    // Handle date range filter - Registered From
    const handleRegisteredFrom = (e) => {
        const value = e.target.value;
        setRegisteredFrom(value);
        fetchUsers(1, { registeredFrom: value });
    };

    // Handle date range filter - Registered To
    const handleRegisteredTo = (e) => {
        const value = e.target.value;
        setRegisteredTo(value);
        fetchUsers(1, { registeredTo: value });
    };

    // Handle date range filter - Last Active From
    const handleLastActiveFrom = (e) => {
        const value = e.target.value;
        setLastActiveFrom(value);
        fetchUsers(1, { lastActiveFrom: value });
    };

    // Handle date range filter - Last Active To
    const handleLastActiveTo = (e) => {
        const value = e.target.value;
        setLastActiveTo(value);
        fetchUsers(1, { lastActiveTo: value });
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

    // NEW: Handle column sorting
    const handleSort = (column) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
        fetchUsers(1, { sortBy: column, sortOrder: newOrder });
    };

    // NEW: Handle select all checkbox
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers(new Set());
        } else {
            const allUserIds = new Set(users.map(u => u.user_id));
            setSelectedUsers(allUserIds);
        }
        setSelectAll(!selectAll);
    };

    // NEW: Handle individual user selection
    const handleSelectUser = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
        setSelectAll(newSelected.size === users.length);
    };

    // NEW: Show bulk action confirmation modal
    const showBulkConfirmation = (status) => {
        if (selectedUsers.size === 0) return;
        setPendingBulkStatus(status);
        setShowBulkConfirmModal(true);
    };

    // NEW: Confirm and execute bulk status update
    const confirmBulkAction = async () => {
        if (selectedUsers.size === 0 || !pendingBulkStatus) {
            setShowBulkConfirmModal(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8000/admin/users/bulk-status', {
                user_ids: Array.from(selectedUsers),
                status: pendingBulkStatus
            });
            setShowBulkConfirmModal(false);
            setPendingBulkStatus('');
            setSelectedUsers(new Set());
            setSelectAll(false);
            fetchUsers(page);
            fetchStats();
            alert(response.data.message);
        } catch (error) {
            console.error('Error bulk updating status:', error);
            alert(error.response?.data?.detail || 'Failed to update user statuses');
            setShowBulkConfirmModal(false);
        }
    };

    // NEW: Cancel bulk action
    const cancelBulkAction = () => {
        setShowBulkConfirmModal(false);
        setPendingBulkStatus('');
    };

    // Get status label for display
    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'locked': return 'Locked';
            case 'disabled': return 'Disabled';
            default: return status;
        }
    };

    // NEW: Export users to CSV
    const handleExport = () => {
        if (users.length === 0) {
            alert('No users to export');
            return;
        }

        const headers = ['User ID', 'Username', 'Email', 'Phone', 'Status', 'Registered', 'Last Active'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                user.user_id,
                `"${(user.user_name || '').replace(/"/g, '""')}"`,
                `"${(user.email_address || '').replace(/"/g, '""')}"`,
                user.phone_number || '',
                user.status || 'active',
                user.created_at || '',
                user.last_login_at || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // NEW: Compute active filter count for filter pills
    const getActiveFilters = () => {
        const filters = [];
        if (searchQuery) filters.push({ key: 'search', label: `Username: ${searchQuery}`, clear: () => { setSearchQuery(''); fetchUsers(1, { search: '' }); } });
        if (emailSearch) filters.push({ key: 'email', label: `Email: ${emailSearch}`, clear: () => { setEmailSearch(''); fetchUsers(1, { emailSearch: '' }); } });
        if (phoneSearch) filters.push({ key: 'phone', label: `Phone: ${phoneSearch}`, clear: () => { setPhoneSearch(''); fetchUsers(1, { phoneSearch: '' }); } });
        if (statusFilter) filters.push({ key: 'status', label: `Status: ${statusFilter}`, clear: () => { setStatusFilter(''); fetchUsers(1, { status: '' }); } });
        if (registeredFrom) filters.push({ key: 'regFrom', label: `Reg From: ${registeredFrom}`, clear: () => { setRegisteredFrom(''); fetchUsers(1, { registeredFrom: '' }); } });
        if (registeredTo) filters.push({ key: 'regTo', label: `Reg To: ${registeredTo}`, clear: () => { setRegisteredTo(''); fetchUsers(1, { registeredTo: '' }); } });
        if (lastActiveFrom) filters.push({ key: 'actFrom', label: `Active From: ${lastActiveFrom}`, clear: () => { setLastActiveFrom(''); fetchUsers(1, { lastActiveFrom: '' }); } });
        if (lastActiveTo) filters.push({ key: 'actTo', label: `Active To: ${lastActiveTo}`, clear: () => { setLastActiveTo(''); fetchUsers(1, { lastActiveTo: '' }); } });
        return filters;
    };

    const activeFilters = getActiveFilters();

    // NEW: Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setEmailSearch('');
        setPhoneSearch('');
        setStatusFilter('');
        setRegisteredFrom('');
        setRegisteredTo('');
        setLastActiveFrom('');
        setLastActiveTo('');
        setSortBy('user_id');
        setSortOrder('desc');
        setSelectedUsers(new Set());
        setSelectAll(false);
        fetchUsers(1, {
            search: '', emailSearch: '', phoneSearch: '', status: '',
            registeredFrom: '', registeredTo: '', lastActiveFrom: '', lastActiveTo: '',
            sortBy: 'user_id', sortOrder: 'desc'
        });
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
            fetchStats();
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
            {/* Quick Stats Bar */}
            <div className="quick-stats-bar">
                <div className="stat-card">
                    <PeopleIcon className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.total_customers}</span>
                        <span className="stat-label">Total Customers</span>
                    </div>
                </div>
                <div className="stat-card">
                    <TrendingUpIcon className="stat-icon stat-icon--active" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.active_users_today}</span>
                        <span className="stat-label">Active Today</span>
                    </div>
                </div>
                <div className="stat-card">
                    <PersonAddIcon className="stat-icon stat-icon--new" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.new_customers_this_week}</span>
                        <span className="stat-label">New This Week</span>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            {activeFilters.length > 0 && (
                <div className="filter-pills-container">
                    <span className="filter-pills-label">Active Filters ({activeFilters.length}):</span>
                    {activeFilters.map((filter) => (
                        <span key={filter.key} className="filter-pill">
                            {filter.label}
                            <button onClick={filter.clear} className="filter-pill__remove">×</button>
                        </span>
                    ))}
                    <button onClick={handleResetFilters} className="filter-pills-clear-all">
                        Clear All
                    </button>
                </div>
            )}

            {/* Bulk Action Toolbar */}
            {selectedUsers.size > 0 && (
                <div className="bulk-action-toolbar">
                    <span className="bulk-action-toolbar__count">
                        {selectedUsers.size} user(s) selected
                    </span>
                    <div className="bulk-action-toolbar__actions">
                        <button
                            className="bulk-action-btn bulk-action-btn--active"
                            onClick={() => showBulkConfirmation('active')}
                        >
                            <CheckCircleIcon /> Set Active
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--locked"
                            onClick={() => showBulkConfirmation('locked')}
                        >
                            <LockIcon /> Lock
                        </button>
                        <button
                            className="bulk-action-btn bulk-action-btn--disabled"
                            onClick={() => showBulkConfirmation('disabled')}
                        >
                            <BlockIcon /> Disable
                        </button>
                    </div>
                    <button
                        className="bulk-action-toolbar__deselect"
                        onClick={() => { setSelectedUsers(new Set()); setSelectAll(false); }}
                    >
                        Deselect All
                    </button>
                </div>
            )}

            {/* Table Header with Filters */}
            <div className="user-table">
                <div className="user-table__header">
                    {/* Checkbox Column */}
                    <div className="user-table__cell user-table__cell--checkbox">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            title="Select all"
                        />
                    </div>
                    <div className="user-table__cell user-table__cell--username">
                        <div className="sortable-header" onClick={() => handleSort('user_name')}>
                            <span className="user-table__header-label">User name</span>
                            {sortBy === 'user_name' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
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
                        <div className="sortable-header" onClick={() => handleSort('email_address')}>
                            <span className="user-table__header-label">Email</span>
                            {sortBy === 'email_address' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
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
                        <div className="sortable-header" onClick={() => handleSort('created_at')}>
                            <span className="user-table__header-label">Registered</span>
                            {sortBy === 'created_at' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <div className="user-table__filter user-table__filter--daterange">
                            <input
                                type="date"
                                value={registeredFrom}
                                onChange={handleRegisteredFrom}
                                className="user-table__search user-table__search--date"
                                title="From date"
                            />
                            <span className="date-separator">-</span>
                            <input
                                type="date"
                                value={registeredTo}
                                onChange={handleRegisteredTo}
                                className="user-table__search user-table__search--date"
                                title="To date"
                            />
                        </div>
                    </div>
                    <div className="user-table__cell user-table__cell--lastactive">
                        <div className="sortable-header" onClick={() => handleSort('last_login_at')}>
                            <span className="user-table__header-label">Last active</span>
                            {sortBy === 'last_login_at' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <div className="user-table__filter user-table__filter--daterange">
                            <input
                                type="date"
                                value={lastActiveFrom}
                                onChange={handleLastActiveFrom}
                                className="user-table__search user-table__search--date"
                                title="From date"
                            />
                            <span className="date-separator">-</span>
                            <input
                                type="date"
                                value={lastActiveTo}
                                onChange={handleLastActiveTo}
                                className="user-table__search user-table__search--date"
                                title="To date"
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
                            onClick={handleResetFilters}
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
                            <div key={user.user_id} className={`user-table__row ${selectedUsers.has(user.user_id) ? 'user-table__row--selected' : ''}`}>
                                {/* Checkbox */}
                                <div className="user-table__cell user-table__cell--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(user.user_id)}
                                        onChange={() => handleSelectUser(user.user_id)}
                                    />
                                </div>
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

            {/* Export Section */}
            <div className="export-section">
                <button
                    className="export-btn"
                    onClick={handleExport}
                    title="Export to CSV"
                >
                    <FileDownloadIcon />
                    <span>Export to CSV</span>
                </button>
            </div>

            {/* Bulk Action Confirmation Modal */}
            {showBulkConfirmModal && (
                <div className="bulk-confirm-overlay" onClick={cancelBulkAction}>
                    <div className="bulk-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bulk-confirm-modal__header">
                            <h3>Confirm Bulk Action</h3>
                            <button className="bulk-confirm-modal__close" onClick={cancelBulkAction}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="bulk-confirm-modal__body">
                            <p className="bulk-confirm-modal__message">
                                Are you sure you want to set <strong>{selectedUsers.size}</strong> user(s) to
                                <span className={`bulk-confirm-modal__status bulk-confirm-modal__status--${pendingBulkStatus}`}>
                                    {' '}{getStatusLabel(pendingBulkStatus)}
                                </span>?
                            </p>
                            <p className="bulk-confirm-modal__warning">
                                This action will modify the status of all selected users.
                            </p>
                        </div>
                        <div className="bulk-confirm-modal__footer">
                            <button className="bulk-confirm-modal__btn bulk-confirm-modal__btn--cancel" onClick={cancelBulkAction}>
                                Cancel
                            </button>
                            <button className="bulk-confirm-modal__btn bulk-confirm-modal__btn--confirm" onClick={confirmBulkAction}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div
                        className={`user-profile-modal ${editMode ? 'edit-expanded' : ''} ${showOrderDetail ? 'detail-expanded' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
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

                                {/* Edit User Button */}
                                <button className="edit-user-btn" onClick={startEditMode}>
                                    {editMode ? 'Editing...' : 'Edit User Information'}
                                </button>
                            </div>

                            {/* Edit Form Panel (Left side - appears when editing) */}
                            {editMode && (
                                <div className="user-profile-modal__edit">
                                    <div className="edit-panel-header">
                                        <h4>Edit User</h4>
                                        <button className="close-edit-btn" onClick={cancelEditMode}>
                                            <CloseIcon />
                                        </button>
                                    </div>
                                    <div className="edit-panel-content">
                                        <div className={`edit-form-field ${editErrors.user_name ? 'has-error' : ''}`}>
                                            <label>Username <span className="required">*</span></label>
                                            <input
                                                type="text"
                                                name="user_name"
                                                value={editForm.user_name}
                                                onChange={handleEditChange}
                                                placeholder="2-50 characters"
                                            />
                                            {editErrors.user_name && <span className="field-error">{editErrors.user_name}</span>}
                                        </div>
                                        <div className={`edit-form-field ${editErrors.email_address ? 'has-error' : ''}`}>
                                            <label>Email <span className="required">*</span></label>
                                            <input
                                                type="email"
                                                name="email_address"
                                                value={editForm.email_address}
                                                onChange={handleEditChange}
                                                placeholder="Valid email address"
                                            />
                                            {editErrors.email_address && <span className="field-error">{editErrors.email_address}</span>}
                                        </div>
                                        <div className={`edit-form-field ${editErrors.phone_number ? 'has-error' : ''}`}>
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phone_number"
                                                value={editForm.phone_number}
                                                onChange={handleEditChange}
                                                placeholder="10 digits"
                                            />
                                            {editErrors.phone_number && <span className="field-error">{editErrors.phone_number}</span>}
                                        </div>
                                        <div className={`edit-form-field ${editErrors.age ? 'has-error' : ''}`}>
                                            <label>Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={editForm.age}
                                                onChange={handleEditChange}
                                                placeholder="0-122"
                                                min="0"
                                                max="122"
                                            />
                                            {editErrors.age && <span className="field-error">{editErrors.age}</span>}
                                        </div>
                                        <div className="edit-form-field">
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={editForm.gender}
                                                onChange={handleEditChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className={`edit-form-field ${editErrors.city ? 'has-error' : ''}`}>
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={editForm.city}
                                                onChange={handleEditChange}
                                                placeholder="City name"
                                            />
                                            {editErrors.city && <span className="field-error">{editErrors.city}</span>}
                                        </div>

                                        <div className="edit-panel-actions">
                                            <button
                                                className="edit-save-btn"
                                                onClick={handleUserUpdate}
                                                disabled={editLoading}
                                            >
                                                {editLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                className="edit-cancel-btn"
                                                onClick={cancelEditMode}
                                                disabled={editLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                                {/* Status Filter Dropdown */}
                                <div className="order-status-filter">
                                    <label>Filter by Status:</label>
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => handleOrderStatusChange(e.target.value)}
                                        className="status-filter-select"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="order-stats">
                                    <div className="order-stat">
                                        <span className="order-stat__value">{orderStats.total_orders}</span>
                                        <span className="order-stat__label">Orders</span>
                                    </div>
                                    <div className="order-stat">
                                        <span className="order-stat__value">${orderStats.total_spent.toLocaleString()}</span>
                                        <span className="order-stat__label">Total Spent (Delivered)</span>
                                    </div>
                                </div>

                                <div className="profile-order-list">
                                    {ordersLoading ? (
                                        <div className="orders-loading">Loading orders...</div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="orders-empty">No orders found</div>
                                    ) : (
                                        <div className="orders-table-container">
                                            <table className="orders-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Amount</th>
                                                        <th>Payment</th>
                                                        <th>Shipping</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userOrders.map((order) => (
                                                        <tr key={order.order_id} className={selectedOrderDetail?.order_id === order.order_id ? 'selected-row' : ''}>
                                                            <td>
                                                                <span
                                                                    className="clickable-order-id"
                                                                    onClick={() => fetchOrderDetail(order.order_id)}
                                                                >
                                                                    #{order.order_id}
                                                                </span>
                                                            </td>
                                                            <td>{order.order_date || 'N/A'}</td>
                                                            <td>
                                                                <span className={`order-status order-status--${order.status?.toLowerCase()}`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="order-amount">${order.order_total?.toFixed(2) || '0.00'}</td>
                                                            <td>{order.payment_method || '—'}</td>
                                                            <td>{order.shipping_method || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Detail Panel */}
                            {showOrderDetail && (
                                <div className="user-profile-modal__detail">
                                    <div className="order-detail-header">
                                        <h4>Order #{selectedOrderDetail?.order_id}</h4>
                                        <button className="close-detail-btn" onClick={closeOrderDetail}>
                                            <CloseIcon />
                                        </button>
                                    </div>
                                    {orderDetailLoading ? (
                                        <div className="order-detail-loading">Loading order details...</div>
                                    ) : selectedOrderDetail ? (
                                        <div className="order-detail-content">
                                            <div className="order-products">
                                                <h5>Products</h5>
                                                {selectedOrderDetail.items && selectedOrderDetail.items.length > 0 ? (
                                                    selectedOrderDetail.items.map((item, idx) => (
                                                        <div key={idx} className="order-product-item">
                                                            <div className="product-image-wrapper">
                                                                {item.product_image ? (
                                                                    <img
                                                                        src={item.product_image}
                                                                        alt={item.product_name || 'Product'}
                                                                        className="product-thumbnail"
                                                                    />
                                                                ) : (
                                                                    <div className="product-image-placeholder">
                                                                        <span>No Image</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="product-info">
                                                                <span className="product-name">{item.product_name || `Product #${item.product_id}`}</span>
                                                                <span className="product-qty">Qty: {item.quantity || 1}</span>
                                                            </div>
                                                            <span className="product-price">${(item.price || 0).toFixed(2)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="no-products">No product details available</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="order-detail-empty">No order selected</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
