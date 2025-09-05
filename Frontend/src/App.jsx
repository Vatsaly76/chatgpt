import { useState } from 'react'
import './App.css'
import AppRoutes from './AppRoutes.jsx'
import ThemeProvider from './contexts/ThemeContext.jsx'

function App() {

  return (
    <>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </>
  )
}

export default App
