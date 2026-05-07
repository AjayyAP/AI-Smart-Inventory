import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import activityService from '../services/activityService';

// Common Components
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await activityService.getActivityLogs();
      setLogs(data);
    } catch {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const tableHeaders = [
    { label: 'Timestamp' },
    { label: 'User' },
    { label: 'Action' }
  ];

  const renderRow = (log) => (
    <tr key={log._id}>
      <td className="text-muted small">
        {new Date(log.createdAt).toLocaleString()}
      </td>
      <td>
        <Badge bg="info" pill className="me-2">{log.user?.role}</Badge>
        <span className="fw-semibold">{log.user?.name}</span>
      </td>
      <td className="fw-bold">{log.action}</td>
    </tr>
  );

  return (
    <Container fluid>
      <div className="mb-4">
        <h2 className="fw-bold text-gradient mb-1">Audit Trail</h2>
        <p className="text-muted">A complete history of all system events and user actions.</p>
      </div>
      
      <Card>
        <DataTable 
          headers={tableHeaders}
          data={logs}
          renderRow={renderRow}
          loading={loading}
          emptyMessage="No activity logs found."
        />
      </Card>
    </Container>
  );
};

export default ActivityLogs;
