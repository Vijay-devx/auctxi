import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { paymentApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IconHistory, IconWallet } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';

const Payments = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const res = await paymentApi.get(`/api/v1/payments/wallet/${user.id}`);
      setHistory(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch payment history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const columns = [
    { header: 'Transaction ID', accessorKey: 'id', cell: ({row}) => row.original.id.substring(0, 8) + '...' },
    { header: 'Type', accessorKey: 'type', cell: ({row}) => row.original.type.replace(/_/g, ' ') },
    { 
      header: 'Date', 
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
    { header: 'Amount', accessorKey: 'amount', cell: ({row}) => {
        const amt = row.original.amount;
        return <span className={amt > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {amt > 0 ? '+' : ''}₹{Math.abs(amt).toLocaleString()}
        </span>
      }
    },
    { header: 'Description', accessorKey: 'description', cellClassName: 'whitespace-normal min-w-[250px]' },
    { header: 'Status', accessorKey: 'status', cell: ({row}) => {
        const status = row.original.status || 'SUCCESS';
        let variant = 'default';
        if (status === 'SUCCESS') variant = 'success';
        else if (status === 'PENDING') variant = 'warning';
        else if (status === 'FAILED') variant = 'danger';
        return <Badge variant={variant}>{status}</Badge>;
      } 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <PageHeader 
        title="Wallet & Payments" 
        description="View your registration fees, purse deposits, and refunds." 
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Transaction History */}
        <Card className="h-full">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <IconHistory className="text-gray-500" />
              <CardTitle>Transaction History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading history...</div>
            ) : (
              <DataTable 
                columns={columns} 
                data={history} 
                className="border-none shadow-none"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
