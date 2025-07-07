'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phonenumber: '',
    role: 'user', // Default value
    document: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  const registerApiUrl = 'https://stagedialer.clay.in/api/auth/register';

  

  const handleRegister = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.name || !form.email || !form.phonenumber || !form.document || !form.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with:', { 
        name: form.name,
        email: form.email,
        phonenumber: form.phonenumber,
        role: form.role,
        document: form.document
      });

      const registerResponse = await fetch(registerApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phonenumber: form.phonenumber,
          role: form.role,
          document: form.document,
          password: form.password,
        }),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        throw new Error(`Registration failed: ${errorText || registerResponse.statusText}`);
      }

      const registerData = await registerResponse.json();
      console.log('Registration successful:', registerData);
      
      // Store email in localStorage or session for the OTP page
      localStorage.setItem('registeredEmail', form.email);
      
      // Redirect to OTP verification page
      router.push('/Verify-otp');

    } catch (err : any) {
      console.error('Registration error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-2" style={{ borderColor: 'var(--primaryColor)' }}>
        <div className="mb-6">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-purple-600 flex items-center gap-1 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 mt-1">Join our platform to manage your data bundles</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-4">
  {/* Phone Number */}
  <div className="w-1/2">
    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
    <input
      type="tel"
      placeholder="+1234567890"
      className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
      value={form.phonenumber}
      onChange={(e) => setForm({ ...form, phonenumber: e.target.value })}
      required
    />
    <p className="text-xs text-gray-500 mt-1">Include country code (e.g +91)</p>
  </div>

  {/* Document ID */}
  <div className="w-1/2">
    <label className="block text-sm font-medium text-gray-700 mb-1">Document ID</label>
    <input
      type="text"
      placeholder="Enter your document/ID number"
      className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
      value={form.document}
      onChange={(e) => setForm({ ...form, document: e.target.value })}
      required
    />
  </div>
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-white font-medium"
              style={{ 
                background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))',
              }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}