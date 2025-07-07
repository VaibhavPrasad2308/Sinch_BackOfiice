'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FormData {
  planname: string;
  country: string;
  description: string;
  price: string;
  call_limit: string;
  sms_limit: string;
  data_limit: string;
  validity: string;
  number_assign: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data?: any;
}

export default function CreateTopUpPlan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState<FormData  & {flag : String}>({
    planname: '',
    country: '',
    description: '',
    price: '',
    call_limit: '',
    sms_limit: '',
    data_limit: '',
    validity: '',
    number_assign: '2',
    flag: 'create',
  });

  // const [sidebarOpen, setSidebarOpen] = useState(false);
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
  // Get token and role on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole') || 'admin'; // Default to admin if not found
    
    setToken(authToken);
    setUserRole(role);
    
    if (!authToken) {
      setError('You need to be logged in to create a plan.');
    } else {
      console.log('Token loaded:', authToken.substring(0, 15) + '...');
      console.log('User role:', role);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    const requiredFields = ['planname', 'country', 'price', 'validity'];
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    return true;
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if token is available
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setTimeout(() => router.push('/'), 1500);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare headers with proper authorization - EXACTLY as in the CURL example
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'role': userRole || 'admin'  // Add the role header as shown in the CURL example
      };
      
      console.log('Making API request to: https://stagedialer.clay.in/api/plan/create');
      console.log('Request body:', JSON.stringify(formData));
      console.log('Using headers:', {
        'Content-Type': 'application/json',
        'Authorization': headers['Authorization']?.substring(0, 20) + '...',
        'role': headers['role']
      });
      
      const response = await fetch('https://stagedialer.clay.in/api/plan/create', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      
      // Process the response
      let responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON if possible
      try {
        if (responseText) {
          const data = JSON.parse(responseText);
          console.log('Response data:', data);
          
          if (response.ok && data.statusCode === 200) {
            alert('Plan created successfully');
            router.push('/plansList');
          } else if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('authToken');
            setTimeout(() => router.push('/'), 1500);
          } else {
            setError(data.message || `Failed to create plan: ${response.status}`);
          }
        } else {
          setError(`Server returned empty response with status: ${response.status}`);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setError(`Server responded with status ${response.status}: ${responseText || 'No response body'}`);
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
            {/* <h2 style={styles.formTitle}>Create New Plan</h2> */}
            
            {error && <div style={additionalStyles.errorMessage}>{error}</div>}
            
            {!token && (
              <div style={additionalStyles.warningMessage}>
                Authentication token not found. Please <a href="/" style={additionalStyles.link}>log in</a> to continue.
              </div>
            )}
            
            <form onSubmit={handleCreatePlan}>
              <div style={styles.formGrid}>
                {[ 
                  { label: 'Plan Name', name: 'planname', placeholder: 'Enter plan name', required: true },
                  { label: 'Country', name: 'country', placeholder: 'Enter country', required: true },
                  { label: 'Description', name: 'description', placeholder: 'Enter description' },
                  { label: 'Price', name: 'price', placeholder: 'Enter price (e.g., 40.00)', required: true },
                  { label: 'Call Limit', name: 'call_limit', placeholder: 'Enter call limit (e.g., 10)' },
                  { label: 'SMS Limit', name: 'sms_limit', placeholder: 'Enter SMS limit (e.g., 5)' },
                  { label: 'Data Limit', name: 'data_limit', placeholder: 'Enter data limit (e.g., 5)' },
                  { label: 'Validity', name: 'validity', placeholder: 'Enter validity in days (e.g., 5)', required: true },
                  { label: 'Number Assign', name: 'number_assign', placeholder: 'Enter number assign', disabled: true }
                ].map(({ label, name, placeholder, disabled, required }) => (
                  <div key={name} style={styles.formGroup as React.CSSProperties}>
                    <label style={styles.label}>
                      {label} {required && <span style={{ color: 'red' }}>*</span>}
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name as keyof FormData]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      disabled={disabled || !token}
                      style={styles.input}
                      required={required}
                    />
                  </div>
                ))}
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="submit" 
                  style={styles.createButton}
                  disabled={isLoading || !token}
                >
                  {isLoading ? 'Creating...' : 'Create Plan'}
                </button>
                <button 
                  type="button" 
                  style={styles.detailsButton}
                  onClick={() => router.push('/plansList')}
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

// Updated styles
const additionalStyles = {
  errorMessage: {
    color: '#dc2626',
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.25rem',
    border: '1px solid #fecaca',
  },
  warningMessage: {
    color: '#d97706',
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#fef3c7',
    borderRadius: '0.25rem',
    border: '1px solid #fde68a',
  },
  link: {
    color: '#1d4ed8',
    textDecoration: 'underline',
    fontWeight: 500,
  }
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
    marginLeft: '257px', 
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