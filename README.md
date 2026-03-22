# Resumify

Most people struggle with resumes. Not because they lack experience, but because they don't know how to present it. What words to use, how to quantify impact, how to make it sound professional without sounding robotic. And even if they figure that out, they end up jumping between five different websites — one for building, one for ATS checking, one for tailoring, one for cover letters, and another for interview prep.

Resumify solves all of that in one place.

## What is Resumify?

Resumify is an AI-powered resume builder that helps you create, improve, and tailor your resume — all from a single app. Instead of spending hours rewording bullet points or guessing what recruiters want to see, you let AI handle the heavy lifting while you stay in control of the content.

It's built for anyone who wants a solid resume without the hassle — students, job switchers, or anyone who just hates staring at a blank document.

## What can it do?

**Build your resume from scratch or import it**
You can start fresh and fill in your details step by step, or speed things up by importing from an existing PDF resume, your GitHub profile, or even your portfolio website. The AI parses everything and fills in the fields for you.

**AI-powered writing assistance**
Struggle with wording? The AI can rewrite your bullet points to be more impactful — adding action verbs, quantified results, and making them recruiter-friendly. It can also generate a professional summary based on your entire resume.

**Tailor your resume for specific jobs**
Paste a job description and Resumify rewrites your resume to match it — reordering bullet points, mirroring the language from the listing, and highlighting the most relevant experience. No more manually tweaking your resume for every application.

**ATS compatibility check**
Get a score out of 100 with matched and missing keywords, plus specific suggestions on what to fix. Not generic advice — it actually references your resume sections and tells you exactly what to change.

**Cover letter generator**
Generate a tailored cover letter that references your actual experience and maps it to the job you're applying for.

**Interview prep**
Get behavioral, technical, and role-specific interview questions generated from your resume and the job description, so you can walk into interviews prepared.

**Resume scoring**
Get your resume scored across five categories — content, impact, writing quality, completeness, and ATS readiness — with before/after examples showing how to improve.

**Export to PDF or LaTeX**
Download your resume as a PDF or generate clean LaTeX code you can paste directly into Overleaf.

## Tech stack

- **Frontend** — React, Vite, Tailwind CSS
- **Backend** — Node.js, Express
- **Database** — PostgreSQL (Neon)
- **Auth** — Firebase (email/password + Google sign-in)
- **AI** — Groq (LLaMA 3.3 70B)
- **Other** — Puppeteer (portfolio scraping), pdf-parse (PDF import), html2pdf.js (PDF export)