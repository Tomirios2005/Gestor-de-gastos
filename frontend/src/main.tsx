import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './router.tsx'
import './index.css'
import {Toaster} from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router/>
        <Toaster position="top-right" richColors />

  </StrictMode>,
)
