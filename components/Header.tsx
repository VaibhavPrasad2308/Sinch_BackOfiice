'use client';

import { usePathname } from 'next/navigation';
import { UserProfilePopup } from '@/app/Auth/LogoutPopup';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

export default function Header() {
  // Get the current path
  const pathname = usePathname();
  
  // Determine the title based on the pathname
  const pageTitle = useMemo(() => {
    // Remove leading slash and split by remaining slashes
    const path = pathname.substring(1);
    
    if (path === '') return 'Dashboard';
    
    // Map of routes to titles
    const routeTitles: Record<string, string> = {
      '/Available-DID': 'Available DID Plans',
      'analytics': 'Analytics',
      'users': 'User Management',
      'settings': 'Settings',
      'profile': 'Profile',
      // Add more mappings as needed
    };
    
    // Check for exact matches first
    if (routeTitles[path]) return routeTitles[path];
    
    // Check for partial matches (for nested routes)
    const segment = path.split('/')[0];
    if (routeTitles[segment]) return routeTitles[segment];
    
    // Fallback: Capitalize the path
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  }, [pathname]);
  
  return (
    <header className="bg-white shadow-lg " style={{ borderColor: 'var(--primaryColor)', height: '65px' }}>
      <div className="p-3 flex items-center justify-between h-50px">
        <div>
          <h1 className="text-black-3xl font-bold bg-clip-text" style={{ fontSize: '1.6rem' }}>
            {pageTitle}
          </h1>
          {/* <p className="text-gray-600 mt-1 font-medium">Welcome back, here's what's happening</p> */}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hover:scale-105 transition-all duration-200"
            style={{ borderColor: 'var(--primaryColor)', color: 'var(--primaryColor)' }}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <UserProfilePopup />
        </div>
      </div>
    </header>
  );
}