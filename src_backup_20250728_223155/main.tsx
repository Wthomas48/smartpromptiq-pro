import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

const MinimalApp = () => {
  const [isWorking, setIsWorking] = React.useState(false);
  
  return (
    <AuthProvider>
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Minimal App - No Routing</h1>
        <p>This bypasses App.tsx completely</p>
        <button 
          onClick={() => setIsWorking(!isWorking)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isWorking ? 'green' : 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Status: {isWorking ? 'Working!' : 'Click Me'}
        </button>
      </div>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>
)
