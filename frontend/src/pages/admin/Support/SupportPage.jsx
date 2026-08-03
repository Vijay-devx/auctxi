import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { IconLifebuoy, IconPlus, IconMessageDots, IconChevronDown } from '@tabler/icons-react';
import { cn } from '../../../utils/cn';

const mockTickets = [
  { id: 'TKT-001', subject: 'Payment Gateway Issue', user: 'team_alpha@example.com', status: 'Open', priority: 'High', date: '2026-07-23' },
  { id: 'TKT-002', subject: 'Player Registration Error', user: 'player123@example.com', status: 'In Progress', priority: 'Medium', date: '2026-07-22' },
  { id: 'TKT-003', subject: 'Auction Timer Sync', user: 'admin@auctxi.com', status: 'Resolved', priority: 'Critical', date: '2026-07-21' },
  { id: 'TKT-004', subject: 'Missing Team Logo', user: 'support@team.com', status: 'Closed', priority: 'Low', date: '2026-07-20' },
];

const faqs = [
  { question: 'How do I reset a user password?', answer: 'Navigate to the Users section, select the user, click on the Action Menu (three dots), and choose "Reset Password". An email with reset instructions will be sent to the user.' },
  { question: 'Can I undo a completed auction?', answer: 'Once an auction is marked as "Completed", it cannot be directly undone from the UI to maintain data integrity. Please contact system administrators for database-level intervention if absolutely necessary.' },
  { question: 'How are platform fees calculated?', answer: 'Platform fees are calculated based on the settings configured in Settings > Payment. You can set a fixed percentage or flat fee per successful bid.' }
];

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const columns = [
    { key: 'id', label: 'Ticket ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'user', label: 'User' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => {
        const variants = {
          'Open': 'error',
          'In Progress': 'warning',
          'Resolved': 'success',
          'Closed': 'info'
        };
        return <Badge variant={variants[val] || 'default'}>{val}</Badge>;
      }
    },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => (
        <span className={cn(
          "text-sm font-medium",
          val === 'Critical' ? "text-red-600" : val === 'High' ? "text-orange-500" : val === 'Medium' ? "text-blue-500" : "text-gray-500"
        )}>
          {val}
        </span>
      )
    },
    { key: 'date', label: 'Created On' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <Button variant="outline" className="px-2 py-1 h-auto text-xs">View</Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Support & Help Desk" 
        subtitle="Manage user support tickets and system FAQs"
        primaryAction={{ label: 'Create Ticket', onClick: () => {}, icon: <IconPlus size={18} /> }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconMessageDots size={20} className="text-amber-500" /> Recent Support Tickets
              </h3>
            </div>
            <DataTable columns={columns} data={mockTickets} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-amber-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconLifebuoy size={20} className="text-amber-500" /> Quick Help & FAQ
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-sm text-gray-900">{faq.question}</span>
                    <IconChevronDown size={16} className={cn(
                      "text-gray-400 transition-transform",
                      activeFaq === idx ? "rotate-180" : ""
                    )} />
                  </button>
                  {activeFaq === idx && (
                    <div className="p-4 pt-0 text-sm text-gray-600 bg-white border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">Need more assistance?</p>
              <Button className="w-full">Contact Technical Team</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
