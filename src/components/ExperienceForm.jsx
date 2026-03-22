import { useState } from 'react';
import { useResume } from '../context/ResumeContext';

export default function ExperienceForm() {
  const { resume, addExperience, updateExperience, removeExperience, addBullet, updateBullet, removeBullet } = useResume();
  const [improvingBullet, setImprovingBullet] = useState(null);

  const improveBullet = async (expId, index, text, jobTitle, company) => {
    if (!text.trim()) return;
    setImprovingBullet(`${expId}-${index}`);
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, jobTitle, company })
      });
      const data = await res.json();
      if (data.improved) updateBullet(expId, index, data.improved);
    } catch (err) {
      console.error('Failed to improve bullet:', err);
    }
    setImprovingBullet(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-400 mt-0.5">Add your relevant work history.</p>
        </div>
        <button onClick={addExperience} className="btn-primary text-xs">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Position
          </span>
        </button>
      </div>

      {resume.experience.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-3xl mb-2">💼</div>
          <p className="text-gray-400 font-medium">No experience added yet</p>
          <p className="text-sm text-gray-300 mt-0.5">Click "Add Position" to get started</p>
        </div>
      )}

      {resume.experience.map((exp) => (
        <div key={exp.id} className="section-card animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <input
                type="text" placeholder="Job Title" value={exp.title}
                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                className="input-field font-medium"
              />
              <input
                type="text" placeholder="Company" value={exp.company}
                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                className="input-field"
              />
              <input
                type="text" placeholder="Location" value={exp.location}
                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                className="input-field"
              />
              <input
                type="text" placeholder="Tech Stack (e.g. React, Node.js, AWS)"
                value={exp.technologies || ''}
                onChange={(e) => updateExperience(exp.id, 'technologies', e.target.value)}
                className="input-field md:col-span-2"
              />
              <div className="md:col-span-2 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start</label>
                  <input
                    type="month" value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <span className="text-gray-300 pb-3 font-light">—</span>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End</label>
                  {exp.current ? (
                    <div className="px-3.5 py-2.5 bg-violet-50 border border-violet-100 rounded-xl text-sm text-violet-500 font-medium">Present</div>
                  ) : (
                    <input
                      type="month" value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox" checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                  className="w-4 h-4 rounded-md border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                I currently work here
              </label>
            </div>
            <button
              onClick={() => removeExperience(exp.id)}
              className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Achievements</label>
            {exp.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-2 items-start group">
                <span className="text-violet-300 mt-3 text-xs font-bold">•</span>
                <textarea
                  value={bullet}
                  onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                  placeholder="Describe what you accomplished..."
                  rows={2}
                  className="input-field resize-none flex-1"
                />
                <button
                  onClick={() => improveBullet(exp.id, idx, bullet, exp.title, exp.company)}
                  disabled={improvingBullet === `${exp.id}-${idx}` || !bullet.trim()}
                  className="btn-ai text-xs whitespace-nowrap py-2 px-3"
                  title="Improve with AI"
                >
                  {improvingBullet === `${exp.id}-${idx}` ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                  )}
                  {improvingBullet === `${exp.id}-${idx}` ? '' : 'AI'}
                </button>
                {exp.bullets.length > 1 && (
                  <button
                    onClick={() => removeBullet(exp.id, idx)}
                    className="mt-2.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addBullet(exp.id)}
              className="text-sm text-violet-500 hover:text-violet-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add bullet point
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
