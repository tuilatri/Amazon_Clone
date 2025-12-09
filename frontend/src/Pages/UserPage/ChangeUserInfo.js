import "./UserPage.css";
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useAuth } from '../../Context/AuthContext';

const ChangeUserInfo = () => {
    const location = useLocation();
    const { userData } = location.state || {};
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const { updateUser } = useAuth();

    // If userData is not passed, provide default empty object or 'Guest' info
    const [userInfo, setUserInfo] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        age: userData?.age || '',
        gender: userData?.gender || '',
        city: userData?.city || '',
        unit_number: userData?.unit_number || '',
        street_number: userData?.street_number || '',
        address_line1: userData?.address_line1 || '',
        address_line2: userData?.address_line2 || '',
        region: userData?.region || '',
        postal_code: userData?.postal_code || '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            [name]: value,
        }));
    };

    const handleUserChange = async (e) => {
        try {
            console.log(userInfo)
            const response = await axios.post("http://127.0.0.1:8000/postUpdate/", userInfo);
            console.log('successful:', response.data);

            // Cập nhật AuthContext với thông tin mới
            updateUser({
                user_name: userInfo.name,
                email_address: userInfo.email,
                phone_number: userInfo.phone,
                age: userInfo.age,
                gender: userInfo.gender,
                city: userInfo.city
            });

            setMessage("Success update information. Redirect to Your Profile Page.");
            setTimeout(() => {
                navigate('/UserPage');
            }, 1500);

        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };



    return (
        <div className="user">
            <NavBar />
            <div className="user__container">
                <div className="user__profile">
                    {/* User Image */}
                    <div className="user__image">
                        <img
                            className="user__image__img"
                            src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg"
                            alt="User"
                        />
                    </div>
                    {/* User Info */}
                    <div className="user__info">
                        <div className="user__info__item">
                            <strong>Full Name:</strong>
                            <input
                                type="text"
                                name="name"
                                value={userInfo.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Email:</strong>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Phone:</strong>
                            <input
                                type="text"
                                name="phone"
                                value={userInfo.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Age:</strong>
                            <input
                                type="number"
                                name="age"
                                value={userInfo.age}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Gender:</strong>
                            <input
                                type="text"
                                name="gender"
                                value={userInfo.gender}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>City:</strong>
                            <input
                                type="text"
                                name="city"
                                value={userInfo.city}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Unit Number:</strong>
                            <input
                                type="text"
                                name="unit_number"
                                value={userInfo.unit_number}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Street Number:</strong>
                            <input
                                type="text"
                                name="street_number"
                                value={userInfo.street_number}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 1:</strong>
                            <input
                                type="text"
                                name="address_line1"
                                value={userInfo.address_line1}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 2:</strong>
                            <input
                                type="text"
                                name="address_line2"
                                value={userInfo.address_line2}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Region:</strong>
                            <input
                                type="text"
                                name="region"
                                value={userInfo.region}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="user__info__item">
                            <strong>Postal Code:</strong>
                            <input
                                type="text"
                                name="postal_code"
                                value={userInfo.postal_code}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    {/* Change Information Button */}
                    <div className="user__edit__button__container">
                        <button
                            onClick={handleUserChange}
                            className="account__dropdownOption"  // Use this class to apply the button styles
                        >
                            Comfirm
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ChangeUserInfo;
