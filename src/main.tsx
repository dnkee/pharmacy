import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PharmacyForm from './PharmacyForm.tsx'
import PharmacyDashboard from './PharmacyDashboard.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <App />
  </StrictMode>,
)
