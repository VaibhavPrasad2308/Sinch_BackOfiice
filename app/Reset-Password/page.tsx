'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const resetPasswordApiUrl = 'https://stagedialer.clay.in/api/auth/reset-password';
  const sendOtpApiUrl = 'https://stagedialer.clay.in/api/auth/send-otp';

  useEffect(() => {
    // Retrieve email from localStorage or previous page
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      // Automatically send OTP when email is available
      sendOtp(storedEmail);
    }
  }, []);

  // Cooldown timer for resend OTP
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = async (emailAddress: string) => {
    if (!emailAddress) {
      setError('Please enter a valid email address');
      return;
    }

    setOtpSending(true);
    setError('');

    try {
      const response = await fetch(sendOtpApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
          purpose: 'reset_password'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      const data = await response.json();
      setOtpSent(true);
      setCooldown(60); // Set 60 seconds cooldown
      // Clear OTP fields for resend case
      setOtp(['', '', '', '', '', '']);
      // Focus on first OTP input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
      
    } catch (err : any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = () => {
    if (cooldown > 0) return; // Prevent resend if cooldown is active
    sendOtp(email);
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleResetPassword = async (e: { preventDefault: () => void; }) => {
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

    // Validate password
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(resetPasswordApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
          newPassword: newPassword
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Password reset failed: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Password reset successful:', data);
      
      // Clear stored email
      localStorage.removeItem('resetPasswordEmail');
      
      // Redirect to login page
      router.push('/login');

    } catch (err : any) {
      console.error('Password reset error:', err);
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
            Reset Password
          </h2>
          
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Enter email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              required
              disabled={otpSent}
            />
            {!otpSent && (
              <Button
                type="button"
                className="mt-2 px-4 py-2 rounded-lg text-white font-medium"
                style={{ 
                  background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))',
                }}
                onClick={() => sendOtp(email)}
                disabled={otpSending}
              >
                {otpSending ? 'Sending...' : 'Send OTP'}
              </Button>
            )}
          </div>

          {otpSent && (
            <>
              <p className="text-gray-600 mt-1">
                Enter the 6-digit code sent to {email}
              </p>
              <div className="flex justify-between space-x-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center border-2 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    pattern="\d*"
                    inputMode="numeric"
                    required
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-white font-medium"
                  style={{ 
                    background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor))',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button 
                    type="button"
                    className={`font-medium ${cooldown > 0 ? 'text-gray-400' : 'text-purple-600 hover:text-purple-800 hover:underline'}`}
                    onClick={handleResendOtp}
                    disabled={cooldown > 0}
                  >
                    {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}