import { useResume } from '../context/ResumeContext';

export default function PersonalInfoForm() {
  const { resume, updatePersonalInfo } = useResume();
  const { personalInfo } = resume;

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: '👤', span: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', icon: '✉️' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567', icon: '📱' },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA', icon: '📍' },
    { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'linkedin.com/in/johndoe', icon: '🔗' },
    { key: 'website', label: 'Website', type: 'url', placeholder: 'johndoe.com', icon: '🌐' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
        <p className="text-sm text-gray-400 mt-0.5">Basic details that appear at the top of your resume.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label, type, placeholder, span }) => (
          <div key={key} className={span ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input
              type={type}
              value={personalInfo[key]}
              onChange={(e) => updatePersonalInfo(key, e.target.value)}
              placeholder={placeholder}
              className="input-field"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
