'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces for the data
interface Profile {
  id: number;
  name: string;
  aucode: string;
  email: string;
  phone: string;
  password: string;
}

interface ApiResponse {
  message: string;
  data: Profile[];
  statusCode: number;
}

interface UpdateFormData {
  id: number;
  name: string;
  aucode: string;
  email: string;
  phone: string;
  password: string;
}

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UpdateFormData | null>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('auth');
    if (auth !== 'true') {
      console.log('User not authenticated, redirecting to login');
      router.push('/');
      return;
    }
    
    console.log('User is authenticated, fetching profiles');
    fetchProfiles();
  }, [router]);
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

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Debug logging
      console.log('Starting to fetch profiles');
      
      const authToken = localStorage.getItem('authToken');
      console.log('Auth token from localStorage:', authToken ? 'exists' : 'not found');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Debug the request before sending
      console.log('Making API request to fetch profiles with token');
      
      const response = await fetch('https://stagedialer.clay.in/api/profile', {
        headers: {
          'Authorization': authToken, // Already includes "Bearer " prefix from login
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
        throw new Error(`Error: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      console.log('API response data received:', result ? 'yes' : 'no');
      
      if (result.statusCode !== 200) {
        throw new Error(result.message || 'Failed to fetch profiles');
      }
      
      console.log(`Fetched ${result.data.length} profiles`);
      setProfiles(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching profiles:', errorMessage);
      setError(errorMessage);
      
      // If this is an auth error, redirect to login
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProfile = async (profileId: number, aucode: string) => {
    try {
      // Confirm before deleting
      if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
        return;
      }
      
      setIsDeleting(true);
      setDeletingId(profileId);
      
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Sending delete profile request');
      
      // Using the API endpoint you provided
      const response = await fetch(`http://localhost:6007/api/profile/users/aucode/${aucode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete profile response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          router.push('/');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Error: ${response.status}`);
      }

      // Handle successful deletion
      console.log('Profile deleted successfully');
      fetchProfiles(); // Refresh the profiles list
      alert('Profile deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      console.error('Error deleting profile:', errorMessage);
      alert(errorMessage);
      
      // If this is an auth error, redirect to login
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleUpdateProfile = async (profileData: UpdateFormData) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.log('No auth token found for update');
        throw new Error('Authentication token not found');
      }
      
      console.log('Sending update profile request');
      
      const response = await fetch('https://stagedialer.clay.in/api/profile/users', {
        method: 'PUT',
        headers: {
          'Authorization': authToken, // Already includes "Bearer " prefix from login
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      console.log('Update profile response status:', response.status);

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
        console.log('Profile updated successfully');
        fetchProfiles();
        setIsUpdateModalOpen(false);
        setSelectedProfile(null);
        alert('Profile updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('Error updating profile:', errorMessage);
      alert(errorMessage);
      
      // If this is an auth error, redirect to login
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('log in')) {
        router.push('/');
      }
    }
  };

  const UpdateModal = ({ profile, onClose, onUpdate }: {
    profile: UpdateFormData;
    onClose: () => void;
    onUpdate: (data: UpdateFormData) => void;
  }) => {
    const [formData, setFormData] = useState<UpdateFormData>(profile);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={styles.modalTitle}>Update Profile</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>AU Code:</label>
              <input
                type="text"
                name="aucode"
                value={formData.aucode}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
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

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 style={styles.pageTitle}>User Profiles</h1>
            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div style={styles.cardContainer}>
            {isLoading ? (
              <div style={styles.loadingContainer}>Loading profiles...</div>
            ) : error ? (
              <div style={styles.errorContainer}>{error}</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>ID</th>
                      <th style={styles.tableHeader}>Name</th>
                      <th style={styles.tableHeader}>AU Code</th>
                      <th style={styles.tableHeader}>Email</th>
                      <th style={styles.tableHeader}>Phone</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={styles.noDataCell}>
                          No profiles found
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((profile, index) => (
                        <tr key={profile.id} style={index % 2 ? styles.oddRow : styles.evenRow}>
                          <td style={styles.tableCell}>{profile.id}</td>
                          <td style={styles.tableCell}>{profile.name}</td>
                          <td style={styles.tableCell}>{profile.aucode}</td>
                          <td style={styles.tableCell}>{profile.email}</td>
                          <td style={styles.tableCell}>{profile.phone}</td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                              
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
    setSelectedProfile(profile);
    setIsUpdateModalOpen(true);
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
  Update
</button>
                             
<button
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
  onClick={() => handleDeleteProfile(profile.id, profile.aucode)}
  disabled={isDeleting}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
  {isDeleting && deletingId === profile.id ? 'Deleting...' : 'Delete'}
</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isUpdateModalOpen && selectedProfile && (
        <UpdateModal
          profile={selectedProfile}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedProfile(null);
          }}
          onUpdate={handleUpdateProfile}
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
    backgroundColor: '#f5f6f7'
  } as React.CSSProperties,
  mainWrapper: {
    flex: 1,
    // marginLeft: '257px',
    padding: '0rem',
  } as React.CSSProperties,
  contentWrapper: {
    margin: '0 20px',
    paddingTop: '0.2rem',
  } as React.CSSProperties,
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    padding: '1px 3px 1px 7px',
    background: '#fff',
    margin: '6px 0px',
    border: '1px solid #cecece',
    borderRadius: '8px',
    justifyContent: 'space-between'
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem',
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
    fontSize: '0.85rem'
  } as React.CSSProperties,
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '0.6rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,
  // Table Styles
  tableWrapper: {
    overflowX: 'auto',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  table: {
    width: '100%',
    fontSize: '0.85rem',
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
  noDataCell: {
    padding: '1rem',
    textAlign: 'center' as const,
    color: '#666',
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
  // Modal Styles
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
    maxWidth: '500px',
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
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as React.CSSProperties,
  input: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.25rem',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  } as React.CSSProperties,
    updateButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  loadingContainer: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  errorContainer: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#dc2626',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  emptyContainer: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  } as React.CSSProperties,
  
  // Additional styles for the table implementation
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
    alignItems: 'center'
  } as React.CSSProperties,
  filterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem'
  } as React.CSSProperties,
  filterSelect: {
    padding: '0.3rem 0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.25rem',
    fontSize: '0.85rem',
    outline: 'none'
  } as React.CSSProperties,
  createButton: {
    padding: '0.3rem 0.8rem',
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  } as React.CSSProperties,
  statusBadge: {
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6rem',
    fontWeight: '500',
    display: 'inline-block'
  } as React.CSSProperties
};