"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function OrderStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (!sessionId) return; // Wait for router.query to be populated
    
    const verifyPayment = async () => {
      try {
        const response = await fetch('http://localhost:6007/api/payment/mark-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage('Your order has been successfully processed!');
        } else {
          setStatus('error');
          setMessage(data.error || 'An error occurred while processing your order.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error: Could not connect to the payment server.');
        console.error('Error verifying payment:', error);
      }
    };
    
    verifyPayment();
  }, [sessionId]);
  
  return (
    <div className="container">
      <Head>
        <title>Order Status | Our Store</title>
        <meta name="description" content="Order status page" />
      </Head>
      
      <main className="main">
        {status === 'loading' && (
          <div className="loadingContainer">
            <div className="spinner"></div>
            <h2>Processing your order...</h2>
            <p>Please wait while we verify your payment.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="successContainer">
            <div className="successIcon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h1>Order Successful!</h1>
            <p>{message}</p>
            <div className="buttons">
              <Link href="/orders" className="button">
                View My Orders
              </Link>
              <Link href="/" className="button">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="errorContainer">
            <div className="errorIcon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </div>
            <h1>Payment Issue</h1>
            <p>We encountered a problem with your order:</p>
            <div className="errorDetails">
              {message}
            </div>
            <p>If you believe this is an error, please contact our support team.</p>
            <div className="buttons">
              <Link href="/checkout" className="button">
                Try Again
              </Link>
              <Link href="/contact" className="button">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          background-color: #f8f9fa;
        }

        .main {
          width: 100%;
          max-width: 500px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 40px;
          text-align: center;
        }

        .loadingContainer,
        .successContainer,
        .errorContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border-left-color: #1976d2;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .successIcon,
        .errorIcon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px;
        }

        .successIcon {
          background-color: #4CAF50;
        }

        .errorIcon {
          background-color: #f44336;
        }

        .successIcon svg,
        .errorIcon svg {
          width: 40px;
          height: 40px;
          fill: white;
        }

        .successContainer h1 {
          color: #2e7d32;
        }

        .errorContainer h1 {
          color: #d32f2f;
        }

        .buttons {
          margin-top: 30px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .button:hover {
          background-color: #1565c0;
        }

        .errorDetails {
          background-color: #fff8f8;
          border: 1px solid #ffcdd2;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
          color: #d32f2f;
          width: 100%;
        }

        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        h2 {
          color: #333;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}