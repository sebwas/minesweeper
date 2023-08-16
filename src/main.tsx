import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App/App.tsx'

import './index.css'
import 'reset-css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
