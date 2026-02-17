import { memo } from 'react'

interface OptimizedFormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const OptimizedFormField = memo(function OptimizedFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: OptimizedFormFieldProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
})

OptimizedFormField.displayName = 'OptimizedFormField'
