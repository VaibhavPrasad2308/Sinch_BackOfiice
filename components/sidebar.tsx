'use client';

import { Button } from '@/components/ui/button';
import { Menu, HelpCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const sidebarItems = [
  { icon: require('lucide-react').LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: require('lucide-react').UserPlus, label: 'Create Vendor', path: '/create-vendor' },
  { icon: require('lucide-react').FileText, label: 'Create Top-Up Plans', path: '/create-top-up-plan' },
  { icon: require('lucide-react').Phone, label: 'DID Plan', path: '/create-Did-plan' },
  { icon: require('lucide-react').ClipboardList, label: 'User Logs', path: '/sinchLogs' },
  { icon: require('lucide-react').UserCog, label: 'Profile', path: '/profile' },
  { icon: require('lucide-react').PhoneCall, label: 'Available DID', path: '/Available-DID' },
];

export default function Sidebar() {
  // ... all your existing state and functions ...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [form, setForm] = useState({ email: 'sameer0018khan@gmail.com', password: '1234' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const router = useRouter();
  const pathname = usePathname();

  const loginApiUrl = 'https://stagedialer.clay.in/api/auth/login';

  // ... all your existing useEffect and functions ...
  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth === 'true') {
      console.log("User is authenticated");
      setIsAuthenticated(true);
      
      // Get user info from localStorage
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);
        } catch (error) {
          console.error("Error parsing user info:", error);
        }
      }
    }
  
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  
  const handleLogin = async (e : any) => {
    // ... existing login function ...
  };

  return (
    <div className={`fixed left-0 top-0 h-full shadow-2xl transition-all duration-300 z-50 flex flex-col justify-between ${sidebarOpen ? 'w-64' : 'w-16'}`} 
         style={{ backgroundColor: 'white' }}>
      
      <div>
        {/* Top section with brand name */}
        <div className="gradient-primary p-6 text-white relative overflow-hidden">
          <div className="relative flex items-center justify-between h-3">
            <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
              <h1 className="text-md font-bold" style={{ color: 'var(--primaryTextColor)', height: '25px' }}>Your Brand Name</h1>
              <p className="text-sm opacity-90" style={{ color: 'var(--secondaryTextColor)' }}>$9000.00</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-black font-bold hover:bg-black/20 p-1 transition-all duration-200"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-2 text-sm">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={index}
                onClick={() => item.path && router.push(item.path)}
                className={`w-full flex items-center gap-2 px-1 py-1 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'text-white shadow-lg transform scale-105'
                    : 'hover:bg-white/10 hover:transform hover:scale-105'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primaryColor)' : 'transparent',
                  color: isActive ? 'var(--primaryTextColor)' : 'var(--secondaryTextColor)',
                }}
              >
                {isActive && <div className="absolute inset-0 bg-white opacity-100"></div>}
                <Icon className="h-5 w-5 flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                <span
                  className={`${
                    sidebarOpen ? 'block' : 'hidden'
                  }  relative z-10 group-hover:translate-z-15 transition-transform duration-200`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Help & Support section at bottom */}
      <div className={`p-4 ${sidebarOpen ? 'mx-3 mb-4' : 'mx-1 mb-4'}`} 
           style={{ 
             backgroundColor: '#2C2D2D', 
             borderRadius: '8px',
             color: 'white'
           }}>
        <div className={`flex flex-col h-28 items-${sidebarOpen ? 'start' : 'center'}`}>
          <div className="flex items-center mb-4 mt-4">
            <HelpCircle className="h-5 w-5 mr-2" />
            <span className={`${sidebarOpen ? 'block' : 'hidden'} text-sm font-medium`}>Need help?</span>
          </div>
          
          {sidebarOpen ? (
            <Button 
              onClick={() => router.push('/help-support')}
              className="w-full bg-white text-green-900 hover:bg-gray-100 text-sm py-1"
            >
              Help & Support
            </Button>
          ) : (
            <Button 
              onClick={() => router.push('/help-support')}
              className="p-1 bg-white text-green-900 hover:bg-gray-100 rounded-full"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}