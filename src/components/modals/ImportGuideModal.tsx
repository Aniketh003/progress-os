'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Copy,
  Check,
  Download,
  Sparkles,
  X,
  FileCode,
  ArrowRight,
  BookOpen,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ImportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImport: () => void;
}

export function ImportGuideModal({ isOpen, onClose, onOpenImport }: ImportGuideModalProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('30 Days (4 Weeks)');
  const [commitment, setCommitment] = useState('180');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  if (!isOpen) return null;

  const currentTopic = topic.trim() || 'Modern Full-Stack Web Development & Cloud Architecture';

  const generatedPrompt = `Act as an expert curriculum designer, educator, and technical mentor.
Create a comprehensive, highly structured ProgressOS learning map JSON for the following learning goal:

• Learning Goal / Subject: ${currentTopic}
• Duration: ${duration}
• Daily Study Time: ${commitment} minutes per day

CRITICAL INSTRUCTIONS:
1. Return ONLY valid, parseable JSON inside a single \`\`\`json code block. Do NOT include any introductory or concluding text outside the JSON.
2. The JSON MUST strictly comply with the ProgressOS Schema v1.0 specification below:

{
  "schemaVersion": "1.0",
  "id": "kebab-case-slug-identifier",
  "title": "${currentTopic}",
  "description": "Thorough summary of what this curriculum covers, prerequisites, and tangible competencies achieved.",
  "category": "Technology", // Options: Technology, Medical, Business, Science, Language, Design, or General
  "status": "not-started",
  "startDate": "${new Date().toISOString().split('T')[0]}",
  "targetDate": null,
  "dailyCommitmentMinutes": ${commitment},
  "repositoryUrl": "",
  "accentColor": "#6366f1",
  "icon": "Compass",
  "weeks": [
    {
      "id": "week-1",
      "weekNumber": 1,
      "title": "Week 1 - Foundations & Core Mental Models",
      "description": "What foundational concepts are mastered this week.",
      "deliverable": "A concrete milestone, test project, or clinical case checklist.",
      "objective": "Primary competency achieved by end of this week.",
      "topics": ["Key Topic 1", "Key Topic 2", "Key Topic 3"],
      "reviewChecklist": [
        "Daily focus blocks logged",
        "Hands-on exercises or flashcards reviewed",
        "Weekly deliverable completed"
      ],
      "days": [
        {
          "id": "day-1",
          "dayNumber": 1,
          "title": "Day 1 - Specific Actionable Topic",
          "description": "Clear overview of today's study block and practical implementation.",
          "objectives": [
            "Specific measurable skill 1",
            "Specific measurable skill 2"
          ],
          "topics": ["Subtopic A", "Subtopic B"],
          "estimatedMinutes": ${commitment},
          "status": "pending",
          "tasks": [
            {
              "id": "task-w1-d1-1",
              "title": "Hands-on implementation or core reading",
              "priority": "high",
              "status": "todo"
            },
            {
              "id": "task-w1-d1-2",
              "title": "Practice problem, review, or code exercise",
              "priority": "medium",
              "status": "todo"
            }
          ]
        }
      ]
    }
  ]
}

SPECIFICATION RULES:
• Ensure dayNumber values are sequential (Day 1, Day 2, Day 3...).
• Every day must have 2 to 4 actionable, measurable tasks with status: "todo".
• Ensure id values are clean kebab-case slugs (e.g. "week-1", "day-1", "task-w1-d1-1").
• Make the curriculum practical, rigorous, hands-on, and real-world ready.`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadSample = () => {
    const a = document.createElement('a');
    a.href = '/data/sample-learning-map.json';
    a.download = 'sample-learning-map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopySample = async () => {
    try {
      const res = await fetch('/data/sample-learning-map.json');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedSample(true);
      setTimeout(() => setCopiedSample(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span>Learning Map Creation & AI Prompt Guide</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                How to generate or format custom JSON roadmaps for ProgressOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick 3-Step Walkthrough */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-mono">1</span>
                <span>Define Your Goal</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enter your subject below and customize duration and daily study hours.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-mono">2</span>
                <span>Generate via AI</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Paste the prompt into ChatGPT, Claude, or Gemini to get formatted JSON.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-mono">3</span>
                <span>Import & Track</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click Import in ProgressOS and paste or upload the JSON roadmap.
              </p>
            </div>
          </div>

          {/* Interactive Prompt Builder */}
          <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Interactive AI Prompt Generator
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">ChatGPT · Claude · Gemini</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Your Subject / Curriculum Topic:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Full-Stack Next.js 15, USMLE Step 1, Golang Distributed Systems..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Duration:</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="14 Days (2 Weeks)">14 Days (2 Weeks)</option>
                  <option value="30 Days (4 Weeks)">30 Days (4 Weeks)</option>
                  <option value="60 Days (8 Weeks)">60 Days (8 Weeks)</option>
                  <option value="90 Days (12 Weeks)">90 Days (12 Weeks)</option>
                </select>
              </div>
            </div>

            {/* Prompt Preview & Copy Button */}
            <div className="relative mt-2">
              <pre className="p-3.5 rounded-lg bg-black/60 border border-border/80 text-[11px] font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {generatedPrompt}
              </pre>
              <button
                onClick={handleCopyPrompt}
                className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shadow-sm transition-all active:scale-95"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy AI Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sample JSON Download & Schema Preview */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-foreground">Sample Roadmap Template</h3>
                <p className="text-[11px] text-muted-foreground">
                  Download a pre-formatted, valid JSON template to inspect or manually edit.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-xs font-medium text-foreground transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Download Sample (.json)</span>
                </button>
                <button
                  onClick={() => setShowJsonPreview((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/70 hover:bg-accent text-xs text-muted-foreground transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{showJsonPreview ? 'Hide Preview' : 'Preview JSON'}</span>
                </button>
              </div>
            </div>

            {showJsonPreview && (
              <div className="relative pt-2">
                <pre className="p-3.5 rounded-lg bg-black/60 border border-border/80 text-[11px] font-mono text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
{`{
  "schemaVersion": "1.0",
  "id": "sample-roadmap-2026",
  "title": "Full-Stack Modern Web Starter (14 Days)",
  "description": "A 14-day intensive roadmap covering modern Next.js 15, TypeScript, Tailwind, and cloud database fundamentals.",
  "category": "Technology",
  "status": "not-started",
  "dailyCommitmentMinutes": 180,
  "accentColor": "#6366f1",
  "icon": "Compass",
  "weeks": [
    {
      "id": "week-1",
      "weekNumber": 1,
      "title": "Week 1 - Architecture & Frontend Fundamentals",
      "days": [
        {
          "id": "day-1",
          "dayNumber": 1,
          "title": "Day 1 - Next.js 15 App Router & TypeScript Setup",
          "estimatedMinutes": 180,
          "status": "pending",
          "tasks": [
            { "id": "task-w1-d1-1", "title": "Initialize project with App Router", "priority": "high", "status": "todo" },
            { "id": "task-w1-d1-2", "title": "Configure path aliases and theme provider", "priority": "medium", "status": "todo" }
          ]
        }
      ]
    }
  ]
}`}
                </pre>
                <button
                  onClick={handleCopySample}
                  className="absolute top-4 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded bg-muted/80 hover:bg-muted text-[11px] text-foreground font-mono transition-colors"
                >
                  {copiedSample ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
          <span className="text-[11px] text-muted-foreground">
            Have your JSON ready? Import it in one click.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-xs font-medium text-foreground transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenImport();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors shadow-sm"
            >
              <span>Open Import Modal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
