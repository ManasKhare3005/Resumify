import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ResumeContext = createContext();

const defaultResume = {
  personalInfo: {
    name: '', email: '', phone: '', location: '', linkedin: '', website: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: []
};

export function ResumeProvider({ children }) {
  const { token } = useAuth();
  const [resume, setResume] = useState(defaultResume);
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResume, setTailoredResume] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef(null);
  const resumeRef = useRef(resume);

  // Keep ref in sync
  resumeRef.current = resume;

  // Load resume from server on login
  useEffect(() => {
    if (!token) {
      setResume(defaultResume);
      setLoaded(false);
      return;
    }
    fetch('/api/resume/load', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.resumeData) {
          // Merge with defaults to handle missing fields from older saves
          setResume({ ...defaultResume, ...data.resumeData });
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [token]);

  // Auto-save with debounce
  const saveToServer = useCallback(() => {
    if (!token) return;
    setSaveStatus('saving');
    fetch('/api/resume/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ resumeData: resumeRef.current })
    })
      .then(res => {
        setSaveStatus(res.ok ? 'saved' : 'error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      })
      .catch(() => {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      });
  }, [token]);

  // Trigger auto-save when resume changes (after initial load)
  useEffect(() => {
    if (!token || !loaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveToServer, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resume, token, loaded, saveToServer]);

  const updatePersonalInfo = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateSummary = (value) => {
    setResume(prev => ({ ...prev, summary: value }));
  };

  // --- Experience ---
  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: crypto.randomUUID(), title: '', company: '', location: '',
        startDate: '', endDate: '', current: false, technologies: '', bullets: ['']
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addBullet = (expId) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      )
    }));
  };

  const updateBullet = (expId, index, value) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? {
          ...exp,
          bullets: exp.bullets.map((b, i) => i === index ? value : b)
        } : exp
      )
    }));
  };

  const removeBullet = (expId, index) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? {
          ...exp,
          bullets: exp.bullets.filter((_, i) => i !== index)
        } : exp
      )
    }));
  };

  // --- Education ---
  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, {
        id: crypto.randomUUID(), degree: '', school: '', location: '',
        startDate: '', endDate: '', gpa: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // --- Skills ---
  const addSkill = () => {
    setResume(prev => ({
      ...prev,
      skills: [...prev.skills, { id: crypto.randomUUID(), category: '', items: '' }]
    }));
  };

  const updateSkill = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (id) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  // --- Projects ---
  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: crypto.randomUUID(), name: '', description: '', technologies: '', link: '', bullets: ['']
      }]
    }));
  };

  const updateProject = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeProject = (id) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addProjectBullet = (projId) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projId ? { ...p, bullets: [...p.bullets, ''] } : p
      )
    }));
  };

  const updateProjectBullet = (projId, index, value) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projId ? {
          ...p,
          bullets: p.bullets.map((b, i) => i === index ? value : b)
        } : p
      )
    }));
  };

  const removeProjectBullet = (projId, index) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projId ? {
          ...p,
          bullets: p.bullets.filter((_, i) => i !== index)
        } : p
      )
    }));
  };

  // --- Certifications ---
  const addCertification = () => {
    setResume(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: crypto.randomUUID(), name: '', issuer: '', date: '', link: ''
      }]
    }));
  };

  const updateCertification = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeCertification = (id) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  // --- Achievements ---
  const addAchievement = () => {
    setResume(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        id: crypto.randomUUID(), text: ''
      }]
    }));
  };

  const updateAchievement = (id, value) => {
    setResume(prev => ({
      ...prev,
      achievements: prev.achievements.map(a =>
        a.id === id ? { ...a, text: value } : a
      )
    }));
  };

  const removeAchievement = (id) => {
    setResume(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  return (
    <ResumeContext.Provider value={{
      resume, setResume, loaded, saveStatus,
      jobDescription, setJobDescription,
      tailoredResume, setTailoredResume,
      updatePersonalInfo, updateSummary,
      addExperience, updateExperience, removeExperience,
      addBullet, updateBullet, removeBullet,
      addEducation, updateEducation, removeEducation,
      addSkill, updateSkill, removeSkill,
      addProject, updateProject, removeProject,
      addProjectBullet, updateProjectBullet, removeProjectBullet,
      addCertification, updateCertification, removeCertification,
      addAchievement, updateAchievement, removeAchievement
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
