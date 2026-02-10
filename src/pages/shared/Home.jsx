import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Handshake, Truck, ChevronDown } from 'lucide-react'; 
import heroImage from '../../assets/loginimage.jpg';

const Home = () => {
  const handleScroll = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FFF8F0] overflow-x-hidden">
      
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
        `}
      </style>

      {/* HERO SECTION 
          - min-h-screen: Forces full viewport height
          - relative: Acts as the anchor for the absolute scroll indicator
          - pb-40: Added EXTRA padding at bottom so text doesn't overlap the arrow since we moved it up
      */}
      <div className="min-h-screen relative flex items-center justify-center pt-24 pb-40 md:pt-10 md:pb-32">
        
        {/* Main Content */}
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          
          {/* Text Left */}
          <div className="w-full md:w-1/2 space-y-8 text-center md:text-left animate-fade-up delay-100">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Sevana: The Hyper-Local <br />
              Donation Marketplace.
            </h1>
            <p className="text-lg text-gray-600 md:text-xl max-w-lg mx-auto md:mx-0 leading-relaxed animate-fade-up delay-200">
              Match Your Items Directly with NGO Needs.
            </p>
            
            <div className="pt-4 animate-fade-up delay-300">
              <Link 
                to="/register" 
                className="inline-block bg-[#2E7D32] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Donating Today
              </Link>
            </div>
          </div>

          {/* Image Right */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-fade-up delay-300">
            <img 
              src={heroImage} 
              alt="Sevana App Interface" 
              className="w-full max-w-lg rounded-3xl shadow-2xl" 
            />
          </div>
        </div>

        {/* SCROLL INDICATOR
            - CHANGED: bottom-12 -> bottom-20 (This moves it up significantly)
            - left-0 w-full flex justify-center: Keeps it perfectly centered
        */}
        <div className="absolute bottom-16 left-0 w-full flex justify-center z-10 animate-fade-up delay-300">
          <div 
            onClick={handleScroll}
            className="flex flex-col items-center gap-2 cursor-pointer text-[#2E7D32] hover:text-[#1B5E20] transition-colors group"
          >
            <span className="text-sm font-bold tracking-widest uppercase group-hover:translate-y-1 transition-transform duration-300">
              Scroll to learn more
            </span>
            <ChevronDown className="w-8 h-8 animate-bounce" />
          </div>
        </div>

      </div>

      {/* Bottom Section - How it Works */}
      <div id="how-it-works" className="container mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
          How Sevana Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center space-y-4 hover:-translate-y-1 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-2">
              <Camera className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">1. List Items</h3>
            <p className="text-gray-600">
              Take a photo and describe your donation in seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center space-y-4 hover:-translate-y-1 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-2">
              <Handshake className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">2. Match NGO</h3>
            <p className="text-gray-600">
              Connect directly with verified local NGOs who need your items.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center space-y-4 hover:-translate-y-1 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-2">
              <Truck className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">3. Easy Pickup</h3>
            <p className="text-gray-600">
              Coordinate logistics and get your items collected easily.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;