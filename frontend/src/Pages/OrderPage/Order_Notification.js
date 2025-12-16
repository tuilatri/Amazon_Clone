import React from 'react';
import './Order_Notification.css';

const OrderNotification = ({
    isOpen,
    onConfirm,
    onCancel,
    orderId,
    message = "Are you sure that you want to cancel this order?",
    actionType = "cancel"
}) => {
    if (!isOpen) return null;

    return (
        <div className="order-notification-overlay">
            <div className={`order-notification ${actionType === 'return' ? 'order-notification--return' : ''}`}>
                <div className="order-notification__header">
                    {actionType === 'return' ? 'Return Request' : 'Notification'}
                </div>
                <div className="order-notification__body">
                    <p>{message}</p>
                    <p className="order-notification__order-id">Order #{orderId}</p>
                </div>
                <div className="order-notification__actions">
                    <button
                        className={`order-notification__btn order-notification__btn--yes ${actionType === 'return' ? 'order-notification__btn--return' : ''}`}
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
