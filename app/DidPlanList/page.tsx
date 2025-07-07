'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface NumberPlanDetail {
  sinchnumbercode: string;
  sinchplancode: string;
  sinchnumber: string;
  buyingprice: string;
  validity: string;
  dayleft: string;
  aucode: string;
  user_email: string;
  createdDate: string;
}

interface ApiResponse {
  statusCode: number;
  message?: string;
  data: NumberPlanDetail[];
  totalCallLimit: number;
}

export default function SinchNumberPlanDetails() {
  const router = useRouter();
  const [numberPlans, setNumberPlans] = useState<NumberPlanDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCallLimit, setTotalCallLimit] = useState(0);
  const [filterBy, setFilterBy] = useState('');
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

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('auth');
    if (auth !== 'true') {
      console.log('User not authenticated, redirecting to login');
      router.push('/');
      return;
    }
    
    console.log('User is authenticated, fetching number plan details');
    fetchNumberPlanDetails();
  }, [router]);

  const fetchNumberPlanDetails = async () => {
    console.log("Fetching number plan details...");
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      console.log("Token:", authToken ? 'exists' : 'not found');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch('https://stagedialer.clay.in/api/sinch/sinchnumberplandetails', {
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
        console.log("Number plan details received:", result.data);
        setNumberPlans(result.data);
        setTotalCallLimit(result.totalCallLimit || 0);
      } else {
        console.error("Unexpected API response format:", result);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch number plan details. Please try again later.';
      console.error('Error fetching number plan details:', errorMessage);
      setError(errorMessage);
      
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNumberPlans = numberPlans.filter(plan => {
    const term = searchTerm.trim().toLowerCase();
    
    // First apply the search term filter
    const matchesSearch = term === '' || 
      plan.sinchnumbercode.toString().toLowerCase().includes(term) ||
      plan.sinchplancode.toString().toLowerCase().includes(term) ||
      plan.sinchnumber.toLowerCase().includes(term) ||
      plan.user_email.toLowerCase().includes(term);
    
    // Then apply the dropdown filter
    const matchesFilter = filterBy === '' || 
      (filterBy === 'lessThan7' && parseInt(plan.dayleft) < 7) ||
      (filterBy === '7to15' && parseInt(plan.dayleft) >= 7 && parseInt(plan.dayleft) <= 15) ||
      (filterBy === 'moreThan15' && parseInt(plan.dayleft) > 15);
    
    return matchesSearch && matchesFilter;
  });

  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Extract days as a number from "X days" string
  const extractDays = (daysString: string) => {
    const match = daysString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
          <div style={styles.breadcrumb}>
            <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
            {/* <span style={{margin: '0 8px'}}>/</span> */}
            {/* <span>Number Plan Details</span> */}
            
            <div style={styles.searchBar}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search by number, plan code or email..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.cardContainer}>
            <div style={styles.header}>
              <h2 style={styles.cardTitle}>Sinch Number Plan Details</h2>
              <button 
                style={{
    padding: '0.3rem 1.75rem',
    backgroundColor: '#2C2D2D',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.80rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
                onClick={fetchNumberPlanDetails}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
  </svg>
                Refresh Data
              </button>
            </div>

            <div style={styles.filtersContainer}>
              <div style={styles.filterItem}>
                {/* <select 
                  style={styles.filterSelect}
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="">All Plans</option>
                  <option value="lessThan7">Less than 7 days left</option>
                  <option value="7to15">7-15 days left</option>
                  <option value="moreThan15">More than 15 days left</option>
                </select> */}
              </div>
            </div>

            {isLoading ? (
              <div style={styles.loadingContainer}>Loading number plan details...</div>
            ) : error ? (
              <div style={styles.errorContainer}>{error}</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Number Code</th>
                      <th style={styles.tableHeader}>Plan Code</th>
                      <th style={styles.tableHeader}>Phone Number</th>
                      <th style={styles.tableHeader}>Price</th>
                      <th style={styles.tableHeader}>Validity</th>
                      <th style={styles.tableHeader}>Days Left</th>
                      <th style={styles.tableHeader}>AU Code</th>
                      <th style={styles.tableHeader}>User Email</th>
                      <th style={styles.tableHeader}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNumberPlans.length > 0 ? (
                      filteredNumberPlans.map((plan, index) => {
                        const daysLeft = extractDays(plan.dayleft);
                        let statusColor = '#047857'; // green for good
                        
                        if (daysLeft <= 3) {
                          statusColor = '#dc2626'; // red for critical
                        } else if (daysLeft <= 7) {
                          statusColor = '#f59e0b'; // amber for warning
                        }
                        
                        return (
                          <tr key={`${plan.sinchnumbercode}-${plan.sinchplancode}`} style={index % 2 === 1 ? styles.oddRow : styles.evenRow}>
                            <td style={styles.tableCell}>{plan.sinchnumbercode}</td>
                            <td style={styles.tableCell}>{plan.sinchplancode}</td>
                            <td style={styles.tableCell}>{plan.sinchnumber}</td>
                            <td style={styles.tableCell}>${plan.buyingprice}</td>
                            <td style={styles.tableCell}>{plan.validity}</td>
                            <td style={styles.tableCell}>
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: statusColor
                              }}>
                                {plan.dayleft}
                              </span>
                            </td>
                            <td style={styles.tableCell}>{plan.aucode}</td>
                            <td style={styles.tableCell}>{plan.user_email}</td>
                            <td style={styles.tableCell}>{formatDate(plan.createdDate)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} style={{...styles.tableCell, textAlign: 'center', padding: '1rem'}}>
                          No number plan details found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {!isLoading && !error && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.75rem', 
                color: '#666', 
                margin: '0.5rem 0', 
                padding: '0 0.5rem' 
              }}>
                <div>
                  Total Call Limit: {totalCallLimit}
                </div>
                <div>
                  Total Plans: {filteredNumberPlans.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  filtersContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  filterItem: {
    minWidth: '150px',
  } as React.CSSProperties,
  filterSelect: {
    width: '100%',
    height: '35px',
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '2rem',
    outline: 'none',
    fontSize: '0.80rem',
    backgroundColor: 'white',
  } as React.CSSProperties,

  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f5f6f7'
  } as React.CSSProperties,
  mainWrapper: {
    flex: 1,
    marginLeft: '257px',
    padding: '0rem',
  } as React.CSSProperties,
  contentWrapper: {
    // maxWidth: '1000px',
    margin: '0 20px',
    paddingTop: '0.2rem',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  } as React.CSSProperties,
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    padding:'1px 3px 1px 7px' ,
    background:'#fff',
    margin:'12px 0px',
    border:'1px solid #cecece',
    borderRadius: '8px',
    // gap: '38.5rem',
    justifyContent: 'space-between'
  } as React.CSSProperties,
  separator: {
    margin: '-1.5rem',
    fontWeight: 600
  },
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
    fontSize: '0.80rem'
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
  tableWrapper: {
    overflowX: 'auto',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  table: {
    width: '100%',
    fontSize: '0.80rem',
    borderCollapse: 'collapse',
  } as React.CSSProperties,
  tableHeader: {
    backgroundColor: '#2C2D2D',
    color: 'white',
    padding: '0rem 0rem',
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
  statusBadge: {
    padding: '0.1rem 0.2rem',
    borderRadius: '0.375rem',
    fontSize: '0.80rem',
    fontWeight: '500',
    color: 'white'
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
  }
};