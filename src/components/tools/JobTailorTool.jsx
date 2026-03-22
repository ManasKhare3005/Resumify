import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function JobTailorTool() {
  const { resume, jobDescription, setJobDescription, tailoredResume, setTailoredResume } = useResume();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: resume, jobDescription })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.tailored) setTailoredResume(data.tailored);
    } catch (err) {
      console.error('Tailor failed:', err);
      setError('Failed to tailor resume. Please try again.');
    }
    setLoading(false);
  };

  const hasResume = resume.experience.length > 0 || resume.summary;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Job Tailor</h2>
            <p className="text-sm text-gray-400">Optimize your resume for a specific job posting</p>
          </div>
        </div>
      </div>

      {!hasResume && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-700 font-medium">Build your resume first</p>
          <p className="text-xs text-amber-500 mt-0.5">Add experience and a summary so the AI has content to tailor.</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={12}
          className="input-field resize-none"
        />
      </div>

      <button
        onClick={handleTailor}
        disabled={loading || !jobDescription.trim() || !hasResume}
        className="w-full btn-ai justify-center py-3"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Tailoring your resume...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            Tailor Resume for This Job
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {tailoredResume && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm text-emerald-700 font-semibold">Resume tailored successfully!</p>
          </div>
          <p className="text-xs text-emerald-600 ml-6">Switch to "Tailored" in the preview panel to see the optimized version.</p>
        </div>
      )}
    </div>
  );
}
