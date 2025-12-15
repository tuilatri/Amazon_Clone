import { useEffect } from 'react';
import axios from 'axios';
import { useAccountStatus } from '../../Context/AccountStatusContext';
import { useAuth } from '../../Context/AuthContext';

/**
 * AxiosInterceptor - Sets up global axios response interceptor
 * to catch 403 Forbidden responses and trigger account restriction modal.
 * 
 * This component must be placed inside both AccountStatusProvider and AuthProvider.
 */
const AxiosInterceptor = ({ children }) => {
    const { showRestrictionModal } = useAccountStatus();
    const { logout } = useAuth();

    useEffect(() => {
        // Add response interceptor
        const interceptor = axios.interceptors.response.use(
            // Success handler - pass through
            (response) => response,
            // Error handler - catch 403
            (error) => {
                if (error.response && error.response.status === 403) {
                    // Extract error message from backend
                    const message = error.response.data?.detail ||
                        'Your account has been restricted.';

                    // Check if this is an account status error
                    const isAccountRestricted =
                        message.includes('locked') ||
                        message.includes('disabled') ||
                        message.includes('not active');

                    if (isAccountRestricted) {
                        // Show the restriction modal
                        showRestrictionModal(message);
                    }
                }

                // Always reject the promise so error handling continues
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [showRestrictionModal, logout]);

    return children;
};

export default AxiosInterceptor;
