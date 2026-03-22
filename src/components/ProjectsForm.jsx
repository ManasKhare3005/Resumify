import { useResume } from '../context/ResumeContext';

export default function ProjectsForm() {
  const { resume, addProject, updateProject, removeProject, addProjectBullet, updateProjectBullet, removeProjectBullet } = useResume();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-400 mt-0.5">Showcase personal, academic, or open-source projects.</p>
        </div>
        <button onClick={addProject} className="btn-primary text-xs">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Project
          </span>
        </button>
      </div>

      {resume.projects.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-3xl mb-2">🚀</div>
          <p className="text-gray-400 font-medium">No projects added yet</p>
          <p className="text-sm text-gray-300 mt-0.5">Click "Add Project" to get started</p>
        </div>
      )}

      {resume.projects.map((proj) => (
        <div key={proj.id} className="section-card animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <input
                type="text" placeholder="Project Name" value={proj.name}
                onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                className="md:col-span-2 input-field font-medium"
              />
              <input
                type="text" placeholder="Technologies (e.g. React, Node.js, PostgreSQL)" value={proj.technologies}
                onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                className="md:col-span-2 input-field"
              />
              <input
                type="url" placeholder="Link (optional, e.g. github.com/user/project)" value={proj.link}
                onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                className="md:col-span-2 input-field"
              />
            </div>
            <button
              onClick={() => removeProject(proj.id)}
              className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description / Highlights</label>
            {proj.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-2 items-start group">
                <span className="text-violet-300 mt-3 text-xs font-bold">•</span>
                <textarea
                  value={bullet}
                  onChange={(e) => updateProjectBullet(proj.id, idx, e.target.value)}
                  placeholder="Describe what the project does or what you built..."
                  rows={2}
                  className="input-field resize-none flex-1"
                />
                {proj.bullets.length > 1 && (
                  <button
                    onClick={() => removeProjectBullet(proj.id, idx)}
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
              onClick={() => addProjectBullet(proj.id)}
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
