import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/appContexts';
import { Container, Row, Col, Badge, Form } from 'react-bootstrap';
import { FaTrash, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { toast } from 'react-toastify';

import userService from '../services/userService';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await userService.updateUser(userId, { status: 'Active' });
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user completely?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Role' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const renderUserRow = (u) => (
    <tr key={u._id}>
      <td className="fw-medium">{u.name}</td>
      <td className="text-muted">{u.email}</td>
      <td>
        <Form.Select 
          size="sm" 
          value={u.role} 
          onChange={(e) => handleRoleChange(u._id, e.target.value)}
          disabled={u._id === user._id}
          style={{ width: '120px' }}
        >
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </Form.Select>
      </td>
      <td>
        <Badge bg={u.status === 'Active' ? 'success' : 'warning'}>
          {u.status || 'Active'}
        </Badge>
      </td>
      <td>
        <div className="d-flex gap-2">
          {u.status === 'Pending' && (
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => handleApprove(u._id)}
              icon={FaCheckCircle}
              title="Approve User"
            />
          )}
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDelete(u._id)}
            icon={FaTrash}
            disabled={u._id === user._id}
            title="Delete User"
          />
        </div>
      </td>
    </tr>
  );

  if (user?.role !== 'Admin') {
    return (
      <Container className="py-4 text-center">
        <h2 className="text-danger"><FaUserShield className="me-2" /> Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </Container>
    );
  }

  return (
    <Container className="py-4 fade-in">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0 text-primary fw-bold">
            <FaUserShield className="me-2" />
            User Management
          </h2>
          <p className="text-muted mb-0">Approve new signups, manage roles, and delete accounts.</p>
        </Col>
      </Row>

      <Card hover={false}>
        <DataTable 
          headers={tableHeaders} 
          data={users || []} 
          renderRow={renderUserRow}
          loading={loading} 
        />
      </Card>
    </Container>
  );
};

export default Users;
