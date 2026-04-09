import React from 'react';
import { Button as BSButton, Spinner } from 'react-bootstrap';

const Button = ({ 
  children, 
  variant = 'primary', 
  size, 
  onClick, 
  type = 'button', 
  loading = false, 
  disabled = false, 
  className = '',
  icon: Icon
}) => {
  return (
    <BSButton 
      variant={variant} 
      size={size} 
      onClick={onClick} 
      type={type} 
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <Spinner animation="border" size="sm" className="me-2" />
      ) : Icon ? (
        <Icon className="me-2" />
      ) : null}
      {children}
    </BSButton>
  );
};

export default Button;
