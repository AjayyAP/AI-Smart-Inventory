import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaBoxOpen, FaTruck, FaShoppingCart, FaExclamationTriangle, FaDollarSign } from 'react-icons/fa';
import { Table } from 'react-bootstrap';
import { ThemeContext } from '../context/appContexts';
import analyticsService from '../services/analyticsService';
import aiService from '../services/aiService';
import Card from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const KpiCard = ({ title, value, icon, color, bgOpacity = '10' }) => {
  const iconElement = React.createElement(icon, { size: 22, className: `text-${color}` });

  return (
    <Card className="h-100 border-0 shadow-sm p-2">
       <div className="d-flex align-items-center justify-content-between p-2">
          <div>
            <h6 className="text-muted mb-2 small text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>{title}</h6>
            <h2 className="mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>
              {typeof value === 'number' && title.includes('Revenue') ? `$${value.toLocaleString()}` : value}
            </h2>
          </div>
          <div className={`p-3 rounded-circle bg-${color} bg-opacity-${bgOpacity}`}>
            {iconElement}
          </div>
       </div>
    </Card>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentOrders: []
  });
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [reorderAi, setReorderAi] = useState({ summary: '', recommendations: [], loading: false });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await analyticsService.getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary data', error);
      }
    };
    fetchSummary();
  }, []);

  const handleFetchReorderAi = async () => {
    if (summary.lowStockProducts === 0) return;
    setReorderAi(prev => ({ ...prev, loading: true }));
    try {
      const { data } = await aiService.getSmartReorderRecommendations();
      setReorderAi({ summary: data.summary, recommendations: data.recommendations, loading: false });
    } catch (error) {
      console.error('AI Reorder error', error);
      setReorderAi(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Container fluid>
      <div className="mb-4">
        <h2 className="fw-bold text-gradient mb-1">Inventory Dashboard</h2>
        <p className="text-muted">Real-time overview of your supply chain performance.</p>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <KpiCard title="Total Products" value={summary?.totalProducts || 0} icon={FaBoxOpen} color="primary" />
        </Col>
        <Col md={3}>
          <KpiCard title="Active Orders" value={summary?.totalOrders || 0} icon={FaShoppingCart} color="success" />
        </Col>
        <Col md={3}>
          <KpiCard title="Total Suppliers" value={summary?.totalSuppliers || 0} icon={FaTruck} color="info" />
        </Col>
        <Col md={3}>
          <KpiCard title="Low Stock Assets" value={summary?.lowStockProducts || 0} icon={FaExclamationTriangle} color="warning" />
        </Col>
      </Row>

      {/* Charts & Revenue */}
      <Row className="g-4">
        <Col lg={8}>
          <Card title="Recent Transactions" className="shadow-sm border-0 h-100" bodyClassName="p-0">
            <div className="table-responsive">
              <Table hover className={`mb-0 align-middle ${theme === 'dark' ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="py-3">Supplier</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders && summary.recentOrders.length > 0 ? (
                    summary.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-4"><Badge bg="secondary">{order.orderNumber}</Badge></td>
                        <td className="fw-medium">{order.supplier?.name || 'N/A'}</td>
                        <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <Badge bg={order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No recent transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <div className="d-flex flex-column h-100 gap-4">
            <Card className="text-white border-0 shadow-sm flex-fill d-flex flex-column justify-content-center text-center p-4 bg-primary-solid" style={{ borderRadius: '24px' }}>
               <div className="mb-3 p-3 bg-white bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <FaDollarSign size={32} />
               </div>
               <h6 className="text-uppercase small fw-bold opacity-75 mb-2">Total Gross Revenue</h6>
               <h1 className="fw-bold mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>${(summary?.totalRevenue || 0).toLocaleString()}</h1>
               <p className="mt-3 small opacity-75 fw-medium">Lifetime sales performance</p>
            </Card>
            
            {summary.lowStockProducts > 0 && (
              <Card title="AI Reorder Recommendations" className="border-0 shadow-sm border-top border-warning border-4">
                {reorderAi.summary ? (
                  <div className="small">
                    <p className="text-muted mb-2">{reorderAi.summary}</p>
                    <ul className="list-unstyled mb-0">
                      {reorderAi.recommendations.map((rec, i) => (
                        <li key={i} className="mb-2 d-flex justify-content-between align-items-center">
                          <span>{rec.name} ({rec.sku})</span>
                          <Badge bg={rec.priority === 'High' ? 'danger' : 'warning'}>+{rec.suggestedAmount}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-muted small mb-3">You have {summary?.lowStockProducts || 0} products below reorder level.</p>
                    <Button 
                      size="sm" 
                      variant="warning" 
                      onClick={handleFetchReorderAi} 
                      loading={reorderAi.loading}
                    >
                      Analyze with AI
                    </Button>
                  </div>
                )}
              </Card>
            )}

            <Card title="Quick Actions" className="border-0 shadow-sm h-100">
               <div className="d-grid gap-3">
                 <Button 
                  variant="outline-primary"
                  onClick={() => navigate('/reports')}
                  className="text-start px-3 py-3 rounded-4 small fw-semibold border-2"
                >
                  Generate Inventory Report
                </Button>
                 <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/activity-logs')}
                  className="text-start px-3 py-3 rounded-4 small fw-semibold border-2"
                >
                  View Recent Activity
                </Button>
                 <Button 
                  variant="outline-info"
                  onClick={() => navigate('/products?stock=low')}
                  className="text-start px-3 py-3 rounded-4 small fw-semibold border-2 text-info"
                >
                  Check Reorder Alerts
                </Button>
               </div>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
