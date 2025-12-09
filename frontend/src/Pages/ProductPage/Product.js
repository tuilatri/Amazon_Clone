import React, { useEffect, useState } from 'react';
import './Product.css';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
// import ProductDetail from "../../../public/Data/Product.json";
import NavBar from "../../Components/Navbar/Navigation"
import ProductFooter from "./ProductFooter"
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GB_CURRENCY } from '../../Utils/constants';
import ItemRatings from '../ItemPage/ItemRatings';
import axios from "axios";
import { useAuth } from '../../Context/AuthContext';

const Product = () => {
  const { category } = useParams(); // Get optional category from URL
  const Dispatch = useDispatch();
  const CartItems = useSelector((state) => state.cart.items);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Derive userInfo from AuthContext
  const userInfo = {
    name: user?.user_name || '',
    email: user?.email_address || '',
    phone: user?.phone_number || '',
    address: '',
    age: user?.age || '',
    gender: user?.gender || '',
    city: user?.city || '',
  };

  const HandleAddToCart = async (item) => {
    if (!isAuthenticated || !user?.email_address) {
      // Pop up login request and navigate to login
      toast.info("Please log in to add items to the cart.", {
        position: "bottom-right"
      });

      // Navigate to the login page, passing the current page and the item to add as state
      navigate('/SignIn', {
        state: {
          from: location.pathname,
          itemToAdd: item,
        }
      });
      return;
    }

    // Add to Redux store
    Dispatch(AddToCart(item));

    try {
      // Call backend API to persist cart item
      const response = await axios.post("http://localhost:8000/addToCart/", {
        product_id: (item.product_id || item.id),
        user_email: userInfo.email,
        quantity: 1
      });

      if (response.status === 200) {
        toast.success('Added to cart successfully', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.", {
        position: "bottom-right"
      });
    }
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);

  // Rating filter state (0 = show all, 1-4 = minimum rating threshold)
  const [ratingFilter, setRatingFilter] = useState(0);

  // Category name mapping (encoded value -> display name)
  const categoryNameMapping = {
    "0": "Accessories", "1": "Appliances", "2": "Bags & Luggage",
    "3": "Beauty & Health", "4": "Car & Motorbike", "5": "Grocery & Gourmet Foods",
    "6": "Home & Kitchen", "7": "Home, Kitchen, Pets", "8": "Industrial Supplies",
    "9": "Kids' Fashion", "10": "Men's Clothing", "11": "Men's Shoes",
    "12": "Music", "13": "Pet Supplies", "14": "Sports & Fitness",
    "15": "Stores", "16": "Toys & Baby Products", "17": "TV, Audio & Cameras",
    "18": "Women's Clothing", "19": "Women's Shoes"
  };

  // Fetch products - all products or filtered by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setCurrentPage(1); // Reset to page 1 when category changes
        let response;

        if (category) {
          // Fetch products by category
          response = await fetch(`http://127.0.0.1:8000/getProductbyCategory/?categoryencode=${category}`);
        } else {
          // Fetch ALL products from database
          response = await fetch("http://127.0.0.1:8000/getAllProductsFlat/");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch product data.");
        }
        const data = await response.json();
        // Handle both array response and object with products property
        setProducts(data.products || data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error fetching product data. Please try again later.", {
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts(); // Actually call the function!
  }, [category]);
  // Fetch products from the backend API
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await axios.post("http://localhost:3000/searchProducts/");
  //       setProducts(response.data);
  //     } catch (err) {
  //       setError("Failed to fetch products.");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProducts();
  // }, []);


  // Fetch product details by product_id (for individual product page)
  // const fetchProductDetails = async (productId) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3000/product/${productId}`);
  //     return response.data;
  //   } catch (err) {
  //     console.error("Error fetching product details:", err);
  //     setError("Failed to fetch product details.");
  //   }
  // };

  // if (loading) {
  //   return <h1>Loading Products...</h1>;
  // }

  // if (error) {
  //   return <h1>{error}</h1>;
  // }

  // // Add product to cart and handle quantity update if product already in cart
  // const handleAddToCartWithQuantity = async (product) => {
  //   try {
  //     // Check if the product is already in the cart
  //     const existingCartItem = CartItems.find(item => item.product_id === product.product_id);

  //     if (existingCartItem) {
  //       // If the item exists in the cart, update the quantity
  //       const updatedItem = { ...existingCartItem, quantity: existingCartItem.quantity + 1 };
  //       Dispatch(AddToCart(updatedItem));  // Update Redux store
  //       toast.success("Updated quantity in cart!", {
  //         position: "bottom-right"
  //       });
  //     } else {
  //       // If the item is not in the cart, add it
  //       const newCartItem = {
  //         product_id: product.product_id,
  //         user_email: "user@example.com", // Replace with dynamic user email
  //         quantity: 1, // Add 1 initially, can be modified as needed
  //       };

  //       const response = await axios.post("http://localhost:3000/addToCart/", newCartItem);
  //       if (response.data.success) {
  //         Dispatch(AddToCart(product));  // Add to Redux store
  //         toast.success("Added item to cart!", {
  //           position: "bottom-right"
  //         });
  //       } else {
  //         toast.error("Failed to add item to cart.", {
  //           position: "bottom-right"
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Error while adding item to cart.", {
  //       position: "bottom-right"
  //     });
  //   }
  // };

  // if (products.length === 0) {
  //     return <h1>Loading Products...</h1>;
  // }

  // Filter products by rating
  const filteredProducts = ratingFilter > 0
    ? products.filter(item => Math.floor(item.average_rating || 0) >= ratingFilter)
    : products;

  // Pagination calculations (based on filtered products)
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Get category name for banner
  const categoryName = category ? categoryNameMapping[category] || "Products" : "All Products";

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Handle rating filter toggle (clicking same filter again resets to show all)
  const handleRatingFilter = (minRating) => {
    if (ratingFilter === minRating) {
      setRatingFilter(0); // Reset filter
    } else {
      setRatingFilter(minRating);
    }
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className='ProductPage'>
        <NavBar />
        <h1 style={{ textAlign: 'center', padding: '50px' }}>Loading Products...</h1>
      </div>
    );
  }

  // Show no products message
  if (products.length === 0) {
    return (
      <div className='ProductPage'>
        <NavBar />
        <h1 style={{ textAlign: 'center', padding: '50px' }}>No Products Found</h1>
      </div>
    );
  }

  // Main product display
  return (
    <div className='ProductPage'>
      <NavBar />
      {/* <div className='ProductTopBanner'>

        <div className='ProductTopBannerItems'>
          Electronics
        </div>

        <div className='ProductTopBannerItemsSubMenu'>Mobiles & Accessories</div>
        <div className="ProductTopBannerItemsSubMenu">Laptops & Accessories</div>
        <div className="ProductTopBannerItemsSubMenu">TV & Home Entertainment</div>
        <div className="ProductTopBannerItemsSubMenu">Audio</div>
        <div className="ProductTopBannerItemsSubMenu">Cameras</div>
        <div className="ProductTopBannerItemsSubMenu">Computer Peripherals</div>
        <div className="ProductTopBannerItemsSubMenu">Smart Technology</div>
        <div className="ProductTopBannerItemsSubMenu">Musical Instruments</div>
        <div className="ProductTopBannerItemsSubMenu">Office & Stationary</div>
      </div> */}

      <div className='ProductPageMain'>
        {/* left sidebar */}
        <div className="ProductPageMainLeftCategory">
          <div className='ProductPageMainLeftCategoryTitle'>Customer Reviews</div>
          <div className="ProductPageMainLeftCategoryContent">

            {/* All - No filter */}
            <div
              className="RatingLeftBox"
              onClick={() => handleRatingFilter(0)}
              style={{ cursor: 'pointer', backgroundColor: ratingFilter === 0 ? '#f0f0f0' : 'transparent', padding: '5px', borderRadius: '4px' }}
            >
              <input
                type="checkbox"
                checked={ratingFilter === 0}
                onChange={() => handleRatingFilter(0)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <span>All Ratings</span>
            </div>

            {/* 4 Stars & Up */}
            <div
              className="RatingLeftBox"
              onClick={() => handleRatingFilter(4)}
              style={{ cursor: 'pointer', backgroundColor: ratingFilter === 4 ? '#f0f0f0' : 'transparent', padding: '5px', borderRadius: '4px' }}
            >
              <input
                type="checkbox"
                checked={ratingFilter === 4}
                onChange={() => handleRatingFilter(4)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            {/* 3 Stars & Up */}
            <div
              className="RatingLeftBox"
              onClick={() => handleRatingFilter(3)}
              style={{ cursor: 'pointer', backgroundColor: ratingFilter === 3 ? '#f0f0f0' : 'transparent', padding: '5px', borderRadius: '4px' }}
            >
              <input
                type="checkbox"
                checked={ratingFilter === 3}
                onChange={() => handleRatingFilter(3)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            {/* 2 Stars & Up */}
            <div
              className="RatingLeftBox"
              onClick={() => handleRatingFilter(2)}
              style={{ cursor: 'pointer', backgroundColor: ratingFilter === 2 ? '#f0f0f0' : 'transparent', padding: '5px', borderRadius: '4px' }}
            >
              <input
                type="checkbox"
                checked={ratingFilter === 2}
                onChange={() => handleRatingFilter(2)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            {/* 1 Star & Up */}
            <div
              className="RatingLeftBox"
              onClick={() => handleRatingFilter(1)}
              style={{ cursor: 'pointer', backgroundColor: ratingFilter === 1 ? '#f0f0f0' : 'transparent', padding: '5px', borderRadius: '4px' }}
            >
              <input
                type="checkbox"
                checked={ratingFilter === 1}
                onChange={() => handleRatingFilter(1)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

          </div>
        </div>

        {/* right sidebar */}
        <div className='ProductPageMainRight'>
          <div className="ProductPageMainRightTopBanner">
            {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results for{" "}
            <span className='ProductPageMainRightTopBannerSpan'>
              {categoryName}
            </span>
            {ratingFilter > 0 && <span style={{ marginLeft: '8px', color: '#666' }}>(Rating: {ratingFilter}★+)</span>}
          </div>

          <div className='ItemImageProductPage'>

            {
              currentProducts.map((item, index) => {
                return (
                  <div className='ItemImageProductPageOne' key={item.product_id}>
                    <div className='ImageBlockItemImageProductPageOne'>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="ProductImageProduct" />
                    </div>

                    <div className='ProductNameProduct'>
                      {/* tên sản phẩm */}
                      <Link to={`/Item/${item.product_id}`} className="product__name__link">
                        {item.product_name}
                      </Link>
                      {/* <div className='ProductNameProductRating'>
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarRateIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                        <StarOutlineIcon sx={{ fontSize: "15px", color: "#febd69" }} />
                      </div> */}
                      <div className='PriceProductDetailPage'>
                        <div className='CurrencyText'>
                        </div>
                        <div className='RateHomeDetail'>
                          <div className="RateHomeDetailPrice">
                            <span className="discount-price">
                              {GB_CURRENCY.format(item.discount_price_usd)}
                            </span>
                            &nbsp;
                            <span className="original-price">
                              {GB_CURRENCY.format(item.actual_price_usd)}
                            </span>
                          </div>

                          <div className='AddToCartButton' onClick={() => (HandleAddToCart(item))}>
                            Add To Cart
                          </div>
                        </div>
                      </div>
                      <div className='ProductRatings'>
                        {/* Add star ratings */}
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
                );
              })
            }



          </div>

          {/* Pagination Controls */}
          <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '20px 0', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === 1 ? '#ccc' : '#febd69', border: 'none', borderRadius: '4px' }}
            >
              Previous
            </button>

            {/* Show limited page numbers */}
            {totalPages <= 7 ? (
              [...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: currentPage === index + 1 ? '#FF9900' : '#fff', border: '1px solid #ccc', borderRadius: '4px', fontWeight: currentPage === index + 1 ? 'bold' : 'normal' }}
                >
                  {index + 1}
                </button>
              ))
            ) : (
              <>
                {currentPage > 3 && <button onClick={() => handlePageChange(1)} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>1</button>}
                {currentPage > 4 && <span>...</span>}
                {[...Array(5)].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: currentPage === pageNum ? '#FF9900' : '#fff', border: '1px solid #ccc', borderRadius: '4px', fontWeight: currentPage === pageNum ? 'bold' : 'normal' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {currentPage < totalPages - 3 && <span>...</span>}
                {currentPage < totalPages - 2 && <button onClick={() => handlePageChange(totalPages)} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>{totalPages}</button>}
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: currentPage === totalPages ? '#ccc' : '#febd69', border: 'none', borderRadius: '4px' }}
            >
              Next
            </button>
          </div>

        </div>

      </div>
      <ToastContainer />
      <ProductFooter />
    </div>
  )
}

export default Product;