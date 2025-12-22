import React, { useState } from "react";
import "./SignUp.css";
import amazon_logo from "../../Assets/amazon_logo_black.png";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

const SignUp = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    email_address: '',
    phone_number: '',
    password: '',
    repassword: '',
    age: '',
    gender: '',
    city: '',
    role: 2  // Default to Users (2=Users, 3=Suppliers)
  });

  // State để toggle hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const validateAge = (age) => {
    const ageNumber = parseInt(age, 10);
    return ageNumber >= 0 && ageNumber <= 122;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (formData.age.trim() === "" || !validateAge(formData.age)) {
      setMessage("Please enter a valid age (0-122).");
      return;
    }

    // Đoạn này chỉ chấp nhận a–z, A–Z, 0–9 và dấu gạch dưới _
    // if (!/^\w{3,50}$/.test(formData.user_name)) {
    //   setMessage("Invalid username.");
    //   return;
    // }

    // Bằng đoạn này (rất thoáng, giống Amazon)
    if (formData.user_name.trim().length < 2 || formData.user_name.trim().length > 50) {
      setMessage("Your name must be between 2 and 50 characters.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone_number)) {
      setMessage("Phone number must be 10 digits.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("Password must be at least 8 characters, include one uppercase letter and one special character.");
      return;
    }

    // try {
    //   const response = await axios.post('http://localhost:8000/register', formData);
    //   console.log('Registration form send successful:', response.data);
    //   setMessage('Please check your mail');
    //   navigate('/signUpVerify', { state: { userData: { ...formData } } });
    // } catch (error) {
    //   console.error('Error registering user:', error.response?.data || error.message);
    //   setMessage('Can not register at the moment. Please try again.');
    // }

    try {
      const response = await axios.post('http://localhost:8000/postRegister/', formData);  // sửa api_endpoint từ register thành postRegister
      console.log('Registration successful:', response.data);

      // Thành công → hiện thông báo và chuyển về trang đăng nhập
      setMessage('Registration successful! Please sign in.');
      setTimeout(() => {
        navigate('/SignIn');
      }, 2000); // Chờ 2 giây cho người dùng đọc thông báo rồi mới chuyển

    } catch (error) {
      console.error('Error registering user:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Cannot register at the moment. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <Link to="/">
        {/* <img src={amazon_logo} alt="Amazon Logo" className="signup-logo" /> */}
      </Link>
      <div className="signup-box">
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="user_name">Your name</label>
          <input
            type="text"
            id="user_name"
            value={formData.user_name}
            placeholder="First and last name"
            required
            onChange={handleInputChange}
          />

          <label htmlFor="email_address">Email</label>
          <input
            type="email"
            id="email_address"
            value={formData.email_address}
            placeholder="Enter your email "
            required
            onChange={handleInputChange}
          />

          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="number"
            id="phone_number"
            value={formData.phone_number}
            placeholder="Enter your mobile number"
            required
            onChange={handleInputChange}
          />

          {/* Password với toggle - ĐÃ FIX LỖI */}
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              placeholder="At least 8 characters, 1 uppercase & 1 special character"
              required
              onChange={handleInputChange}
            />
            <InputAdornment position="end" className="password-toggle">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          </div>

          {/* Re-enter password với toggle - ĐÃ FIX LỖI */}
          <label htmlFor="repassword">Re-enter password</label>
          <div className="password-wrapper">
            <input
              type={showRePassword ? "text" : "password"}
              id="repassword"
              value={formData.repassword}
              placeholder="Re-enter your password"
              required
              onChange={handleInputChange}
            />
            <InputAdornment position="end" className="password-toggle">
              <IconButton
                onClick={() => setShowRePassword(!showRePassword)}
                edge="end"
                size="small"
              >
                {showRePassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          </div>

          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            placeholder="Enter your age"
            required
            onChange={handleInputChange}
          />

          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>

          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            value={formData.city}
            placeholder="Which city are you in"
            required
            onChange={handleInputChange}
          />

          <label>Which role do you want to register as?</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-button ${formData.role === 2 ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 2 })}
            >
              Users
            </button>
            <button
              type="button"
              className={`role-button ${formData.role === 3 ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 3 })}
            >
              Suppliers
            </button>
          </div>

          <button type="submit" className="signup-button">
            Sign up
          </button>
          {message && <div className="message">{message}</div>}

          <p className="agreement-text">
            By creating an account, you agree to Amazon's{" "}
            <a href="#">Conditions of Use</a> and{" "}
            <a href="#">Privacy Notice</a>.
          </p>
        </form>

        <p className="signin-prompt">
          Already have an account?{" "}
          <a href="/SignIn" className="signin-link">
            Sign in
          </a>
        </p>
        <p className="signin-prompt">
          Forget Password?{" "}
          <a href="/ForgetPassword" className="signin-link">
            Click here
          </a>
        </p>
      </div>

      <footer>
        <div className="footer-links">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <p>© 1996-2024, Amazon.com, Inc. or its affiliates</p>
      </footer>
    </div>
  );
};

export default SignUp;