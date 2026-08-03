import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import KPICardRow from '../../../components/ui/KPICardRow';
import KPICard from '../../../components/ui/KPICard';
import SearchFilterBar from '../../../components/ui/SearchFilterBar';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ActionMenu from '../../../components/ui/ActionMenu';
import DetailPanel from '../../../components/ui/DetailPanel';
import { IconReceipt, IconCheck, IconClock, IconX, IconDownload, IconEye } from '@tabler/icons-react';
import { paymentApi } from '../../../services/api';

export default function PaymentsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.get('/api/v1/payments/admin/transactions');
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to fetch all payments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const columns = [
    { header: 'Transaction ID', accessorKey: 'id', cell: ({row}) => row.original.id.substring(0, 8) + '...' },
    { header: 'User ID', accessorKey: 'userId', cell: ({row}) => row.original.userId.substring(0, 8) + '...' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Amount', accessorKey: 'amount', cell: ({row}) => `₹${row.original.amount.toLocaleString()}` },
    { 
      header: 'Date & Time', 
      accessorKey: 'createdAt', 
      cell: ({row}) => {
        let dateStr = row.original.createdAt;
        if (!dateStr.endsWith('Z')) dateStr += 'Z';
        return new Date(dateStr).toLocaleString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        });
      }
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant = 'default';
        if (status === 'SUCCESS') variant = 'success';
        else if (status === 'PENDING') variant = 'warning';
        else if (status === 'FAILED') variant = 'danger';
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    { header: 'Gateway Ref', accessorKey: 'gatewayReferenceId', cell: ({row}) => row.original.gatewayReferenceId || '-' },
    {
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => (
        <ActionMenu actions={[
          { label: 'View Details', icon: IconEye, onClick: () => handleViewDetails(row.original) },
          { label: 'Download Receipt', icon: IconDownload, onClick: () => window.alert('Downloading receipt for transaction: ' + row.original.id + '\n(Mock implementation)') }
        ]} />
      )
    }
  ];

  const filters = [
    {
      name: 'type',
      placeholder: 'Payment Type',
      options: [
        { label: 'Registration', value: 'REGISTRATION_FEE' },
        { label: 'Purse Deposit', value: 'PURSE_DEPOSIT' },
        { label: 'Refund', value: 'PURSE_REFUND' },
      ]
    },
    {
      name: 'status',
      placeholder: 'All Statuses',
      options: [
        { label: 'Successful', value: 'SUCCESS' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' },
      ]
    }
  ];

  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredPayments = payments.filter(p => {
    if (searchQuery && !p.id.includes(searchQuery) && !p.userId.includes(searchQuery)) return false;
    if (filterType && p.type !== filterType) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const successfulCount = filteredPayments.filter(p => p.status === 'SUCCESS').length;
  const pendingCount = filteredPayments.filter(p => p.status === 'PENDING').length;
  const failedCount = filteredPayments.filter(p => p.status === 'FAILED').length;
  const totalAmount = filteredPayments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Global Payments" 
        actions={
          <Button variant="outline" icon={<IconDownload size={18} />}>Export</Button>
        }
      />

      <KPICardRow>
        <KPICard title="Total Volume" value={`₹${totalAmount.toLocaleString()}`} icon={<IconReceipt size={24} />} />
        <KPICard title="Successful Transactions" value={successfulCount} icon={<IconCheck size={24} />} />
        <KPICard title="Pending Transactions" value={pendingCount} icon={<IconClock size={24} />} />
        <KPICard title="Failed Transactions" value={failedCount} icon={<IconX size={24} />} />
      </KPICardRow>

      <SearchFilterBar 
        searchPlaceholder="Search payments by ID, User..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={(name, value) => {
          if (name === 'type') setFilterType(value);
          if (name === 'status') setFilterStatus(value);
        }}
      />

      {loading ? (
         <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">Loading transactions...</div>
      ) : (
        <DataTable 
          data={filteredPayments}
          columns={columns}
        />
      )}

      <div className="mt-4">
        <Pagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(filteredPayments.length / 10) || 1} 
          onPageChange={setCurrentPage} 
        />
      </div>

      <DetailPanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Transaction ID</div>
              <div className="text-sm font-medium text-gray-900 break-all">{selectedPayment.id}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">User ID</div>
              <div className="text-sm font-medium text-gray-900 break-all">{selectedPayment.userId}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Payment Type</div>
              <div className="text-sm font-medium text-gray-900">{selectedPayment.type}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Gateway Reference</div>
              <div className="text-sm font-medium text-gray-900 break-all">{selectedPayment.gatewayReferenceId || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Status</div>
              <div><Badge variant={selectedPayment.status === 'SUCCESS' ? 'success' : selectedPayment.status === 'PENDING' ? 'warning' : 'danger'}>{selectedPayment.status}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Amount</div>
              <div className="text-lg font-bold text-gray-900">₹{selectedPayment.amount.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="text-sm text-gray-500">Date & Time</div>
              <div className="text-sm font-medium text-gray-900">{new Date(selectedPayment.createdAt + (selectedPayment.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric', 
                  hour: '2-digit', minute: '2-digit'
                })}</div>
            </div>
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
