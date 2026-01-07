/**
 * ConfirmDialog Component
 * Confirmation dialog for destructive actions
 */

import Modal, { ModalFooter } from './Modal';
import './ConfirmDialog.css';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning' | 'primary'
    isLoading = false,
}) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="confirm-dialog-content">
                <div className={`confirm-dialog-icon confirm-dialog-icon-${variant}`}>
                    {variant === 'danger' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    )}
                    {variant === 'warning' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    )}
                    {variant === 'primary' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </div>
                <p className="confirm-dialog-message">{message}</p>
            </div>
            <ModalFooter>
                <button
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </button>
                <button
                    className={`btn btn-${variant}`}
                    onClick={handleConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : confirmText}
                </button>
            </ModalFooter>
        </Modal>
    );
}
