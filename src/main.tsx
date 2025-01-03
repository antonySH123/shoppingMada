import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'react-loading-skeleton/dist/skeleton.css'
import './index.css'
import { AuthProvider } from './context/UserContext.tsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { SkeletonTheme } from 'react-loading-skeleton'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
       <SkeletonTheme>
       <App/>
       </SkeletonTheme>
        <ToastContainer/>
      </AuthProvider>

  </StrictMode>,

)
