import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IconUsers, IconUserCheck, IconUserX, IconUserMinus, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

export default function UsersList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/v1/users');
        setUsers(response.data?.content || response.data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = () => navigate('/admin/users/create');

  const columns = [
    { header: 'User Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status || 'Active';
        let variant = 'default';
        if (status === 'Active') variant = 'success';
        else if (status === 'Inactive') variant = 'warning';
        else if (status === 'Blocked') variant = 'danger';
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    { header: 'Joined On', accessorKey: 'createdAt', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ];

  const activeUsers = users.filter(u => u.status !== 'Blocked' && u.status !== 'Inactive').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users" 
        actions={
          <Button variant="primary" onClick={handleAddUser}>+ Add User</Button>
        }
      />

      <KPICardRow>
        <KPICard title="Total Users" value={users.length.toString()} icon={<IconUsers size={24} />} />
        <KPICard title="Active Users" value={activeUsers.toString()} icon={<IconUserCheck size={24} />} />
        <KPICard title="Inactive Users" value={(users.length - activeUsers).toString()} icon={<IconUserMinus size={24} />} />
      </KPICardRow>

      <DataTable 
        data={users}
        columns={columns}
      />
      
      {loading && <div className="text-center text-gray-500 py-4">Loading users...</div>}
      {!loading && users.length === 0 && <div className="text-center text-gray-500 py-4">No users found.</div>}
    </div>
  );
}
