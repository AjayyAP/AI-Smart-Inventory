import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import productService from '../services/productService';

// Common Components
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await productService.getProducts();
      setProducts(data);
    } catch {
      toast.error('Failed to fetch inventory reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const tableHeaders = [
    { label: 'SKU' },
    { label: 'Product Name' },
    { label: 'Category' },
    { label: 'Price' },
    { label: 'Current Stock' },
    { label: 'Status' }
  ];

  const renderRow = (prod) => {
    const isLowStock = prod.stockLevel <= prod.reorderPoint;
    return (
      <tr key={prod._id}>
        <td className="fw-bold text-secondary">{prod.sku}</td>
        <td className="fw-semibold">{prod.name}</td>
        <td>{prod.category?.name || 'N/A'}</td>
        <td>${prod.price.toFixed(2)}</td>
        <td className={isLowStock ? 'text-danger fw-bold' : ''}>
          {prod.stockLevel}
        </td>
        <td>
          <Badge bg={isLowStock ? 'danger' : 'success'} pill>
            {isLowStock ? 'Needs Restock' : 'Healthy'}
          </Badge>
        </td>
      </tr>
    );
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Godown Inventory Reporting</h2>
          <p className="text-muted small">Comprehensive view of godown stock status.</p>
        </div>
      </div>

      <Card>
        <DataTable 
          headers={tableHeaders}
          data={products}
          renderRow={renderRow}
          loading={loading}
          emptyMessage="No inventory records available for reporting."
        />
      </Card>
    </Container>
  );
};

export default Reports;
