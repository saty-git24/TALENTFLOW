import React from 'react';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/index.js';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/helpers.js';

// ThemeToggle component for header
function ThemeToggle() {
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
    <button 
      onClick={toggle} 
      className={cn(
        "p-2 rounded-md transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]",
        "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        "border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      )} 
      title={isLight ? 'Switch to dark' : 'Switch to light'} 
      aria-pressed={!isLight}
    >
      {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}

export const Header = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 px-2">
                TalentFlow
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4 px-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right px-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Satyam Gautam</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">HR Manager</p>
              </div>
              
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-700">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};