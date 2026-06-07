import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';
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

  const handleExportPdf = () => {
    if (products.length === 0) {
      toast.warning('No inventory records available to export');
      return;
    }

    const reportDate = new Date();
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('AI Smart Godown Inventory Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on: ${reportDate.toLocaleDateString()} ${reportDate.toLocaleTimeString()}`, 14, 26);

    autoTable(doc, {
      startY: 34,
      head: [['SKU', 'Product Name', 'Category', 'Wholesale Price', 'Current Stock', 'Status']],
      body: products.map((prod) => {
        const isLowStock = prod.stockLevel <= prod.reorderPoint;
        return [
          prod.sku,
          prod.name,
          prod.category?.name || 'N/A',
          `$${Number(prod.price || 0).toFixed(2)}`,
          prod.stockLevel,
          isLowStock ? 'Needs Restock' : 'Healthy',
        ];
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [13, 110, 253] },
    });

    doc.save(`godown-inventory-report-${reportDate.toISOString().slice(0, 10)}.pdf`);
    toast.success('Inventory report PDF downloaded');
  };


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
        <Button icon={FaFilePdf} onClick={handleExportPdf} disabled={loading || products.length === 0}>
          Export PDF
        </Button>
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
