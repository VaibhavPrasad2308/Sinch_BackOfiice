'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, CreditCard, Users, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserProfilePopup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [form, setForm] = useState({ email: 'sameer0018khan@gmail.com', password: '' });
  const [error, setError] = useState('');
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', aucode: '' });
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

  // Compute initials and displayName from userInfo
  const initials = userInfo.email
    ? userInfo.email.split(' ').map(n => n[0]).join('').toUpperCase()
    : '';

  const displayName =userInfo.email.split('@')[0];

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
        // Extract aucode from response
        const aucode = loginData.user?.aucode || loginData.aucode;
        
        // Extract name from aucode if available
        let extractedName = '';
        if (aucode) {
          // Assuming aucode format might be something like "john.doe.12345" or similar
          // Extract name part and format it properly
          const nameParts = aucode.split('.');
          if (nameParts.length >= 2) {
            // Take first two parts assuming they're first and last name
            extractedName = nameParts.slice(0, 2)
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
          } else {
            // If single part, just capitalize it
            extractedName = aucode.charAt(0).toUpperCase() + aucode.slice(1);
          }
        }
        
        const userInfo = {
  name: loginData.user?.name || email.split('@')[0] || extractedName, // Prioritize email username over aucode extraction
  email: email,
  aucode: aucode // Store the original aucode
};

        localStorage.setItem('auth', 'true');
        localStorage.setItem('authToken', `Bearer ${loginData.token}`);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUserInfo(userInfo);
        setIsAuthenticated(true);
        console.log("Login successful and token saved");
      } else {
        throw new Error('Token not received from login response');
      }

    } catch (err: any) {
      console.error('Full error details:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  function handleSignOut(event: React.MouseEvent<HTMLButtonElement>): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    router.push('/signout'); // change if your login path differs
  }

  return (
    <div className="relative">
      {/* The trigger div */}
      <div 
        ref={triggerRef}
        className="flex items-center gap-3 px-4 py-2 rounded-full shadow-lg gradient-primary-soft border-2 cursor-pointer"
        style={{ borderColor: 'var(--primaryColor)', height: '40px' }}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
      >
        <div style={{ color: 'var(--primaryColor)', height: '30px' }} className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white text-md font-bold shadow-lg">
          {initials}
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--primaryColor)' }}>
          {displayName}
        </span>
      </div>

      {/* The popup */}
      {isPopupOpen && (
        <div 
          ref={popupRef}
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          style={{ top: "100%" }}
        >
          {/* User info section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <div className="text-gray-700">
                  {initials}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{userInfo.name}</h3>
                <p className="text-xs text-gray-600">{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Manage Sinch ID */}
          <div className="p-3 border-b border-gray-100">
            <a href="#" className="flex items-center justify-between text-sm text-blue-600 hover:bg-gray-50 rounded p-2">
              <span>Manage my Sinch ID</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Organization */}
          <div className="p-3 border-b border-gray-100">
            <div className="text-gray-800 font-semibold mb-1">GigHub Systems, Inc (USD)</div>
            <div className="text-xs text-gray-600">GigHub Systems, Inc (USD)</div>
          </div>

          {/* Menu options */}
          <div className="p-2">
            <a href="#" className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              <CreditCard className="w-5 h-5" />
              <span>Billing</span>
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              <Settings className="w-5 h-5" />
              <span>Account Settings</span>
            </a>
            <a href="#" className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </a>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded text-sm w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}