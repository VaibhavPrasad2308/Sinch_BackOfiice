'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import Header from '@/components/Header';
import { Checkbox } from '@radix-ui/react-checkbox';

interface CallLog {
  call_id: string;
  caller_number: string;
  status: string;
  duration: number;
  start_time: string;
  end_time: string;
  user: string;
  event: string;
  result: string;
}

export default function CallLogs() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('');
const [resultFilter, setResultFilter] = useState<string>('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);


// Add this after fetching the call logs
const uniqueEvents = Array.from(new Set(callLogs.map(log => log.event))).filter(Boolean);
const uniqueResults = Array.from(new Set(callLogs.map(log => log.result))).filter(Boolean);

  useEffect(() => {
    fetchCallLogs();
  }, []);
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
  const fetchCallLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://stagedialer.clay.in/api/calllog/call-events');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (Array.isArray(data.data)) {
        setCallLogs(
          data.data.map((entry: any) => ({
            user: entry.user || '',
            call_id: entry.callid || '',
            caller_number: entry.from_number || entry.cli || '',
            status: entry.result || 'unknown',
            duration: 0,
            start_time: entry.raw_payload?.timestamp || entry.created_at || '',
            end_time: '',
            event:entry.event || '',
            result: entry.result || '',

          }))
        );
      } else {
        setError('Invalid data format from server.');
      }
    } catch (err) {
      setError('Failed to fetch call logs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

// Compute filtered logs for rendering
const filteredLogs = callLogs.filter(log =>
  (log.call_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.caller_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
  (eventFilter === '' || log.event === eventFilter) &&
  (resultFilter === '' || log.result === resultFilter)
);

return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={{
        ...styles.mainWrapper,
        marginLeft: isSidebarOpen ? '257px' : '70px', // Adjust based on collapsed width (16px + padding)
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <Header  />
        <div style={styles.contentWrapper}>
          <div style={styles.breadcrumb}>
          <h1 style={styles.pageTitle}>Call Logs</h1>
           <div style={styles.filtersContainer}>
    <div style={styles.filterItem}>
      <select 
        value={eventFilter} 
        onChange={(e) => setEventFilter(e.target.value)}
        style={styles.filterSelect}
      >
        <option value="">All Events</option>
        {uniqueEvents.map(event => (
          <option key={event} value={event}>{event}</option>
        ))}
      </select>
    </div>
    <div style={styles.filterItem}>
      <select 
        value={resultFilter} 
        onChange={(e) => setResultFilter(e.target.value)}
        style={styles.filterSelect}
      >
        <option value="">All Results</option>
        {uniqueResults.map(result => (
          <option key={result} value={result}>{result}</option>
        ))}
      </select>
    </div>
    <div style={styles.searchBar}>
      <input
        type="text"
        placeholder="Search by call ID or number..."
        style={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
          
            
          
          </div>
          <div style={styles.cardContainer}>
            {isLoading ? (
              <div style={styles.loadingContainer}>Loading call logs...</div>
            ) : error ? (
              <div style={styles.errorContainer}>{error}</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>User</th>
                      <th style={styles.tableHeader}>Call ID</th>
                      <th style={styles.tableHeader}>Caller Number</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Event</th>
                      <th style={styles.tableHeader}>Start Time</th>
                     <th style={styles.tableHeader}>Result</th>

                      
                      {/* <th style={styles.tableHeader}>End Time</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr key={log.call_id} style={index % 2 ? styles.oddRow : styles.evenRow}>
                        <td style={styles.tableCell}>{log.user}</td>
                        <td style={styles.tableCell}>{log.call_id}</td>
                        <td style={styles.tableCell}>{log.caller_number}</td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(log.status)
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={styles.tableCell}>{log.event}</td>
                        <td style={styles.tableCell}>{new Date(log.start_time).toLocaleString()}</td>
                        <td style={styles.tableCell}>{log.result}</td>
                      </tr>
                    ))}
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

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return '#4ade80';
    case 'failed': return '#ef4444';
    case 'in-progress': return '#facc15';
    default: return '#9ca3af';
  }
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
  fontSize: '0.85rem',
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
    fontSize: '0.85rem'
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
  statusBadge: {
    padding: '0.1rem 0.2rem',
    borderRadius: '0.375rem',
    fontSize: '0.85rem',
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
