import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { paymentApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IconReceipt2 } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';

const ManagerPayments = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettlements = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const res = await paymentApi.get(`/api/v1/payments/manager/${user.id}/settlements`);
      setSettlements(res.data);
    } catch (err) {
      console.error("Failed to fetch settlements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [user]);

  const columns = [
    { header: 'Settlement ID', accessorKey: 'id', cell: ({row}) => row.original.id.substring(0, 8) + '...' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Date', accessorKey: 'createdAt', cell: ({row}) => new Date(row.original.createdAt).toLocaleString() },
    { header: 'Gross Revenue', accessorKey: 'grossAmount', cell: ({row}) => `₹${row.original.grossAmount.toLocaleString()}` },
    { header: 'Platform Fee', accessorKey: 'platformCommissionAmount', cell: ({row}) => `₹${row.original.platformCommissionAmount.toLocaleString()}` },
    { header: 'Net Payout', accessorKey: 'netAmount', cell: ({row}) => <span className="font-bold text-green-600">₹{row.original.netAmount.toLocaleString()}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({row}) => {
        const status = row.original.status;
        let variant = 'default';
        if (status === 'PAID_OUT') variant = 'success';
        else if (status === 'CALCULATED') variant = 'warning';
        else if (status === 'FAILED') variant = 'danger';
        return <Badge variant={variant}>{status}</Badge>;
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Financial Settlements" 
        description="View revenue payouts from your hosted auctions." 
      />

      <Card>
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <IconReceipt2 className="text-gray-500" />
            <CardTitle>Settlement History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading settlements...</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={settlements} 
              className="border-none shadow-none"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerPayments;
