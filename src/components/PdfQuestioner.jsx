import React, { useState } from 'react';

// PdfQuestioner: simple upload UI + results display
export default function PdfQuestioner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);

  function onFileChange(e) {
    setFile(e.target.files[0]);
    setQuestions([]);
    setError(null);
  }

  async function upload() {
    if (!file) return setError('Please select a PDF file');
    setLoading(true);
    setProgressText('Uploading file...');
    setError(null);

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: form
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Upload failed');
      }
      const json = await resp.json();
      setJobId(json.jobId || null);
      setQuestions(json.questions || []);
      setProgressText('Done');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto', fontFamily: 'system-ui, Arial' }}>
      <h2>PDF Questioner</h2>
      <p>Upload a PDF and get MCQ/SAQ/LAQ questions generated from its content.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="file" accept="application/pdf" onChange={onFileChange} />
        <button onClick={upload} disabled={loading}>
          {loading ? 'Working...' : 'Upload & Generate'}
        </button>
      </div>

      {progressText && <p>{progressText}</p>}
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}

      {questions && questions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Questions</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {questions.map((q) => (
              <div key={q.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
                <div style={{ fontSize: 14, color: '#555' }}>{q.type.toUpperCase()} {q.source_page ? `• page ${q.source_page}` : ''}</div>
                <div style={{ marginTop: 8, fontWeight: 600 }}>{q.question}</div>

                {q.type === 'mcq' && q.options && (
                  <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 8 }}>
                    {q.options.map((opt, i) => {
                      const label = String.fromCharCode(65 + i);
                      const isCorrect = q.answer && (q.answer === opt || q.answer === label || q.answer === (label + ')') );
                      return (
                        <li key={i} style={{ padding: '6px 8px', background: isCorrect ? '#e6ffed' : 'transparent', borderRadius: 4 }}>
                          <strong style={{ marginRight: 8 }}>{label}.</strong> {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {q.type === 'saq' && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ color: '#333' }}><strong>Answer:</strong> {q.answer}</div>
                  </div>
                )}

                {q.type === 'laq' && q.expected_points && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ color: '#333' }}><strong>Expected points:</strong></div>
                    <ul>
                      {q.expected_points.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer' }}>Raw model output</summary>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{q.rawModelOutput}</pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
