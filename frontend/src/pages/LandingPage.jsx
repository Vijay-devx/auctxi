import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Statistics from '../components/landing/Statistics';
import UpcomingAuctions from '../components/landing/UpcomingAuctions';
import LiveAuctions from '../components/landing/LiveAuctions';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#f59e0b] selection:text-white scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <UpcomingAuctions />
        <LiveAuctions />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
