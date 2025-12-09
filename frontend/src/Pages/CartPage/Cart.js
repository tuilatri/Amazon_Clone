import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useSelector, useDispatch } from 'react-redux';
import { RemoveFromCart, RemoveAllFromCart, UpdateCartQuantity } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { GB_CURRENCY } from '../../Utils/constants';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ItemRatings from '../ItemPage/ItemRatings';
import { AddToCart } from '../../Redux/Action/Action';
import { useAuth } from '../../Context/AuthContext';

const Cart = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate(); // Hook to handle navigation
  // Derive userInfo from AuthContext instead of location.state
  const userInfo = {
    name: user?.user_name || '',
    email: user?.email_address || '',
    phone: user?.phone_number || '',
    address: '',
    age: user?.age || '',
    gender: user?.gender || '',
    city: user?.city || '',
  };
  const [CartItem, SetCartItem] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected product IDs
  const Dispatch = useDispatch();

  const HandleAddToCart = async (item) => {
    Dispatch(AddToCart(item));
    try {
      console.log(item.product_id || item.id, userInfo.email)
      const response = await axios.post("http://localhost:8000/addToCart/", { product_id: (item.product_id || item.id), user_email: userInfo.email, quantity: 1 });

      if (response.status === 200) {
        toast.success('Added to cart successfully', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error);
    }
  };

  // Fetch cart items when the component mounts and user is authenticated
  useEffect(() => {
    if (userInfo.email) {
      fetchCartItems();
    }
  }, [user?.email_address]); // Re-fetch when user auth changes

  // Fetch recommended items based on cart status
  useEffect(() => {
    // If cart has items and user is logged in, fetch related items
    if (CartItem.length > 0 && userInfo.email) {
      fetchRecommendedItems();
    } else if (CartItem.length === 0) {
      // When cart is empty (or user not logged in), fetch highest rated products
      fetchHighestRatedProducts();
    }
  }, [CartItem.length, userInfo.email]);

  // Initial load - always fetch highest rated products first (for immediate display)
  useEffect(() => {
    fetchHighestRatedProducts();
  }, []);

  // Auto-select all items when cart is fetched
  useEffect(() => {
    if (CartItem.length > 0) {
      const allIds = new Set(CartItem.map(item => item.product_id || item.id));
      setSelectedItems(allIds);
    }
  }, [CartItem]);

  // Calculate total cost only for selected items
  const totalCost = CartItem.reduce((total, item) => {
    const itemId = item.product_id || item.id;
    if (!selectedItems.has(itemId)) return total; // Skip unselected items

    const quantity = item.quantity || 1;
    const price = item.discount_price_usd || item.price || 0;
    return total + (quantity * price);
  }, 0);

  // Count selected items
  const selectedCount = CartItem.filter(item => selectedItems.has(item.product_id || item.id)).length;

  const fetchCartItems = async () => {
    try {
      const response = await axios.post("http://localhost:8000/cart", { type: "display", user_email: userInfo.email });
      const fetchedCart = response.data.cart;
      SetCartItem(fetchedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items.");
    }
  };

  const [recommendedItems, setRecommendedItems] = useState([]);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const recommendedPerPage = 10;

  const fetchRecommendedItems = async () => {
    try {
      const response = await axios.post("http://localhost:8000/cartRelatedItems", {
        user_email: userInfo.email,
        type: "display"
      });

      if (response.data.products && Array.isArray(response.data.products)) {
        setRecommendedItems(response.data.products);
      } else {
        setRecommendedItems([]);
      }
    } catch (error) {
      console.error("Error fetching related items:", error);
      setRecommendedItems([]);
    }
  };

  const fetchHighestRatedProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/getHighestRatedProducts/");
      if (response.data && Array.isArray(response.data)) {
        setRecommendedItems(response.data);
      } else {
        setRecommendedItems([]);
      }
    } catch (error) {
      console.error("Error fetching highest rated products:", error);
      setRecommendedItems([]);
    }
  };

  // Pagination for recommended items
  const totalRecommendedPages = Math.ceil(recommendedItems.length / recommendedPerPage);
  const paginatedRecommendedItems = recommendedItems.slice(
    (recommendedPage - 1) * recommendedPerPage,
    recommendedPage * recommendedPerPage
  );

  const handleRecommendedPageChange = (page) => {
    setRecommendedPage(page);
    // Scroll to recommended section
    document.querySelector('.ItemImageProductPage2')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle individual item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Select all items
  const handleSelectAll = () => {
    const allIds = new Set(CartItem.map(item => item.product_id || item.id));
    setSelectedItems(allIds);
  };

  // Deselect all items
  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  // Remove all items from cart (backend)
  const handleRemoveAllFromCart = async () => {
    try {
      await axios.post("http://localhost:8000/cart", { type: "remove-all", user_email: userInfo.email });
      toast.error("All items removed from cart", { position: "bottom-right" });
      Dispatch(RemoveAllFromCart());
      SetCartItem([]);
      setSelectedItems(new Set());

      // Dispatch custom event to notify Navigation to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error removing all items:", error);
      toast.error("Failed to remove all items from cart.");
    }
  };

  // Dynamic text and actions for the selection area
  const getSelectionUI = () => {
    if (CartItem.length === 0) {
      return <span style={{ color: '#666' }}>No product is in cart</span>;
    }

    const allSelected = selectedItems.size === CartItem.length;
    const noneSelected = selectedItems.size === 0;

    if (noneSelected) {
      return (
        <span>
          No items selected. <span className="DeselectAllCartLink" onClick={handleSelectAll}>Select all items</span>
        </span>
      );
    }

    if (allSelected) {
      return (
        <span className="DeselectAllCartLink" onClick={handleDeselectAll}>Deselect all items</span>
      );
    }

    // Some selected, some not
    return (
      <span>
        <span className="DeselectAllCartLink" onClick={handleSelectAll}>Select all items</span>
        {' | '}
        <span className="DeselectAllCartLink" onClick={handleDeselectAll}>Deselect all items</span>
      </span>
    );
  };

  console.log(CartItem)
  // Handle remove item from the cart
  const HandleRemoveFromCart = async (id) => {
    try {
      console.log("Removing product with ID:", id);
      const response = await axios.post("http://localhost:8000/cart", {
        type: "remove",
        user_email: userInfo.email,
        product_id: id
      });
      toast.error("Removed From Cart", { position: "bottom-right" });
      Dispatch(RemoveFromCart(id));

      // Remove from selected items
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // Dispatch custom event to notify Navigation to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

      fetchCartItems();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart.");
    }
  };

  // Handle quantity change for an item
  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) {
      toast.warn("Quantity cannot be less than 1.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/cart", {
        type: "update-quantity",
        user_email: userInfo.email,
        product_id: id,
        quantity: newQuantity
      });

      Dispatch(UpdateCartQuantity(id, newQuantity));

      SetCartItem((prevItems) =>
        prevItems.map((item) =>
          (item.product_id === id ? { ...item, quantity: newQuantity } : item)
        )
      );

      // Dispatch custom event to notify Navigation to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success("Quantity updated", { position: "bottom-right" });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity.");
    }
  };

  return (
    <div>
      <NavBar userInfo={userInfo} />
      <div className="Cart">

        <div className="TopLeftCart">
          <div className="TopLeftCartTitle">Shopping Cart</div>
          <div className="DeselectAllCart">{getSelectionUI()}</div>
          <div className="CartPriceTextDivider">Price</div>
          <div className="CartItemDiv">
            {CartItem.map((item, ind) => (
              <div className="CartItemBlock" key={ind}>
                <div className="CartItemLeftBlock">
                  {/* Checkbox for selection */}
                  <div className="CartItemCheckbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.product_id || item.id)}
                      onChange={() => handleItemSelect(item.product_id || item.id)}
                    />
                  </div>
                  <div className="CartItemLeftBlockImage">
                    <img
                      className="CartItemLeftBlockImg"
                      src={item.imageUrl || item.product_image}
                      alt={item.name || item.product_name}
                    />
                  </div>
                  <div className="CartItemLeftBlockDetails">
                    <div className="CartItemProductName">{item.name || item.product_name}</div>
                    <div className="InStockCart">In Stock</div>
                    <div className="FreeShipping">Free Shipping Available</div>

                    {/* Quantity Management */}
                    <div className="CartQuantityControls">
                      <button
                        className="DecreaseButton"
                        onClick={() =>
                          handleQuantityChange(item.product_id || item.id, (item.quantity ?? 100) - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="QuantityInput"
                        value={item.quantity ?? 100}
                        onChange={(e) =>
                          handleQuantityChange(item.product_id || item.id, parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        className="IncreaseButton"
                        onClick={() =>
                          handleQuantityChange(item.product_id || item.id, (item.quantity ?? 100) + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div
                      className="RemoveFromCart"
                      onClick={() => HandleRemoveFromCart(item.product_id)}
                    >
                      Remove from Cart
                    </div>
                  </div>
                </div>

                <div className="CartItemRightBlock">
                  <div className="CartItemPrice">{GB_CURRENCY.format(item.price || item.discount_price_usd)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="TopRightCart">
          <div>
            Subtotal ({selectedCount} items):
            <span className="SubTotalTitleSpan">
              {GB_CURRENCY.format(totalCost)}
            </span>
          </div>
          <div className="GiftAddTo">
            <input type="checkbox" />
            <div>This order contains a gift</div>
          </div>
          <Link to="/Checkout" className="ProceedToBuy">
            <div className="ProceedToBuy__text">
              Proceed to checkout
            </div>
          </Link>
        </div>
        <ToastContainer />
      </div>

      {/* Recommended Products Section */}
      <div className="RecommendedSection">
        <h2 className="RecommendedTitle">
          {CartItem.length > 0 ? "Products Related to Items in Your Cart" : "Top Rated Products"}
        </h2>
        <div className='ItemImageProductPage2'>
          {paginatedRecommendedItems.map((item, ind) => (
            <div className='ItemImageProductPageOne' key={item.product_id}>
              <div className='ImageBlockItemImageProductPageOne'>
                <img src={item.product_image} className="ProductImageProduct" alt={item.product_name} />
              </div>
              <div className='ProductNameProduct'>
                <Link
                  to={{
                    pathname: `/Item/${item.product_id}`,
                  }}
                  className="product__name__link"
                >
                  {item.product_name}
                </Link>
                <div className='PriceProductDetailPage'>
                  <div className='RateHomeDetail'>
                    <div className='RateHomeDetailPrice'>
                      {GB_CURRENCY.format(item.discount_price_usd)}
                    </div>
                    <div className='AddToCartButton' onClick={() => HandleAddToCart(item)}>
                      Add To Cart
                    </div>
                  </div>
                </div>
                <div className='ProductRatings'>
                  <ItemRatings average_rating={item.average_rating} no_of_ratings={item.no_of_ratings} />
                </div>
                <div className='SaleProductPage'>
                  Up to 25% off on Black Friday
                </div>
                <div className='DeliveryHomepage'>
                  Free Domestic Shipping By Amazon
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination for recommended items */}
        {totalRecommendedPages > 1 && (
          <div className="pagination">
            <button
              className="pagination__button"
              onClick={() => handleRecommendedPageChange(recommendedPage - 1)}
              disabled={recommendedPage === 1}
            >
              Previous
            </button>

            {[...Array(totalRecommendedPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination__number ${recommendedPage === index + 1 ? 'pagination__number--active' : ''}`}
                onClick={() => handleRecommendedPageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="pagination__button"
              onClick={() => handleRecommendedPageChange(recommendedPage + 1)}
              disabled={recommendedPage === totalRecommendedPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
