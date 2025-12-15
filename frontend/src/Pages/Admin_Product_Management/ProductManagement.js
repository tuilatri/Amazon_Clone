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
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import StarIcon from '@mui/icons-material/Star';

/**
 * ProductManagement - Admin tab for managing products
 * UI skeleton matching Customer Management layout structure
 * 
 * Table columns based on database Product model:
 * - product_name
 * - main_category
 * - sub_category
 * - average_rating
 * - no_of_ratings
 * - discount_price_usd
 * - actual_price_usd
 */
const ProductManagement = () => {
    // Sample static data matching database fields
    const [products] = useState([
        {
            product_id: 'P001',
            product_name: 'Wireless Bluetooth Headphones',
            main_category: 'Electronics',
            sub_category: 'Audio',
            average_rating: 4.5,
            no_of_ratings: 1250,
            discount_price_usd: 79.99,
            actual_price_usd: 129.99
        },
        {
            product_id: 'P002',
            product_name: 'Cotton T-Shirt Premium',
            main_category: 'Clothing',
            sub_category: 'Men\'s Fashion',
            average_rating: 4.2,
            no_of_ratings: 856,
            discount_price_usd: 24.99,
            actual_price_usd: 39.99
        },
        {
            product_id: 'P003',
            product_name: 'Stainless Steel Cookware Set',
            main_category: 'Home & Kitchen',
            sub_category: 'Cookware',
            average_rating: 4.7,
            no_of_ratings: 2340,
            discount_price_usd: 149.99,
            actual_price_usd: 249.99
        },
        {
            product_id: 'P004',
            product_name: 'Smartphone Fast Charger',
            main_category: 'Electronics',
            sub_category: 'Accessories',
            average_rating: 4.3,
            no_of_ratings: 3120,
            discount_price_usd: 19.99,
            actual_price_usd: 34.99
        },
        {
            product_id: 'P005',
            product_name: 'Programming Guide Book',
            main_category: 'Books',
            sub_category: 'Technology',
            average_rating: 4.8,
            no_of_ratings: 567,
            discount_price_usd: 29.99,
            actual_price_usd: 49.99
        }
    ]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [mainCategoryFilter, setMainCategoryFilter] = useState('');
    const [subCategoryFilter, setSubCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('product_name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Selection states
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    // Action menu state
    const [activeMenu, setActiveMenu] = useState(null);

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

    // Handle reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setMainCategoryFilter('');
        setSubCategoryFilter('');
    };

    // Handle export (placeholder)
    const handleExport = () => {
        console.log('Export products clicked');
        // TODO: Implement backend export functionality
    };

    // Compute active filters
    const getActiveFilters = () => {
        const filters = [];
        if (searchQuery) {
            filters.push({ key: 'search', label: `Name: "${searchQuery}"`, clear: () => setSearchQuery('') });
        }
        if (mainCategoryFilter) {
            filters.push({ key: 'main_category', label: `Main: ${mainCategoryFilter}`, clear: () => setMainCategoryFilter('') });
        }
        if (subCategoryFilter) {
            filters.push({ key: 'sub_category', label: `Sub: ${subCategoryFilter}`, clear: () => setSubCategoryFilter('') });
        }
        return filters;
    };

    const activeFilters = getActiveFilters();

    // Render star rating
    const renderRating = (rating) => {
        return (
            <div className="rating-display">
                <StarIcon className="rating-star" />
                <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="admin-page__productmanagement">
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

            {/* Product Table */}
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

                    {/* Main Category Column */}
                    <div className="product-table__cell product-table__cell--main-category">
                        <div className="sortable-header" onClick={() => handleSort('main_category')}>
                            <span className="product-table__header-label">Main Category</span>
                            {sortBy === 'main_category' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <select
                            value={mainCategoryFilter}
                            onChange={(e) => setMainCategoryFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Home & Kitchen">Home & Kitchen</option>
                            <option value="Books">Books</option>
                        </select>
                    </div>

                    {/* Sub Category Column */}
                    <div className="product-table__cell product-table__cell--sub-category">
                        <div className="sortable-header" onClick={() => handleSort('sub_category')}>
                            <span className="product-table__header-label">Sub Category</span>
                            {sortBy === 'sub_category' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                        <select
                            value={subCategoryFilter}
                            onChange={(e) => setSubCategoryFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                        </select>
                    </div>

                    {/* Average Rating Column */}
                    <div className="product-table__cell product-table__cell--rating">
                        <div className="sortable-header" onClick={() => handleSort('average_rating')}>
                            <span className="product-table__header-label">Avg Rating</span>
                            {sortBy === 'average_rating' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Number of Ratings Column */}
                    <div className="product-table__cell product-table__cell--num-ratings">
                        <div className="sortable-header" onClick={() => handleSort('no_of_ratings')}>
                            <span className="product-table__header-label"># Ratings</span>
                            {sortBy === 'no_of_ratings' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Discount Price Column */}
                    <div className="product-table__cell product-table__cell--discount-price">
                        <div className="sortable-header" onClick={() => handleSort('discount_price_usd')}>
                            <span className="product-table__header-label">Discount ($)</span>
                            {sortBy === 'discount_price_usd' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Actual Price Column */}
                    <div className="product-table__cell product-table__cell--actual-price">
                        <div className="sortable-header" onClick={() => handleSort('actual_price_usd')}>
                            <span className="product-table__header-label">Actual ($)</span>
                            {sortBy === 'actual_price_usd' && (
                                sortOrder === 'asc' ? <ArrowUpwardIcon className="sort-icon" /> : <ArrowDownwardIcon className="sort-icon" />
                            )}
                        </div>
                    </div>

                    {/* Actions Column */}
                    <div className="product-table__cell product-table__cell--actions">
                        <button className="reset-filters-btn" onClick={handleResetFilters} title="Reset Filters">
                            <RestartAltIcon />
                        </button>
                        <button className="add-product-btn" title="Add Product">
                            <AddIcon />
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
                            <div className="product-table__cell product-table__cell--main-category">
                                {product.main_category}
                            </div>
                            <div className="product-table__cell product-table__cell--sub-category">
                                {product.sub_category}
                            </div>
                            <div className="product-table__cell product-table__cell--rating">
                                {renderRating(product.average_rating)}
                            </div>
                            <div className="product-table__cell product-table__cell--num-ratings">
                                {product.no_of_ratings.toLocaleString()}
                            </div>
                            <div className="product-table__cell product-table__cell--discount-price">
                                ${product.discount_price_usd.toFixed(2)}
                            </div>
                            <div className="product-table__cell product-table__cell--actual-price">
                                ${product.actual_price_usd.toFixed(2)}
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

            {/* Export Section - Below table */}
            <div className="export-section">
                <button className="export-btn" onClick={handleExport} title="Export Products to CSV">
                    <FileDownloadIcon />
                    <span>Export Products</span>
                </button>
            </div>
        </div>
    );
};

export default ProductManagement;
