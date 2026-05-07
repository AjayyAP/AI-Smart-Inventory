import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/appContexts';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

// Common Components
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { forgotPassword, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setStep(2); // Move to reset step
    } catch {
      // Error handled in context via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email, otp, newPassword);
      navigate('/login'); // Redirect to login on success
    } catch {
       // Error handled in context
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
               <div className="text-center mb-4">
                  <h2 className="fw-bold text-gradient mb-2" style={{ letterSpacing: '-0.5px' }}>
                    {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                  </h2>
                  <p className="text-muted small">
                    {step === 1 
                      ? "Enter your email and we'll send a 6-digit OTP." 
                      : `Enter the code sent to ${email} and your new password.`}
                  </p>
               </div>
                
               {step === 1 ? (
                 <form onSubmit={handleRequestOtp}>
                   <Input 
                     label="Email Address"
                     type="email"
                     placeholder="name@company.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                   <Button 
                     type="submit" 
                     className="w-100 py-3 fw-bold mb-3 shadow-sm text-white" 
                     style={{ background: 'var(--primary-color)', border: 'none' }}
                     loading={isSubmitting}
                   >
                     Send OTP
                   </Button>
                 </form>
               ) : (
                 <form onSubmit={handleResetPassword}>
                   <Input 
                     label="6-Digit OTP"
                     type="text"
                     placeholder="000000"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value)}
                     maxLength={6}
                     className="fw-bold text-primary text-center"
                     style={{ letterSpacing: '8px' }}
                     required
                   />
                   <Input 
                     label="New Password"
                     type="password"
                     placeholder="••••••••"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     required
                   />
                   <Button 
                     type="submit" 
                     className="w-100 py-3 fw-bold mb-3 shadow-sm text-white" 
                     style={{ background: 'var(--primary-color)', border: 'none' }}
                     loading={isSubmitting}
                   >
                     Reset Password
                   </Button>
                 </form>
               )}

                <div className="text-center mt-2">
                  <Link to="/login" className="small fw-bold text-decoration-none text-muted">
                    Back to Login
                  </Link>
                </div>
            </Card>
            <p className="text-center text-white mt-4 small opacity-75">
              © 2026 AI Smart Inventory & Supply Chain
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
