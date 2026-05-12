import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/appContexts';
import { Container, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supplierService from '../services/supplierService';

// Common Components
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Suppliers = () => {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', contactEmail: '', contactPhone: '', address: ''
  });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supplierService.getSuppliers({ search });
      setSuppliers(data);
    } catch {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuppliers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchSuppliers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      if (editId) {
        await supplierService.updateSupplier(editId, formData);
        toast.success('Supplier updated');
      } else {
        await supplierService.createSupplier(formData);
        toast.success('Supplier added');
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || (editId ? 'Failed to update supplier' : 'Failed to add supplier'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', contactEmail: '', contactPhone: '', address: '' });
  };

  const handleEditClick = (sup) => {
    setEditId(sup._id);
    setFormData({
      name: sup.name,
      contactEmail: sup.contactEmail,
      contactPhone: sup.contactPhone,
      address: sup.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.deleteSupplier(id);
        toast.success('Supplier deleted');
        fetchSuppliers();
      } catch {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Phone' },
    { label: 'Address' },
    { label: 'Actions', className: 'text-end' }
  ];

  const renderRow = (sup) => (
    <tr key={sup._id}>
      <td className="fw-bold">{sup.name}</td>
      <td>{sup.contactEmail}</td>
      <td>{sup.contactPhone}</td>
      <td className="text-muted"><small>{sup.address}</small></td>
      <td className="text-end">
        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(sup)}>
          <FaEdit />
        </Button>
        {user?.role === 'Admin' && (
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(sup._id)}>
            <FaTrash />
          </Button>
        )}
      </td>
    </tr>
  );

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-gradient">Wholesale Suppliers</h2>
        <Button icon={FaPlus} onClick={() => { handleCloseModal(); setShowModal(true); }}>
          Add Wholesale Supplier
        </Button>
      </div>

      <Card className="mb-4">
        <Row>
          <Col md={4}>
            <Input 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="mb-0"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <DataTable 
          headers={tableHeaders}
          data={suppliers}
          renderRow={renderRow}
          loading={loading}
        />
      </Card>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg"
        title={editId ? "Edit Wholesale Supplier" : "Add New Wholesale Supplier"}
        onConfirm={handleCreate}
        isSubmitting={isSubmitting}
      >
        <Row>
          <Col md={6}>
            <Input label="Wholesale Supplier Name" name="name" value={formData.name} onChange={handleChange} required />
          </Col>
          <Col md={6}>
            <Input label="Contact Email" type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Input label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
          </Col>
          <Col md={6}>
            <Input label="Address" name="address" value={formData.address} onChange={handleChange} required />
          </Col>
        </Row>
      </Modal>
    </Container>
  );
};

export default Suppliers;
