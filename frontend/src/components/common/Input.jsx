import React from 'react';
import { Form } from 'react-bootstrap';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  as, 
  rows, 
  options, 
  className = '',
  error
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      {label && <Form.Label className="fw-semibold">{label}</Form.Label>}
      
      {type === 'select' ? (
        <Form.Select 
          name={name} 
          value={value} 
          onChange={onChange} 
          required={required}
          isInvalid={!!error}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          required={required}
          as={as}
          rows={rows}
          isInvalid={!!error}
        />
      )}
      
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default Input;
