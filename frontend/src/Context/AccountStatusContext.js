import React, { createContext, useState, useContext, useCallback } from 'react';

/**
 * AccountStatusContext - Global context for managing account restriction state.
 * Used to trigger the AccountStatusModal when a 403 response is received.
 */
const AccountStatusContext = createContext();

export const AccountStatusProvider = ({ children }) => {
    const [isRestricted, setIsRestricted] = useState(false);
    const [restrictionMessage, setRestrictionMessage] = useState('');

    // Show the restriction modal with a message
    const showRestrictionModal = useCallback((message) => {
        setRestrictionMessage(message || 'Your account has been restricted.');
        setIsRestricted(true);
    }, []);

    // Hide the restriction modal
    const hideRestrictionModal = useCallback(() => {
        setIsRestricted(false);
        setRestrictionMessage('');
    }, []);

    return (
        <AccountStatusContext.Provider value={{
            isRestricted,
            restrictionMessage,
            showRestrictionModal,
            hideRestrictionModal
        }}>
            {children}
        </AccountStatusContext.Provider>
    );
};

export const useAccountStatus = () => {
    const context = useContext(AccountStatusContext);
    if (!context) {
        throw new Error('useAccountStatus must be used within an AccountStatusProvider');
    }
    return context;
};
