import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/index.js';
import { cn } from '../../utils/helpers.js';

const navigationItems = [
  {
    name: 'Jobs',
    href: '/jobs',
    icon: Briefcase
  },
  {
    name: 'Candidates',
    href: '/candidates',
    icon: Users
  },
  {
    name: 'Kanban Board',
    href: '/kanban',
    icon: BarChart3
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: FileCheck
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 lg:hidden">
              Menu
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              TalentFlow v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};