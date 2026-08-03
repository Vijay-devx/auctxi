import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function UserCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => navigate('/admin/users');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/v1/users', formData);
      toast.success('User created successfully');
      navigate('/admin/users');
    } catch (error) {
      console.error('Failed to create user', error);
      // The interceptor already shows a toast, so we don't need to duplicate it unless we want specific handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader 
        title="Add New User" 
        backUrl="/admin/users"
      />

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Username *</label>
                <input 
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="Enter username" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <input 
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="Enter email address" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input 
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="Create a password" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select 
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Auction Manager</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
