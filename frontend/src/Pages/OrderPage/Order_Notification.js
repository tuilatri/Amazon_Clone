import React from 'react';
import './Order_Notification.css';

const OrderNotification = ({ isOpen, onConfirm, onCancel, orderId }) => {
    if (!isOpen) return null;

    return (
        <div className="order-notification-overlay">
            <div className="order-notification">
                <div className="order-notification__header">
                    Notification
                </div>
                <div className="order-notification__body">
                    <p>Are you sure that you want to cancel this order?</p>
                    <p className="order-notification__order-id">Order #{orderId}</p>
                </div>
                <div className="order-notification__actions">
                    <button
                        className="order-notification__btn order-notification__btn--yes"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                    <button
                        className="order-notification__btn order-notification__btn--no"
                        onClick={onCancel}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderNotification;
