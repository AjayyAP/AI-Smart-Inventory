import React from 'react';
import { Modal as BSModal } from 'react-bootstrap';
import Button from './Button';

const Modal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  footer, 
  size = 'md',
  submitText = 'Save Changes',
  onConfirm,
  isSubmitting = false
}) => {
  return (
    <BSModal show={show} onHide={onHide} size={size} centered>
      <BSModal.Header closeButton className="border-0">
        <BSModal.Title className="fw-bold">{title}</BSModal.Title>
      </BSModal.Header>
      <BSModal.Body>
        {children}
      </BSModal.Body>
      <BSModal.Footer className="border-0">
        {footer ? footer : (
          <>
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="primary" onClick={onConfirm} loading={isSubmitting}>
              {submitText}
            </Button>
          </>
        )}
      </BSModal.Footer>
    </BSModal>
  );
};

export default Modal;
