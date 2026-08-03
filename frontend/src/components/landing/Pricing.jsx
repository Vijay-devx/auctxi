import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { IconCheck } from '@tabler/icons-react';

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for small local tournaments",
    features: [
      "Up to 50 players",
      "Maximum 6 teams",
      "Standard bidding intervals",
      "Basic leaderboards",
      "Community support"
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/auction",
    description: "For serious leagues and associations",
    features: [
      "Up to 500 players",
      "Maximum 16 teams",
      "Real-time instant bidding",
      "Advanced analytics & CSV export",
      "Custom branding",
      "Priority email support"
    ],
    buttonText: "Choose Pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large scale professional events",
    features: [
      "Unlimited players & teams",
      "Dedicated server instance",
      "Custom rule engine programming",
      "White-label solution",
      "On-site technical support",
      "24/7 phone support"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

const Pricing = () => {
  return (
    <div id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your upcoming cricket auction. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-[#f59e0b] shadow-lg scale-105 z-10' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#f59e0b] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-center my-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <IconCheck className="w-5 h-5 text-[#f59e0b] mr-2 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.popular ? "primary" : "outline"} 
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
