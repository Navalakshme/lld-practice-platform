'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Sliders, 
  History, 
  Award,
  Layers
} from 'lucide-react';

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadProblem() {
      try {
        const [probRes, attRes] = await Promise.all([
          fetch(`/api/problems/${problemId}`),
          fetch(`/api/attempts?problemId=${problemId}&learnerId=learner-default`),
        ]);

        const probData = await probRes.json();
        const attData = await attRes.json();

        if (probData.success) {
          setProblem(probData.problem);
        }
        if (attData.success) {
          setPreviousAttempts(attData.attempts);
        }
      } catch (err) {
        console.error('Failed to load problem details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  async function handleStartPractice() {
    try {
      setStarting(true);
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          learnerId: 'learner-default',
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        router.push(`/practice/${data.attempt.id}`);
      }
    } catch (err) {
      console.error('Failed to start attempt', err);
      alert('Error starting attempt');
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 animate-pulse">
        Loading problem requirements & rubric...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-400">Problem Not Found</h2>
        <Link href="/" className="text-sm text-indigo-400 hover:underline">
          Return to problem catalog
        </Link>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    INTERMEDIATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ADVANCED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <button
          onClick={handleStartPractice}
          disabled={starting}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{starting ? 'Initializing Attempt...' : 'Start Practice Attempt'}</span>
        </button>
      </div>

      {/* Title & Metadata */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
              difficultyColors[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </span>
          {problem.tags?.map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-extrabold text-white">{problem.title}</h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-4xl">
          {problem.description}
        </p>

        {problem.context && (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed whitespace-pre-line">
            <span className="font-semibold block mb-1 text-indigo-300">Design Focus & Context:</span>
            {problem.context}
          </div>
        )}
      </div>

      {/* Two Column Layout: Requirements & Rubric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Detailed Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Problem Requirements</h2>
          </div>

          <div className="space-y-3">
            {problem.requirements?.map((req: any) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {req.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.criticality === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {req.criticality}
                  </span>
                </div>
                <p className="text-sm text-slate-200">{req.description}</p>
              </div>
            ))}
          </div>

          {problem.starterHint && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Architectural Hint:</span>
                <p className="mt-0.5 text-amber-200/90">{problem.starterHint}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Evaluation Rubric & Past Attempts */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Evaluation Rubric</h2>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Your solution will be assessed across these weighted dimensions by our hybrid evaluation engine:
            </p>

            <div className="space-y-2.5 pt-2">
              {problem.rubric?.dimensions?.map((dim: any) => (
                <div key={dim.id} className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>{dim.name}</span>
                    <span className="text-indigo-400 font-mono">
                      {Math.round(dim.weight * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {dim.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Past Attempts on this Problem */}
          {previousAttempts.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Previous Attempts ({previousAttempts.length})</span>
                </span>
              </div>

              <div className="space-y-2">
                {previousAttempts.map((att: any) => (
                  <Link
                    key={att.id}
                    href={`/practice/${att.id}`}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition text-xs"
                  >
                    <span className="text-slate-300 font-medium">
                      Attempt #{att.attemptNumber}
                    </span>
                    <div className="flex items-center space-x-2">
                      {(att._evaluation || att.evaluation) && (
                        <span className="font-mono text-indigo-300 font-bold">
                          {(att._evaluation || att.evaluation).overallScore} / 10
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {att._status || att.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
