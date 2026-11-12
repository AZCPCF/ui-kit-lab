import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/vazirmatn'
import './spike/shell.css'
import './app/app-shell.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
