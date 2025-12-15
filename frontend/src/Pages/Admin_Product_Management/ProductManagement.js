import React, { useState } from 'react';
import './ProductManagement.css';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import WarningIcon from '@mui/icons-material/Warning';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

/**
 * ProductManagement - Admin tab for managing products
 * UI skeleton matching Customer Management layout structure
 * 
 * NOTE: This is a UI-only implementation. No backend API calls yet.
 */
const ProductManagement = () => {
    // Sample static data for UI demonstration
    const [products] = useState([
        {
            product_id: 'P001',
            product_name: 'Sample Product 1',
            category: 'Electronics',
            price: 99.99,
            stock: 150,
            status: 'active',
            created_at: '2024-01-15'
        },
        {
            product_id: 'P002',
            product_name: 'Sample Product 2',
            category: 'Clothing',
            price: 49.99,
            stock: 0,
            status: 'out_of_stock',
            created_at: '2024-02-20'
        },
        {
            product_id: 'P003',
            product_name: 'Sample Product 3',
            category: 'Home & Kitchen',
            price: 199.99,
            stock: 25,
            status: 'active',
            created_at: '2024-03-10'
        },
        {
            product_id: 'P004',
            product_name: 'Sample Product 4',
            category: 'Electronics',
            price: 299.99,
            stock: 10,
            status: 'low_stock',
            created_at: '2024-03-15'
        },
        {
            product_id: 'P005',
            product_name: 'Sample Product 5',
            category: 'Books',
            price: 19.99,
            stock: 500,
            status: 'active',
            created_at: '2024-04-01'
        }
    ]);

    // Filter states (UI only, no actual filtering)
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('product_id');
    const [sortOrder, setSortOrder] = useState('desc');

    // Selection states
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    // Action menu state
    const [activeMenu, setActiveMenu] = useState(null);

    // Static stats for UI demonstration
    const stats = {
        total_products: 1250,
        active_listings: 1180,
        low_stock_count: 45
    };

    // Handle sort
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts(new Set());
        } else {
            const allIds = new Set(products.map(p => p.product_id));
            setSelectedProducts(allIds);
        }
        setSelectAll(!selectAll);
    };

    // Handle individual selection
    const handleSelectProduct = (productId) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
        setSelectAll(newSelected.size === products.length);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'status-badge status-badge--active';
            case 'out_of_stock': return 'status-badge status-badge--out-of-stock';
            case 'low_stock': return 'status-badge status-badge--low-stock';
            case 'discontinued': return 'status-badge status-badge--discontinued';
            default: return 'status-badge';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'out_of_stock': return 'Out of Stock';
            case 'low_stock': return 'Low Stock';
            case 'discontinued': return 'Discontinued';
            default: return status;
        }
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setStatusFilter('');
    };

    // Compute active filters
    const getActiveFilters = () => {
        const filters = [];
        if (searchQuery) {
            filters.push({ key: 'search', label: `Name: "${searchQuery}"`, clear: () => setSearchQuery('') });
        }
        if (categoryFilter) {
            filters.push({ key: 'category', label: `Category: ${categoryFilter}`, clear: () => setCategoryFilter('') });
        }
        if (statusFilter) {
            filters.push({ key: 'status', label: `Status: ${getStatusLabel(statusFilter)}`, clear: () => setStatusFilter('') });
        }
        return filters;
    };

    const activeFilters = getActiveFilters();

    return (
        <div className="admin-page__productmanagement">
            {/* Quick Stats Bar */}
            <div className="quick-stats-bar">
                <div className="stat-card">
                    <CategoryIcon className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.total_products}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                </div>
                <div className="stat-card">
                    <TrendingUpIcon className="stat-icon stat-icon--active" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.active_listings}</span>
                        <span className="stat-label">Active Listings</span>
                    </div>
                </div>
                <div className="stat-card">
                    <NewReleasesIcon className="stat-icon stat-icon--warning" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.low_stock_count}</span>
                        <span className="stat-label">Low Stock Items</span>
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
            {selectedProducts.size > 0 && (
                <div className="bulk-action-toolbar">
                    <span className="bulk-action-toolbar__count">
                        {selectedProducts.size} product(s) selected
                    </span>
                    <div className="bulk-action-toolbar__actions">
                        <button className="bulk-action-btn bulk-action-btn--active">
                            <CheckCircleIcon /> Activate
                        </button>
                        <button className="bulk-action-btn bulk-action-btn--warning">
                            <WarningIcon /> Mark Low Stock
                        </button>
                        <button className="bulk-action-btn bulk-action-btn--disabled">
                            <BlockIcon /> Discontinue
                        </button>
                    </div>
                    <button
                        className="bulk-action-toolbar__deselect"
                        onClick={() => { setSelectedProducts(new Set()); setSelectAll(false); }}
                    >
                        Deselect All
                    </button>
                </div>
            )}

            {/* Table Header with Filters */}
            <div className="product-table">
                <div className="product-table__header">
                    {/* Checkbox Column */}
                    <div className="product-table__cell product-table__cell--checkbox">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            title="Select all"
                        />
                    </div>

                    {/* Product Name Column */}
                    <div className="product-table__cell product-table__cell--name">
                        <div className="sortable-header" onClick={() => handleSort('product_name')}>
                            <span className="product-table__header-label">Product Name</span>
                            {sortBy === 'product_name' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <div className="product-table__filter">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="product-table__search"
                            />
                        </div>
                    </div>

                    {/* Category Column */}
                    <div className="product-table__cell product-table__cell--category">
                        <div className="sortable-header" onClick={() => handleSort('category')}>
                            <span className="product-table__header-label">Category</span>
                            {sortBy === 'category' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Home & Kitchen">Home & Kitchen</option>
                            <option value="Books">Books</option>
                        </select>
                    </div>

                    {/* Price Column */}
                    <div className="product-table__cell product-table__cell--price">
                        <div className="sortable-header" onClick={() => handleSort('price')}>
                            <span className="product-table__header-label">Price</span>
                            {sortBy === 'price' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Stock Column */}
                    <div className="product-table__cell product-table__cell--stock">
                        <div className="sortable-header" onClick={() => handleSort('stock')}>
                            <span className="product-table__header-label">Stock</span>
                            {sortBy === 'stock' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Status Column */}
                    <div className="product-table__cell product-table__cell--status">
                        <span className="product-table__header-label">Status</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="discontinued">Discontinued</option>
                        </select>
                    </div>

                    {/* Actions Column */}
                    <div className="product-table__cell product-table__cell--actions">
                        <button className="reset-filters-btn" onClick={handleResetFilters} title="Reset Filters">
                            <RestartAltIcon />
                        </button>
                        <button className="add-product-btn" title="Add Product">
                            <AddIcon />
                        </button>
                        <button className="export-btn" title="Export Products">
                            <FileDownloadIcon />
                        </button>
                    </div>
                </div>

                {/* Table Body */}
                <div className="product-table__body">
                    {products.map((product) => (
                        <div key={product.product_id} className="product-table__row">
                            <div className="product-table__cell product-table__cell--checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.has(product.product_id)}
                                    onChange={() => handleSelectProduct(product.product_id)}
                                />
                            </div>
                            <div className="product-table__cell product-table__cell--name">
                                <div className="product-info">
                                    <InventoryIcon className="product-icon" />
                                    <div className="product-details">
                                        <span className="product-name">{product.product_name}</span>
                                        <span className="product-id">ID: {product.product_id}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="product-table__cell product-table__cell--category">
                                {product.category}
                            </div>
                            <div className="product-table__cell product-table__cell--price">
                                ${product.price.toFixed(2)}
                            </div>
                            <div className="product-table__cell product-table__cell--stock">
                                {product.stock}
                            </div>
                            <div className="product-table__cell product-table__cell--status">
                                <span className={getStatusBadgeClass(product.status)}>
                                    {getStatusLabel(product.status)}
                                </span>
                            </div>
                            <div className="product-table__cell product-table__cell--actions">
                                <button
                                    className="action-menu-btn"
                                    onClick={() => setActiveMenu(activeMenu === product.product_id ? null : product.product_id)}
                                >
                                    <MoreVertIcon />
                                </button>
                                {activeMenu === product.product_id && (
                                    <div className="action-menu">
                                        <button className="action-menu__item">
                                            <CheckCircleIcon /> View Details
                                        </button>
                                        <button className="action-menu__item">
                                            <InventoryIcon /> Edit Product
                                        </button>
                                        <button className="action-menu__item action-menu__item--danger">
                                            <BlockIcon /> Discontinue
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <div className="pagination__info">
                    Showing 1-{products.length} of {products.length} products
                </div>
                <div className="pagination__controls">
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="pagination__per-page"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                    <div className="pagination__buttons">
                        <button className="pagination__btn" disabled>
                            <FirstPageIcon />
                        </button>
                        <button className="pagination__btn" disabled>
                            Prev
                        </button>
                        <span className="pagination__page">Page {page} of 1</span>
                        <button className="pagination__btn" disabled>
                            Next
                        </button>
                        <button className="pagination__btn" disabled>
                            <LastPageIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
