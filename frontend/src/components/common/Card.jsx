import React from 'react';
import { Card as BSCard } from 'react-bootstrap';

const Card = ({ children, title, headerActions, className = '', bodyClassName = '' }) => {
  return (
    <BSCard className={`shadow-sm border-0 ${className}`}>
      {title && (
        <BSCard.Header className="border-0 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'transparent' }}>
          <h5 className="mb-0 fw-bold">{title}</h5>
          {headerActions && <div>{headerActions}</div>}
        </BSCard.Header>
      )}
      <BSCard.Body className={bodyClassName}>
        {children}
      </BSCard.Body>
    </BSCard>
  );
};

export default Card;
