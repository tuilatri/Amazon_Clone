import React, { useEffect, useRef, useState } from 'react';
import "./NavBar.css";
import amazon_logo from "../../Assets/amazon_logo.png";
import vietnam from '../../Assets/vietnam.png';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Link, useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from "framer-motion"
import LanguageIcon from '@mui/icons-material/Language';
import { useSelector, useDispatch } from 'react-redux';
import { callAPI } from '../../Utils/CallAPI';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';

const NavBar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [category, setCategory] = useState("All");

    const handleNavigate = () => {
        navigate('/');
    };
    const [showAll, setShowAll] = useState(false);
    const allItems = [
        { main_category_encoded: 15, title: "stores" },
        { main_category_encoded: 4, title: "car & motorbike" },
        { main_category_encoded: 7, title: "home, kitchen, pets" },
        { main_category_encoded: 13, title: "pet supplies" },
        { main_category_encoded: 6, title: "home & kitchen" },
        { main_category_encoded: 11, title: "men's shoes" },
        { main_category_encoded: 0, title: "accessories" },
        { main_category_encoded: 3, title: "beauty & health" },
        { main_category_encoded: 16, title: "toys & baby products" },
        { main_category_encoded: 12, title: "music" },
        { main_category_encoded: 14, title: "sports & fitness" },
        { main_category_encoded: 17, title: "tv, audio & cameras" },
        { main_category_encoded: 19, title: "women's shoes" },
        { main_category_encoded: 1, title: "appliances" },
        { main_category_encoded: 5, title: "grocery & gourmet foods" },
        { main_category_encoded: 9, title: "kids' fashion" },
        { main_category_encoded: 2, title: "bags & luggage" },
        { main_category_encoded: 10, title: "men's clothing" },
        { main_category_encoded: 8, title: "industrial supplies" },
        { main_category_encoded: 18, title: "women's clothing" }
    ];

    const categoryMapping = {
        "stores": 15,
        "car & motorbike": 4,
        "home, kitchen, pets": 7,
        "pet supplies": 13,
        "home & kitchen": 6,
        "men's shoes": 11,
        "accessories": 0,
        "beauty & health": 3,
        "toys & baby products": 16,
        "music": 12,
        "sports & fitness": 14,
        "tv, audio & cameras": 17,
        "women's shoes": 19,
        "appliances": 1,
        "grocery & gourmet foods": 5,
        "kids' fashion": 9,
        "bags & luggage": 2,
        "men's clothing": 10,
        "industrial supplies": 8,
        "women's clothing": 18
    };

    // Reverse mapping: encoded ID -> category title
    const categoryNameMapping = {
        "0": "Accessories", "1": "Appliances", "2": "Bags & Luggage",
        "3": "Beauty & Health", "4": "Car & Motorbike", "5": "Grocery & Gourmet Foods",
        "6": "Home & Kitchen", "7": "Home, Kitchen, Pets", "8": "Industrial Supplies",
        "9": "Kids' Fashion", "10": "Men's Clothing", "11": "Men's Shoes",
        "12": "Music", "13": "Pet Supplies", "14": "Sports & Fitness",
        "15": "Stores", "16": "Toys & Baby Products", "17": "TV, Audio & Cameras",
        "18": "Women's Clothing", "19": "Women's Shoes"
    };

    // Get current location to determine active category
    const location = useLocation();
    const currentCategoryFromUrl = location.pathname.match(/\/Product\/(\d+)/)?.[1] || null;
    const displayedCategoryName = currentCategoryFromUrl ? categoryNameMapping[currentCategoryFromUrl] || "All" : "All";

    const [sidebar, setSiderbar] = useState(false)

    const ref = useRef();
    useEffect(() => {
        document.body.addEventListener("click", (e) => {
            if (e.target.contains(ref.current)) {
                setSiderbar(false);
            }
        });
    }, [ref, sidebar]);

    const CartItems = useSelector((state) => state.cart.items);
    const [backendCartCount, setBackendCartCount] = useState(0);
    const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

    // Function to fetch cart count from backend
    const fetchCartCount = async () => {
        if (isAuthenticated && user?.email_address) {
            try {
                const response = await axios.post("http://localhost:8000/cart", {
                    type: "display",
                    user_email: user.email_address
                });
                if (response.data.cart && Array.isArray(response.data.cart)) {
                    // Sum up all quantities for total item count
                    const totalQuantity = response.data.cart.reduce(
                        (sum, item) => sum + (item.quantity || 1), 0
                    );
                    setBackendCartCount(totalQuantity);
                }
            } catch (error) {
                console.error("Error fetching cart count:", error);
            }
        } else {
            setBackendCartCount(0);
        }
    };

    // Fetch cart count on mount, when user changes, and when triggered by cart updates
    useEffect(() => {
        fetchCartCount();
    }, [isAuthenticated, user?.email_address, cartUpdateTrigger]);

    // Listen for cart update events from other components (Cart.js)
    useEffect(() => {
        const handleCartUpdate = (event) => {
            if (event.key === 'cartUpdated') {
                setCartUpdateTrigger(prev => prev + 1);
            }
        };

        // Also listen for custom event for same-tab updates
        const handleCustomCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('storage', handleCartUpdate);
        window.addEventListener('cartUpdated', handleCustomCartUpdate);

        return () => {
            window.removeEventListener('storage', handleCartUpdate);
            window.removeEventListener('cartUpdated', handleCustomCartUpdate);
        };
    }, [isAuthenticated, user?.email_address]);

    // Calculate total quantity from Redux store
    const reduxCartTotal = CartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Use the maximum of Redux cart total and backend cart total
    // This ensures immediate updates (Redux) and persistence after reload (backend)
    const cartCount = Math.max(reduxCartTotal, backendCartCount);
    // When a category is selected
    const handleCategorySelect = (categoryTitle) => {
        // Handle "All" selection
        if (categoryTitle === "All") {
            navigate('/Product');
            setShowAll(false);
            return;
        }

        const mainCategoryEncoded = categoryMapping[categoryTitle]; // Get main_category_encoded
        if (mainCategoryEncoded === undefined) {
            console.error("Category title not found in mapping:", categoryTitle);
            return; // Stop execution if the category title is invalid
        }
        navigate(`/Product/${mainCategoryEncoded}`); // Navigate with the encoded value
        setShowAll(false); // Close the dropdown after selection
    };
    const handleProfileClick = () => {
        navigate('/UserPage');
    };

    const handleLogOutClick = () => {
        logout();
        navigate('/');
    };

    // khĂºc nĂ y lĂ m suggestion cho search bar
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getSuggestions = async (query) => {
        fetch(`http://localhost:8000/products/search?query=${query}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch suggestions");
                }
                return response.json();
            })
            .then((data) => {
                setSuggestions(data.products || []); // Adjust for the API response format
            })
            .catch((error) => {
                console.error("Error fetching suggestions:", error);
            });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) { // Only fetch if searchTerm is non-empty
                getSuggestions(searchTerm);
            } else {
                setSuggestions([]); // Clear suggestions for empty input
            }
        }, 300); // Add debounce to reduce API calls

        return () => clearTimeout(delayDebounceFn); // Cleanup debounce timer
    }, [searchTerm]);


    const navigate = useNavigate();

    const onHandleSubmit = (e) => {
        e.preventDefault();
        navigate({
            pathname: "/search",
            search: `?${createSearchParams({ category, searchTerm })}`,
        });
        setSearchTerm("");
        setCategory("All");
    };
    // State to control dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Function to toggle the dropdown menu visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };
    // háº¿t pháº§n suggestion cho search bar
    // console.log(userData)
    return (
        <div className="navbar__component">
            {/* NavBar trĂªn */}
            <div className="navbar__up">
                {/* bĂªn trĂ¡i */}
                <div className="navbar__up__left">
                    {/* logo */}
                    <div>
                        {/* Option 1: Using navigate with button */}
                        <button onClick={handleNavigate} className="navbar__logo">
                            <img className="amazon__logo" src={amazon_logo} alt="amazon_logo" />
                        </button>
                    </div>

                    {/* vá»‹ trĂ­ */}
                    <div className="navbar__location">
                        <div className="location__img">
                            <LocationOnOutlinedIcon className="location__icon" sx={{ fontSize: "22px" }} />
                        </div>
                        <div className="navbar__location__place">
                            <div className="place__top">
                                Deliver to
                            </div>
                            <div className="place__bottom">
                                Vietnam
                            </div>
                        </div>
                    </div>
                </div>


                {/* á»Ÿ giá»¯a */}
                <div className="searchbox__middle">
                    {/* Search Box */}
                    <div className="navbar__searchbox">
                        {/* All Categories Dropdown */}
                        <div className="searchbox__box">
                            <div
                                className="searchbox__all"
                                onClick={() => setShowAll(!showAll)}
                            >
                                <div className="searchbox__all__text">{displayedCategoryName}</div>
                                <ArrowDropDownOutlinedIcon sx={{ fontSize: "20px" }} />
                            </div>

                            {/* Dropdown list of categories */}
                            {showAll && (
                                <div>
                                    <ul className="searchbox__all__textbox">
                                        {/* All option - shows all products */}
                                        <li
                                            className="textbox__text"
                                            key="all"
                                            onClick={() => handleCategorySelect("All")}
                                            style={{ fontWeight: !currentCategoryFromUrl ? 'bold' : 'normal' }}
                                        >
                                            All
                                        </li>
                                        {allItems.map(item => (
                                            <li
                                                className="textbox__text"
                                                key={item.main_category_encoded}
                                                onClick={() => handleCategorySelect(item.title)}
                                            >
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}


                            {/* Search Input */}
                            <input
                                type="text"
                                className="searchbox__input"
                                placeholder="Search Amazon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Search Icon */}
                            <div className="searchbox__icon" onClick={onHandleSubmit}>
                                <SearchOutlinedIcon sx={{ fontSize: "26px" }} />
                            </div>
                        </div>
                        {
                            suggestions && searchTerm && (
                                <div className="suggestion__box">
                                    {
                                        suggestions
                                            .filter((Product) => {
                                                const currentSearchTerm = searchTerm.toLowerCase();
                                                const title = Product.product_name.toLowerCase(); // Match with `name` field from JSON
                                                return title.includes(currentSearchTerm);
                                            })
                                            .slice(0, 10)
                                            .map((Product) => (
                                                <div key={Product.product_id} onClick={() => setSearchTerm(Product.product_name)}>
                                                    {Product.product_name}
                                                </div>
                                            ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* bĂªn pháº£i */}
                <div className="navbar__up__right">
                    {/* ngĂ´n ngá»¯ */}
                    <div className="vietnam__logo">
                        <img src={vietnam} className="vietnam__flag" alt="vietnam_logo" />
                        <div className="vietnam__text">
                            VN <ArrowDropDownOutlinedIcon sx={{ fontSize: 16, marginLeft: -0.4 }} className="vietnam__dropdown" />
                        </div>
                    </div>

                    {/* tĂ i khoáº£n */}
                    <div className="account" onClick={toggleDropdown}>
                        <div className="account__left">
                            <div className="account__up">
                                {isAuthenticated && user ? `Hello, ${user.user_name}` : "Hello, Sign in"}
                            </div>
                            <div className="account__down">
                                Accounts & Lists
                            </div>
                        </div>
                        <div className="account__right">
                            <ArrowDropDownOutlinedIcon sx={{ fontSize: 16 }} className="account__dropdown" />
                        </div>

                        {/* Conditional Dropdown Menu */}
                        <div
                            className={`account__dropdownMenu ${isDropdownOpen ? 'open' : ''}`}
                        >
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/SignUp" className="account__dropdownOption">
                                        Sign Up
                                    </Link>
                                    <Link to="/SignIn" className="account__dropdownOption">
                                        Sign In
                                    </Link>
                                    <Link to="/ForgetPassword" className="account__dropdownOption">
                                        Forget Password
                                    </Link>
                                </>
                            ) : (
                                <div>
                                    <div onClick={handleProfileClick} className="account__dropdownOption">
                                        Your Profile
                                    </div>
                                    <div onClick={handleLogOutClick} className="account__dropdownOption">
                                        Log Out
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* hoĂ n tráº£ */}
                    {/* Conditional rendering based on role */}
                    {isAuthenticated && user?.role === 1 ? (
                        /* Admin UI - System Management replaces Return and Cart */
                        <Link to="/admin" className="admin-nav-link">
                            <div className="admin-nav-content">
                                <SettingsIcon className="admin-nav-icon" />
                                <div className="admin-nav-text">
                                    <div className="admin-nav-label">System</div>
                                    <div className="admin-nav-title">Management</div>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        /* Normal User / Supplier UI - Return and Cart */
                        <>
                            <Link to="/Orders" className="return">
                                <div className="return__up">
                                    Returns
                                </div>
                                <div className="return__down">
                                    & Orders
                                </div>
                            </Link>

                            {/* giá» hĂ ng */}
                            <Link
                                to="/Cart" // Pass userData via state
                                className="cart"
                            >
                                <span className="cart__up">
                                    {cartCount}
                                </span>
                                <div className="cart__down">
                                    <ShoppingCartOutlinedIcon className="cart__icon" />
                                </div>
                                <div className="cart__title">
                                    Cart
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* NavBar dÆ°á»›i */}
            <div className="navbar__down">
                <div className="navbar__down__left">
                    <div className="option" onClick={() => setSiderbar(true)}>
                        <MenuOutlinedIcon sx={{ fontSize: "24px" }} />
                        <div className="option__text">
                            All
                        </div>
                    </div>


                    <Link to={'/Product'} className="type">
                        <div className="type__text">
                            Today's Deals
                        </div>
                    </Link>

                    <div className="type">
                        <div className="type__text">
                            Customer Service
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Registry
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Gift Cards
                        </div>
                    </div>

                    <div className="type">
                        <div className="type__text">
                            Sell
                        </div>
                    </div>
                </div>
            </div>

            {/* navbar bĂªn trĂ¡i */}
            {
                sidebar && (
                    <div className="sidebar__screen">
                        <div className="sidebar__all">
                            <motion.div ref={ref} initial={{ x: -500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="sidebar__box">

                                {/* signin */}
                                <div className="sidebar__signin">
                                    <AccountCircleIcon />
                                    <h3 className="sidebar__signin__text">
                                        Hello, User
                                    </h3>
                                </div>

                                <div className="sidebar__wrap">
                                    {/* block 1 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Digital Content & Devices
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Music
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Kindle E-readers & Books
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Appstore
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                        </ul>
                                    </div>

                                    {/* block 2 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Shop by Department
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Electronics
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Computers
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Smart Home
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Arts & Crafts
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Automotive
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Baby
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Beauty and Personal Care
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Women's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Men's Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Girls' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Boys' Fashion
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Health and Household
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Home and Kitchen
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Industrial and Scientific
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Luggage
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Movies and Televisions
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Pet Supplies
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Software
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Sports and Outdoors
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Tools and Home Improvements
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Toys and Games
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Video Games
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                        </ul>
                                    </div>

                                    {/* block 3 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Programs and Features
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Gift Cards
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <li className="sidebar__component__text">
                                                Shop By Interest
                                            </li>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Amazon Live
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                International Shopping
                                                <span>
                                                    <ArrowForwardIosIcon />
                                                </span>
                                            </Link>
                                            <li className="sidebar__component__text">
                                                Amazon Second Chance
                                            </li>
                                        </ul>
                                    </div>

                                    {/* block 4 */}
                                    <div className="sidebar__component">
                                        <h3 className="sidebar__heading">
                                            Help and Settings
                                        </h3>
                                        <ul className="sidebar__component__box">
                                            <li className="sidebar__component__text">
                                                Your Account
                                            </li>
                                            <li className="sidebar__component__text--modified">
                                                <span>
                                                    <LanguageIcon />
                                                </span>
                                                English
                                            </li>
                                            <li className="sidebar__component__text--modified">
                                                <span>
                                                    <img src={vietnam} className="vietnam__flag" alt="vietnam_logo" />
                                                </span>
                                                Viet Nam
                                            </li>
                                            <Link to={'/Product'} className="sidebar__component__text">
                                                Customer Services
                                            </Link>
                                        </ul>
                                    </div>
                                </div>

                                {/* nĂºt Ä‘Ă³ng */}
                                <span className="sidebar__close__icon" onClick={() => setSiderbar(false)}>
                                    <CloseIcon />
                                </span>
                            </motion.div>
                        </div>
                    </div>
                )
            }

        </div>
    );
}

export default NavBar;
