import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPerformanceMonitoring } from './lib/performance'
import { initAnalytics } from './lib/analytics'
import { PerformanceMonitor } from './components/PerformanceMonitor'

// Initialize performance monitoring
initPerformanceMonitoring({
  logToConsole: import.meta.env.DEV,
  debug: import.meta.env.DEV,
})

// Initialize analytics (GA4)
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.DEV && <PerformanceMonitor />}
  </StrictMode>,
)
