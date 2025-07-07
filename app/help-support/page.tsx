'use client';



import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
// pages/faq.js
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(2); // The third FAQ is open by default
    const [isSidebarOpen, setSidebarOpen] = useState(true);
  
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
  const faqs = [
    { question: 'Is there a free trial available for the payed options ?', answer: '' },
    { question: 'Is it possible to subscribe to the app annualy ?', answer: '' },
    {
      question: 'Is it possible to cancel my subscription ?',
      answer:
        'Yes of course, just send us an email at contact@bookapp.com with a little reason of why you want to cancel your subscription and you will get a refund between 1–2 business days.',
    },
    { question: 'How do I change my account mail ?', answer: '' },
    { question: 'How can I change my payment method ?', answer: '' },
  ];

  return (
    <>
    <Header/>
    <Sidebar/>
      <h1>Frequently Asked Questions</h1>
      <div style={{paddingLeft:'260px'}} className=" min-h-screen  text-black flex flex-col items-center px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold mb-1">
          Frequently asked{' '}
          <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            questions
          </span>
        </h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Do you need some help with something or do you have questions on some features ?
        </p>

        <div className="w-full max-w-2xl bg-white shadow-md rounded-xl overflow-hidden">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border-b last:border-b-0 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <div className="flex justify-between items-center px-6 py-4 text-base font-medium">
                <span>{faq.question}</span>
                <span>{openIndex === idx ? '−' : '+'}</span>
              </div>
              {openIndex === idx && faq.answer && (
                <p className="px-6 pb-4 text-sm text-gray-700">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <h2 className="text-lg font-semibold mb-2">Have any other questions ?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Don’t hesitate to send us an email with your enquiry or statement at:
          </p>
          <div
            className="inline-block bg-gray-100 px-4 py-2 rounded-md font-mono text-sm cursor-pointer"
            onClick={() => navigator.clipboard.writeText('contact@bookapp.com')}
          >
            sinch@gmail.com &nbsp; 📋
          </div>
        </div>
      </div>
    </>
  );
}
