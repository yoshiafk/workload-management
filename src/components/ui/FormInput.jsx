/**
 * FormInput Component
 * Reusable form input with label, validation, and error display
 */

import './FormInput.css';

export default function FormInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    options = [], // For select type
    min,
    max,
    step,
    rows = 3, // For textarea
    autoFocus = false,
    helpText,
}) {
    const inputId = `input-${name}`;

    const handleChange = (e) => {
        const newValue = type === 'number'
            ? (e.target.value === '' ? '' : Number(e.target.value))
            : e.target.value;
        onChange(name, newValue);
    };

    const renderInput = () => {
        const commonProps = {
            id: inputId,
            name,
            value: value ?? '',
            onChange: handleChange,
            placeholder,
            disabled,
            autoFocus,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${inputId}-error` : undefined,
        };

        switch (type) {
            case 'select':
                const hasEmptyOption = options.some(opt => opt.value === '');
                return (
                    <select {...commonProps} className="form-select">
                        {!hasEmptyOption && <option value="">Select...</option>}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows={rows}
                        className="form-input form-textarea"
                    />
                );

            case 'number':
                return (
                    <input
                        {...commonProps}
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        className="form-input"
                    />
                );

            case 'date':
                return (
                    <input
                        {...commonProps}
                        type="date"
                        className="form-input"
                    />
                );

            case 'checkbox':
                return (
                    <label className="form-checkbox-label">
                        <input
                            type="checkbox"
                            id={inputId}
                            name={name}
                            checked={!!value}
                            onChange={(e) => onChange(name, e.target.checked)}
                            disabled={disabled}
                            className="form-checkbox"
                        />
                        <span className="form-checkbox-text">{label}</span>
                    </label>
                );

            default:
                return (
                    <input
                        {...commonProps}
                        type={type}
                        className="form-input"
                    />
                );
        }
    };

    // Checkbox has its own label layout
    if (type === 'checkbox') {
        return (
            <div className={`form-group ${error ? 'has-error' : ''}`}>
                {renderInput()}
                {error && (
                    <span id={`${inputId}-error`} className="form-error">
                        {error}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`form-group ${error ? 'has-error' : ''}`}>
            <label htmlFor={inputId} className="form-label">
                {label}
                {required && <span className="form-required">*</span>}
            </label>
            {renderInput()}
            {helpText && <span className="form-help">{helpText}</span>}
            {error && (
                <span id={`${inputId}-error`} className="form-error">
                    {error}
                </span>
            )}
        </div>
    );
}

/**
 * Form Actions - Container for form buttons
 */
export function FormActions({ children }) {
    return <div className="form-actions">{children}</div>;
}
