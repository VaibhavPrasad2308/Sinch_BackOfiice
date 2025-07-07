'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Database,
  DollarSign,
  HelpCircle,
  Menu,
  Package,
  Search,
  Settings,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfilePopup } from './Auth/LogoutPopup';
import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';

const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/', active: true },
  { icon: Database, label: 'Data Bundles', path: '/data-bundles' },
  { icon: DollarSign, label: 'Pricing', path: '/pricing' },
  { icon: TrendingUp, label: 'Create Top-Up Plans', path: '/create-top-up-plan' },
  { icon: Bell, label: 'News & Updates', path: '/news-updates' },
  { icon: Package, label: 'Bundle Inventory', path: '/bundle-inventory' },
  { icon: Smartphone, label: 'Sinch Logs', path: '/sinchLogs' },
  { icon: Settings, label: 'API Box', path: '/api-box' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help-support' },
];

const statsCards = [
  { title: 'Revenue from last 30 days', value: '0', change: '+0%', trend: 'up' },
  { title: 'Paying customers (All time)', value: '0', change: '0%', trend: 'neutral' },
  { title: 'Active purchases this month', value: '0', change: '0%', trend: 'neutral' },
  { title: 'Bundles in inventory', value: '0', change: '0%', trend: 'neutral' },
  { title: 'Bundle Sold in last 30 Days', value: '0', change: '0%', trend: 'neutral' },
];

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [form, setForm] = useState({ email: 'sameer0018khan@gmail.com', password: '1234' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
   const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const router = useRouter();

  const loginApiUrl = 'https://stagedialer.clay.in/api/auth/login';

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
    const checkSidebarState = () => {
      const currentState = localStorage.getItem('sidebarOpen');
      if (currentState !== null) {
        const parsedState = JSON.parse(currentState);
        if (parsedState !== sidebarOpen) {
          setSidebarOpen(parsedState);
        }
      }
    };
    
    // Check every 300ms for changes
    const intervalId = setInterval(checkSidebarState, 300);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const handleLogin = async (e : any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use the values from the form state
    const email = form.email.trim();
    const password = form.password.trim();

    try {
      console.log('Attempting login with:', { email, password });

      const loginResponse = await fetch(loginApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Response status:', loginResponse.status);

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error('Login failed:', loginResponse.status, errorText);
        throw new Error(`Login failed: ${errorText || loginResponse.statusText}`);
      }

      const loginData = await loginResponse.json();
      console.log('Login response data:', loginData);

      // Check if login was successful and token was received
      if (loginData.token) {
  const userInfo = {
    name: loginData.user?.name || loginData.aucode || email.split('@')[0], // fallback order: API name > aucode > email
    email: email,
    aucode: loginData.aucode, // Save aucode for future use
  };

  localStorage.setItem('auth', 'true');
  localStorage.setItem('authToken', `Bearer ${loginData.token}`);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  setUserInfo(userInfo);
  setIsAuthenticated(true);
  console.log("Login successful and token saved");
}
 else {
        throw new Error('Token not received from login response');
      }

    } catch (err: any) {
      console.error('Full error details:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80 border-2" style={{ borderColor: 'var(--primaryColor)' }}>
          <h2 className="text-xl font-bold mb-4">Login</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 border rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-white font-medium"
            disabled={loading}
            style={{ 
                background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))',
              }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          
          <p className="text-sm text-gray-500 mt-2">
            Don't have an account? <a href="/register" className="text-purple-600 hover:underline">Register</a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Forgot your password? <a href="/Reset-Password" className="text-purple-600 hover:underline">Reset it</a>
          </p>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </form>
      </div>
    );
  }

  return (
   <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-grey-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl gradient-primary-soft border-2" style={{ borderColor: 'var(--primaryColor)' }}>
                    <TrendingUp className="h-6 w-6" style={{ color: 'var(--primaryColor)' }} />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                </div>
                <div>
                  <p className="text-3xl font-bold bg-black mb-2  bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 font-medium">{stat.title}</p>
                  <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 gradient-primary-soft" 
                        style={{ color: 'var(--primaryColor)' }}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}