import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/appContexts';
import { Container, Row, Col, Table as BSTable, Form } from 'react-bootstrap';
import { FaPlus, FaCheck, FaTimes, FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import api from '../services/api';

// Common Components
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    supplier: '',
    startDate: '',
    endDate: ''
  });

  const [formData, setFormData] = useState({
    orderNumber: `ORD-${Date.now()}`,
    supplier: '',
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1, priceAtPurchase: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordRes, supRes, prodRes] = await Promise.all([
        orderService.getOrders(filters),
        api.get('/suppliers'),
        api.get('/products')
      ]);
      setOrders(ordRes.data);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
    } catch {
      toast.error('Failed to fetch orders data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0) return;
    const prodDetails = products.find(p => p._id === currentItem.product);
    if (!prodDetails) return;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product: currentItem.product,
          name: prodDetails.name,
          quantity: parseInt(currentItem.quantity),
          priceAtPurchase: parseFloat(currentItem.priceAtPurchase || prodDetails.price)
        }
      ]
    });
    setCurrentItem({ product: '', quantity: 1, priceAtPurchase: 0 });
  };

  const removeItem = (idx) => {
    const newItems = [...formData.items];
    newItems.splice(idx, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmitOrder = async () => {
    let finalItems = [...formData.items];
    
    // Auto-add if user forgot to click the '+' button but filled the fields
    if (currentItem.product && currentItem.quantity > 0) {
       const prodDetails = products.find(p => p._id === currentItem.product);
       if (prodDetails && !finalItems.some(i => i.product === currentItem.product)) {
         finalItems.push({
           product: currentItem.product,
           name: prodDetails.name,
           quantity: parseInt(currentItem.quantity),
           priceAtPurchase: parseFloat(currentItem.priceAtPurchase || prodDetails.price)
         });
       }
    }

    if (finalItems.length === 0) {
      return toast.warning('Please add at least one item using the + button');
    }
    if (!formData.supplier) {
      return toast.warning('Please select a supplier');
    }

    setIsSubmitting(true);
    const totalAmount = finalItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

    const payload = {
      orderNumber: formData.orderNumber,
      supplier: formData.supplier,
      items: finalItems.map(i => ({ product: i.product, quantity: i.quantity, priceAtPurchase: i.priceAtPurchase })),
      totalAmount
    };

    try {
      if (editingId) {
        await orderService.updateOrder(editingId, payload);
        toast.success('Order updated successfully');
      } else {
        await orderService.createOrder(payload);
        toast.success('Order created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ orderNumber: `ORD-${Date.now()}`, supplier: '', items: [] });
      setCurrentItem({ product: '', quantity: 1, priceAtPurchase: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} order`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (order) => {
    setEditingId(order._id);
    setFormData({
      orderNumber: order.orderNumber,
      supplier: order.supplier?._id || order.supplier,
      items: order.items.map(i => ({
        product: i.product?._id || i.product,
        name: i.product?.name || 'Unknown',
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase
      }))
    });
    setShowModal(true);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await orderService.updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.deleteOrder(id);
        toast.success('Order deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete order');
      }
    }
  };

  const tableHeaders = [
    { label: 'Order #' },
    { label: 'Supplier' },
    { label: 'Total Amount' },
    { label: 'Status' },
    { label: 'Created By' },
    { label: 'Actions', className: 'text-end' }
  ];

  const renderRow = (ord) => (
    <tr key={ord._id}>
      <td className="fw-bold text-primary">{ord.orderNumber}</td>
      <td>{ord.supplier?.name || 'N/A'}</td>
      <td>${ord.totalAmount.toFixed(2)}</td>
      <td>
        <Form.Select 
          size="sm" 
          value={ord.status} 
          onChange={(e) => updateStatus(ord._id, e.target.value)}
          style={{ 
            width: '130px', 
            fontWeight: '600',
            color: ord.status === 'Completed' ? 'var(--bs-success)' : ord.status === 'Pending' ? 'var(--bs-warning)' : 'var(--bs-danger)'
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed / Confirm</option>
        </Form.Select>
      </td>
      <td>{ord.user?.name || 'System'}</td>
      <td className="text-end">
        {user?.role === 'Admin' && (
          <>
            <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(ord)}>
              <FaEdit />
            </Button>
            <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(ord._id)}>
              <FaTrash />
            </Button>
          </>
        )}
      </td>
    </tr>
  );

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-gradient">Purchase Orders</h2>
        <Button icon={FaPlus} onClick={() => {
          setEditingId(null);
          setFormData({ orderNumber: `ORD-${Date.now()}`, supplier: '', items: [] });
          setShowModal(true);
        }}>
          Create Order
        </Button>
      </div>

      <Card className="mb-4" bodyClassName="py-3">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Input label="Search Order" name="search" placeholder="Order #" value={filters.search} onChange={handleFilterChange} className="mb-0" />
          </Col>
          <Col md={2}>
            <Input 
              type="select" 
              label="Status" 
              name="status" 
              placeholder="All Status" 
              value={filters.status} 
              onChange={handleFilterChange}
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Completed', value: 'Completed' }
              ]}
              className="mb-0"
            />
          </Col>
          <Col md={3}>
            <Input 
              type="select" 
              label="Supplier" 
              name="supplier" 
              placeholder="All Suppliers" 
              value={filters.supplier} 
              onChange={handleFilterChange}
              options={suppliers.map(s => ({ label: s.name, value: s._id }))}
              className="mb-0"
            />
          </Col>
          <Col md={2}>
            <Input type="date" label="From" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mb-0" />
          </Col>
          <Col md={2}>
            <Input type="date" label="To" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mb-0" />
          </Col>
        </Row>
      </Card>

      <Card>
        <DataTable 
          headers={tableHeaders}
          data={orders}
          renderRow={renderRow}
          loading={loading}
        />
      </Card>

      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setEditingId(null);
        }} 
        size="lg"
        title={editingId ? 'Edit Order' : 'Create Purchase Order'}
        onConfirm={handleSubmitOrder}
        isSubmitting={isSubmitting}
        confirmLabel={editingId ? 'Update Order' : 'Create Order'}
      >
        <Row>
          <Col md={6}>
            <Input label="Order Number" value={formData.orderNumber} disabled readOnly />
          </Col>
          <Col md={6}>
            <Input 
              type="select" 
              label="Supplier" 
              required 
              value={formData.supplier} 
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              options={suppliers.map(s => ({ label: s.name, value: s._id }))}
              placeholder="Select Supplier..."
            />
          </Col>
        </Row>

        <hr />
        <h6 className="fw-bold mb-3">Order Items</h6>
        
        <Row className="g-2 align-items-end mb-3">
          <Col md={5}>
            <Input 
              type="select" 
              label="Product" 
              value={currentItem.product} 
              onChange={(e) => {
                const p = products.find(prod => prod._id === e.target.value);
                setCurrentItem({...currentItem, product: e.target.value, priceAtPurchase: p ? p.price : 0});
              }}
              options={products.map(p => ({ label: `${p.name} ($${p.price})`, value: p._id }))}
              placeholder="Select Product..."
              className="mb-0"
            />
          </Col>
          <Col md={3}>
            <Input type="number" label="Qty" min="1" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} className="mb-0" />
          </Col>
          <Col md={3}>
            <Input type="number" label="Unit Price" step="0.01" value={currentItem.priceAtPurchase} onChange={(e) => setCurrentItem({...currentItem, priceAtPurchase: e.target.value})} className="mb-0" />
          </Col>
          <Col md={1}>
            <Button variant="secondary" onClick={handleAddItem} className="w-100"><FaPlus /></Button>
          </Col>
        </Row>

        {formData.items.length > 0 && (
          <BSTable responsive bordered size="sm">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th className="text-end"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.priceAtPurchase).toFixed(2)}</td>
                  <td>${(item.quantity * item.priceAtPurchase).toFixed(2)}</td>
                  <td className="text-end">
                    <Button variant="link text-danger p-0" onClick={() => removeItem(idx)}><FaTimes /></Button>
                  </td>
                </tr>
              ))}
              <tr className="table-secondary fw-bold">
                <td colSpan="3" className="text-end">Grand Total</td>
                <td colSpan="2">${formData.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </BSTable>
        )}
      </Modal>
    </Container>
  );
};

export default Orders;
