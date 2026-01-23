/**
 * Toast Utilities
 * Wrapper around sonner for consistent toast notifications
 */

import { toast } from 'sonner';

/**
 * Show toast notifications with consistent styling
 */
export const showToast = {
    /**
     * Success notification
     * @param {string} message - Message to display
     * @param {Object} options - Additional sonner options
     */
    success: (message, options = {}) => {
        toast.success(message, {
            duration: 3000,
            ...options,
        });
    },

    /**
     * Error notification
     * @param {string} message - Message to display
     * @param {Object} options - Additional sonner options
     */
    error: (message, options = {}) => {
        toast.error(message, {
            duration: 5000,
            ...options,
        });
    },

    /**
     * Info notification
     * @param {string} message - Message to display
     * @param {Object} options - Additional sonner options
     */
    info: (message, options = {}) => {
        toast.info(message, {
            duration: 3000,
            ...options,
        });
    },

    /**
     * Warning notification
     * @param {string} message - Message to display
     * @param {Object} options - Additional sonner options
     */
    warning: (message, options = {}) => {
        toast.warning(message, {
            duration: 4000,
            ...options,
        });
    },

    /**
     * Toast with action button (e.g., Undo)
     * @param {string} message - Message to display
     * @param {Object} action - Action config { label: string, onClick: function }
     * @param {Object} options - Additional sonner options
     */
    action: (message, action, options = {}) => {
        toast(message, {
            duration: 5000,
            action: {
                label: action.label || 'Undo',
                onClick: action.onClick,
            },
            ...options,
        });
    },

    /**
     * Promise-based toast for async operations
     * @param {Promise} promise - Promise to track
     * @param {Object} messages - { loading, success, error }
     * @param {Object} options - Additional sonner options
     */
    promise: (promise, messages, options = {}) => {
        return toast.promise(promise, {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: messages.error || 'Something went wrong',
            ...options,
        });
    },

    /**
     * Loading toast that can be updated
     * @param {string} message - Message to display
     * @returns {string} Toast ID for later dismissal/update
     */
    loading: (message, options = {}) => {
        return toast.loading(message, options);
    },

    /**
     * Dismiss a specific toast or all toasts
     * @param {string} [toastId] - Optional toast ID to dismiss
     */
    dismiss: (toastId) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    },
};

export default showToast;
