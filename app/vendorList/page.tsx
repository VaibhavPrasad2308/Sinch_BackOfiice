'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Vendor {
  id: number;
  vendorcode: string;
  vendor_name: string;
  vendor_planlist: string;
  price: string;
  description: string;
  created_at: string;
  usercode: string;
  update_date: string | null;
}

interface ApiResponse {
  status: number;
  vendors: Vendor[];
}

interface UpdateFormData {
  vendor_name: string;
  vendor_planlist: string;
  price: number; // Changed to number to match the request
  description: string;
}

export default function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentState = localStorage.getItem('sidebarOpen');
      if (currentState !== null) {
        setSidebarOpen(JSON.parse(currentState));
      }
    };
    
    const intervalId = setInterval(handleStorageChange, 300);
    return () => clearInterval(intervalId);
  }, []);

 useEffect(() => {
    const auth = localStorage.getItem('auth');
    const authToken = localStorage.getItem('authToken');
    
    if (auth !== 'true' || !authToken) {
      console.log('User not authenticated, redirecting to login');
      router.push('/');
      return;
    }
    
    console.log('User is authenticated, fetching vendors');
    fetchVendors();
  }, [router]);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken'); // This will already include 'Bearer '
      console.log("Auth Token:", authToken); // Debug log
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('https://stagedialer.clay.in/api/vendor/getvendors', {
        method: 'GET',
        headers: {
          'Authorization': authToken, // Don't add 'Bearer ' prefix as it's already included
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          router.push('/');
          throw new Error('Session expired or invalid token');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status === 200) {
        setVendors(result.vendors);
      } else {
        throw new Error('Failed to fetch vendors');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendors';
      console.error('Error details:', err);
      setError(errorMessage);
      
      if (errorMessage.includes('session') || errorMessage.includes('token')) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVendor = async (vendorData: UpdateFormData) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Updating vendor with data:', vendorData); // Debug log

      const response = await fetch(`https://stagedialer.clay.in/api/vendor/updatevendor/${selectedVendor?.vendorcode}`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_name: vendorData.vendor_name,
          vendor_planlist: vendorData.vendor_planlist,
          price: Number(vendorData.price), // Convert to number
          description: vendorData.description
        })
      });

      console.log('Update response status:', response.status); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          router.push('/');
          throw new Error('Session expired');
        }
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update response:', result); // Debug log
      
      if (result.status === 200) {
        fetchVendors();
        setIsUpdateModalOpen(false);
        setSelectedVendor(null);
        alert('Vendor updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update vendor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vendor';
      console.error('Error updating vendor:', errorMessage);
      alert(errorMessage);
      
      if (errorMessage.includes('session') || errorMessage.includes('token')) {
        router.push('/');
      }
    }
  };

   const UpdateModal = ({ vendor, onClose, onUpdate }: {
    vendor: Vendor;
    onClose: () => void;
    onUpdate: (data: UpdateFormData) => void;
  }) => {
    const [formData, setFormData] = useState<UpdateFormData>({
      vendor_name: vendor.vendor_name,
      vendor_planlist: vendor.vendor_planlist,
      price: Number(vendor.price), // Convert to number
      description: vendor.description
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.name === 'price' 
        ? Number(e.target.value) 
        : e.target.value;
        
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    };

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={styles.modalTitle}>Update Vendor</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Vendor Name:</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Plan List:</label>
              <input
                type="text"
                name="vendor_planlist"
                value={formData.vendor_planlist}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                style={styles.input}
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

  const filteredVendors = vendors.filter(vendor => {
    const term = searchTerm.toLowerCase().trim();
    return term === '' || 
           vendor.vendorcode.toLowerCase().includes(term) ||
           vendor.vendor_name.toLowerCase().includes(term) ||
           vendor.vendor_planlist.toLowerCase().includes(term) ||
           vendor.description.toLowerCase().includes(term);
  });

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={{
        ...styles.mainContent,
        marginLeft: isSidebarOpen ? '257px' : '70px'
      }}>
        <Header />
        <div style={styles.header}>
          <div style={styles.breadcrumb}>
            <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
            <span style={{margin: '0 8px'}}>/</span>
            <span>Vendors List</span>
          </div>
          
          <div style={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search vendors..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.cardContainer}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Vendors</h2>
            <Link href="/create-vendor">
              <button style={styles.addButton}>Add New Vendor</button>
            </Link>
          </div>

          {isLoading ? (
            <div style={styles.loadingContainer}>Loading vendors...</div>
          ) : error ? (
            <div style={styles.errorContainer}>{error}</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Vendor Code</th>
                    <th style={styles.tableHeader}>Vendor Name</th>
                    <th style={styles.tableHeader}>Plan List</th>
                    <th style={styles.tableHeader}>Price</th>
                    <th style={styles.tableHeader}>Description</th>
                    <th style={styles.tableHeader}>Created At</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor, index) => (
                    <tr key={vendor.id} style={index % 2 === 1 ? styles.oddRow : styles.evenRow}>
                      <td style={styles.tableCell}>{vendor.vendorcode}</td>
                      <td style={styles.tableCell}>{vendor.vendor_name}</td>
                      <td style={styles.tableCell}>{vendor.vendor_planlist}</td>
                      <td style={styles.tableCell}>${vendor.price}</td>
                      <td style={styles.tableCell}>{vendor.description}</td>
                      <td style={styles.tableCell}>
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </td>
                      <td style={styles.tableCell}>
                        <button 
                          style={styles.updateButton}
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setIsUpdateModalOpen(true);
                          }}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {isUpdateModalOpen && selectedVendor && (
        <UpdateModal
          vendor={selectedVendor}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedVendor(null);
          }}
          onUpdate={handleUpdateVendor}
        />
      )}
    </div>
  );
}

const styles = {
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