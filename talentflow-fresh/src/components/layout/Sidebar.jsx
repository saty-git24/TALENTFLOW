import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight
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
  }
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: Settings
  // }
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useAppStore();

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
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 lg:hidden">
                Menu
              </h2>
              {/* Desktop collapse button */}
              <button
                onClick={toggleSidebarCollapsed}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:inline-flex"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn('flex-1 py-6', sidebarCollapsed ? 'px-1' : 'px-4 sm:px-6')}>
            <div className={cn(sidebarCollapsed ? 'space-y-2' : 'space-y-1')}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center text-sm font-medium rounded-md',
                      sidebarCollapsed 
                        ? 'p-3 justify-center' 
                        : 'px-3 py-2',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-black'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <Icon
                      className={cn(
                        'flex-shrink-0 h-5 w-5',
                        isActive
                          ? 'text-primary-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-black'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {!sidebarCollapsed && 'TalentFlow v1.0'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};