import { useState, useEffect } from 'react';
import { RefreshCw, Copy, CheckCircle2 } from 'lucide-react';

interface Quote {
  id: number;
  phrase: string;
}

// Ensure TypeScript knows about window.APP_CONFIG
declare global {
  interface Window {
    APP_CONFIG: {
      backendUrl?: string;
      basePath?: string;
      assetsPath?: string;
    };
  }
}

// Compute base path for the application. Priority:
// 1. runtime `window.APP_CONFIG.basePath` (if provided)
// 2. derive first path segment from `window.location.pathname` (e.g. '/rqm' from '/rqm/' or '/rqm/page')
// 3. empty string for root
const getBasePrefix = (): string => {
  const cfg = window.APP_CONFIG && window.APP_CONFIG.basePath;
  if (cfg && cfg.trim() !== '') return cfg.replace(/\/+$|^\s+|\s+$/g, '').replace(/\/$/, '');

  const path = window.location.pathname || '/';
  if (path === '/') return '';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  return `/${parts[0]}`;
};

const getBackendBase = (): string => {
  const configured = window.APP_CONFIG && window.APP_CONFIG.backendUrl;
  if (configured && configured.trim() !== '') return configured.replace(/\/$/, '');
  const prefix = getBasePrefix();
  return prefix ? `${prefix}/api` : '/api';
};

function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendBase = getBackendBase();
      const response = await fetch(`${backendBase}/quote/random`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      if (response.status === 204) {
        setQuote({ id: 0, phrase: "No quotes available. Please seed the database." });
        return;
      }

      const data = await response.json();
      setQuote(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleCopy = () => {
    if (quote?.phrase) {
      navigator.clipboard.writeText(quote.phrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container">
      <div className="quote-card">
        <h1 className="title">Daily Inspiration</h1>
        
        <div className="quote-content">
          {loading ? (
            <div className="skeleton-loader"></div>
          ) : error ? (
             <div className="error-message">{error}</div>
          ) : (
            <blockquote>
              "{quote?.phrase || 'Welcome to the Random Quote Machine!'}"
            </blockquote>
          )}
        </div>

        <div className="actions">
          <button 
            onClick={fetchQuote} 
            disabled={loading}
            className="btn btn-primary"
          >
            <RefreshCw className={`icon ${loading ? 'spin' : ''}`} size={18} />
            Еще фраза
          </button>
          
          <button 
            onClick={handleCopy} 
            disabled={!quote?.phrase || loading}
            className={`btn btn-secondary ${copied ? 'copied' : ''}`}
          >
            {copied ? <CheckCircle2 className="icon" size={18} /> : <Copy className="icon" size={18} />}
            {copied ? 'Скопировано!' : 'Скопировать'}
          </button>
        </div>
      </div>
      
      <div className="background-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
}

export default App;
