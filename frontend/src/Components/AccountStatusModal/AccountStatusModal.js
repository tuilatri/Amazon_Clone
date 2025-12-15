import React from 'react';
import './AccountStatusModal.css';
import LockIcon from '@mui/icons-material/Lock';

/**
 * AccountStatusModal - A blocking modal that appears when a user's account
 * is restricted (locked/disabled) during an active session.
 * 
 * Matches the styling of order-detail-modal from AdminOverview.
 */
const AccountStatusModal = ({ isOpen, message, onLogout }) => {
    if (!isOpen) return null;

    // Handle logout click
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div className="account-status-overlay">
            <div className="account-status-modal">
                <div className="account-status-modal__header">
                    <span>Account Restricted</span>
                </div>

                <div className="account-status-modal__body">
                    <div className="account-status-modal__icon">
                        <LockIcon style={{ fontSize: 60, color: '#c45500' }} />
                    </div>

                    <div className="account-status-modal__message">
                        <p className="account-status-modal__primary-message">
                            {message || 'Your account has been restricted by an administrator.'}
                        </p>
                        <p className="account-status-modal__sub-message">
                            Please contact support for assistance.
                        </p>
                    </div>
                </div>

                <div className="account-status-modal__footer">
                    <button
                        className="account-status-modal__btn"
                        onClick={handleLogout}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountStatusModal;
