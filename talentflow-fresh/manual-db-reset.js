// Manual Database Reset Script
// Copy and paste this into the browser console (F12 -> Console tab)

(async function clearTalentFlowDB() {
  console.log('🔄 Starting database reset...');
  
  try {
    // Delete the IndexedDB database
    const deleteRequest = indexedDB.deleteDatabase('TalentFlowDB');
    
    deleteRequest.onsuccess = async function() {
      console.log('✅ Database deleted successfully');
      
      // Reload the page to reinitialize the database
      console.log('🔄 Reloading page to reinitialize database...');
      window.location.reload();
    };
    
    deleteRequest.onerror = function() {
      console.error('❌ Failed to delete database');
    };
    
    deleteRequest.onblocked = function() {
      console.warn('⚠️ Database deletion blocked. Close all tabs and try again.');
    };
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
  }
})();

console.log('📋 Database reset script loaded. The database will be cleared and the page will reload automatically.');