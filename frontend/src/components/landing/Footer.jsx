import React from 'react';
import { 
  IconBrandTwitter, 
  IconBrandInstagram, 
  IconBrandFacebook, 
  IconBrandYoutube 
} from '@tabler/icons-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight block mb-4">
              Auct<span className="text-[#f59e0b]">XI</span>
            </span>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The premier platform for managing cricket auctions, bringing professional-grade tools to local and global leagues.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#f59e0b] transition-colors">
                <IconBrandTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#f59e0b] transition-colors">
                <IconBrandFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#f59e0b] transition-colors">
                <IconBrandInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#f59e0b] transition-colors">
                <IconBrandYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-500 hover:text-[#f59e0b]">Features</a></li>
              <li><a href="#pricing" className="text-sm text-gray-500 hover:text-[#f59e0b]">Pricing</a></li>
              <li><a href="#auctions" className="text-sm text-gray-500 hover:text-[#f59e0b]">Live Auctions</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Leaderboards</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Auction Guides</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">API Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Contact</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#f59e0b]">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AuctXI. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Made with ❤️ for Cricket</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
