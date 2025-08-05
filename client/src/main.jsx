// NovaNest/client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Your global styles
import { BrowserRouter } from 'react-router-dom'

import "easymde/dist/easymde.min.css"; // <-- Import EasyMDE CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)