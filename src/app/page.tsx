'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  Award, 
  Clock, 
  FileText 
} from 'lucide-react';

interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  summary: string;
  requirementsCount: number;
  tags: string[];
}

interface AttemptSummary {
  id: string;
  problemId: string;
  attemptNumber: number;
  status: string;
  overallScore?: number;
  updatedAt: string;
}

export default function DashboardPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [probRes, attRes] = await Promise.all([
          fetch('/api/problems'),
          fetch('/api/attempts?learnerId=learner-default'),
        ]);

        const probData = await probRes.json();
        const attData = await attRes.json();

        if (probData.success) {
          setProblems(
            probData.problems.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              difficulty: p.difficulty,
              summary: p.summary,
              requirementsCount: p.requirements.length,
              tags: p.tags,
            }))
          );
        }

        if (attData.success) {
          setRecentAttempts(
            attData.attempts.map((a: any) => ({
              id: a.id,
              problemId: a.problemId,
              attemptNumber: a.attemptNumber,
              status: a._status || a.status,
              overallScore: a._evaluation?.overallScore || a.evaluation?.overallScore,
              updatedAt: a._updatedAt || a.updatedAt,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    INTERMEDIATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ADVANCED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Object-Oriented & Low-Level Design</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Practice LLD with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Explainable Feedback</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Unlike LeetCode algorithms, Low-Level Design is about trade-offs, modularity, and responsibilities. 
            Design real-world systems, submit your models, receive multi-dimensional rubric feedback, and iterate to improve.
          </p>
        </div>

        {/* Practice Loop Flow */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">1</span>
            <span>Choose Problem</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
            <span>Think & Design</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</span>
            <span>Submit Solution</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">4</span>
            <span>Explainable Feedback</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">5</span>
            <span>Iterate & Improve</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Problem Catalog & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Problems */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Practice Problems</span>
            </h2>
            <span className="text-xs text-slate-400">{problems.length} Curated Challenges</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse bg-slate-900/40 rounded-xl border border-slate-800">
              Loading challenges...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition hover:shadow-lg group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
                        {problem.title}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                          difficultyColors[problem.difficulty]
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2">
                      {problem.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                        {problem.requirementsCount} Requirements
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Multi-dimensional Rubric Scoring
                    </span>
                    <Link
                      href={`/problems/${problem.id}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 hover:underline"
                    >
                      <span>Explore & Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Practice & Iterations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Your Attempts</span>
            </h2>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No attempts recorded yet.</p>
                <p className="text-[11px] text-slate-500">
                  Pick a problem on the left to start your first design attempt!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.slice(0, 5).map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={`/practice/${attempt.id}`}
                    className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        Attempt #{attempt.attemptNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          attempt.status === 'EVALUATED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : attempt.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {attempt.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Problem: {attempt.problemId}</span>
                      {attempt.overallScore !== undefined && (
                        <span className="font-mono text-indigo-300 font-bold">
                          {attempt.overallScore} / 10
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Continuous improvement is tracked across attempts.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
