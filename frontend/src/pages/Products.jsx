import { useLocation } from 'react-router-dom';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/appContexts';
import { Container, Row, Col, Badge, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMagic, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

// API Services
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import aiService from '../services/aiService';

// Common Components
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Products = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [editId, setEditId] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: ''
  });

  const [formData, setFormData] = useState({
    name: '', sku: '', description: '', category: '', price: '', stockLevel: '', reorderPoint: ''
  });
  const [images, setImages] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('stock') === 'low') {
      // We'll filter this in the frontend or backend. 
      // For now, let's just make it a specific filter if the backend supports it.
      setFilters(prev => ({ ...prev, search: '', stockStatus: 'low' }));
    }
  }, [location.search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        productService.getProducts(filters),
        categoryService.getCategories()
      ]);
      setProducts(prodsRes.data);
      setCategories(catsRes.data);
    } catch {
      toast.error('Failed to fetch product data');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      if (editId) {
        await productService.updateProduct(editId, data);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(data);
        toast.success('Product added successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || (editId ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', sku: '', description: '', category: '', price: '', stockLevel: '', reorderPoint: '' });
    setImages(null);
  };

  const handleEditClick = (prod) => {
    setEditId(prod._id);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      description: prod.description || '',
      category: prod.category._id || prod.category,
      price: prod.price,
      stockLevel: prod.stockLevel,
      reorderPoint: prod.reorderPoint
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted');
        fetchData();
      } catch {
        toast.error('Failed to delete product');
      }
    }
  };

  const generateAiDescription = async () => {
    if (!formData.name || !formData.category) {
      toast.warning('Please enter a Product Name and select a Category first.');
      return;
    }
    
    setIsGeneratingAi(true);
    try {
      const selectedCategory = categories.find(c => c._id === formData.category);
      const categoryName = selectedCategory ? selectedCategory.name : 'General';
      
      const { data } = await aiService.generateDescription({
        productName: formData.name,
        categoryName: categoryName,
        tags: 'ecommerce, professional'
      });
      
      setFormData({ ...formData, description: data.description });
      toast.success('AI description generated!');
    } catch (error) {
      console.error('AI Gen Error:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`AI Failed: ${errorMsg}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const tableHeaders = [
    { label: 'SKU' },
    { label: 'Product Name' },
    { label: 'Category' },
    { label: 'Wholesale Price' },
    { label: 'Stock' },
    { label: 'Actions', className: 'text-end' }
  ];

  const renderProductRow = (prod) => (
    <tr key={prod._id}>
      <td><Badge bg="secondary" pill>{prod.sku}</Badge></td>
      <td className="fw-bold">{prod.name}</td>
      <td>{prod.category?.name || 'N/A'}</td>
      <td>${prod.price.toFixed(2)}</td>
      <td>
        <Badge bg={prod.stockLevel <= prod.reorderPoint ? 'danger' : 'success'}>
          {prod.stockLevel}
        </Badge>
      </td>
      <td className="text-end">
        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(prod)}>
          <FaEdit />
        </Button>
        {user?.role === 'Admin' && (
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(prod._id)}>
            <FaTrash />
          </Button>
        )}
      </td>
    </tr>
  );

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-gradient">Godown Products Inventory</h2>
        <Button icon={FaPlus} onClick={() => { handleCloseModal(); setShowModal(true); }}>
          Add Product
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="mb-4" bodyClassName="py-3">
        <Row className="g-2 align-items-end">
          <Col md={2}>
            <Input 
              label="Search Product" 
              name="search" 
              placeholder="Name or SKU..." 
              value={filters.search} 
              onChange={handleFilterChange}
              className="mb-0"
            />
          </Col>
          <Col md={2}>
            <Input 
              type="select" 
              label="Category" 
              name="category" 
              placeholder="All Categories" 
              value={filters.category} 
              onChange={handleFilterChange}
              options={categories.map(c => ({ label: c.name, value: c._id }))}
              className="mb-0"
            />
          </Col>
          <Col md={2}>
            <Input 
              type="select" 
              label="Stock Status" 
              name="stockStatus" 
              placeholder="All Status" 
              value={filters.stockStatus} 
              onChange={handleFilterChange}
              options={[
                { label: 'Low Stock', value: 'low' },
                { label: 'Healthy', value: 'healthy' }
              ]}
              className="mb-0"
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small mb-1">Price Range</Form.Label>
            <div className="d-flex gap-2">
              <Input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} className="mb-0" />
              <Input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} className="mb-0" />
            </div>
          </Col>
          <Col md={1} className="text-end ms-auto">
             <Button variant="outline-secondary" size="sm" onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', stockStatus: '' })}>
               Clear
             </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <DataTable 
          headers={tableHeaders}
          data={products}
          renderRow={renderProductRow}
          loading={loading}
          emptyMessage="No products match your criteria."
        />
      </Card>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        title={editId ? "Edit Product" : "Add New Product"}
        size="lg"
        onConfirm={handleCreate}
        isSubmitting={isSubmitting}
      >
        <Row>
          <Col md={6}>
            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
          </Col>
          <Col md={6}>
            <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} required />
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Input 
              type="select" 
              label="Category" 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
              options={categories.map(c => ({ label: c.name, value: c._id }))}
              placeholder="Select Category..."
            />
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Input label="Wholesale Price ($)" type="number" name="price" value={formData.price} onChange={handleChange} required />
          </Col>
          <Col md={4}>
            <Input label="Initial Stock" type="number" name="stockLevel" value={formData.stockLevel} onChange={handleChange} required />
          </Col>
          <Col md={4}>
            <Input label="Reorder Point" type="number" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} required />
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="fw-semibold">Product Description</label>
          <Button variant="outline-primary" size="sm" onClick={generateAiDescription} loading={isGeneratingAi} icon={FaMagic}>
            Generate via AI
          </Button>
        </div>
        <Input as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} />

        <Input label="Product Images" type="file" multiple onChange={handleFileChange} />
      </Modal>
    </Container>
  );
};

export default Products;
