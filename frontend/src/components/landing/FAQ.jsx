import React, { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const faqs = [
  {
    question: "How do I create a new auction?",
    answer: "Once you register and log in, navigate to your Dashboard and click on 'Create Auction'. You can then set up the rules, budget, and schedule."
  },
  {
    question: "Can players register themselves?",
    answer: "Yes, you can generate a unique registration link for your auction and share it. Players can fill in their details, upload photos, and select their roles directly."
  },
  {
    question: "Is there a limit on the number of bids?",
    answer: "No, there are no limits on the number of bids during a live auction. Our real-time engine can handle thousands of concurrent bids seamlessly."
  },
  {
    question: "How are team budgets managed?",
    answer: "Budgets are tracked automatically. When a player is sold to a team, the final bid amount is instantly deducted from that team's remaining purse."
  },
  {
    question: "Can we project the auction on a big screen?",
    answer: "Absolutely. We provide a dedicated 'Spectator Mode' designed specifically for projectors and large screens, hiding manager controls and maximizing visibility."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                <IconChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
