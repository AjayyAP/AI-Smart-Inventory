import React from 'react';
import { Badge as BSBadge } from 'react-bootstrap';

const Badge = ({ children, bg = 'primary', pill = false, className = '' }) => {
  return (
    <BSBadge bg={bg} pill={pill} className={className}>
      {children}
    </BSBadge>
  );
};

export default Badge;
