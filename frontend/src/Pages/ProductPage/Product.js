import React, { useEffect, useState } from 'react';
import './Product.css';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
// import ProductDetail from "../../../public/Data/Product.json";
import NavBar from "../../Components/Navbar/Navigation"
import ProductFooter from "./ProductFooter"
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AddToCart } from '../../Redux/Action/Action';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GB_CURRENCY } from '../../Utils/constants';
import ItemRatings from '../ItemPage/ItemRatings';
import axios from "axios";

const Product = () => {
  const { category } = useParams(); // Get optional category from URL
  const Dispatch = useDispatch();
  const CartItems = useSelector((state) => state.cart.items);

  const HandleAddToCart = (item) => {
    toast.success("Added Item To Cart", {
      position: "bottom-right"
    })
    Dispatch(AddToCart(item));
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);

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

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Get category name for banner
  const categoryName = category ? categoryNameMapping[category] || "Products" : "All Products";

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
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
      <div className='ProductTopBanner'>

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
      </div>

      <div className='ProductPageMain'>
        {/* left sidebar */}
        <div className="ProductPageMainLeftCategory">
          <div className='ProductPageMainLeftCategoryTitle'>Catergory</div>
          <div className="ProductPageMainLeftCategoryContent">
            <div className="ProductPageMainLeftCategoryTitleContent">Computers & Accessories</div>
            <div className="ProductPageMainLeftCategoryContentSub">Macbooks</div>
            <div className="ProductPageMainLeftCategoryContentSub">Amazon Prime</div>
            <div className="ProductPageMainLeftCategoryContentSub">Average Customer Review</div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarRateIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <StarOutlineIcon sx={{ fontSize: "20px", color: "#febd69" }} />
              <div className="AndUp"> & Up</div>
            </div>

            <div className="RatingLeftBox">
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
            {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} results for{" "}
            <span className='ProductPageMainRightTopBannerSpan'>
              {categoryName}
            </span>
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
                        <ItemRatings avgRating={item.average_rating} ratings={item.no_of_ratings} />
                      </div>
                      <div className='SaleProductPage'>
                        Up to 25% off on Black Friday
                      </div>
                      <div className='DeliveryHomepage'>
                        Free Domestic Shipping By Amazon
                        0</div>
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