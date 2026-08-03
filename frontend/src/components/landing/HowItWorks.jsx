import React from 'react';

const steps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up as an organizer or a team manager. Set up your profile and preferences."
  },
  {
    number: "02",
    title: "Create / Join",
    description: "Organizers create new auctions. Managers register their teams and pay entry fees if required."
  },
  {
    number: "03",
    title: "Add Players",
    description: "Upload player databases via CSV or allow players to register individually for the pool."
  },
  {
    number: "04",
    title: "Participate Live",
    description: "Enter the live auction room. Bid in real-time, build your squad, and track your remaining budget."
  }
];

const HowItWorks = () => {
  return (
    <div id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your auction up and running in minutes with our simple four-step process.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-[#f59e0b] flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-[#f59e0b]">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
