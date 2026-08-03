import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../services/api';
import { toast } from 'react-toastify';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/common/Table';
import { IconCreditCard, IconRefresh } from '@tabler/icons-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [userId, setUserId] = useState('user-123'); // Hardcoded for demo, normally from JWT
  const [amount, setAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await paymentApi.get(`/api/v1/payments/history/${userId}`);
      setPayments(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Processing payment with Gateway (Retrying on timeouts)...");
    try {
      await paymentApi.post('/api/v1/payments/process', {
        userId,
        amount: parseFloat(amount),
        currency: 'USD'
      });
      toast.update(toastId, { render: "Payment Processed!", type: "success", isLoading: false, autoClose: 3000 });
      fetchPayments();
    } catch (err) {
      toast.update(toastId, { render: "Payment Failed after retries.", type: "error", isLoading: false, autoClose: 3000 });
      fetchPayments();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'PENDING': 'warning',
      'SUCCESS': 'success',
      'FAILED': 'danger'
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payment Gateway</h2>
          <p className="text-sm text-slate-500">Test the robust Spring Retry payment microservice.</p>
        </div>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <Input 
              label="Simulated User ID" 
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="bg-white"
            />
            <Input 
              label="Amount ($)" 
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-white"
            />
            <Button onClick={handleTestPayment} disabled={isProcessing} className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-w-[200px]">
              <IconCreditCard size={18} />
              {isProcessing ? 'Processing...' : 'Simulate Payment'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Clicking this will hit the Payment Microservice (Port 8081). It randomly simulates Gateway timeouts 50% of the time to demonstrate Spring Retry.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Transaction History</h3>
            <Button variant="ghost" size="sm" onClick={fetchPayments} className="gap-2 text-slate-500">
              <IconRefresh size={16} /> Refresh
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Failure Reason</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {p.gatewayTransactionId || p.id}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    ${p.amount?.toLocaleString()} {p.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell className="text-red-500 text-xs">
                    {p.failureReason || '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    No transactions found for this user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
