import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountStatusModal from '../AccountStatusModal/AccountStatusModal';
import { useAccountStatus } from '../../Context/AccountStatusContext';
import { useAuth } from '../../Context/AuthContext';

/**
 * AccountStatusHandler - Wrapper component that renders the AccountStatusModal
 * and handles the logout flow when user acknowledges the restriction.
 * 
 * Must be used inside both AccountStatusProvider and AuthProvider.
 */
const AccountStatusHandler = ({ children }) => {
    const { isRestricted, restrictionMessage, hideRestrictionModal } = useAccountStatus();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hide the modal first
        hideRestrictionModal();
        // Call logout from AuthContext (clears localStorage)
        logout();
        // Redirect to SignIn page
        navigate('/SignIn');
    };

    return (
        <>
            {children}
            <AccountStatusModal
                isOpen={isRestricted}
                message={restrictionMessage}
                onLogout={handleLogout}
            />
        </>
    );
};

export default AccountStatusHandler;
