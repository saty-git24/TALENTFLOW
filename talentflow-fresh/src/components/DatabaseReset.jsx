import React from 'react';
import { clearDatabase } from '../db/index.js';

const DatabaseReset = () => {
  const [status, setStatus] = React.useState('Ready to reset');
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    setStatus('Clearing database...');
    
    try {
      await clearDatabase();
      setStatus('✅ Database cleared and reseeded successfully!');
      
      // Redirect to candidates page after 2 seconds
      setTimeout(() => {
        window.location.href = '/candidates';
      }, 2000);
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  // Auto-trigger reset on mount
  React.useEffect(() => {
    handleReset();
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Reset</h1>
      <div className="text-lg text-gray-600 mb-6">{status}</div>
      {isResetting && (
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      )}
    </div>
  );
};

export default DatabaseReset;