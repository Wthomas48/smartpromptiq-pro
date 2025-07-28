import { useState, useEffect } from 'react';

export function APITest() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>
      <p className="mb-2">✅ Frontend connected to backend!</p>
      <p className="mb-4">Found {templates.length} prompt templates:</p>
      <ul className="list-disc pl-5">
        {templates.map(t => (
          <li key={t.id}>{t.name} - {t.category}</li>
        ))}
      </ul>
    </div>
  );
}
