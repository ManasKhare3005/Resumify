import { useResume } from '../context/ResumeContext';

export default function CertificationsForm() {
  const { resume, addCertification, updateCertification, removeCertification } = useResume();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Certifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">Add professional certifications and licenses.</p>
        </div>
        <button onClick={addCertification} className="btn-primary text-xs">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Certification
          </span>
        </button>
      </div>

      {resume.certifications.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-3xl mb-2">🏅</div>
          <p className="text-gray-400 font-medium">No certifications added yet</p>
          <p className="text-sm text-gray-300 mt-0.5">Click "Add Certification" to get started</p>
        </div>
      )}

      {resume.certifications.map((cert) => (
        <div key={cert.id} className="section-card animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <input
                type="text" placeholder="Certification Name (e.g. AWS Solutions Architect)" value={cert.name}
                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                className="md:col-span-2 input-field font-medium"
              />
              <input
                type="text" placeholder="Issuing Organization (e.g. Amazon Web Services)" value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                className="input-field"
              />
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date Earned</label>
                <input
                  type="month" value={cert.date}
                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  className="input-field"
                />
              </div>
              <input
                type="url" placeholder="Credential URL (optional)" value={cert.link}
                onChange={(e) => updateCertification(cert.id, 'link', e.target.value)}
                className="md:col-span-2 input-field"
              />
            </div>
            <button
              onClick={() => removeCertification(cert.id)}
              className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
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
