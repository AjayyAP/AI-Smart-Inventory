import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../context/appContexts';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import { FaSun, FaMoon, FaSignOutAlt, FaBars } from 'react-icons/fa';
import ChatBot from './ChatBot';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar variant={theme === 'dark' ? 'dark' : 'light'} expand="lg" sticky="top" className="shadow-sm">
        <Container fluid>
          {user && (
            <Navbar.Brand href="#home" onClick={(e) => { e.preventDefault(); handleShow(); }}>
              <FaBars className="me-2" style={{ cursor: 'pointer' }} />
              AI Smart Inventory
            </Navbar.Brand>
          )}
          {!user && <Navbar.Brand as={Link} to="/">AI Smart Inventory</Navbar.Brand>}
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Nav.Link onClick={toggleTheme} className="d-flex align-items-center">
                {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
              </Nav.Link>
              {user && (
                <Nav.Link onClick={handleLogout} className="d-flex align-items-center text-danger fw-bold ms-3">
                  <FaSignOutAlt size={18} className="me-2" /> Logout
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar Offcanvas */}
      {user && (
        <Offcanvas show={show} onHide={handleClose} placement="start" data-bs-theme={theme}>
          <Offcanvas.Header closeButton className="border-bottom">
            <Offcanvas.Title className="fw-bold fs-5">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Nav className="flex-column mt-3 fs-6 fw-medium">
              <Nav.Link as={Link} to="/dashboard" onClick={handleClose} className="px-4 py-3 border-bottom">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/products" onClick={handleClose} className="px-4 py-3 border-bottom">Products</Nav.Link>
              <Nav.Link as={Link} to="/categories" onClick={handleClose} className="px-4 py-3 border-bottom">Categories</Nav.Link>
              <Nav.Link as={Link} to="/suppliers" onClick={handleClose} className="px-4 py-3 border-bottom">Suppliers</Nav.Link>
              <Nav.Link as={Link} to="/orders" onClick={handleClose} className="px-4 py-3 border-bottom">Orders</Nav.Link>
              <Nav.Link as={Link} to="/reports" onClick={handleClose} className="px-4 py-3 border-bottom">Reports</Nav.Link>
              {user?.role === 'Admin' && (
                <>
                  <Nav.Link as={Link} to="/activity-logs" onClick={handleClose} className="px-4 py-3 border-bottom">Activity Logs</Nav.Link>
                  <Nav.Link as={Link} to="/users" onClick={handleClose} className="px-4 py-3">Manage Users</Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Main Content Area */}
      <div style={{ padding: '24px 20px' }}>
        <Container fluid>
          <Outlet />
        </Container>
      </div>
      
      {/* Global AI Chatbot */}
      {user && <ChatBot />}
    </>
  );
};

export default Layout;
