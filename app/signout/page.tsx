'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem('auth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // Redirect to login page after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 2000);
    
    // Cleanup timer if component unmounts
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          You have been signed out
        </h1>
        <p className="text-gray-600 mb-2">Thank you for using our application.</p>
        <p className="text-gray-500 text-sm">You will be redirected to the login page shortly...</p>
      </div>
    </div>
  );
}