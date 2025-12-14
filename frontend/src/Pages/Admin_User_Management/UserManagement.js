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
                                            <span className="user-name">{user.user_name}</span>
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
        </div>
    );
};

export default UserManagement;
