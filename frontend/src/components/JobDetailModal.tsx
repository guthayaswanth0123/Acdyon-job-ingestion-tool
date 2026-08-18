import React, { useEffect, useState } from 'react';
import { Job } from '../types/job';
import {
  X,
  Building2,
  MapPin,
  ExternalLink,
  Calendar,
  ShieldCheck,
  DollarSign,
  PlayCircle,
  FileText,
  Briefcase,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'video'>('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  // Helper to safely format raw description text into rich HTML if plain text
  const cleanAndFormatDescription = (rawStr: string) => {
    if (!rawStr || rawStr.trim() === '') {
      return '<p class="text-slate-400 italic">No detailed description was provided by the source feed for this position.</p>';
    }

    let cleaned = rawStr
      .replace(/Find (more )?.*? Jobs in .*? on Arbeitnow/gi, '')
      .replace(/Find Jobs in .*? on Arbeitnow/gi, '')
      .trim();

    // Check if the string already contains HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(cleaned);

    if (!hasHtmlTags) {
      // Convert plain text line breaks into HTML paragraphs and lists
      const paragraphs = cleaned.split(/\n\s*\n/);
      return paragraphs
        .map((p) => {
          const trimmed = p.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const listItems = trimmed
              .split(/\n/)
              .map((li) => `<li>${li.replace(/^[-*]\s*/, '')}</li>`)
              .join('');
            return `<ul class="my-3 space-y-1">${listItems}</ul>`;
          }
          return `<p class="mb-4 text-slate-300 leading-relaxed">${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');
    }

    return cleaned;
  };

  // Extract potential salary string
  const extractSalary = (text: string) => {
    const match = text.match(/([£$€]\s?\d{2,3}[,.]?\d{0,3}\s?[-–—]\s?[£$€]?\s?\d{2,3}[,.]?\d{0,3})/i);
    return match ? match[0] : null;
  };

  const detectedSalary = extractSalary(job.description);

  // Return relevant role reference YouTube video embed based on title/category
  const getRoleVideoEmbed = (title: string, category?: string | null) => {
    const t = (title + ' ' + (category || '')).toLowerCase();

    if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('product designer')) {
      return {
        title: 'Product Design & UI/UX Career Guide',
        url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        description: 'Learn about the core responsibilities, design sprints, and day-to-day workflow of Product Designers.',
      };
    }
    if (t.includes('data') || t.includes('analyst') || t.includes('ai') || t.includes('machine learning')) {
      return {
        title: 'Data Science & Analytics Overview',
        url: 'https://www.youtube.com/embed/X3paOmcrTjQ',
        description: 'Understanding modern data engineering workflows, SQL query optimization, and predictive analytics.',
      };
    }
    if (t.includes('product manager') || t.includes('product lead') || t.includes('scrum')) {
      return {
        title: 'Product Management Fundamentals',
        url: 'https://www.youtube.com/embed/7V2Xg72_19c',
        description: 'Strategic roadmap execution, user story prioritization, and cross-functional leadership.',
      };
    }
    if (t.includes('sales') || t.includes('account executive') || t.includes('business development')) {
      return {
        title: 'Enterprise Sales & Business Growth',
        url: 'https://www.youtube.com/embed/u1Qv_i5CsmM',
        description: 'B2B enterprise pipeline development, client negotiations, and SaaS account strategies.',
      };
    }
    if (t.includes('crime') || t.includes('finance') || t.includes('banking') || t.includes('accountant')) {
      return {
        title: 'Financial Crime & Banking Compliance',
        url: 'https://www.youtube.com/embed/P_Pq1U8c1fM',
        description: 'Overview of anti-money laundering (AML), fraud investigation, and banking risk management.',
      };
    }
    // Default Engineering / Software Developer
    return {
      title: 'Software Engineering Career & Workflow',
      url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
      description: 'Insights into modern fullstack software development, code reviews, and agile sprint dynamics.',
    };
  };

  const videoData = getRoleVideoEmbed(job.title, job.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-3xl max-h-[88vh] rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  {job.source}
                </span>
                {job.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {job.category}
                  </span>
                )}
                {detectedSalary && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {detectedSalary}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-extrabold text-white mb-2 leading-tight">{job.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(job.published_at)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tab Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setActiveModalTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModalTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Job Overview</span>
            </button>

            <button
              onClick={() => setActiveModalTab('video')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeModalTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Role Video Guide</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">New</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Telemetry info bar */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Record ID: <code className="text-indigo-300 font-mono">{job.id}</code></span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>Type: {job.job_type || 'Full Time'}</span>
              <span>•</span>
              <span>Source: {job.source}</span>
            </div>
          </div>

          {/* Tech Stack Skill Pills */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Key Required Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab 1: Job Description */}
          {activeModalTab === 'overview' && (
            <div className="space-y-4">
              <div
                className="job-description-content"
                dangerouslySetInnerHTML={{ __html: cleanAndFormatDescription(job.description) }}
              />
            </div>
          )}

          {/* Tab 2: Reference Role Video Embed */}
          {activeModalTab === 'video' && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-cyan-400" />
                  {videoData.title}
                </h4>
                <p className="text-xs text-slate-300">{videoData.description}</p>
              </div>

              {/* Responsive Video Container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                <iframe
                  src={videoData.url}
                  title={videoData.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Role Insights & Preparation Tips
                </div>
                <ul className="space-y-1 pl-4 list-disc text-slate-300">
                  <li>Review the key requirements listed in the <strong>Job Overview</strong> tab.</li>
                  <li>Tailor your resume highlights to align with the extracted <strong>Key Required Skills</strong> tags.</li>
                  <li>Research {job.company}'s active tech stack and recent engineering/product announcements before applying.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Ingested: {new Date(job.created_at).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Apply on Original Listing</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
