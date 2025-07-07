'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
  

  useEffect(() => {
    const isAuth = localStorage.getItem('auth');
    if (!isAuth) {
      router.push('/register');
    }
  }, [router]);
  useEffect(() => {
      // Read sidebar state from localStorage (matches your sidebar component)
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null) {
        setSidebarOpen(JSON.parse(savedState));
      }
    }, []);
    useEffect(() => {
      // Function to handle storage events
      const handleStorageChange = () => {
        const currentState = localStorage.getItem('sidebarOpen');
        if (currentState !== null) {
          setSidebarOpen(JSON.parse(currentState));
        }
      };
      
      // Set up an interval to check localStorage (since storage event only fires in other tabs)
      const intervalId = setInterval(handleStorageChange, 300);
      
      // Clean up on unmount
      return () => clearInterval(intervalId);
    }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Home Page</h1>
      <button
        onClick={() => {
          localStorage.removeItem('auth');
          router.push('/login');
        }}
      >
        Logout
      </button>
    </div>
  );
}
