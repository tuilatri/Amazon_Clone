import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../Components/Navbar/Navigation";
import Footer from "../../Components/Footer/Footer";
import "./Checkout.css";
import { GB_CURRENCY } from '../../Utils/constants';
import { useDispatch } from 'react-redux';
import { ClearCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const Checkout = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const Dispatch = useDispatch();

    // User info derived from AuthContext
    const userInfo = {
        name: user?.user_name || '',
        email: user?.email_address || '',
        phone: user?.phone_number || '',
        age: user?.age || '',
        gender: user?.gender || '',
        city: user?.city || '',
    };

    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch cart items from backend
    const fetchCartItems = async () => {
        if (!userInfo.email) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/cart", {
                type: "display",
                user_email: userInfo.email
            });

            if (response.data.cart && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            toast.error("Failed to load cart items.");
        } finally {
            setLoading(false);
        }
    };

    // Load cart items and selection state on mount
    useEffect(() => {
        if (userInfo.email) {
            fetchCartItems();
        } else {
            setLoading(false);
        }
    }, [user?.email_address]);

    // Load selection state from localStorage after cart items are loaded
    useEffect(() => {
        if (cartItems.length > 0 && userInfo.email) {
            const storageKey = `cartSelection_${userInfo.email}`;
            const savedSelection = localStorage.getItem(storageKey);

            if (savedSelection) {
                try {
                    const savedIds = JSON.parse(savedSelection);
                    // Filter to only items that exist in cart and are selected
                    const selectedCartItems = cartItems.filter(item =>
                        savedIds.includes(item.product_id || item.id)
                    );
                    setSelectedItems(selectedCartItems);
                } catch (e) {
                    console.error("Error parsing saved selection:", e);
                    // Fallback: use all cart items
                    setSelectedItems(cartItems);
                }
            } else {
                // No saved selection - use all items
                setSelectedItems(cartItems);
            }
        }
    }, [cartItems, userInfo.email]);

    // Calculate total cost for selected items
    const subtotal = selectedItems.reduce((total, item) => {
        const quantity = item.quantity || 1;
        const price = parseFloat(item.discount_price_usd) || parseFloat(item.price) || 0;
        return total + (quantity * price);
    }, 0);

    // Calculate total quantity
    const totalQuantity = selectedItems.reduce((total, item) => total + (item.quantity || 1), 0);

    const HandleProceed = async () => {
        if (selectedItems.length === 0) {
            toast.warn("No items selected for checkout.");
            return;
        }

        try {
            // Clear the cart after successful checkout
            await axios.post("http://localhost:8000/cart", {
                type: "remove-all",
                user_email: userInfo.email
            });

            Dispatch(ClearCart());

            // Clear selection from localStorage
            const storageKey = `cartSelection_${userInfo.email}`;
            localStorage.removeItem(storageKey);

            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));

            toast.success("Order Completed! Thank you for your purchase.", {
                position: "bottom-right"
            });

            // Redirect to home after delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error("Error completing order:", error);
            toast.error("Failed to complete order. Please try again.");
        }
    };

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="checkout">
                <NavBar />
                <div className="checkout__container">
                    <div className="checkout__title">
                        Please log in to proceed with checkout
                    </div>
                    <div className="checkout__section">
                        <Link to="/SignIn" className="checkout__button">
                            Sign In
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="checkout">
                <NavBar />
                <div className="checkout__container">
                    <div className="checkout__title">Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="checkout">
            <NavBar />
            <div className="checkout__container">
                {/* checkout title */}
                <div className="checkout__title">
                    Checkout ({totalQuantity} items)
                </div>

                {/* checkout shows items */}
                <div className="checkout__section">
                    <div className="checkout__part">
                        <h3>Review Items</h3>
                    </div>
                    <div className="checkout__showitems">
                        {selectedItems.length === 0 ? (
                            <div className="checkout__empty">
                                No items selected. Please go back to <Link to="/Cart">Cart</Link> and select items.
                            </div>
                        ) : (
                            selectedItems.map((item, ind) => (
                                <div className="checkout__showitems__block" key={item.product_id || ind}>
                                    <div className="checkout__showitems__leftblock">
                                        <div className="checkout__showitems__leftblock__image">
                                            <img
                                                className="checkout__showitems__leftblockimg"
                                                src={item.product_image || item.imageUrl}
                                                alt={item.product_name || item.name}
                                            />
                                        </div>
                                        <div className="checkout__showitems__leftblock__details">
                                            <div className="checkout__showitems__leftblock__name">
                                                {item.product_name || item.name}
                                            </div>
                                            <div className="checkout__showitems__leftblock__quantity">
                                                Quantity: {item.quantity || 1}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="checkout__showitems__rightblock">
                                        <div className="checkout__showitems__rightblock__price">
                                            {GB_CURRENCY.format(
                                                (item.quantity || 1) * (parseFloat(item.discount_price_usd) || parseFloat(item.price) || 0)
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* checkout shows subtotal */}
                <div className="checkout__section">
                    <div className="checkout__part">
                        <h3>Order Summary</h3>
                    </div>
                    <div className="checkout__summary">
                        <div className="checkout__summary__row">
                            <span>Items ({totalQuantity}):</span>
                            <span>{GB_CURRENCY.format(subtotal)}</span>
                        </div>
                        <div className="checkout__summary__row checkout__summary__total">
                            <span><strong>Order Total:</strong></span>
                            <span><strong>{GB_CURRENCY.format(subtotal)}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="checkout__section">
                    <div className="checkout__part">
                        <h3>Payment Method</h3>
                    </div>
                    <div className="checkout__payment-method">
                        <div className="checkout__payment-option">
                            <input
                                type="radio"
                                id="payment-cod"
                                name="payment"
                                checked
                                readOnly
                            />
                            <label htmlFor="payment-cod">Cash On Delivery</label>
                        </div>
                    </div>
                </div>

                {/* button for payment */}
                <div className="checkout__section">
                    <div className="checkout__payment">
                        <div
                            className="checkout__button"
                            onClick={HandleProceed}
                            style={{
                                opacity: selectedItems.length === 0 ? 0.5 : 1,
                                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Place Order
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Footer />
        </div>
    )
}

export default Checkout