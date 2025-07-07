'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


interface UnallocatedNumber {
  sinchnumbercode: string;
  sinchnumber: string;
  allocated: number;
}

interface ApiResponse {
  statusCode: number;
  message?: string;
  data: UnallocatedNumber[];
}

export default function UnallocatedNumbers() {
  const router = useRouter();
  const [numbers, setNumbers] = useState<UnallocatedNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    
    console.log('User is authenticated, fetching unallocated numbers');
    fetchUnallocatedNumbers();
  }, [router]);

  const fetchUnallocatedNumbers = async () => {
    console.log("Fetching unallocated numbers...");
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      console.log("Token:", authToken ? 'exists' : 'not found');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch('https://stagedialer.clay.in/api/sinch/unallocated-numbers', {
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
        console.log("Unallocated numbers received:", result.data);
        setNumbers(result.data);
      } else {
        console.error("Unexpected API response format:", result);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch unallocated numbers. Please try again later.';
      console.error('Error fetching unallocated numbers:', errorMessage);
      setError(errorMessage);
      
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNumbers = numbers.filter(number => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') return true;

    return (
      number.sinchnumbercode.toString().includes(term) ||
      number.sinchnumber.toLowerCase().includes(term)
    );
  });

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
            <Link href="/" style={{ color: '#2C2D2D', font: 'bold',fontWeight:'600' }}>Home</Link>
            {/* <span style={{margin: '0 8px'}}></span> */}
            {/* <span>Unallocated Numbers</span> */}
            
            <div style={styles.searchBar}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search by number code or phone number..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.cardContainer}>
            <div style={styles.header}>
              <h2 style={styles.cardTitle}>Unallocated Phone Numbers</h2>
               {/* <div style={styles.filtersContainer}>
              <div style={styles.filterItem}>
                <select 
                  style={styles.filterSelect}
                  onChange={(e) => setSearchTerm(e.target.value)}
                >
                  <option value="">All Numbers</option>
                  <option value="+1">US Numbers (+1)</option>
                  <option value="+91">India Numbers (+91)</option>
                </select>
              </div>
            </div> */}
              
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
  onClick={fetchUnallocatedNumbers}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
  </svg>
  Refresh List
</button>
            </div>

           

            {isLoading ? (
              <div style={styles.loadingContainer}>Loading unallocated numbers...</div>
            ) : error ? (
              <div style={styles.errorContainer}>{error}</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Number Code</th>
                      <th style={styles.tableHeader}>Phone Number</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNumbers.length > 0 ? (
                      filteredNumbers.map((number, index) => (
                        <tr key={number.sinchnumbercode} style={index % 2 === 1 ? styles.oddRow : styles.evenRow}>
                          <td style={styles.tableCell}>{number.sinchnumbercode}</td>
                          <td style={styles.tableCell}>{number.sinchnumber}</td>
                          <td style={styles.tableCell}>

                            {/* status badge is the 200 success code */}
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: number.allocated === 0 ? '#047857' : '#dc2626'
                            }}>
                              {number.allocated === 0 ? 'N.A.' : 'N.A.'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            
                          <button 
    style={{
      padding: '0.5rem 0.75rem',
      backgroundColor: '#2C2D2D',
      color: 'white',
      gap: '5px',  // Adjusted gap value
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center', // Add this to center the content inside button
      margin: '0 auto', // Add this to center the button in the cell
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.80rem'
    }}
    onClick={() => router.push(`/allocate-number/${number.sinchnumbercode}`)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <td colSpan={4} style={{...styles.tableCell, textAlign: 'center', padding: '1rem'}}>
                          No unallocated numbers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {!isLoading && !error && filteredNumbers.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#666', margin: '0.5rem 0', textAlign: 'right' }}>
                Total unallocated numbers: {filteredNumbers.length}
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