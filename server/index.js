import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { randomUUID } from 'crypto';
import pool, { initDB } from './db.js';
import admin from './firebaseAdmin.js';
import pdfParse from 'pdf-parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

// Initialize database tables
await initDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

// --- AUTH MIDDLEWARE (Firebase) ---

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const idToken = header.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.userId = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- DELETE ACCOUNT ---

app.delete('/api/auth/delete', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM resumes WHERE user_id = $1', [req.userId]);
    await admin.auth().deleteUser(req.userId);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete account error:', error.message || error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// --- RESUME SAVE/LOAD ---

app.post('/api/resume/save', authMiddleware, async (req, res) => {
  try {
    const { resumeData } = req.body;

    await pool.query(
      `INSERT INTO resumes (user_id, data, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.userId, JSON.stringify(resumeData)]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Save error:', error.message || error);
    res.status(500).json({ error: 'Failed to save resume.' });
  }
});

app.get('/api/resume/load', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM resumes WHERE user_id = $1', [req.userId]);
    if (result.rows.length === 0) return res.json({ resumeData: null });
    res.json({ resumeData: result.rows[0].data });
  } catch (error) {
    console.error('Load error:', error.message || error);
    res.status(500).json({ error: 'Failed to load resume.' });
  }
});

// --- AI HELPERS ---

async function chat(messages, maxTokens = 1024) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
}

function buildResumeText(resumeData) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, achievements } = resumeData;
  const parts = [];
  if (personalInfo?.name) parts.push(`Name: ${personalInfo.name}`);
  if (summary) parts.push(`Summary: ${summary}`);
  if (experience?.length) {
    parts.push('Experience:\n' + experience.map(e =>
      `- ${e.title || ''} at ${e.company || ''} (${e.location || ''}), ${e.startDate} - ${e.current ? 'Present' : e.endDate}${e.technologies ? '\n  Tech: ' + e.technologies : ''}\n  ${(e.bullets || []).filter(Boolean).join('; ')}`
    ).join('\n'));
  }
  if (education?.length) {
    parts.push('Education:\n' + education.map(e =>
      `- ${e.degree || ''} from ${e.school || ''} (${e.location || ''}), ${e.startDate} - ${e.endDate}${e.gpa ? ', GPA: ' + e.gpa : ''}`
    ).join('\n'));
  }
  if (projects?.length) {
    parts.push('Projects:\n' + projects.map(p =>
      `- ${p.name || ''}${p.technologies ? ' (' + p.technologies + ')' : ''}${p.link ? ' - ' + p.link : ''}\n  ${(p.bullets || []).filter(Boolean).join('; ')}`
    ).join('\n'));
  }
  if (skills?.length) {
    parts.push('Skills:\n' + skills.map(s => `- ${s.category}: ${s.items}`).join('\n'));
  }
  if (certifications?.length) {
    parts.push('Certifications:\n' + certifications.map(c =>
      `- ${c.name || ''}${c.issuer ? ', ' + c.issuer : ''}${c.date ? ' (' + c.date + ')' : ''}`
    ).join('\n'));
  }
  if (achievements?.length) {
    parts.push('Achievements:\n' + achievements.map(a => `- ${a.text || ''}`).filter(a => a !== '- ').join('\n'));
  }
  return parts.join('\n\n');
}

// --- AI ENDPOINTS ---

app.post('/api/improve', async (req, res) => {
  try {
    const { text, jobTitle, company } = req.body;
    const context = jobTitle ? `for a ${jobTitle} role${company ? ` at ${company}` : ''}` : '';

    const result = await chat([
      { role: 'system', content: `You are a senior resume consultant who writes high-impact bullet points. You follow the formula: Strong Action Verb + What You Did + Tool/Tech Used + Measurable Result.

Rules:
- NEVER use weak verbs like "Worked on", "Helped with", "Was responsible for"
- ALWAYS start with a power verb: Built, Engineered, Designed, Optimized, Reduced, Increased, Automated, Architected, Delivered, Spearheaded
- Add quantified results wherever possible (%, users, time saved, scale). If exact numbers aren't provided, use reasonable professional estimates like "reducing manual effort by ~40%" or "serving 500+ daily users"
- Mention specific technologies/tools used
- Keep it to 1-2 lines max
- Make it sound like an engineer, not a student
- Return ONLY the improved bullet point, nothing else` },
      { role: 'user', content: `Improve this resume bullet point ${context}. Make it specific, impactful, and results-driven.\n\nOriginal: ${text}` }
    ], 300);

    res.json({ improved: result });
  } catch (error) {
    console.error('Improve error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to improve text' });
  }
});

app.post('/api/generate-summary', async (req, res) => {
  try {
    const { personalInfo, experience, education, skills, projects, certifications, achievements } = req.body;

    const resumeText = buildResumeText({ personalInfo, summary: '', experience: experience || [], education: education || [], skills: skills || [], projects: projects || [], certifications: certifications || [], achievements: achievements || [] });

    if (!resumeText.trim() || resumeText === `Name: ${personalInfo?.name || ''}`.trim()) {
      return res.status(400).json({ error: 'Please fill in your experience, skills, or other sections first so the AI has context to work with.' });
    }

    const result = await chat([
      { role: 'system', content: `You are a senior resume consultant. Write sharp, specific professional summaries that make recruiters stop scrolling.

Rules:
- NEVER write generic fluff like "passionate developer", "motivated engineer", "team player", "problem solver"
- Base the summary ENTIRELY on the candidate's actual data provided below — their real job titles, companies, tech stack, projects, education, and achievements
- Mention: years of experience (estimate from their roles), their specific tech stack (from their experience + skills), what they actually built/delivered, and their strongest domain
- If they have certifications or notable achievements, weave those in naturally
- If they have projects, reference the type of things they build
- Keep it to 2-3 sentences, punchy and confident
- Write like an engineer describing themselves to a hiring manager, not a student writing a cover letter
- Return ONLY the summary paragraph, nothing else. No labels or prefixes.` },
      { role: 'user', content: `Write a professional summary for this candidate based ONLY on the details below. Every claim in the summary must be traceable to something in their resume data. Do not invent skills, experience, or achievements they don't have.\n\nCANDIDATE DATA:\n${resumeText}` }
    ], 300);

    res.json({ summary: result });
  } catch (error) {
    console.error('Summary error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

app.post('/api/tailor-resume', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    const { personalInfo, summary, experience, education, skills, projects, certifications, achievements } = resumeData;

    const resumeText = JSON.stringify({ summary, experience, education, skills, projects, certifications, achievements }, null, 2);

    const result = await chat([
      { role: 'system', content: `You are a senior resume strategist who specializes in tailoring resumes to pass ATS systems and impress hiring managers. You rewrite content to be specific, metric-driven, and keyword-optimized. Return ONLY valid JSON, no markdown fences, no explanations.` },
      { role: 'user', content: `Tailor this resume for the job description below. Don't just swap words — strategically rewrite bullet points to highlight relevant experience and naturally weave in keywords from the JD.

RULES:
- Keep all personal info exactly the same
- Rewrite the summary to directly address what this role needs — mention specific technologies and experience that match
- Rewrite experience bullet points using the Action + Tech + Result formula. Add reasonable metrics where missing (e.g., "reduced load time by ~35%", "serving 1K+ daily users")
- Reorder bullet points so the most relevant ones for this job come first
- Mirror the job description's language naturally (if JD says "CI/CD pipelines", use that exact phrase instead of "deployment automation")
- Prioritize and reorder skills to lead with what the JD emphasizes most
- Do NOT fabricate experience or skills the candidate doesn't have — but DO reframe existing experience to highlight relevance
- Keep the same jobs and schools — but optimize every word

PROJECT SELECTION (CRITICAL):
- The candidate has listed ALL their projects. Your job is to pick ONLY the top 3 most relevant projects for this specific job.
- Rank projects by how well their technologies, domain, and skills align with the job description requirements
- For the 3 selected projects, rewrite their bullet points to emphasize aspects that match the job — use keywords from the JD naturally, highlight relevant technologies, and add impact metrics where reasonable
- If the candidate has 3 or fewer projects, include all of them but still rewrite the descriptions to match the JD
- Do NOT include projects that have no relevance to the job — replace them with more relevant ones from the candidate's list
- Keep each selected project's name, technologies, and link intact — only rewrite the bullet descriptions

- Keep certifications and achievements as-is unless directly relevant to reword

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME DATA:
${resumeText}

Return a JSON object with this exact structure:
{
  "personalInfo": ${JSON.stringify(personalInfo)},
  "summary": "tailored summary string",
  "experience": [{"id": "string", "title": "string", "company": "string", "location": "string", "startDate": "string", "endDate": "string", "current": false, "technologies": "string", "bullets": ["string"]}],
  "education": [{"id": "string", "degree": "string", "school": "string", "location": "string", "startDate": "string", "endDate": "string", "gpa": "string"}],
  "skills": [{"id": "string", "category": "string", "items": "string"}],
  "projects": [{"id": "string", "name": "string", "technologies": "string", "link": "string", "bullets": ["string"]}],
  "certifications": [{"id": "string", "name": "string", "issuer": "string", "date": "string", "link": "string"}],
  "achievements": [{"id": "string", "text": "string"}]
}` }
    ], 4000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const tailored = JSON.parse(cleaned);
    res.json({ tailored });
  } catch (error) {
    console.error('Tailor error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to tailor resume' });
  }
});

app.post('/api/generate-latex', async (req, res) => {
  try {
    const { resumeData } = req.body;
    const { personalInfo, summary, experience, education, skills, projects, certifications, achievements } = resumeData;

    const result = await chat([
      { role: 'system', content: 'You are a LaTeX expert. Generate complete, compilable LaTeX resume documents. Return ONLY LaTeX code starting with \\documentclass and ending with \\end{document}. No explanations, no markdown fences.' },
      { role: 'user', content: `Generate a complete LaTeX resume using a clean, professional single-column format similar to Jake's Resume template. Use the article document class with custom formatting. Escape special characters properly. Only include sections that have content (skip sections marked N/A or empty).

Personal Info:
Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
LinkedIn: ${personalInfo.linkedin || 'N/A'}
Website: ${personalInfo.website || 'N/A'}

Summary: ${summary || 'N/A'}

Experience:
${(experience || []).map(e => `- ${e.title} at ${e.company} (${e.location}), ${e.startDate} - ${e.current ? 'Present' : e.endDate}\n  Bullets: ${(e.bullets || []).filter(Boolean).join('; ')}`).join('\n') || 'N/A'}

Education:
${(education || []).map(e => `- ${e.degree} from ${e.school} (${e.location}), ${e.startDate} - ${e.endDate}${e.gpa ? ', GPA: ' + e.gpa : ''}`).join('\n') || 'N/A'}

Projects:
${(projects || []).map(p => `- ${p.name}${p.technologies ? ' (' + p.technologies + ')' : ''}${p.link ? ' - ' + p.link : ''}\n  ${(p.bullets || []).filter(Boolean).join('; ')}`).join('\n') || 'N/A'}

Skills:
${(skills || []).map(s => `- ${s.category}: ${s.items}`).join('\n') || 'N/A'}

Certifications:
${(certifications || []).map(c => `- ${c.name}${c.issuer ? ', ' + c.issuer : ''}${c.date ? ' (' + c.date + ')' : ''}`).join('\n') || 'N/A'}

Achievements:
${(achievements || []).filter(a => a.text?.trim()).map(a => `- ${a.text}`).join('\n') || 'N/A'}` }
    ], 4000);

    const cleaned = result.replace(/^```(?:latex)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    res.json({ latex: cleaned });
  } catch (error) {
    console.error('LaTeX error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to generate LaTeX' });
  }
});

// --- TOOL ENDPOINTS ---

app.post('/api/cover-letter', async (req, res) => {
  try {
    const { resumeData, jobDescription, companyName } = req.body;
    const resumeText = buildResumeText(resumeData);

    const result = await chat([
      { role: 'system', content: `You are a senior career coach who writes cover letters that actually get interviews. You write like a confident professional, not a desperate applicant. Every sentence connects the candidate's SPECIFIC experience to the job's SPECIFIC requirements. Return ONLY the cover letter text.` },
      { role: 'user', content: `Write a cover letter for this candidate applying to ${companyName || 'the company'}.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Rules:
- NEVER open with "I am writing to apply" or "I am excited to apply" — start with a specific hook that shows you understand the company's problem and can solve it
- Reference 2-3 SPECIFIC experiences from the resume that directly match job requirements. Don't just say "I have experience in X" — say "At [Company], I built [specific thing] using [tech], which directly maps to your need for [JD requirement]"
- Mention specific technologies from both the resume and JD to show alignment
- Sound confident and direct, not desperate or overly formal
- Close with a specific call to action, not generic "I look forward to hearing from you"
- 3-4 paragraphs, each with a clear purpose
- Write like a senior engineer, not a student` }
    ], 2000);

    res.json({ coverLetter: result });
  } catch (error) {
    console.error('Cover letter error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
  }
});

app.post('/api/ats-check', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    const resumeText = buildResumeText(resumeData);

    const result = await chat([
      { role: 'system', content: `You are a senior ATS optimization expert and recruiter who has reviewed 10,000+ resumes. You give blunt, specific, actionable feedback — not vague suggestions. Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Analyze this resume against the job description. Be brutally specific — don't say "add more keywords", say exactly WHICH keywords and WHERE to add them.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "verdict": "<direct verdict like 'Strong Match — minor gaps' or 'Weak Match — missing core requirements'>",
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Rules for suggestions:
- Be SPECIFIC. Not "add more technical keywords" but "Add 'CI/CD' and 'Docker' to your skills section — both are mentioned 3x in the job description"
- Reference exact sections: "Your experience bullet #2 says 'built features' — rewrite it to mention 'React' and 'REST APIs' which this role requires"
- If the resume is underselling something, point it out: "You have Firebase experience but don't mention 'cloud infrastructure' — add it to match the JD's cloud requirements"
- Give 4-6 suggestions, ordered by impact (highest first)
- Include at least one suggestion about missing action verbs or weak phrasing` }
    ], 2000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    res.json({ result: parsed });
  } catch (error) {
    console.error('ATS check error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to check ATS score' });
  }
});

app.post('/api/interview-prep', async (req, res) => {
  try {
    const { resumeData, jobTitle, companyName } = req.body;
    const resumeText = buildResumeText(resumeData);

    const result = await chat([
      { role: 'system', content: `You are a senior engineering interviewer who has conducted 1000+ interviews at top tech companies. You generate realistic, specific questions that interviewers would actually ask based on THIS candidate's resume — not generic interview questions. Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Generate interview questions for this candidate applying for ${jobTitle}${companyName ? ` at ${companyName}` : ''}.

RESUME:
${resumeText}

Return a JSON object with this exact structure:
{
  "behavioral": ["question1", "question2", "question3", "question4", "question5"],
  "technical": ["question1", "question2", "question3", "question4", "question5"],
  "roleSpecific": ["question1", "question2", "question3"],
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- Behavioral questions MUST reference their actual resume content. Not "Tell me about a challenge" but "You mentioned working on [specific project] — walk me through a technical decision you made there and what you'd do differently now"
- Technical questions should probe the specific technologies they listed. If they have React, ask about hooks/state management. If they have Firebase, ask about real-time data patterns. Don't ask generic "what is OOP" questions
- Role-specific questions should connect their experience to the target role's requirements
- Tips should be specific and actionable: not "practice coding" but "Your resume mentions [X] — prepare a 2-minute story about the architecture decisions you made, including tradeoffs. Interviewers love hearing what you considered but rejected"
- Every question should feel like it came from reading THEIR resume, not a generic question bank` }
    ], 2000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    res.json({ questions: parsed });
  } catch (error) {
    console.error('Interview prep error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to generate questions' });
  }
});

app.post('/api/resume-score', async (req, res) => {
  try {
    const { resumeData } = req.body;
    const resumeText = buildResumeText(resumeData);

    const result = await chat([
      { role: 'system', content: `You are a brutally honest senior resume reviewer who has hired 500+ engineers. You give real, no-BS feedback — not generic encouragement. You point out exactly what's weak, why it's weak, and how to fix it with specific examples. Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Review this resume like a hiring manager would. Be specific and direct — reference actual content from the resume in your feedback.

RESUME:
${resumeText}

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "verdict": "<direct verdict like 'Solid Foundation — needs sharper impact statements' or 'Too Generic — rewrite bullet points with metrics'>",
  "categories": [
    {"name": "Content & Relevance", "score": <0-100>, "feedback": "<specific feedback referencing actual resume content, e.g. 'Your Brillio experience mentions development but lacks specifics about scale, users, or systems built'>"},
    {"name": "Impact & Metrics", "score": <0-100>, "feedback": "<specific feedback, e.g. 'Only 1 out of 8 bullet points includes numbers — add metrics like users served, performance improvements, or deployment frequency'>"},
    {"name": "Writing Quality", "score": <0-100>, "feedback": "<specific feedback about weak verbs, generic phrasing, etc. Quote actual weak phrases from the resume>"},
    {"name": "Completeness", "score": <0-100>, "feedback": "<what's missing — e.g. 'No summary section', 'Skills not grouped by category', 'Missing links to projects'>"},
    {"name": "ATS Readiness", "score": <0-100>, "feedback": "<specific ATS issues — e.g. 'Skills listed as prose instead of keywords', 'Job titles don't match industry standards'>"}
  ],
  "strengths": ["strength1 — be specific, reference actual content", "strength2", "strength3"],
  "improvements": ["improvement1 — include a before/after example using their actual content", "improvement2 — be specific about what to change and where", "improvement3"]
}

Rules:
- Reference ACTUAL content from the resume in every feedback point
- For improvements, give specific before/after rewrites using their real bullet points
- Don't say "add more metrics" — say "Your bullet 'Developed deployment agent' should be 'Built an intelligent deployment agent reducing deployment errors by ~30% using Node.js and Docker'"
- Strengths should also be specific: not "good structure" but "Clean separation of Experience/Projects/Skills makes this easy to scan in 6 seconds"
- Score honestly — most resumes at junior/mid level are 55-70, not 80+` }
    ], 3000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    res.json({ result: parsed });
  } catch (error) {
    console.error('Resume score error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to score resume' });
  }
});

// --- IMPORT HELPERS ---

const RESUME_JSON_STRUCTURE = `{
  "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "summary": "",
  "experience": [{ "title": "", "company": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false, "technologies": "comma,separated", "bullets": ["bullet1"] }],
  "education": [{ "degree": "", "school": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "gpa": "" }],
  "skills": [{ "category": "Category Name", "items": "comma, separated, skills" }],
  "projects": [{ "name": "", "technologies": "comma,separated", "link": "", "bullets": ["bullet1"] }],
  "certifications": [{ "name": "", "issuer": "", "date": "YYYY-MM", "link": "" }],
  "achievements": [{ "text": "" }]
}`;

function addIdsToResume(data) {
  const withId = arr => (arr || []).map(item => ({ ...item, id: randomUUID() }));
  return {
    personalInfo: data.personalInfo || { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
    summary: data.summary || '',
    experience: withId(data.experience),
    education: withId(data.education),
    skills: withId(data.skills),
    projects: withId(data.projects),
    certifications: withId(data.certifications),
    achievements: withId(data.achievements),
  };
}

// --- IMPORT ENDPOINTS ---

app.post('/api/import/parse-resume', async (req, res) => {
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ error: 'No file provided' });

    const buffer = Buffer.from(fileBase64, 'base64');
    const pdfData = await pdfParse(buffer);

    if (!pdfData.text?.trim()) {
      return res.status(400).json({ error: 'Could not extract text from PDF. The file might be image-based — try a text-based PDF.' });
    }

    const result = await chat([
      { role: 'system', content: `You are an expert resume parser. Extract structured resume data from the provided text. Be thorough — capture every piece of information. For dates, use YYYY-MM format. Group skills into meaningful categories (e.g., "Languages", "Frameworks", "Tools", "Databases"). Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Parse the following resume text into structured JSON.\n\nTEXT:\n${pdfData.text}\n\nReturn JSON with this exact structure:\n${RESUME_JSON_STRUCTURE}\n\nRules:\n- Extract ALL information present in the text\n- For experience bullets, preserve the original meaning but clean up formatting\n- If a field is not present, use empty string or empty array\n- For dates, convert to YYYY-MM format (e.g., "Jan 2023" → "2023-01", "2023" → "2023-01")\n- If someone is currently in a role, set "current": true and "endDate": ""\n- Group skills into logical categories\n- Preserve links/URLs found in the text` }
    ], 4000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    const resumeData = addIdsToResume(parsed);
    res.json({ resumeData });
  } catch (error) {
    console.error('Resume import error:', error.message || error);
    res.status(500).json({ error: 'Failed to parse resume. Please try again.' });
  }
});

app.post('/api/import/github', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'GitHub username is required' });

    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { 'User-Agent': 'Resumify/1.0' }
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=20`, {
        headers: { 'User-Agent': 'Resumify/1.0' }
      }),
    ]);

    if (!profileRes.ok) {
      return res.status(404).json({ error: `GitHub user "${username}" not found` });
    }

    const profile = await profileRes.json();
    const repos = await reposRes.json();

    const repoSummary = (Array.isArray(repos) ? repos : [])
      .filter(r => !r.fork)
      .slice(0, 15)
      .map(r => `- ${r.name}: ${r.description || 'No description'} (${r.language || 'Unknown'}, ${r.stargazers_count} stars)${r.homepage ? ' | Live: ' + r.homepage : ''}${r.topics?.length ? ' | Topics: ' + r.topics.join(', ') : ''}`)
      .join('\n');

    const languages = [...new Set((Array.isArray(repos) ? repos : []).filter(r => !r.fork && r.language).map(r => r.language))];
    const allTopics = [...new Set((Array.isArray(repos) ? repos : []).filter(r => !r.fork).flatMap(r => r.topics || []))];

    const githubText = `GitHub Profile for ${profile.name || profile.login}:
Name: ${profile.name || ''}
Bio: ${profile.bio || ''}
Location: ${profile.location || ''}
Email: ${profile.email || ''}
Website: ${profile.blog || ''}
GitHub: https://github.com/${username}
Public Repos: ${profile.public_repos}
Languages Used: ${languages.join(', ')}
Topics/Technologies: ${allTopics.join(', ')}

Top Repositories:
${repoSummary}`;

    const result = await chat([
      { role: 'system', content: `You are an expert at building professional resumes from GitHub profiles. Create a comprehensive resume from the provided GitHub data. Infer skills from repositories, create project descriptions from repo info, and write a professional summary. Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Build a resume from this GitHub profile data. Turn the top repositories into well-described projects with bullet points about what they do (infer from name, description, and tech). Group all languages and technologies into skill categories.\n\n${githubText}\n\nReturn JSON with this exact structure:\n${RESUME_JSON_STRUCTURE}\n\nRules:\n- Use the person's name, location, email, and website from their profile\n- Set linkedin to "" (not available from GitHub)\n- Write a professional summary based on their bio and the kind of projects they build\n- Leave experience and education as empty arrays (not available from GitHub)\n- Convert the most impressive/relevant repos into projects with descriptive bullet points\n- Group all languages, frameworks, and topics into logical skill categories\n- Leave certifications and achievements as empty arrays` }
    ], 4000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    const resumeData = addIdsToResume(parsed);
    res.json({ resumeData });
  } catch (error) {
    console.error('GitHub import error:', error.message || error);
    res.status(500).json({ error: 'Failed to import from GitHub. Please check the username and try again.' });
  }
});

app.post('/api/import/portfolio', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Portfolio URL is required' });

    let parsedUrl;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Use Puppeteer to render JavaScript-heavy sites (React, Next.js, etc.)
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    let textContent = '';
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.goto(parsedUrl.toString(), { waitUntil: 'networkidle2', timeout: 20000 });

      // Wait a bit for any lazy-loaded content
      await new Promise(r => setTimeout(r, 2000));

      // Extract text + links from the fully rendered page
      textContent = await page.evaluate(() => {
        // Grab all link hrefs that look useful (LinkedIn, GitHub, mailto, etc.)
        const links = [];
        document.querySelectorAll('a[href]').forEach(a => {
          const href = a.href;
          if (href.includes('linkedin.com') || href.includes('github.com') || href.startsWith('mailto:') || href.includes('twitter.com') || href.includes('x.com')) {
            links.push(href);
          }
        });

        const bodyText = document.body?.innerText || '';
        const linkSection = links.length ? '\n\nLinks found: ' + links.join(', ') : '';
        return (bodyText + linkSection).trim();
      });
    } finally {
      await browser.close();
    }

    textContent = textContent.replace(/\s+/g, ' ').trim().slice(0, 12000);

    if (textContent.length < 50) {
      return res.status(400).json({ error: 'Could not extract enough content from the portfolio. The page might be empty or require authentication.' });
    }

    const result = await chat([
      { role: 'system', content: `You are an expert resume parser. Extract structured resume data from the provided portfolio website text. Be thorough — capture every piece of information you can find. For dates, use YYYY-MM format. Group skills into meaningful categories. Return ONLY valid JSON, no markdown fences.` },
      { role: 'user', content: `Parse the following portfolio website content into a structured resume JSON.\n\nTEXT:\n${textContent}\n\nReturn JSON with this exact structure:\n${RESUME_JSON_STRUCTURE}\n\nRules:\n- Extract ALL information present in the text\n- For experience bullets, preserve the original meaning but clean up formatting\n- If a field is not present, use empty string or empty array\n- For dates, convert to YYYY-MM format\n- Group skills into logical categories\n- Preserve links/URLs found in the text` }
    ], 4000);

    const cleaned = result.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    const resumeData = addIdsToResume(parsed);
    res.json({ resumeData });
  } catch (error) {
    console.error('Portfolio import error:', error.message || error);
    if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
      return res.status(408).json({ error: 'Portfolio fetch timed out. The site might be too slow or blocking automated access.' });
    }
    res.status(500).json({ error: 'Failed to import from portfolio. Please try again.' });
  }
});

// --- SERVE FRONTEND IN PRODUCTION ---

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
