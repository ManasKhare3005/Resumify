import { useState } from 'react';
import { useResume } from '../context/ResumeContext';

export default function SummaryForm() {
  const { resume, updateSummary } = useResume();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo: resume.personalInfo,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
          certifications: resume.certifications,
          achievements: resume.achievements
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else if (data.summary) {
        updateSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Could not connect to the server. Make sure the backend is running (npm run dev).');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
          <p className="text-sm text-gray-400 mt-0.5">A brief overview of your professional background.</p>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="btn-ai"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
          )}
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <textarea
        value={resume.summary}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder="Experienced software engineer with 5+ years..."
        rows={5}
        className="input-field resize-none"
      />
      <p className="text-xs text-gray-300">Tip: Fill in your experience and skills first, then use AI to generate a polished summary.</p>
    </div>
  );
}
