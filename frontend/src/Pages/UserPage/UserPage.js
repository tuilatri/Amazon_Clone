import "./UserPage.css";
import NavBar from '../../Components/Navbar/Navigation';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useAuth } from '../../Context/AuthContext';

const UserPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated || !user) {
            navigate('/SignIn');
            return;
        }

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/getUserProfile/", {
                    params: {
                        email: user.email_address,
                    },
                });

                if (response.status === 200) {
                    setUserInfo(response.data.data);
                }
            } catch (err) {
                setError("Failed to fetch user data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [isAuthenticated, user, navigate]);

    const handleUserChange = async (e) => {
        try {
            navigate('/ChangeUserInfo', { state: { userData: { ...userInfo } } });
        } catch (error) {
            setMessage(error.response?.data?.detail || "Verification failed.");
        }
    };

    if (loading) {
        return (
            <div className="user">
                <NavBar />
                <div className="user__container">
                    <p>Loading...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="user">
                <NavBar />
                <div className="user__container">
                    <p>No user information available.</p>
                </div>
                <Footer />
            </div>
        );
    }

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
                            <strong>Full Name:</strong> <span>{userInfo.name}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Email:</strong> <span>{userInfo.email}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Phone:</strong> <span>{userInfo.phone}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Age:</strong> <span>{userInfo.age}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Gender:</strong> <span>{userInfo.gender}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>City:</strong> <span>{userInfo.city}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Unit Number:</strong> <span>{userInfo.unit_number}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Street Number:</strong> <span>{userInfo.street_number}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 1:</strong> <span>{userInfo.address_line1}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Address Line 2:</strong> <span>{userInfo.address_line2}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Region:</strong> <span>{userInfo.region}</span>
                        </div>
                        <div className="user__info__item">
                            <strong>Postal Code:</strong> <span>{userInfo.postal_code}</span>
                        </div>
                    </div>
                    {/* Change Information Button */}
                    <div className="user__edit__button__container">
                        <button
                            onClick={handleUserChange}
                            className="account__dropdownOption"  // Use this class to apply the button styles
                        >
                            Change User Information
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserPage;
