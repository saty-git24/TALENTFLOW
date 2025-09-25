// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import './styles/globals.css'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import App from './App.jsx'
import './styles/globals.css'

// Initialize MSW and database
async function enableMocking() {
  // Always enable MSW, even in production, and force root scope
  try {
    const { worker } = await import('./api/mockApi.js')
    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: { scope: '/' }
      },
      onUnhandledRequest: 'bypass',
    })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(
        () => console.log('MSW worker registered and ready'),
        (err) => console.error('MSW worker registration failed:', err)
      )
    }
  } catch (error) {
    console.error('Failed to start MSW worker:', error)
  }
}

async function startApp() {
  try {
    await enableMocksAndStartApp()
    
    // Initialize database
    const { initializeDatabase } = await import('./db/index.js')
    await initializeDatabase()
    console.log('Database initialized successfully')
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </BrowserRouter>
      </React.StrictMode>,
    )
    console.log('App rendered successfully')
  } catch (error) {
    console.error('Failed to start app:', error)
    // Render error state
    ReactDOM.createRoot(document.getElementById('root')).render(
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Application Error</h1>
        <p>Failed to initialize application: {error.message}</p>
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    )
  }
}

async function enableMocksAndStartApp() {
  console.log('[DEBUG] App starting at', window.location.href);
  console.log('[DEBUG] NODE_ENV:', import.meta.env.MODE);
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    console.log('[DEBUG] Service workers supported, attempting registration...');
    try {
      // Register the service worker at the root scope
      const registration = await navigator.serviceWorker.register("/mockServiceWorker.js", {
        scope: "/",
      });
      console.log("[MSW] Service worker registered:", registration);
    } catch (error) {
      console.error("[MSW] Service worker registration failed:", error);
    }
  } else {
    console.warn("[MSW] Service workers are not supported in this environment.");
  }

  // Start MSW and wait for it to be ready
  try {
    const { worker } = await import('./api/mockApi.js')
    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
        options: { scope: "/" },
      },
      onUnhandledRequest: "bypass",
    });
    console.log('[MSW] worker.start() called');
  } catch (err) {
    console.error('[MSW] worker.start() failed:', err);
  }

  // Initialize IndexedDB and seed data
  try {
    const { initializeDatabase } = await import('./db/index.js')
    await initializeDatabase();
    console.log('[DEBUG] Database initialized');
  } catch (err) {
    console.error('[DEBUG] Database initialization failed:', err);
  }
}

startApp()