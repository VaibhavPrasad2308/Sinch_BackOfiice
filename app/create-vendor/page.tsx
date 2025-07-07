'use client'

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

// Updated interface to match the API request structure
interface FormData {
  vendor_name: string;
  vendor_planlist: string;
  price: number | string;
  description: string;
  usercode: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data?: any;
}

function page() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    
    // Updated formData structure to match API request fields
    const [formData, setFormData] = useState<FormData>({
      vendor_name: '',
      vendor_planlist: '',
      price: '',
      description: '',
      usercode: ''
    });
    
    // Not used - can be removed
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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' ? parseFloat(value) || value : value
      }));
      console.log(`Field changed: ${name} = ${value}`);
      setError(null);
    };
    
    const validateForm = () => {
      // Updated required fields to match API expectations
      const requiredFields = ['vendor_name', 'vendor_planlist', 'price'];
      for (const field of requiredFields) {
        if (!formData[field as keyof FormData]) {
          setError(`${field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} is required`);
          return false;
        }
      }
      return true;
    };
    
    const handleCreateVendor = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;
    
      setIsLoading(true);
      setError(null);
    
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          router.push('/vendorList');
          return;
        }
    
        console.log('Request body:', JSON.stringify(formData));
        
        const response = await fetch('https://stagedialer.clay.in/api/vendor/createvendor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'role': 'admin' // Added role header as shown in the curl example
          },
          body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (response.ok && data.statusCode === 200) {
            alert('Vendor created successfully');
            router.push('/vendorList'); // Updated to redirect to vendor list instead of plans list
          } else {
            setError(data.message || `Failed to create Vendor: ${response.status}`);
          }
        } else {
          // Handle non-JSON response
          const textResponse = await response.text();
          console.log('Text response:', textResponse);
          setError(`Server responded with: ${response.status} - ${textResponse}`);
        }
      } catch (err) {
        console.error('Detailed error:', err);
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
  return (
    <div style={styles.pageContainer}>
      <Sidebar />
       <div style={{
        ...styles.mainWrapper,
        marginLeft: isSidebarOpen ? '257px' : '70px', // Adjust based on collapsed width (16px + padding)
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <Header />
        
        <div style={styles.contentWrapper}>
          <div style={styles.formContainer}>
            {/* <h2 style={styles.formTitle}>Create New Vendor</h2> */}
            
            {error && <div style={additionalStyles.errorMessage}>{error}</div>}
            
            <form onSubmit={handleCreateVendor}> {/* Updated form submission handler name */}
              <div style={styles.formGrid}>
                {[ 
                  { label: 'Vendor Name', name: 'vendor_name', placeholder: 'Enter vendor name' },
                  { label: 'Vendor Plan List', name: 'vendor_planlist', placeholder: 'Enter plan list (e.g. Basic, Pro)' },
                  { label: 'Price', name: 'price', placeholder: 'Enter price' },
                  { label: 'Description', name: 'description', placeholder: 'Enter description' },
                  { label: 'User Code', name: 'usercode', placeholder: 'Enter user code' },
                ].map(({ label, name, placeholder}) => (
                  <div key={name} style={styles.formGroup as React.CSSProperties}>
                    <label style={styles.label}>{label}</label>
                    <input
                      type={name === 'price' ? 'number' : 'text'}
                      name={name}
                      value={formData[name as keyof FormData]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      style={styles.input}
                      required={['vendor_name', 'vendor_planlist', 'price'].includes(name)}
                    />
                  </div>
                ))}
              </div>
  
              <div style={styles.buttonGroup}>
                <button 
                  type="submit" 
                  style={styles.createButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Vendor'}
                </button>
                <button 
                  type="button" 
                  style={styles.detailsButton}
                  onClick={() => router.push('/vendorList')}
                  disabled={isLoading}
                >
                  Details
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page

const additionalStyles = {
  errorMessage: {
    color: '#dc2626',
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.25rem',
    border: '1px solid #fecaca',
  },
};

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f5f6f7'
  },
  mainWrapper: {
    flex: 1,
    marginLeft: '257px', // assuming sidebar is fixed-width
    padding: '0rem'
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '1rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1.5rem'
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#444'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '500',
    marginBottom: '0.1rem',
    color: '#333'
  },
  input: {
    padding: '0.4rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem'
  },
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  detailsButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};