import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CodingProblem, AICodeCheckResult } from '../types';
import {
  Play, CheckCircle2, AlertTriangle, Code2, Terminal, RefreshCw,
  ArrowLeft, Sparkles, AlertCircle, HelpCircle, BookOpen, Check,
  ChevronRight, Info, MessageSquare, Award
} from 'lucide-react';

interface CodingLabProps {
  setActiveTab?: (tab: string) => void;
}

export const CodingLab: React.FC<CodingLabProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();
  const [problems, setProblems] = useState<(CodingProblem & { isCompleted?: boolean; lastCode?: string; lastLanguage?: string; mentorFeedback?: string })[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<(CodingProblem & { isCompleted?: boolean; lastCode?: string; lastLanguage?: string; mentorFeedback?: string }) | null>(null);
  const [language, setLanguage] = useState<'java' | 'python' | 'cpp' | 'javascript'>('java');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  
  // Execution Output State
  const [executionOutput, setExecutionOutput] = useState<{
    status: string;
    passCount: number;
    totalCount: number;
    outputDetails: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // AI Error Check State
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<AICodeCheckResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'ai' | 'tests'>('ai');

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/coding/problems', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProblems(data.data);
        if (!selectedProblem) {
          setSelectedProblem(data.data[0]);
        } else {
          const updated = data.data.find((p: any) => p.id === selectedProblem.id);
          if (updated) setSelectedProblem(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching coding problems:', e);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [token]);

  // When problem or language changes, load code
  useEffect(() => {
    if (selectedProblem) {
      if (selectedProblem.lastCode && selectedProblem.lastLanguage === language) {
        setCode(selectedProblem.lastCode);
      } else if (selectedProblem.starterCode) {
        setCode((selectedProblem.starterCode as any)[language] || '// Write your code here');
      } else {
        setCode('// Write your code here');
      }
      setCustomInput(selectedProblem.sampleInput || '');
      setExecutionOutput(null);
      setAiCheckResult(null);
    }
  }, [selectedProblem?.id, language]);

  // Calculate student statistics
  const completedCount = problems.filter(p => p.isCompleted).length;
  const totalCount = problems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Run Code against test cases
  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setActiveConsoleTab('tests');
    try {
      const res = await fetch('/api/coding/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          language,
          code,
          customInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setExecutionOutput(data.data);
        addToast(`Execution Output: ${data.data.status}`, 'success');
      } else {
        setExecutionOutput({
          status: 'Compilation Error',
          passCount: 0,
          totalCount: selectedProblem.testCases?.length || 2,
          outputDetails: data.message || 'Error executing test cases'
        });
      }
    } catch {
      setExecutionOutput({
        status: 'Compilation Error',
        passCount: 0,
        totalCount: selectedProblem.testCases?.length || 2,
        outputDetails: 'Network error communicating with code execution service.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // AI Error Checker: Tells errors but DOES NOT solve it, student will solve it!
  const handleAICheck = async () => {
    if (!selectedProblem) return;
    if (!code || code.trim().length < 15) {
      addToast('Please write your attempt in the editor before requesting AI error check', 'error');
      return;
    }

    setIsCheckingAI(true);
    setActiveConsoleTab('ai');
    try {
      const res = await fetch('/api/coding/check-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          language,
          code
        })
      });
      const data = await res.json();
      if (data.success) {
        const result: AICodeCheckResult = data.data;
        setAiCheckResult(result);

        if (result.isCompleted || !result.hasError) {
          addToast('🎉 Outstanding! All errors cleared. Question marked as COMPLETED!', 'success');
          // Update problem status in local list
          setProblems(prev => prev.map(p => p.id === selectedProblem.id ? { ...p, isCompleted: true } : p));
          setSelectedProblem(prev => prev ? { ...prev, isCompleted: true } : null);
          fetchProblems();
        } else {
          addToast(`AI detected errors in your code: ${result.errorTitle || 'Logical bug'}. You must solve it!`, 'warning');
        }
      } else {
        addToast(data.message || 'AI evaluation failed. Please try again.', 'error');
      }
    } catch {
      addToast('Network error during AI error inspection', 'error');
    } finally {
      setIsCheckingAI(false);
    }
  };

  const handleResetStarterCode = () => {
    if (selectedProblem?.starterCode) {
      setCode((selectedProblem.starterCode as any)[language] || '// Write your code here');
      addToast('Starter code restored', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header & Overview */}
      <div className="border-b border-[#1A1A1A]/10 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] mb-2 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Overview
            </button>
          )}
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] uppercase font-bold tracking-widest">
              Live Coding IDE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-700" />
              AI Error Inspector (No Solutions Given)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A]">
            Coding & Problem Solving Lab
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 max-w-2xl mt-1">
            Solve institutional programming questions. AI checks your code, finds every error and explains why it failed, but <b>does not solve it for you</b>. Once all errors are cleared, your completion is recorded for your mentor to inspect.
          </p>
        </div>

        {/* Student Progress Badge & Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/15 shadow-sm min-w-[260px]">
          <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Lab Progress
            </span>
            <span className="font-mono text-emerald-700">{completedCount} / {totalCount} Cleared</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-[#1A1A1A]/60 text-right mt-1 font-mono">
            {progressPercent}% Complete
          </p>
        </div>
      </div>

      {/* Main Grid: Problem Selector Sidebar (4 Cols) + IDE Workspace (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 Required Questions List & Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#1A1A1A]/15 rounded-[28px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">Problems Directory</h3>
                <p className="text-[11px] text-[#1A1A1A]/60">8 Institutional Problems + Mentor Questions</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white">
                {problems.length} Total
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {problems.map((prob, idx) => {
                const isSelected = selectedProblem?.id === prob.id;
                const isDone = prob.isCompleted;

                return (
                  <button
                    key={prob.id}
                    onClick={() => setSelectedProblem(prob)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A] shadow-md'
                        : isDone
                        ? 'bg-emerald-50/60 border-emerald-300 text-[#1A1A1A] hover:bg-emerald-100/50'
                        : 'bg-[#F9F7F2] border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/30'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#1A1A1A]/10 text-[#1A1A1A]'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          prob.difficulty === 'Easy'
                            ? (isSelected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-900')
                            : (isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-900')
                        }`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold line-clamp-1">{prob.title}</h4>
                      <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-[#F9F7F2]/70' : 'text-[#1A1A1A]/60'}`}>
                        {prob.topic}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center pt-1">
                      {isDone ? (
                        <span
                          title="Completed - All Errors Cleared"
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-400 text-[#1A1A1A]' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          Cleared
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Pending
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Problem Description & Interactive IDE Workspace (8 Cols) */}
        {selectedProblem && (
          <div className="lg:col-span-8 space-y-5">
            {/* Problem Details Card */}
            <div className="bg-white border border-[#1A1A1A]/15 rounded-[28px] p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60">
                      {selectedProblem.category} • {selectedProblem.topic}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif italic text-[#1A1A1A]">{selectedProblem.title}</h2>
                </div>

                {selectedProblem.isCompleted ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Completed & Saved to Mentor
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Pending Clearance
                  </div>
                )}
              </div>

              {/* Problem Description */}
              <div className="text-xs text-[#1A1A1A]/85 leading-relaxed font-sans space-y-3">
                <p className="whitespace-pre-line text-sm">{selectedProblem.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#F9F7F2] rounded-xl border border-[#1A1A1A]/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 block mb-1">
                      Input Format
                    </span>
                    <p className="text-xs font-mono text-[#1A1A1A]">{selectedProblem.inputFormat}</p>
                  </div>
                  <div className="p-3 bg-[#F9F7F2] rounded-xl border border-[#1A1A1A]/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/70 block mb-1">
                      Output Format
                    </span>
                    <p className="text-xs font-mono text-[#1A1A1A]">{selectedProblem.outputFormat}</p>
                  </div>
                </div>

                {selectedProblem.constraints && (
                  <div className="p-2.5 bg-[#F9F7F2] rounded-xl border border-[#1A1A1A]/10 text-[11px] font-mono text-[#1A1A1A]/70">
                    <b>Constraints:</b> {selectedProblem.constraints}
                  </div>
                )}

                {/* Sample I/O */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#1A1A1A] text-[#F9F7F2] p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Sample Input</span>
                    <pre className="font-mono text-xs whitespace-pre-wrap">{selectedProblem.sampleInput}</pre>
                  </div>
                  <div className="bg-[#1A1A1A] text-[#F9F7F2] p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Sample Output</span>
                    <pre className="font-mono text-xs whitespace-pre-wrap">{selectedProblem.sampleOutput}</pre>
                  </div>
                </div>

                {/* Mentor Feedback If Available */}
                {selectedProblem.mentorFeedback && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Feedback from your Mentor
                    </span>
                    <p className="italic text-amber-900/90">"{selectedProblem.mentorFeedback}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Workspace Card */}
            <div className="bg-white border border-[#1A1A1A]/15 rounded-[28px] p-5 shadow-sm space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
                {/* Language Select Buttons */}
                <div className="flex items-center gap-1.5">
                  {(['java', 'python', 'cpp', 'javascript'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                        language === lang
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'bg-[#F9F7F2] text-[#1A1A1A]/80 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Reset & Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetStarterCode}
                    className="p-2 rounded-full border border-[#1A1A1A]/20 hover:bg-[#F9F7F2] text-[#1A1A1A] text-xs transition-all"
                    title="Reset to starter template"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Run Code Button */}
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || isCheckingAI}
                    className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-gray-300"
                  >
                    {isRunning ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    Run Code
                  </button>

                  {/* Check Code with AI (The Core Requirement: Tells error but does not solve it!) */}
                  <button
                    onClick={handleAICheck}
                    disabled={isCheckingAI || isRunning}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {isCheckingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        AI Checking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        Check Code with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Editor Box */}
              <div className="border border-[#1A1A1A] rounded-2xl overflow-hidden bg-[#1E1E1E] shadow-xl">
                <div className="px-4 py-2 bg-[#252526] border-b border-[#333] text-[10px] font-mono text-[#F9F7F2]/60 uppercase tracking-widest flex items-center justify-between">
                  <span>Solution.{language === 'cpp' ? 'cpp' : language === 'javascript' ? 'js' : language}</span>
                  <span className="flex items-center gap-2">
                    <span>UTF-8</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  </span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={16}
                  className="w-full bg-[#1E1E1E] text-[#F9F7F2] font-mono text-xs sm:text-sm p-4 focus:outline-none leading-relaxed resize-none selection:bg-purple-900 selection:text-white"
                  spellCheck={false}
                  placeholder="// Type your implementation here..."
                />
              </div>

              {/* Console & AI Error Inspector Panel */}
              <div className="border border-[#1A1A1A]/20 rounded-2xl overflow-hidden bg-white shadow-sm">
                {/* Tabs */}
                <div className="flex items-center bg-[#F9F7F2] border-b border-[#1A1A1A]/10 px-3 pt-2">
                  <button
                    onClick={() => setActiveConsoleTab('ai')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeConsoleTab === 'ai'
                        ? 'border-purple-700 text-purple-900 bg-white rounded-t-xl'
                        : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    AI Error Coach
                    {aiCheckResult && (
                      <span className={`w-2 h-2 rounded-full ${aiCheckResult.hasError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveConsoleTab('tests')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeConsoleTab === 'tests'
                        ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white rounded-t-xl'
                        : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Test Execution Console
                    {executionOutput && (
                      <span className={`w-2 h-2 rounded-full ${executionOutput.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  {/* TAB 1: AI ERROR COACH */}
                  {activeConsoleTab === 'ai' && (
                    <div className="space-y-4">
                      {!aiCheckResult ? (
                        <div className="p-6 text-center text-xs text-[#1A1A1A]/60 italic bg-[#F9F7F2] rounded-xl border border-[#1A1A1A]/10 space-y-2">
                          <Sparkles className="w-6 h-6 text-purple-600 mx-auto opacity-70" />
                          <p className="font-semibold text-[#1A1A1A]">Ready for AI Code Inspection</p>
                          <p className="max-w-md mx-auto text-[11px]">
                            Click <b>"Check Code with AI"</b> above. AI will check your code, point out any syntax errors, off-by-one loops, missing base cases, or logical bugs without giving you the answer. You will solve it yourself!
                          </p>
                        </div>
                      ) : aiCheckResult.hasError ? (
                        /* ERROR DETECTED: Clear, pedagogical error explanation WITHOUT code solutions */
                        <div className="space-y-4 animate-in fade-in duration-300">
                          {/* Error Banner */}
                          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                                  Error Detected
                                </span>
                                <span className="text-xs font-bold font-serif text-rose-950">
                                  {aiCheckResult.errorTitle || 'Logical Error in Solution'}
                                </span>
                              </div>
                              <p className="text-xs text-rose-900/90 leading-relaxed font-sans">
                                {aiCheckResult.errorDescription}
                              </p>
                            </div>
                          </div>

                          {/* Pedagogical Guidance (Strictly No Solution) */}
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Pedagogical Guidance (Solve It Yourself!)
                            </span>
                            <p className="text-xs text-amber-950 leading-relaxed">
                              {aiCheckResult.pedagogicalGuidance}
                            </p>
                            {aiCheckResult.hints && aiCheckResult.hints.length > 0 && (
                              <div className="pt-2 border-t border-amber-200/60 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-amber-900">Guiding Hints:</span>
                                <ul className="list-disc list-inside text-xs text-amber-900/90 space-y-0.5 pl-1">
                                  {aiCheckResult.hints.map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                            <Info className="w-4 h-4 text-purple-700 shrink-0" />
                            <span>
                              <b>Next Step:</b> Fix the error in your code editor above, then click <b>"Check Code with AI"</b> again. Once all errors are cleared, the problem will be completed!
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* ALL ERRORS CLEARED: Celebration & Completed state */
                        <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                              <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                                100% Errors Cleared
                              </span>
                              <h3 className="text-xl font-serif italic font-bold text-emerald-900 mt-0.5">
                                Question Completed Successfully!
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                            {aiCheckResult.errorDescription || 'All test cases passed and your logic is verified.'} {aiCheckResult.pedagogicalGuidance}
                          </p>

                          <div className="p-3 bg-white/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                            <span>
                              ✓ Status: <b>Completed & Recorded</b> • Your mentor can now see your code and verified progress in their portal.
                            </span>
                            <span className="font-mono text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                              PASS
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: TEST EXECUTION CONSOLE */}
                  {activeConsoleTab === 'tests' && (
                    <div className="space-y-3">
                      {!executionOutput ? (
                        <div className="p-6 text-center text-xs text-[#1A1A1A]/60 italic bg-[#F9F7F2] rounded-xl border border-[#1A1A1A]/10">
                          Click "Run Code" to compile and execute against sample test cases.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/10">
                            <span className="text-xs font-bold text-[#1A1A1A]">Test Suite Results</span>
                            <span
                              className={`text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full font-bold ${
                                executionOutput.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {executionOutput.status} ({executionOutput.passCount}/{executionOutput.totalCount})
                            </span>
                          </div>
                          <pre className="p-4 rounded-xl bg-[#1E1E1E] text-[#F9F7F2] font-mono text-xs whitespace-pre-wrap leading-relaxed">
                            {executionOutput.outputDetails}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
