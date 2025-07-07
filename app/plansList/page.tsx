'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Plan {
  plancode: number;
  planname: string;
  country: string;
  description: string;
  price: string;
  call_limit: string;
  sms_limit: string;
  number_assign: string;
  data_limit: string;
  validity: string;
}

interface ApiResponse {
  statusCode: number;
  message?: string;
  data: Plan[];
}

interface UpdateFormData {
  plancode: number;
  planname: string;
  country: string;
  description: string;
  price: string;
  call_limit: string;
  sms_limit: string;
  number_assign: string;
  data_limit: string;
  validity: string;
}

export default function PlansList() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // New states for update functionality
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UpdateFormData | null>(null);
  
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

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('auth');
    if (auth !== 'true') {
      console.log('User not authenticated, redirecting to login');
      router.push('/');

      return;
    }
    
    console.log('User is authenticated, fetching plans');
    fetchPlans();
  }, [router]);

  const fetchPlans = async () => {
    console.log("Fetching plans...");
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      console.log("Token:", authToken ? 'exists' : 'not found');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Make sure you're using the correct API endpoint
      const response = await fetch('https://stagedialer.clay.in/api/plan/sinchplan', {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 Unauthorized - clearing auth and redirecting');
          localStorage.removeItem('auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          router.push('/');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Make sure we're handling the response structure correctly
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        console.log("Plans received:", result.data);
        setPlans(result.data);
      } else {
        console.error("Unexpected API response format:", result);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plans. Please try again later.';
      console.error('Error fetching plans:', errorMessage);
      setError(errorMessage);
      
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle plan updates
  const handleUpdatePlan = async (planData: UpdateFormData) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.log('No auth token found for update');
        throw new Error('Authentication token not found');
      }
      
      console.log('Sending update plan request');
      
      const response = await fetch('https://stagedialer.clay.in/api/plan/create/update', {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      
      console.log('Update plan response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 Unauthorized during update - clearing auth and redirecting');
          localStorage.removeItem('auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          router.push('/');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.statusCode === 200) {
        console.log('Plan updated successfully');
        fetchPlans(); // Refresh the plans list
        setIsUpdateModalOpen(false);
        setSelectedPlan(null);
        alert('Plan updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update plan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
      console.error('Error updating plan:', errorMessage);
      alert(errorMessage);
      
      // If this is an auth error, redirect to login
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    }
  };

  // Update Modal Component
  const UpdateModal = ({ plan, onClose, onUpdate }: {
    plan: UpdateFormData;
    onClose: () => void;
    onUpdate: (data: UpdateFormData) => void;
  }) => {
    const [formData, setFormData] = useState<UpdateFormData>(plan);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={styles.modalTitle}>Update Plan</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Plan Code:</label>
                <input
                  type="text"
                  name="plancode"
                  value={formData.plancode}
                  disabled
                  style={styles.disabledInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Plan Name:</label>
                <input
                  type="text"
                  name="planname"
                  value={formData.planname}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Country:</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Price ($):</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Call Limit:</label>
                <input
                  type="text"
                  name="call_limit"
                  value={formData.call_limit}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>SMS Limit:</label>
                <input
                  type="text"
                  name="sms_limit"
                  value={formData.sms_limit}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Number Assign:</label>
                <input
                  type="text"
                  name="number_assign"
                  value={formData.number_assign}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Data Limit:</label>
                <input
                  type="text"
                  name="data_limit"
                  value={formData.data_limit}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label>Validity:</label>
              <input
                type="text"
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., 30 days"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                style={styles.textarea}
                rows={4}
              />
            </div>
            
            <div style={styles.modalButtons}>
              <button type="submit" style={styles.updateButton}>Update</button>
              <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredPlans = plans.filter(plan => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') return true;

    return (
      plan.plancode.toString().includes(term) ||
      plan.planname.toLowerCase().includes(term) ||
      plan.country.toLowerCase().includes(term) ||
      plan.description.toLowerCase().includes(term) ||
      plan.price.toLowerCase().includes(term) ||
      plan.call_limit.toLowerCase().includes(term) ||
      plan.sms_limit.toLowerCase().includes(term) ||
      plan.number_assign.toLowerCase().includes(term) ||
      plan.data_limit.toLowerCase().includes(term) ||
      plan.validity.toLowerCase().includes(term)
    );
  });

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '257px' : '70px', 
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <Header />
        <div style={styles.header}>
          <div style={styles.breadcrumb}>
            <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
            <span style={{margin: '0 8px'}}>/</span>
            <span>Plans List</span>
          </div>
          
          <div style={styles.searchBar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search by plan code, name, country..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.cardContainer}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Available Sinch Plans</h2>
            <Link href="/create-top-up-plan">
              <button style={styles.addButton}>
                Add New Plan
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div style={styles.loadingContainer}>Loading plans...</div>
          ) : error ? (
            <div style={styles.errorContainer}>{error}</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Plan Code</th>
                    <th style={styles.tableHeader}>Plan Name</th>
                    <th style={styles.tableHeader}>Country</th>
                    <th style={styles.tableHeader}>Description</th>
                    <th style={styles.tableHeader}>Price ($)</th>
                    <th style={styles.tableHeader}>Call Limit</th>
                    <th style={styles.tableHeader}>SMS Limit</th>
                    <th style={styles.tableHeader}>Number Assign</th>
                    <th style={styles.tableHeader}>Data Limit</th>
                    <th style={styles.tableHeader}>Validity</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.length > 0 ? (
                    filteredPlans.map((plan, index) => (
                      <tr key={plan.plancode} style={index % 2 === 1 ? styles.oddRow : styles.evenRow}>
                        <td style={styles.tableCell}>{plan.plancode}</td>
                        <td style={styles.tableCell}>{plan.planname}</td>
                        <td style={styles.tableCell}>{plan.country}</td>
                        <td style={styles.tableCell}>{plan.description}</td>
                        <td style={styles.tableCell}>${plan.price}</td>
                        <td style={styles.tableCell}>{plan.call_limit}</td>
                        <td style={styles.tableCell}>{plan.sms_limit}</td>
                        <td style={styles.tableCell}>{plan.number_assign}</td>
                        <td style={styles.tableCell}>{plan.data_limit}</td>
                        <td style={styles.tableCell}>{plan.validity}</td>
                        <td style={styles.tableCell}>
                          <button 
                            style={{
                              padding: '0.2rem 0.5rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              fontSize: '0.6rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsUpdateModalOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} style={{...styles.tableCell, textAlign: 'center', padding: '1rem'}}>
                        No plans found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Render the update modal when needed */}
      {isUpdateModalOpen && selectedPlan && (
        <UpdateModal
          plan={selectedPlan}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedPlan(null);
          }}
          onUpdate={handleUpdatePlan}
        />
      )}
    </div>
  );
}

// Original styles plus new modal styles
const styles = {
  // ... your existing styles from PlansList
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    marginLeft: '257px',
    padding: '0rem'
  } as React.CSSProperties,
  separator: {
    margin: '-1.5rem',
    fontWeight: 600
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:'1px 3px 1px 7px',
    margin:'12px 0px',
    backgroundColor:'white',
    border:'1px solid #cecece',
    borderRadius: '8px',
  } as React.CSSProperties,
    breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    padding:'1px 3px 1px 7px',
    background:'#fff',
    margin:'12px 0px',
    justifyContent: 'space-between'
  } as React.CSSProperties,
  
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
  } as React.CSSProperties,
  searchBar: {
    position: 'relative',
    width: '240px',
    height:'3rem',
    padding:'0.5rem',
    marginBottom:'0rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    height:'35px',
    padding: '0.6rem 2rem 0.5rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '2rem',
    outline: 'none',
    fontSize: '0.80'
  } as React.CSSProperties,
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    padding: '.2rem 0 .2rem',
    height: '18px',
    color: '#666',
  } as React.CSSProperties,
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,
  loadingContainer: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#666',
  },
  errorContainer: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#dc2626',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  addButton: {
   padding: '0.3rem 1.75rem',
                  backgroundColor: '#27292d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.80rem'
  },
  tableWrapper: {
    overflowX: 'auto',
    fontSize: '0.80rem',
  } as React.CSSProperties,
  table: {
    width: '100%',
    fontSize: '0.85',
    borderCollapse: 'collapse',
  } as React.CSSProperties,
  tableHeader: {
    backgroundColor: '#2C2D2D',
    color: 'white',
    padding: '0.3rem 1rem',
    textAlign: 'center' as const
  } as React.CSSProperties,
  tableCell: {
   padding: '0.3rem 1rem',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center' as const
  } as React.CSSProperties,
  oddRow: {
    backgroundColor: '#f9f9f9'
  } as React.CSSProperties,
  evenRow: {
    backgroundColor: 'white'
  } as React.CSSProperties,
  updateButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#27292d',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontWeight: '500'
  } as React.CSSProperties,
  
  // New styles for the modal functionality
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
  } as React.CSSProperties,
  modalTitle: {
    marginBottom: '1.5rem',
    fontSize: '1.2rem',
    fontWeight: '600',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  formRow: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  } as React.CSSProperties,
  input: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.25rem',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  disabledInput: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.25rem',
    fontSize: '0.9rem',
    backgroundColor: '#f3f4f6',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  textarea: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.25rem',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '100px',
  } as React.CSSProperties,
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  } as React.CSSProperties,
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  successMessage: {
    padding: '1rem',
    textAlign: 'center' as const,
    color: '#047857',
    backgroundColor: '#d1fae5',
    borderRadius: '0.375rem',
    marginBottom: '1rem'
  }
};