import React from 'react';
import { Table, Spinner } from 'react-bootstrap';

const DataTable = ({ 
  headers, 
  data, 
  renderRow, 
  loading = false, 
  emptyMessage = 'No data found.',
  className = ''
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className={header.className}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-5 text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => renderRow(item, idx))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable;
