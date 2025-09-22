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
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAppStore } from '../../store/index.js';
import { cn } from '../../utils/helpers.js';

// Small ThemeToggle component kept local to Sidebar for simplicity
function ThemeToggle() {
  // track whether we're currently in light mode (true = white background)
  const [isLight, setIsLight] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem('tf-theme')
      if (saved === 'light') return true
      if (saved === 'dark') return false
      return !document.documentElement.classList.contains('tf-dark')
    } catch (e) {
      return !document.documentElement.classList.contains('tf-dark')
    }
  })

  React.useEffect(() => {
    // keep DOM in sync if initial state says dark
    const el = document.documentElement
    if (isLight) {
      el.classList.remove('tf-dark')
      try { window.localStorage.setItem('tf-theme', 'light') } catch (e) {}
    } else {
      el.classList.add('tf-dark')
      try { window.localStorage.setItem('tf-theme', 'dark') } catch (e) {}
    }
  }, [isLight])

  const toggle = () => {
    setIsLight((v) => !v)
  }

  return (
    <button onClick={toggle} className="p-1 rounded-md text-gray-600 hover:text-gray-900" title={isLight ? 'Switch to dark' : 'Switch to light'} aria-pressed={!isLight}>
      {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

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
          'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 lg:hidden">
                Menu
              </h2>
              {/* Desktop collapse button moved to the top */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSidebarCollapsed}
                  className="ml-2 p-1 rounded-md text-gray-600 hover:text-gray-900 hidden lg:inline-flex"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>

                {/* Theme toggle (reflects current state) */}
                <ThemeToggle />
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn('flex-1 px-4 sm:px-6 py-6', sidebarCollapsed ? 'space-y-2' : 'space-y-1')}>
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
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500 text-center">
              {!sidebarCollapsed && 'TalentFlow v1.0'}
            </div>
            {/* Collapse button moved to the top */}
          </div>
        </div>
      </div>
    </>
  );
};