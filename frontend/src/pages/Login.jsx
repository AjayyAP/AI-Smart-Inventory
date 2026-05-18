import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/appContexts';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Common Components
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { isBlank, isValidEmail } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Read pendingApproval flag passed from Signup page after OTP verification, or default false
  const [pendingApproval, setPendingApproval] = useState(location.state?.pendingApproval || false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.';
    if (isBlank(password)) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setPendingApproval(false);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (msg.includes('verify your email')) {
        setShowOtpModal(true);
      } else if (msg.includes('pending Admin approval')) {
        setPendingApproval(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    try {
      const result = await verifyOtp(email, otp);
      setShowOtpModal(false);
      if (result && result.token) {
        navigate('/dashboard');
      } else {
        setPendingApproval(true);
      }
      // If no token (pending), stay on login page and show pending message
    } catch {
      setShowOtpModal(false); // close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'var(--primary-color)', overflow: 'hidden' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5} xl={4}>
            <Card className="p-4">
               <div className="text-center mb-5">
                  <h1 className="fw-bold text-gradient mb-2" style={{ letterSpacing: '-1px' }}>Welcome Back</h1>
                  <p className="text-muted">Sign in to manage your inventory</p>
                </div>
                
                {pendingApproval && (
                  <div className="alert alert-warning text-center mb-4 border-0 shadow-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                    <strong>Awaiting Approval</strong><br/>
                    Your email is verified, but an Admin must approve your account before you can log in.
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <Input 
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    error={errors.email}
                    required
                  />

                  <div className="d-flex justify-content-between mb-1">
                    <label className="fw-semibold small">Password</label>
                    <Link to="/forgot-password" className="small text-decoration-none">Forgot Password?</Link>
                  </div>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    error={errors.password}
                    required
                  />

                  <Button 
                    type="submit" 
                    className="w-100 py-3 fw-bold mb-4 shadow-sm text-white" 
                    style={{ background: 'var(--primary-color)', border: 'none' }}
                    loading={isSubmitting}
                  >
                    Log In
                  </Button>
                </form>

                <div className="text-center">
                  <span className="text-muted small">New to the platform? </span>
                  <Link to="/signup" className="small fw-bold text-decoration-none">Create an account</Link>
                </div>
            </Card>
            <p className="text-center text-white mt-4 small opacity-75">
              © 2026 AI Smart Godown Inventory
            </p>
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
            Your email is not verified. Please enter the 6-digit code sent to <br/><strong>{email}</strong>
          </p>
          <Input 
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center fw-bold text-primary display-6"
            style={{ letterSpacing: '10px' }}
            required
          />
        </Modal>
      </Container>
    </div>
  );
};

export default Login;
