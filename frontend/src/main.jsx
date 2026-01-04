import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

// Hydrate the token before anything renders
const saved = sessionStorage.getItem("tft_token");
if (saved) window.accessToken = saved;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)