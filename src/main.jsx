import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import * as Toast from '@radix-ui/react-toast'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Toast.Provider swipeDirection="right" duration={3500}>
          <App />
          <Toast.Viewport className="fixed bottom-6 right-6 z-[1000] flex w-[360px] max-w-full flex-col gap-3 outline-none" />
        </Toast.Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
