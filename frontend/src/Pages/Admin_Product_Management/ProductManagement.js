import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ProductManagement.css';
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
import InventoryIcon from '@mui/icons-material/Inventory';

/**
 * ProductManagement - Admin tab for managing products
 * Fetches products from database and displays in a table matching Customer Management layout
 */
const ProductManagement = () => {
    // Products state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);

    // Categories state for filters
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [mainCategoryFilter, setMainCategoryFilter] = useState('');
    const [subCategoryFilter, setSubCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('product_name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Selection states
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Action menu state
    const [activeMenu, setActiveMenu] = useState(null);

    // Image loading states for skeleton
    const [imageLoadingStates, setImageLoadingStates] = useState({});

    // Handle image load complete
    const handleImageLoad = (productId) => {
        setImageLoadingStates(prev => ({ ...prev, [productId]: 'loaded' }));
    };

    // Handle image error
    const handleImageError = (productId) => {
        setImageLoadingStates(prev => ({ ...prev, [productId]: 'error' }));
    };

    // Fetch products from API
    const fetchProducts = useCallback(async (pageNum = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum,
                per_page: perPage,
                search: searchQuery,
                main_category: mainCategoryFilter,
                sub_category: subCategoryFilter,
                sort_by: sortBy,
                sort_order: sortOrder
            });

            const response = await axios.get(`http://localhost:8000/admin/products?${params}`);
            setProducts(response.data.products);
            setTotal(response.data.total);
            setTotalPages(response.data.total_pages);
            setPage(response.data.page);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchQuery, mainCategoryFilter, subCategoryFilter, sortBy, sortOrder]);

    // Fetch categories for filters
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/admin/products/categories');
            setMainCategories(response.data.main_categories || []);
            setSubCategories(response.data.sub_categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchProducts(1);
        fetchCategories();
    }, []);

    // Reload when filters change (with debounce for search)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, mainCategoryFilter, subCategoryFilter, sortBy, sortOrder, perPage]);

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

    // Handle reset filters (including sorting)
    const handleResetFilters = () => {
        setSearchQuery('');
        setMainCategoryFilter('');
        setSubCategoryFilter('');
        // Reset sorting to default
        setSortBy('average_rating');
        setSortOrder('desc');
    };

    // Handle export - downloads CSV from backend
    const handleExport = async () => {
        try {
            const params = new URLSearchParams({
                sort_by: sortBy,
                sort_order: sortOrder
            });

            const response = await axios.get(`http://localhost:8000/admin/products/export?${params}`, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting products:', error);
            alert('Failed to export products. Please try again.');
        }
    };

    // Pagination handlers
    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    const handleFirstPage = () => fetchProducts(1);
    const handleLastPage = () => fetchProducts(totalPages);
    const handlePrevPage = () => page > 1 && fetchProducts(page - 1);
    const handleNextPage = () => page < totalPages && fetchProducts(page + 1);

    // Calculate pagination info
    const startItem = total > 0 ? (page - 1) * perPage + 1 : 0;
    const endItem = Math.min(page * perPage, total);

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

                    {/* Product Name Column - Not sortable */}
                    <div className="product-table__cell product-table__cell--name">
                        <div className="non-sortable-header">
                            <span className="product-table__header-label">Product Name</span>
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

                    {/* Main Category Column - Not sortable */}
                    <div className="product-table__cell product-table__cell--main-category">
                        <div className="non-sortable-header">
                            <span className="product-table__header-label">Main Category</span>
                        </div>
                        <select
                            value={mainCategoryFilter}
                            onChange={(e) => setMainCategoryFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                            {mainCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub Category Column - Not sortable */}
                    <div className="product-table__cell product-table__cell--sub-category">
                        <div className="non-sortable-header">
                            <span className="product-table__header-label">Sub Category</span>
                        </div>
                        <select
                            value={subCategoryFilter}
                            onChange={(e) => setSubCategoryFilter(e.target.value)}
                            className="product-table__select"
                        >
                            <option value="">All</option>
                            {subCategories.slice(0, 20).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
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
                    {loading ? (
                        <div className="product-table__loading">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="product-table__empty">No products found.</div>
                    ) : (
                        products.map((product) => (
                            <div key={product.product_id} className={`product-table__row ${selectedProducts.has(product.product_id) ? 'product-table__row--selected' : ''}`}>
                                <div className="product-table__cell product-table__cell--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(product.product_id)}
                                        onChange={() => handleSelectProduct(product.product_id)}
                                    />
                                </div>
                                <div className="product-table__cell product-table__cell--name">
                                    <div className="product-info">
                                        <div className="product-image-container">
                                            {imageLoadingStates[product.product_id] === 'error' || !product.product_image ? (
                                                <div className="product-image-skeleton">
                                                    <InventoryIcon className="product-icon" />
                                                </div>
                                            ) : (
                                                <>
                                                    {imageLoadingStates[product.product_id] !== 'loaded' && (
                                                        <div className="product-image-skeleton"></div>
                                                    )}
                                                    <img
                                                        src={product.product_image}
                                                        alt={product.product_name}
                                                        className={`product-image ${imageLoadingStates[product.product_id] === 'loaded' ? 'product-image--loaded' : 'product-image--loading'}`}
                                                        onLoad={() => handleImageLoad(product.product_id)}
                                                        onError={() => handleImageError(product.product_id)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <span className="product-name" title={product.product_name}>
                                            {product.product_name.length > 60
                                                ? product.product_name.substring(0, 60) + '...'
                                                : product.product_name}
                                        </span>
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
                                    {product.discount_price_usd ? `$${product.discount_price_usd.toFixed(2)}` : '-'}
                                </div>
                                <div className="product-table__cell product-table__cell--actual-price">
                                    {product.actual_price_usd ? `$${product.actual_price_usd.toFixed(2)}` : '-'}
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
                        ))
                    )}
                </div>
            </div>

            {/* Pagination - Matching Customer Management */}
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
                                onClick={() => fetchProducts(pageNum)}
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
                <button className="export-btn" onClick={handleExport} title="Export Products to CSV">
                    <FileDownloadIcon />
                    <span>Export Products</span>
                </button>
            </div>
        </div >
    );
};

export default ProductManagement;
