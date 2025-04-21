// src/pages/Home.jsx
import React, { useState } from 'react';
import { Menu, MapPin, ChevronDown, Search } from 'lucide-react';

const Home = () => {
    const [address, setAddress] = useState('');
    return (
        <div className="min-h-screen bg-yellow-400 overflow-hidden relative">
        {/* Background Image */}
        <div 
          className="absolute right-0 bottom-0 w-full h-full bg-contain bg-no-repeat bg-right-bottom pointer-events-none"
          style={{ 
            backgroundImage: "url('https://png.pngtree.com/png-clipart/20240705/original/pngtree-group-of-fast-food-products-fast-food-items-hamburger-fries-hotdog-png-image_15492773.png')",
            backgroundSize: "50%"
          }}
        />
        
        {/* Content Container - this ensures content appears above the background */}
        <div className="relative z-10">
          {/* Navigation Bar */}
          <nav className="flex justify-between items-center p-6">
            <div className="flex items-center">
              <button className="mr-4">
                <Menu size={24} color="black" />
              </button>
              <h1 className="font-sans font-bold text-xl">Eatzaa</h1>
            </div>
            <div className="flex gap-2">
              <button className="bg-white px-4 py-1 rounded-full text-sm font-medium">Log in</button>
              <button className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">Sign up</button>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="px-6 pt-8 w-full md:w-1/2 mt-30 ">
            <h2 className="font-sans text-8xl font-bold mb-6">Order Food<br/> To Your Door</h2>
            
            {/* Search Form */}
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="bg-white rounded-md flex-grow flex items-center px-2 py-3 border border-gray-200">
                <MapPin size={20} className="text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Enter delivery address" 
                  className="flex-grow outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="bg-white rounded-md flex items-center px-4 py-3 border border-gray-200">
                <span className="mr-2">Deliver now</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
              
              <button className="bg-black text-white font-medium rounded-md px-4 py-3">
                Find Food
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-8">Sign in for your recent addresses</p>
          </main>
        </div>
        
        {/* Support Button */}
        <div className="absolute bottom-6 left-6 z-20">
          <button className="bg-gray-800 text-white p-3 rounded-full">
            <Search size={24} />
          </button>
        </div>
        
        
      </div>
    );
};

export default Home;
