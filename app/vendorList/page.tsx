'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  vendorName: string;
  planList: string;
  price: string;
  description: string;
  userCode: string;
  status: string;
}

export default function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
  

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        router.push('/register');
        return;
      }

      const response = await fetch('https://stagedialer.clay.in/api/vendor/getvendors', {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Vendor API response:', data);

      // Handle various formats
      if (data.status === 200 && Array.isArray(data.vendors)) {
  // Map to your internal Vendor structure
  const formattedVendors: Vendor[] = data.vendors.map((v: any) => ({
    id: String(v.id),
    vendorName: v.vendor_name,
    planList: v.vendor_planlist,
    price: `$${v.price}`,
    description: v.description || 'N/A',
    userCode: v.vendorcode,
    status: v.status || 'active',
  }));
  setVendors(formattedVendors);
} else {
  setError('Invalid data format from server.');
}


    } catch (err) {
      setError('Failed to fetch vendors. Please try again later.');
      console.error('Error fetching vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };
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

  const uniqueStatuses = Array.from(new Set(vendors.map(v => v.status))).filter(Boolean);
  const priceRanges = ['$0-$50', '$51-$100', '$101-$200', '$201+'];

  const filteredVendors = vendors.filter(vendor =>
    (vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.userCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || vendor.status === statusFilter) &&
    (priceFilter === '' || matchesPriceFilter(vendor.price, priceFilter))
  );

  function matchesPriceFilter(price: string, filter: string): boolean {
    const numericPrice = parseInt(price.replace(/[^\d]/g, ''));
    switch (filter) {
      case '$0-$50': return numericPrice < 50;
      case '$51-$100': return numericPrice >= 50 && numericPrice <= 100;
      case '$101-$200': return numericPrice > 100 && numericPrice <= 200;
      case '$201+': return numericPrice > 200;
      default: return true;
    }
  }

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return '#4ade80';
      case 'inactive': return '#ef4444';
      case 'pending': return '#facc15';
      default: return '#9ca3af';
    }
  }

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
            <h1 style={styles.pageTitle}>Vendor List</h1>
            <div style={styles.filtersContainer}>
              <div style={styles.filterItem}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.filterItem}>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Price Ranges</option>
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              <div style={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search by vendor name or code..."
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              // For the Create Vendor button
<button
  onClick={() => router.push('/createVendor')}
  style={{
    padding: '0.5rem 1rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
  Create Vendor
</button>
            </div>
          </div>
          <div style={styles.cardContainer}>
            {isLoading ? (
              <div style={styles.loadingContainer}>Loading vendors...</div>
            ) : error ? (
              <div style={styles.errorContainer}>{error}</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Vendor ID</th>
                      <th style={styles.tableHeader}>Vendor Name</th>
                      <th style={styles.tableHeader}>Plan List</th>
                      <th style={styles.tableHeader}>Price</th>
                      <th style={styles.tableHeader}>Description</th>
                      <th style={styles.tableHeader}>User Code</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor, index) => (
                        <tr key={vendor.id} style={index % 2 ? styles.oddRow : styles.evenRow}>
                          <td style={styles.tableCell}>{vendor.id}</td>
                          <td style={styles.tableCell}>{vendor.vendorName}</td>
                          <td style={styles.tableCell}>{vendor.planList}</td>
                          <td style={styles.tableCell}>{vendor.price}</td>
                          <td style={styles.tableCell}>{vendor.description}</td>
                          <td style={styles.tableCell}>{vendor.userCode}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(vendor.status)
                            }}>
                              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                          
<button
  onClick={() => router.push(`/editVendor/${vendor.id}`)}
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
>
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
  Edit
</button>
                            
<button
  onClick={() => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      console.log('Delete vendor', vendor.id);
    }
  }}
  style={{
    padding: '0.2rem 0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
  Delete
</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={styles.noDataCell}>
                          No vendors found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  filtersContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
    margin: '0 20px',
    paddingTop: '0.2rem',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    padding: '1px 3px 1px 7px',
    background: '#fff',
    margin: '12px 0px',
    border: '1px solid #cecece',
    borderRadius: '8px',
    justifyContent: 'space-between'
  } as React.CSSProperties,
  searchBar: {
    position: 'relative',
    width: '240px',
    height: '3rem',
    padding: '0.5rem',
    marginBottom: '0rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    height: '35px',
    padding: '0.6rem 2rem 0.5rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '2rem',
    outline: 'none',
    fontSize: '0.80rem'
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
    backgroundColor: '#1F2328',
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
  },
  noDataCell: {
    padding: '1rem',
    textAlign: 'center' as const,
    color: '#666',
  },
  createButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.7rem',
  } as React.CSSProperties,
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  editButton: {
    padding: '0.2rem 0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.6rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  deleteButton: {
    padding: '0.2rem 0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.6rem',
    cursor: 'pointer',
  } as React.CSSProperties,
};