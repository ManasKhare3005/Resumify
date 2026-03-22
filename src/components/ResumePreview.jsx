import { useResume } from '../context/ResumeContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default function ResumePreview({ useTailored = false }) {
  const { resume, tailoredResume } = useResume();
  const data = useTailored && tailoredResume ? tailoredResume : resume;
  const { personalInfo, summary, experience, education, skills, projects, certifications, achievements } = data;

  const hasContent = personalInfo.name || summary || experience.length > 0 || education.length > 0 || skills.length > 0 || (projects || []).length > 0 || (certifications || []).length > 0 || (achievements || []).length > 0;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-300 py-32">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-base font-medium">Your resume preview will appear here</p>
          <p className="text-sm mt-1 text-gray-200">Start filling in your details on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div id="resume-preview" className="bg-white px-6 py-5 text-black font-serif text-[10px] leading-snug">
      {/* Header */}
      {personalInfo.name && (
        <div className="text-center mb-1.5">
          <h1 className="text-xl font-bold tracking-wide uppercase">{personalInfo.name}</h1>
          <div className="flex flex-wrap justify-center gap-x-2 text-[9px] text-gray-600 mt-0.5">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Summary</h2>
          <p className="text-[9.5px] leading-tight">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Experience</h2>
          {experience.map((exp, i) => (
            (exp.title || exp.company) && (
              <div key={exp.id} className={i > 0 ? 'mt-1.5' : ''}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10px]">{exp.title}</span>
                  <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">
                    {formatDate(exp.startDate)}{exp.startDate && ' — '}{exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="italic text-[9.5px]">{exp.company}{exp.technologies ? ` | ${exp.technologies}` : ''}</span>
                  <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">{exp.location}</span>
                </div>
                {exp.bullets.some(b => b.trim()) && (
                  <ul className="list-disc ml-3.5 mt-0.5">
                    {exp.bullets.map((bullet, idx) => (
                      bullet.trim() && <li key={idx} className="text-[9.5px] leading-tight">{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && education.some(e => e.degree || e.school) && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Education</h2>
          {education.map((edu, i) => (
            (edu.degree || edu.school) && (
              <div key={edu.id} className={i > 0 ? 'mt-1' : ''}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10px]">{edu.degree}</span>
                  <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">
                    {formatDate(edu.startDate)}{edu.startDate && ' — '}{formatDate(edu.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="italic text-[9.5px]">{edu.school}</span>
                  <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">
                    {edu.location}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Projects */}
      {(projects || []).length > 0 && projects.some(p => p.name) && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Projects</h2>
          {projects.map((proj, i) => (
            proj.name && (
              <div key={proj.id} className={i > 0 ? 'mt-1.5' : ''}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10px]">{proj.name}</span>
                  {proj.link && <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">{proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[9px] italic text-gray-600">{proj.technologies}</div>
                )}
                {proj.bullets && proj.bullets.some(b => b.trim()) && (
                  <ul className="list-disc ml-3.5 mt-0.5">
                    {proj.bullets.map((bullet, idx) => (
                      bullet.trim() && <li key={idx} className="text-[9.5px] leading-tight">{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && skills.some(s => s.category && s.items) && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Skills</h2>
          {skills.map((skill) => (
            skill.category && skill.items && (
              <div key={skill.id} className="text-[9.5px] leading-tight">
                <span className="font-bold">{skill.category}:</span> {skill.items}
              </div>
            )
          ))}
        </div>
      )}

      {/* Certifications */}
      {(certifications || []).length > 0 && certifications.some(c => c.name) && (
        <div className="mb-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Certifications</h2>
          {certifications.map((cert) => (
            cert.name && (
              <div key={cert.id} className="flex justify-between items-baseline">
                <span className="text-[9.5px]"><span className="font-bold">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                {cert.date && <span className="text-[9px] text-gray-600 whitespace-nowrap ml-2">{formatDate(cert.date)}</span>}
              </div>
            )
          ))}
        </div>
      )}

      {/* Achievements */}
      {(achievements || []).length > 0 && achievements.some(a => a.text?.trim()) && (
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-wider border-b border-black pb-1 mb-0.5">Achievements</h2>
          <ul className="list-disc ml-3.5">
            {achievements.map((ach) => (
              ach.text?.trim() && <li key={ach.id} className="text-[9.5px] leading-tight">{ach.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
