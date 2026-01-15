import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Handshake, Truck } from 'lucide-react'; // Icons for the bottom section
import heroImage from '../../assets/loginimage.jpg'; // Make sure to add your orange image here

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      
      
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Sevana: The Hyper-Local <br />
              Donation Marketplace.
            </h1>
            <p className="text-lg text-gray-600 md:text-xl max-w-lg mx-auto md:mx-0">
              Match Your Items Directly with NGO Needs.
            </p>
            
            <div className="pt-4">
              <Link 
                to="/register" 
                className="inline-block bg-[#2E7D32] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95"
              >
                Start Donating Today
              </Link>
            </div>
          </div>

          
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            
            <img 
              src={heroImage} 
              alt="Sevana App Interface" 
              className="w-full max-w-lg rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300" 
            />
          </div>
        </div>
      </div>

      {/*bottom section*/}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
          How Sevana Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          
         
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
              <Camera className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">1. List Items</h3>
            <p className="text-gray-600 max-w-xs">
              Take a photo and describe your donation in seconds.
            </p>
          </div>

          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
              <Handshake className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">2. Match NGO</h3>
            <p className="text-gray-600 max-w-xs">
              Connect directly with verified local NGOs who need your items.
            </p>
          </div>

          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
              <Truck className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">3. Easy Pickup</h3>
            <p className="text-gray-600 max-w-xs">
              Coordinate logistics and get your items collected easily.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;