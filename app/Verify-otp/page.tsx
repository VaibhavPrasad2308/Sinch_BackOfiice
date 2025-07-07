'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const verifyOtpApiUrl = 'https://stagedialer.clay.in/api/auth/verify-otp';

  useEffect(() => {
    // Retrieve email from localStorage or previous page
    const storedEmail = localStorage.getItem('registeredEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate OTP
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(verifyOtpApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OTP Verification failed: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('OTP Verification successful:', data);
      
      // Clear stored email
      localStorage.removeItem('registeredEmail');
      
      // Redirect to dashboard or next page
      router.push('/');

    } catch (err: any) {
      console.error('OTP Verification error:', err);
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
            onClick={() => router.push('/register')}
            className="text-gray-600 hover:text-purple-600 flex items-center gap-1 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Registration</span>
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Verify OTP
          </h2>
          <p className="text-gray-600 mt-1">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center border-2 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                pattern="\d*"
                inputMode="numeric"
                required
              />
            ))}
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
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button 
                type="button"
                className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                onClick={() => {/* Resend OTP logic */}}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}