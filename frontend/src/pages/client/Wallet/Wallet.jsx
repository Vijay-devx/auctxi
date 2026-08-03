import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { IconWallet, IconPlus, IconArrowUpRight, IconArrowDownLeft, IconRefresh, IconSettings, IconShieldCheck } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../../../components/ui/DataTable';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingFunds, setAddingFunds] = useState(false);
  const [amount, setAmount] = useState('');

  // 'DEMO' or 'REAL'
  const [paymentMode, setPaymentMode] = useState('DEMO');

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/payments/wallet/${user.id}`);
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to fetch wallet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchWallet();
  }, [user]);

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleDemoDeposit = async (depositAmount) => {
    const res = await api.post(`/api/v1/payments/wallet/${user.id}/deposit`, {
      amount: depositAmount
    });
    setWallet(res.data.wallet);
    alert("Demo funds added instantly!");
  };

  const handleRealDeposit = async (depositAmount) => {
    // 1. Create order on backend
    const orderRes = await api.post('/api/v1/payments/razorpay/create-order', {
      amount: depositAmount,
      receiptId: `rcpt_${user.id.substring(0,8)}_${Date.now()}`
    });
    const { orderId } = orderRes.data;

    // 2. Initialize Razorpay Checkout
    const options = {
      key: "rzp_test_TKd9utAdVXyhH1", // Razorpay test key
      amount: depositAmount * 100,
      currency: "INR",
      name: "AuctXI Platform",
      description: "Wallet Deposit",
      order_id: orderId,
      handler: async function (response) {
        try {
          // 3. Verify payment on backend
          const verifyRes = await api.post('/api/v1/payments/razorpay/verify', {
            clientId: user.id,
            amount: depositAmount,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
          setWallet(verifyRes.data.wallet);
          alert("Payment successful! Funds added to your wallet.");
        } catch (error) {
          console.error("Verification failed", error);
          alert("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: user.name,
        email: user.email || "",
      },
      theme: {
        color: "#f59e0b"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      alert("Payment failed! " + response.error.description);
    });
    rzp.open();
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const depositAmount = Number(amount);
    if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) return;

    try {
      setAddingFunds(true);
      if (paymentMode === 'DEMO') {
        await handleDemoDeposit(depositAmount);
      } else {
        await handleRealDeposit(depositAmount);
      }
      setAmount('');
    } catch (err) {
      console.error('Failed to add funds', err);
      alert('Failed to initiate payment. Check console for details.');
    } finally {
      setAddingFunds(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const columns = [
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => {
        const type = row.original.type;
        const isDeposit = type.includes('DEPOSIT') || type.includes('REFUND');
        return (
          <div className="flex items-center gap-2">
            {isDeposit ? <IconArrowDownLeft className="text-green-500" size={16} /> : <IconArrowUpRight className="text-red-500" size={16} />}
            <span className="font-medium text-sm">{type.replace(/_/g, ' ')}</span>
          </div>
        );
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cellClassName: 'whitespace-normal min-w-[250px]',
      cell: ({ row }) => <span className="text-gray-500 text-sm">{row.original.description}</span>
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => {
        const amt = row.original.amount;
        return (
          <span className={`font-medium ${amt > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {amt > 0 ? '+' : ''}{formatCurrency(amt)}
          </span>
        );
      }
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => <span className="text-sm text-gray-500">{new Date(row.original.createdAt).toLocaleString()}</span>
    }
  ];

  if (loading && !wallet) return <div className="p-12 text-center text-gray-500">Loading wallet...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IconWallet className="text-amber-500" size={28} /> My Wallet
        </h1>
        <Button variant="outline" onClick={fetchWallet} disabled={loading}><IconRefresh size={18} className="mr-2" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-none shadow-xl overflow-hidden relative">
            {/* Mode Indicator */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${paymentMode === 'REAL' ? 'bg-amber-500 text-black' : 'bg-gray-600 text-white'}`}>
              {paymentMode === 'REAL' ? 'LIVE MODE' : 'TEST MODE'}
            </div>

            <CardContent className="p-8">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold text-white mb-6">
                {formatCurrency(wallet?.balance)}
              </h2>

              {/* Payment Mode Selector */}
              <div className="mb-6 p-1 bg-gray-800 rounded-lg flex gap-1">
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMode === 'REAL' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  onClick={() => setPaymentMode('REAL')}
                >
                  <IconShieldCheck size={14} /> Real Money
                </button>
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${paymentMode === 'DEMO' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  onClick={() => setPaymentMode('DEMO')}
                >
                  <IconSettings size={14} /> Test (Demo)
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <form onSubmit={handleAddFunds} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Add Funds (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                      <Button type="submit" disabled={addingFunds || !amount} className={`${paymentMode === 'REAL' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-600 hover:bg-gray-500'} text-black border-none transition-colors`}>
                        {addingFunds ? '...' : <IconPlus size={20} />}
                      </Button>
                    </div>
                  </div>
                  {paymentMode === 'REAL' && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <IconShieldCheck size={12} className="text-amber-500" />
                      Secured by Razorpay
                    </p>
                  )}
                  {paymentMode === 'DEMO' && (
                    <p className="text-xs text-gray-500">
                      Funds will be added instantly for testing purposes.
                    </p>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {wallet?.transactions?.length > 0 ? (
                <DataTable columns={columns} data={wallet.transactions} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <IconWallet size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet.</p>
                  <p className="text-sm mt-1">Add funds to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
