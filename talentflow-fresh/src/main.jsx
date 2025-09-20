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
  if (import.meta.env.DEV) {
    const { worker } = await import('./api/mockApi.js')
    return worker.start()
  }
}

async function startApp() {
  await enableMocking()
  
  // Initialize database
  const { initializeDatabase } = await import('./db/index.js')
  await initializeDatabase()
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
}

startApp()