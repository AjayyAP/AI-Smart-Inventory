import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/appContexts';
import { Container, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaSearch, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';

// Common Components
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Categories = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await categoryService.getCategories({ search });
      setCategories(data);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      if (editId) {
        await categoryService.updateCategory(editId, formData);
        toast.success('Category updated');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category added');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || (editId ? 'Failed to update category' : 'Failed to add category'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', description: '' });
  };

  const handleEditClick = (cat) => {
    setEditId(cat._id);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch {
        toast.error('Failed to delete category');
      }
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Description' },
    { label: 'Actions', className: 'text-end' }
  ];

  const renderRow = (cat) => (
    <tr key={cat._id}>
      <td className="fw-bold text-primary">{cat.name}</td>
      <td className="text-muted">{cat.description || 'N/A'}</td>
      <td className="text-end">
        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(cat)}>
          <FaEdit />
        </Button>
        {user?.role === 'Admin' && (
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat._id)}>
            <FaTrash />
          </Button>
        )}
      </td>
    </tr>
  );

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-gradient">Product Categories</h2>
        <Button icon={FaPlus} onClick={() => { handleCloseModal(); setShowModal(true); }}>
          Add Category
        </Button>
      </div>

      <Card className="mb-4">
        <Row className="align-items-center">
          <Col md={4}>
            <Input 
              placeholder="Search by name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="mb-0"
              icon={FaSearch}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <DataTable 
          headers={tableHeaders}
          data={categories}
          renderRow={renderRow}
          loading={loading}
        />
      </Card>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        title={editId ? "Edit Category" : "Add New Category"}
        onConfirm={handleCreate}
        isSubmitting={isSubmitting}
      >
        <Input 
          label="Category Name" 
          name="name"
          value={formData.name} 
          onChange={handleInputChange} 
          required 
        />
        <Input 
          label="Description" 
          name="description"
          as="textarea" 
          rows={3} 
          value={formData.description} 
          onChange={handleInputChange} 
        />
      </Modal>
    </Container>
  );
};

export default Categories;
