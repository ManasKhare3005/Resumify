import { useResume } from '../context/ResumeContext';

export default function SkillsForm() {
  const { resume, addSkill, updateSkill, removeSkill } = useResume();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Skills</h2>
          <p className="text-sm text-gray-400 mt-0.5">Group your skills by category.</p>
        </div>
        <button onClick={addSkill} className="btn-primary text-xs">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </span>
        </button>
      </div>

      {resume.skills.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-3xl mb-2">⚡</div>
          <p className="text-gray-400 font-medium">No skills added yet</p>
          <p className="text-sm text-gray-300 mt-0.5">Click "Add Category" to get started</p>
        </div>
      )}

      {resume.skills.map((skill) => (
        <div key={skill.id} className="section-card animate-slide-up">
          <div className="flex gap-3 items-start">
            <div className="flex-1 space-y-3">
              <input
                type="text" placeholder="Category (e.g. Programming Languages)" value={skill.category}
                onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                className="input-field font-medium"
              />
              <input
                type="text" placeholder="Skills (comma separated, e.g. Python, JavaScript, Go)" value={skill.items}
                onChange={(e) => updateSkill(skill.id, 'items', e.target.value)}
                className="input-field"
              />
            </div>
            <button
              onClick={() => removeSkill(skill.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
