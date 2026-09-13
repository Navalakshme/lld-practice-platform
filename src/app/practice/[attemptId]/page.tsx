'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  History, 
  Plus, 
  Trash2, 
  Code, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  BookOpen,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { ClassModel, InterfaceModel, RelationshipModel, RelationshipType } from '@/domain';

export default function PracticeWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id || params.attemptId as string;

  const [attempt, setAttempt] = useState<any>(null);
  const [problem, setProblem] = useState<any>(null);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'requirements' | 'feedback' | 'history'>('studio');

  // Submission Form State
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [interfaces, setInterfaces] = useState<InterfaceModel[]>([]);
  const [relationships, setRelationships] = useState<RelationshipModel[]>([]);
  const [designPatterns, setDesignPatterns] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');

  useEffect(() => {
    async function fetchAttemptAndProblem() {
      try {
        const attRes = await fetch(`/api/attempts/${attemptId}`);
        const attData = await attRes.json();

        if (attData.success && attData.attempt) {
          const loadedAttempt = attData.attempt;
          setAttempt(loadedAttempt);

          const sub = loadedAttempt._submission || loadedAttempt.submission || {};
          setClasses(sub.classes || []);
          setInterfaces(sub.interfaces || []);
          setRelationships(sub.relationships || []);
          setDesignPatterns(sub.designPatterns || []);
          setExplanation(sub.explanation || '');
          setCodeSnippet(sub.codeSnippet || '');

          if ((loadedAttempt._status || loadedAttempt.status) === 'EVALUATED') {
            setActiveTab('feedback');
          }

          // Fetch Problem details
          const probRes = await fetch(`/api/problems/${loadedAttempt.problemId}`);
          const probData = await probRes.json();
          if (probData.success) {
            setProblem(probData.problem);
          }

          // Fetch all attempts for history tracking
          const historyRes = await fetch(`/api/attempts?problemId=${loadedAttempt.problemId}&learnerId=${loadedAttempt.learnerId}`);
          const historyData = await historyRes.json();
          if (historyData.success) {
            setAllAttempts(historyData.attempts);
          }
        }
      } catch (err) {
        console.error('Failed to load practice attempt', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttemptAndProblem();
  }, [attemptId]);

  // Handle Class management
  function addClass() {
    const newClass: ClassModel = {
      id: `cls-${Date.now()}`,
      name: '',
      type: 'CLASS',
      responsibilities: [''],
      attributes: [],
      methods: [],
    };
    setClasses([...classes, newClass]);
  }

  function updateClass(index: number, updated: Partial<ClassModel>) {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], ...updated };
    setClasses(updatedClasses);
  }

  function removeClass(index: number) {
    setClasses(classes.filter((_, i) => i !== index));
  }

  // Handle Interface management
  function addInterface() {
    const newInterface: InterfaceModel = {
      id: `int-${Date.now()}`,
      name: '',
      purpose: '',
      methods: [],
    };
    setInterfaces([...interfaces, newInterface]);
  }

  function updateInterface(index: number, updated: Partial<InterfaceModel>) {
    const updatedList = [...interfaces];
    updatedList[index] = { ...updatedList[index], ...updated };
    setInterfaces(updatedList);
  }

  function removeInterface(index: number) {
    setInterfaces(interfaces.filter((_, i) => i !== index));
  }

  // Handle Relationship management
  function addRelationship() {
    const newRel: RelationshipModel = {
      id: `rel-${Date.now()}`,
      source: '',
      target: '',
      type: 'COMPOSITION',
      description: '',
    };
    setRelationships([...relationships, newRel]);
  }

  function updateRelationship(index: number, updated: Partial<RelationshipModel>) {
    const updatedList = [...relationships];
    updatedList[index] = { ...updatedList[index], ...updated };
    setRelationships(updatedList);
  }

  function removeRelationship(index: number) {
    setRelationships(relationships.filter((_, i) => i !== index));
  }

  // Quick Preset: Load High-Scoring Good Design
  function loadGoodDesignPreset() {
    if (problem?.slug?.includes('parking') || problem?.id?.includes('prob-1')) {
      setClasses([
        {
          id: 'c1',
          name: 'ParkingLot',
          type: 'CLASS',
          responsibilities: ['Orchestrates floors and entry/exit gates', 'Coordinates ticket lifecycle'],
          attributes: [{ name: 'floors', type: 'List<ParkingFloor>', visibility: 'PRIVATE' }],
          methods: [
            { name: 'parkVehicle', returnType: 'Ticket', visibility: 'PUBLIC' },
            { name: 'processExit', returnType: 'Receipt', visibility: 'PUBLIC' },
          ],
        },
        {
          id: 'c2',
          name: 'ParkingFloor',
          type: 'CLASS',
          responsibilities: ['Maintains spots by type (Compact, Regular, Large)', 'Reports availability'],
          attributes: [{ name: 'spots', type: 'Map<SpotType, List<ParkingSpot>>', visibility: 'PRIVATE' }],
          methods: [{ name: 'getAvailableSpot', returnType: 'ParkingSpot', visibility: 'PUBLIC' }],
        },
        {
          id: 'c3',
          name: 'ParkingSpot',
          type: 'CLASS',
          responsibilities: ['Holds vehicle', 'Tracks occupancy state'],
          attributes: [
            { name: 'spotNumber', type: 'string', visibility: 'PRIVATE' },
            { name: 'isOccupied', type: 'boolean', visibility: 'PRIVATE' },
          ],
          methods: [
            { name: 'assignVehicle', returnType: 'void', visibility: 'PUBLIC' },
            { name: 'vacate', returnType: 'void', visibility: 'PUBLIC' },
          ],
        },
        {
          id: 'c4',
          name: 'Vehicle',
          type: 'ABSTRACT_CLASS',
          responsibilities: ['Base vehicle contract holding license plate and vehicle size'],
          attributes: [{ name: 'licensePlate', type: 'string', visibility: 'PROTECTED' }],
          methods: [{ name: 'getType', returnType: 'VehicleType', visibility: 'PUBLIC' }],
        },
        {
          id: 'c5',
          name: 'Ticket',
          type: 'CLASS',
          responsibilities: ['Immutable entry timestamp, vehicle reference, assigned spot'],
          attributes: [
            { name: 'ticketId', type: 'string', visibility: 'PRIVATE' },
            { name: 'issuedAt', type: 'Date', visibility: 'PRIVATE' },
          ],
          methods: [],
        },
      ]);
      setInterfaces([
        {
          id: 'i1',
          name: 'SpotAllocationStrategy',
          purpose: 'Pluggable algorithm to find best spot (e.g. NearestToEntrance, LowestFloorFirst)',
          methods: [{ name: 'allocate', returnType: 'ParkingSpot', visibility: 'PUBLIC' }],
        },
        {
          id: 'i2',
          name: 'PricingStrategy',
          purpose: 'Calculates parking fees dynamically based on duration and vehicle category',
          methods: [{ name: 'calculateFee', returnType: 'double', visibility: 'PUBLIC' }],
        },
      ]);
      setRelationships([
        { id: 'r1', source: 'ParkingLot', target: 'ParkingFloor', type: 'COMPOSITION' },
        { id: 'r2', source: 'ParkingFloor', target: 'ParkingSpot', type: 'AGGREGATION' },
        { id: 'r3', source: 'ParkingLot', target: 'SpotAllocationStrategy', type: 'ASSOCIATION' },
        { id: 'r4', source: 'ParkingLot', target: 'PricingStrategy', type: 'ASSOCIATION' },
      ]);
      setDesignPatterns(['Strategy Pattern', 'Factory Pattern', 'Composition']);
      setExplanation(
        'Decoupled ParkingLot from pricing rules and spot allocation algorithms using Strategy pattern. Vehicle hierarchy allows seamless extension to ElectricVehicles. ParkingFloor manages physical spots via aggregation.'
      );
      setCodeSnippet(
        'public interface PricingStrategy {\n    double calculateFee(Ticket ticket, VehicleType type);\n}\n\npublic class HourlyPricingStrategy implements PricingStrategy {\n    public double calculateFee(Ticket ticket, VehicleType type) {\n        // duration * hourlyRate\n        return 10.0;\n    }\n}'
      );
    } else {
      alert('Preset available for Parking Lot problem.');
    }
  }

  // Quick Preset: Load Flawed Design (SRP violation & missing abstractions)
  function loadFlawedDesignPreset() {
    setClasses([
      {
        id: 'cf1',
        name: 'ParkingLotManager',
        type: 'CLASS',
        responsibilities: [
          'Create cars, bikes, trucks',
          'Manage all floors and spots',
          'Search spots inline using nested loops',
          'Generate tickets',
          'Calculate fees inline using hardcoded switch statements',
          'Handle cash payments and credit card payments',
          'Control barrier hardware',
        ],
        attributes: [
          { name: 'cars', type: 'List<Car>', visibility: 'PUBLIC' },
          { name: 'spots', type: 'int[]', visibility: 'PUBLIC' },
          { name: 'moneyCollected', type: 'double', visibility: 'PUBLIC' },
        ],
        methods: [
          { name: 'doEverything', returnType: 'void', visibility: 'PUBLIC' },
          { name: 'parkCar', returnType: 'void', visibility: 'PUBLIC' },
          { name: 'calculateBill', returnType: 'double', visibility: 'PUBLIC' },
        ],
      },
    ]);
    setInterfaces([]);
    setRelationships([]);
    setDesignPatterns([]);
    setExplanation('Everything is centralized in ParkingLotManager for quick execution.');
    setCodeSnippet('');
  }

  // Submit and evaluate
  async function handleSubmit() {
    try {
      setEvaluating(true);

      const submissionPayload = {
        classes,
        interfaces,
        relationships,
        designPatterns,
        explanation,
        codeSnippet,
      };

      const res = await fetch(`/api/attempts/${attemptId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission: submissionPayload,
          simulateFailure,
          artificialDelayMs: 1200,
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        setAttempt(data.attempt);
        if (data.attempt._status === 'EVALUATED' || data.attempt.status === 'EVALUATED') {
          setActiveTab('feedback');
        }
      }
    } catch (err) {
      console.error('Submission failed', err);
      alert('Error during submission');
    } finally {
      setEvaluating(false);
    }
  }

  // Retry a failed attempt
  async function handleRetry() {
    try {
      setEvaluating(true);
      const res = await fetch(`/api/attempts/${attemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' }),
      });
      const data = await res.json();
      if (data.success && data.attempt) {
        setAttempt(data.attempt);
        setSimulateFailure(false);
        // Automatically trigger re-evaluation without error simulation
        await handleSubmit();
      }
    } catch (err) {
      console.error('Retry failed', err);
    } finally {
      setEvaluating(false);
    }
  }

  // Create a new Attempt #N+1 pre-filled with this design
  async function handleStartNextAttempt() {
    if (!problem) return;
    try {
      setLoading(true);
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          learnerId: 'learner-default',
          initialSubmission: {
            classes,
            interfaces,
            relationships,
            designPatterns,
            explanation,
            codeSnippet,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.attempt) {
        router.push(`/practice/${data.attempt.id}`);
      }
    } catch (err) {
      console.error('Failed to create iteration attempt', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 animate-pulse">
        Loading design workspace...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-400">Attempt Not Found</h2>
        <Link href="/" className="text-sm text-indigo-400 hover:underline">
          Return to catalog
        </Link>
      </div>
    );
  }

  const currentStatus = attempt._status || attempt.status;
  const evaluation = attempt._evaluation || attempt.evaluation;

  return (
    <div className="space-y-6">
      {/* Workspace Header & State Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href={`/problems/${problem?.id || attempt.problemId}`}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">
                {problem?.title || 'LLD Practice'}
              </h1>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">
                Attempt #{attempt.attemptNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured Design Studio • Object-Oriented Modeling
            </p>
          </div>
        </div>

        {/* State Machine Status & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Status:</span>
            <span
              className={`font-bold ${
                currentStatus === 'EVALUATED'
                  ? 'text-emerald-400'
                  : currentStatus === 'FAILED'
                  ? 'text-rose-400'
                  : currentStatus === 'EVALUATING'
                  ? 'text-amber-400 animate-pulse'
                  : 'text-sky-400'
              }`}
            >
              {currentStatus}
            </span>
          </div>

          {/* Simulate Failure Checkbox (For demonstration of resilience) */}
          <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer select-none bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span className="text-[11px]">Simulate Failure</span>
          </label>

          {/* Action button: Retry or Submit */}
          {currentStatus === 'FAILED' ? (
            <button
              onClick={handleRetry}
              disabled={evaluating}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Evaluation</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={evaluating}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Evaluating Design...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Evaluation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 text-sm">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center space-x-2 transition ${
            activeTab === 'studio'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Design Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center space-x-2 transition ${
            activeTab === 'requirements'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Problem Requirements ({problem?.requirements?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center space-x-2 transition ${
            activeTab === 'feedback'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Explainable Feedback</span>
          {evaluation && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs">
              {evaluation.overallScore}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 border-b-2 font-medium flex items-center space-x-2 transition ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Attempt History ({allAttempts.length})</span>
        </button>
      </div>

      {/* TAB 1: DESIGN STUDIO */}
      {activeTab === 'studio' && (
        <div className="space-y-8">
          {/* Fast Preset Loader Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs">
            <span className="text-indigo-200">
              💡 <strong>Quick Evaluator Presets:</strong> Test the evaluation engine instantly with curated designs:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadGoodDesignPreset}
                className="px-3 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition font-medium"
              >
                Load Good Design (Strategy + SOLID)
              </button>
              <button
                onClick={loadFlawedDesignPreset}
                className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition font-medium"
              >
                Load Flawed Design (God Class)
              </button>
            </div>
          </div>

          {/* Section 1: Classes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Domain Classes ({classes.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Define concrete or abstract classes, their responsibilities, and attributes.
                </p>
              </div>
              <button
                onClick={addClass}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No classes defined yet. Click "Add Class" or load a quick preset above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls, idx) => (
                  <div
                    key={cls.id || idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Class Name (e.g. ParkingLot)"
                        value={cls.name}
                        onChange={(e) => updateClass(idx, { name: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm font-semibold text-white w-full focus:outline-none focus:border-indigo-500"
                      />
                      <select
                        value={cls.type}
                        onChange={(e) => updateClass(idx, { type: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                      >
                        <option value="CLASS">Concrete</option>
                        <option value="ABSTRACT_CLASS">Abstract</option>
                      </select>
                      <button
                        onClick={() => removeClass(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Stated Responsibilities (SRP):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="One responsibility per line..."
                        value={cls.responsibilities?.join('\n') || ''}
                        onChange={(e) =>
                          updateClass(idx, {
                            responsibilities: e.target.value.split('\n').filter(Boolean),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Key Methods */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Methods (comma separated):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. parkVehicle, vacateSpot, calculateFee"
                        value={cls.methods?.map((m) => m.name).join(', ') || ''}
                        onChange={(e) => {
                          const methodNames = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          updateClass(idx, {
                            methods: methodNames.map((name) => ({
                              name,
                              returnType: 'void',
                              visibility: 'PUBLIC',
                            })),
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Interfaces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Interfaces & Abstractions ({interfaces.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Define polymorphic contracts and strategy boundaries.
                </p>
              </div>
              <button
                onClick={addInterface}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Interface</span>
              </button>
            </div>

            {interfaces.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No interfaces defined yet. Adding interfaces improves abstraction and decoupling scores.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interfaces.map((intf, idx) => (
                  <div
                    key={intf.id || idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Interface Name (e.g. PricingStrategy)"
                        value={intf.name}
                        onChange={(e) => updateInterface(idx, { name: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm font-semibold text-indigo-300 w-full focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => removeInterface(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Purpose / Contract Rationale:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Encapsulate dynamic fee calculation policies"
                        value={intf.purpose}
                        onChange={(e) => updateInterface(idx, { purpose: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Relationships */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Relationships & Topology ({relationships.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Model Composition, Inheritance, Aggregation, or Implementation.
                </p>
              </div>
              <button
                onClick={addRelationship}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Relationship</span>
              </button>
            </div>

            {relationships.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No relationships declared yet. Define how entities interact.
              </div>
            ) : (
              <div className="space-y-2">
                {relationships.map((rel, idx) => (
                  <div
                    key={rel.id || idx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      placeholder="Source Class (e.g. ParkingLot)"
                      value={rel.source}
                      onChange={(e) => updateRelationship(idx, { source: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 shrink-0 w-44"
                    />

                    <select
                      value={rel.type}
                      onChange={(e) => updateRelationship(idx, { type: e.target.value as RelationshipType })}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-indigo-400 font-mono font-medium"
                    >
                      <option value="COMPOSITION">-- contains (Composition) --&gt;</option>
                      <option value="AGGREGATION">-- has (Aggregation) --&gt;</option>
                      <option value="INHERITANCE">-- is-a (Inheritance) --&gt;</option>
                      <option value="IMPLEMENTATION">-- implements --&gt;</option>
                      <option value="ASSOCIATION">-- associates with --&gt;</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Target Class / Interface (e.g. ParkingFloor)"
                      value={rel.target}
                      onChange={(e) => updateRelationship(idx, { target: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 shrink-0 w-44"
                    />

                    <button
                      onClick={() => removeRelationship(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 ml-auto transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Design Patterns & Rationale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Design Patterns Employed:
              </label>
              <input
                type="text"
                placeholder="e.g. Strategy Pattern, State Pattern, Factory"
                value={designPatterns.join(', ')}
                onChange={(e) =>
                  setDesignPatterns(
                    e.target.value.split(',').map((p) => p.trim()).filter(Boolean)
                  )
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Mention key patterns so the evaluator can test their suitability for this domain.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Architectural Rationale & Trade-offs:
              </label>
              <textarea
                rows={4}
                placeholder="Explain why you structured the classes this way, what trade-offs you considered (e.g. composition vs inheritance, simplicity vs extensibility)..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 5: Code Skeleton (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Optional Code Skeleton / Interface Definitions:</span>
            </div>
            <textarea
              rows={5}
              placeholder="// Optional Java / TypeScript / Python class skeletons or key method logic"
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full bg-slate-950 font-mono border border-slate-800 rounded-lg p-3 text-xs text-emerald-300/90 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* TAB 2: PROBLEM REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <p>{problem?.description}</p>
          </div>

          <div className="space-y-3">
            {problem?.requirements?.map((req: any) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
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
                <div className="flex flex-wrap gap-1 pt-1">
                  {req.keywords?.map((kw: string) => (
                    <span
                      key={kw}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPLAINABLE FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          {currentStatus === 'FAILED' ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3 text-center">
              <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Evaluation Failed</h3>
              <p className="text-xs text-rose-300 max-w-lg mx-auto">
                {attempt.failureReason || 'Evaluation engine encountered an error or timeout.'}
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Evaluation</span>
              </button>
            </div>
          ) : !evaluation ? (
            <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Evaluation Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Submit your solution in the Design Studio tab to receive explainable feedback and rubric scorecards.
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
              >
                Go to Design Studio
              </button>
            </div>
          ) : (
            <>
              {/* Scorecard Hero */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Evaluation Complete ({evaluation.evaluatorType})</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    Design Quality Score
                  </h2>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Weighted synthesis of structural requirement coverage (Deterministic) and SOLID / architectural trade-offs (Qualitative).
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 min-w-[140px]">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400 font-mono">
                    {evaluation.overallScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-1">out of 10</span>
                </div>
              </div>

              {/* Rubric Dimension Breakdown */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Rubric Dimensions Score Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evaluation.dimensionScores?.map((dim: any) => (
                    <div
                      key={dim.dimensionId}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-200">{dim.dimensionName}</span>
                        <span className="font-mono text-indigo-400 text-sm">
                          {dim.score} / {dim.maxScore}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal">
                        {dim.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirement Coverage Checklist */}
              {evaluation.requirementCoverage?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Requirement Coverage Analysis (Deterministic)</span>
                  </h3>

                  <div className="space-y-2">
                    {evaluation.requirementCoverage.map((req: any) => (
                      <div
                        key={req.code}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start space-x-2.5">
                          {req.covered ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-mono font-bold text-slate-200">
                              {req.code}
                            </span>
                            <p className="text-slate-400 text-[11px] mt-0.5">{req.notes}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            req.covered
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {req.covered ? 'COVERED' : 'UNMET'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Issues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>What You Did Well (Strengths)</span>
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    {evaluation.strengths?.length === 0 ? (
                      <p className="text-xs text-slate-500">No notable strengths identified yet.</p>
                    ) : (
                      evaluation.strengths.map((str: string, i: number) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Identified Issues */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Design Issues</span>
                  </h3>

                  <div className="space-y-2.5">
                    {evaluation.issues?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-emerald-400">
                        ✓ No critical design anti-patterns detected!
                      </div>
                    ) : (
                      evaluation.issues.map((issue: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{issue.title}</span>
                            {issue.violatesPrinciple && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px] font-bold">
                                {issue.violatesPrinciple}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            {issue.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              {evaluation.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Actionable Recommendations for Improvement</span>
                  </h3>

                  <div className="space-y-2.5">
                    {evaluation.suggestions.map((sug: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1 text-xs"
                      >
                        <span className="font-bold text-indigo-200">{sug.title}</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {sug.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architectural Trade-offs Section (Core Requirement) */}
              {evaluation.tradeOffs?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-sky-400 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Recognized Architectural Trade-offs</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    In LLD, there is rarely one single "correct" answer. Here is how your design decisions evaluate in production context:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {evaluation.tradeOffs.map((trade: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{trade.decision}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                            Trade-off
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <p className="text-emerald-300">
                            <strong>Upside:</strong> {trade.upside}
                          </p>
                          <p className="text-amber-300">
                            <strong>Downside:</strong> {trade.downside}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                          <strong>Verdict:</strong> {trade.verdict}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Attempt CTA */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Ready to refine your design?</h4>
                  <p className="text-xs text-slate-400">
                    Apply these suggestions and create Attempt #{attempt.attemptNumber + 1} to track your score progression.
                  </p>
                </div>

                <button
                  onClick={handleStartNextAttempt}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Iterate & Start Attempt #{attempt.attemptNumber + 1}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: ATTEMPT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Attempt History for {problem?.title}
              </h3>
              <p className="text-xs text-slate-400">
                Track your progression across iterations and see how feedback improved your design.
              </p>
            </div>

            <button
              onClick={handleStartNextAttempt}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Attempt</span>
            </button>
          </div>

          <div className="space-y-3">
            {allAttempts.map((att) => {
              const attScore = att._evaluation?.overallScore || att.evaluation?.overallScore;
              const isCurrent = att.id === attempt.id;

              return (
                <div
                  key={att.id}
                  className={`p-4 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-slate-900 border-indigo-500/60 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white text-sm">
                        Attempt #{att.attemptNumber}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          Current Attempt
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          (att._status || att.status) === 'EVALUATED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {att._status || att.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      {attScore !== undefined && (
                        <span className="font-mono text-sm font-bold text-indigo-400">
                          {attScore} / 10
                        </span>
                      )}
                      {!isCurrent && (
                        <Link
                          href={`/practice/${att.id}`}
                          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
