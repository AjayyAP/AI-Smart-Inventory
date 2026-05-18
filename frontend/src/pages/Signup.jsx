import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/appContexts';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Common Components
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { isBlank, isStrongPassword, isValidEmail, passwordMessage, requiredMessage } from '../utils/validation';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (isBlank(name)) nextErrors.name = requiredMessage('Full name');
    if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.';
    if (!isStrongPassword(password)) nextErrors.password = passwordMessage;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      // Registration succeeded - show OTP modal
      setShowOtpModal(true);
    } catch (error) {
      // AuthContext already shows a toast with the error
      // If it's an "already exists" error but not verified, show OTP modal anyway
      const msg = error.response?.data?.message || '';
      if (msg.includes('OTP') || msg.includes('verify') || msg.includes('New OTP')) {
        setShowOtpModal(true);
      }
      // For "User already exists" errors, AuthContext toast is enough
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    try {
      const result = await verifyOtp(email, otp);
      setShowOtpModal(false);
      // If we got a token, go to dashboard. If not (pending), go to login with pending flag.
      if (result && result.token) {
        navigate('/dashboard');
      } else {
        navigate('/login', { state: { pendingApproval: true } });
      }
    } catch (error) {
      // On error (like 403 pending), close modal and go to login with pending flag
      setShowOtpModal(false);
      const isPending = error.response?.status === 403;
      navigate('/login', { state: { pendingApproval: isPending } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{ background: 'var(--primary-color)', overflowY: 'auto' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={6} xl={5}>
            <Card className="p-4 my-4">
                <div className="text-center mb-4">
                  <h1 className="fw-bold text-primary mb-2" style={{ letterSpacing: '-1px' }}>Join Us</h1>
                  <p className="text-muted">Smart Inventory. Smarter Business.</p>
                </div>
                
                <form onSubmit={handleRegister}>
                  <Input 
                    label="Full Name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    error={errors.name}
                    required
                  />

                  <Input 
                    label="Email Address"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    error={errors.email}
                    required
                  />

                  <Input 
                    label="Password"
                    type="password"
                    placeholder="Ajay@123"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    error={errors.password}
                    required
                    minLength="8"
                  />

                  <Button 
                    type="submit" 
                    className="w-100 py-3 fw-bold mb-4 shadow-sm" 
                    loading={isSubmitting}
                  >
                    Create Account
                  </Button>
                </form>

                <div className="text-center">
                  <span className="text-muted small">Already registered? </span>
                  <Link to="/login" className="small fw-bold text-decoration-none">Sign in here</Link>
                </div>
            </Card>
          </Col>
        </Row>

        <Modal 
          show={showOtpModal} 
          onHide={() => setShowOtpModal(false)} 
          title="Verify Your Identity"
          onConfirm={handleVerifyOtp}
          isSubmitting={isSubmitting}
          confirmLabel="Confirm OTP"
        >
          <p className="text-center text-muted mb-4 px-3">
            We've sent a 6-digit confirmation code to <br/><strong>{email}</strong>
          </p>
          <Input 
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center fw-bold text-primary display-4"
            style={{ letterSpacing: '10px' }}
            required
          />
        </Modal>
      </Container>
    </div>
  );
};

export default Signup;
