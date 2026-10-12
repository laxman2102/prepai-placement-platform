import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorApprovalItem } from '../types';
import {
  CheckCircle2, Clock, AlertCircle, Play, Pause, Volume2,
  Mic, MessageSquare, Award, ArrowLeft, RefreshCw,
  FileText, Code2, Bot, Brain, ChevronRight, UserCheck,
  Sparkles, Filter, Check, HelpCircle, VolumeX, Send
} from 'lucide-react';

interface MentorApprovalPageProps {
  setActiveTab?: (tab: string) => void;
}

export const MentorApprovalPage: React.FC<MentorApprovalPageProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();
  const [approvals, setApprovals] = useState<MentorApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'MOCK_INTERVIEW' | 'CODING_LAB' | 'APTITUDE_TEST'>('ALL');
  const [selectedItem, setSelectedItem] = useState<MentorApprovalItem | null>(null);

  // Audio Playback State for Voice Note
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Submission Dialog State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState<'MOCK_INTERVIEW' | 'CODING_LAB' | 'APTITUDE_TEST' | 'PROJECT_REVIEW'>('MOCK_INTERVIEW');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApprovals(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch approvals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [token]);

  // Handle Voice Note Playback
  const handlePlayVoice = (item: MentorApprovalItem) => {
    if (!item.mentorVoiceNoteUrl) {
      // If simulated or synthesized audio, we can speak using Web Speech Synthesis or simulated synth tone!
      if ('speechSynthesis' in window && item.mentorNotes) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(item.mentorNotes);
        utterance.rate = playbackRate;
        utterance.pitch = 1.0;
        utterance.onstart = () => setPlayingId(item.id);
        utterance.onend = () => {
          setPlayingId(null);
          setPlaybackProgress(0);
        };
        window.speechSynthesis.speak(utterance);
        return;
      }
      addToast('No audio recording stream attached for this item.', 'error');
      return;
    }

    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis?.cancel();
      setPlayingId(null);
      return;
    }

    // New play
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(item.mentorVoiceNoteUrl);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    setPlayingId(item.id);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setPlayingId(null);
      setPlaybackProgress(0);
    };

    audio.play().catch(() => {
      // Fallback to speech synthesis if audio format issue
      if ('speechSynthesis' in window && item.mentorNotes) {
        const utterance = new SpeechSynthesisUtterance(item.mentorNotes);
        utterance.rate = playbackRate;
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      }
    });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim()) {
      addToast('Please enter a submission title', 'error');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: requestType,
          title: requestTitle.trim(),
          details: {
            studentNotes: requestNotes.trim(),
            submittedTimestamp: new Date().toISOString()
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Session work submitted for Mentor Approval!', 'success');
        setShowRequestModal(false);
        setRequestTitle('');
        setRequestNotes('');
        fetchApprovals();
      } else {
        addToast(data.message || 'Submission failed', 'error');
      }
    } catch (e) {
      addToast('Network error while requesting approval', 'error');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const filteredApprovals = approvals.filter(item => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PENDING') return item.status === 'PENDING';
    if (activeFilter === 'APPROVED') return item.status === 'APPROVED';
    return item.itemType === activeFilter;
  });

  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const voiceNotesCount = approvals.filter(a => a.mentorVoiceNoteUrl || a.mentorNotes).length;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'MOCK_INTERVIEW':
        return <Bot className="w-5 h-5 text-indigo-700" />;
      case 'CODING_LAB':
        return <Code2 className="w-5 h-5 text-emerald-700" />;
      case 'APTITUDE_TEST':
        return <Brain className="w-5 h-5 text-amber-700" />;
      default:
        return <FileText className="w-5 h-5 text-[#1A1A1A]" />;
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* Top Header & Context */}
      <header className="border-b border-[#1A1A1A]/10 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] mb-3 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Overview
            </button>
          )}
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold mb-2">Faculty Verification & Endorsement</p>
          <h1 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A]">
            Mentor Approval <br />
            <span className="italic font-normal">& Evaluated Sessions</span>
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 mt-2 max-w-xl">
            When you complete AI mock interviews, coding labs, or tests, your designated faculty mentor reviews your answers, provides written feedback & voice instructions, and certifies the session with a verified <span className="font-semibold text-emerald-800 underline">Green Tick</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchApprovals}
            disabled={isLoading}
            className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            id="btn-submit-work-approval"
            className="px-6 py-3 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333333] transition-all shadow-md inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Request Work Approval
          </button>
        </div>
      </header>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Verified Endorsements</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-serif italic text-emerald-800 font-bold">{approvedCount}</span>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            </div>
            <p className="text-[11px] text-[#1A1A1A]/60 mt-1">Sessions with Green Tick</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-[#1A1A1A]/30 bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Under Evaluation</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-serif italic text-amber-900 font-bold">{pendingCount}</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-[11px] text-[#1A1A1A]/60 mt-1">Awaiting mentor review</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100/60 border border-amber-300 flex items-center justify-center text-amber-800">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="border border-[#1A1A1A]/30 bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Voice & Notes Received</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-serif italic text-indigo-900 font-bold">{voiceNotesCount}</span>
              <Volume2 className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[11px] text-[#1A1A1A]/60 mt-1">Direct mentor instructions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100/60 border border-indigo-300 flex items-center justify-center text-indigo-800">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1A1A1A]/10 pb-4">
        {[
          { key: 'ALL', label: 'All Submissions' },
          { key: 'PENDING', label: `Pending (${pendingCount})` },
          { key: 'APPROVED', label: `Green Tick Approved (${approvedCount})` },
          { key: 'MOCK_INTERVIEW', label: 'Mock Interviews' },
          { key: 'CODING_LAB', label: 'Coding Labs' },
          { key: 'APTITUDE_TEST', label: 'Aptitude Tests' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeFilter === f.key
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin opacity-40 text-[#1A1A1A] mb-3" />
          <p className="text-xs uppercase tracking-widest opacity-60">Fetching verified submissions...</p>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#1A1A1A]/20 rounded-3xl p-8 shadow-sm">
          <Award className="w-12 h-12 mx-auto text-[#1A1A1A]/30 mb-3" />
          <h3 className="text-xl font-serif italic text-[#1A1A1A]">No Submissions Found in Filter</h3>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-md mx-auto">
            Complete a Mock Interview, solve Coding Problems, or click "Request Work Approval" to submit your session answers to your mentor.
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase tracking-wider font-semibold hover:bg-[#333] transition-all"
          >
            Submit Work for Approval
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApprovals.map((item) => {
            const isApproved = item.status === 'APPROVED';
            const isPlayingThis = playingId === item.id;

            return (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 sm:p-8 transition-all shadow-md ${
                  isApproved
                    ? 'border-emerald-700/50 bg-gradient-to-br from-emerald-50/50 via-white to-[#F9F7F2]'
                    : 'border-[#1A1A1A]/20 bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#1A1A1A]/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/15 shrink-0 shadow-sm">
                      {getItemIcon(item.itemType)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/10 text-[#1A1A1A]">
                          {item.itemType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] opacity-50 uppercase tracking-widest">
                          Submitted {new Date(item.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif italic text-[#1A1A1A] font-medium">{item.title}</h3>
                      <p className="text-xs text-[#1A1A1A]/60 mt-1">
                        Student: <span className="font-semibold text-[#1A1A1A]">{item.studentName}</span> • Reviewer: <span className="font-semibold text-[#1A1A1A]">{item.mentorName || 'Assigned Faculty Mentor'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Prominent Green Tick or Pending Status Badge */}
                  <div className="shrink-0 flex items-center gap-3">
                    {isApproved ? (
                      <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-400 text-emerald-950 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-200 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                            Mentor Approved <span className="text-emerald-700">✓</span>
                          </p>
                          <p className="text-[10px] text-emerald-800 font-medium">Verified Correct Answer</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-950 shadow-sm">
                        <Clock className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Pending Evaluation</p>
                          <p className="text-[10px] text-amber-800">Awaiting faculty sign-off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content: Mentor Notes and Voice Message */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                  {/* Left Column: Written Feedback / Instructions */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <h4 className="text-[11px] uppercase tracking-[0.2em] opacity-50 font-semibold mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Mentor Note & Written Instructions
                      </h4>
                      {item.mentorNotes ? (
                        <div className="p-5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/15 relative">
                          <p className="text-xs text-[#1A1A1A] leading-relaxed italic font-serif text-sm whitespace-pre-wrap">
                            "{item.mentorNotes}"
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[10px] opacity-60 uppercase tracking-widest border-t border-[#1A1A1A]/10 pt-2 font-semibold">
                            <span>Written by {item.mentorName || 'Faculty Mentor'}</span>
                            <span>{item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Reviewed'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 text-xs italic">
                          No written comments provided yet. Your mentor will leave instruction notes upon session verification.
                        </div>
                      )}
                    </div>

                    {/* View Student Submission Details Button */}
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:underline pt-1"
                    >
                      <FileText className="w-4 h-4" /> Inspect Submitted Answers & Scores <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Column: Voice Message Player */}
                  <div className="lg:col-span-5 bg-[#1A1A1A] text-[#F9F7F2] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-[#333] pb-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Mentor Voice Message
                        </span>
                        {item.mentorVoiceDuration && (
                          <span className="text-[10px] font-mono text-emerald-300">
                            {item.mentorVoiceDuration}s audio
                          </span>
                        )}
                      </div>

                      {item.mentorVoiceNoteUrl || item.mentorNotes ? (
                        <div className="space-y-3">
                          <p className="text-xs text-[#F9F7F2]/80 leading-relaxed">
                            {item.mentorVoiceNoteUrl
                              ? 'Listen to the personalized audio guidance recorded by your mentor.'
                              : 'Listen to spoken instructions synthesized from your mentor’s feedback notes.'}
                          </p>

                          {/* Voice Player Controls */}
                          <div className="bg-[#262626] border border-[#333] rounded-xl p-3 flex items-center gap-3">
                            <button
                              onClick={() => handlePlayVoice(item)}
                              id={`btn-play-voice-${item.id}`}
                              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
                              title={isPlayingThis ? 'Pause Audio' : 'Play Voice Message'}
                            >
                              {isPlayingThis ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                            </button>

                            <div className="flex-1">
                              <div className="flex justify-between items-center text-[10px] font-mono text-[#F9F7F2]/60 mb-1">
                                <span>{isPlayingThis ? 'Playing Voice Note' : 'Voice Instruction Ready'}</span>
                                <span>{item.mentorVoiceDuration || 18}s</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-200"
                                  style={{ width: isPlayingThis ? `${playbackProgress}%` : '0%' }}
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
                                setPlaybackRate(nextRate);
                                if (audioRef.current) audioRef.current.playbackRate = nextRate;
                              }}
                              className="px-2 py-1 bg-[#1A1A1A] border border-[#444] rounded text-[10px] font-mono text-emerald-400 hover:bg-black"
                              title="Toggle Speed"
                            >
                              {playbackRate}x
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs opacity-50 italic">
                          No voice recording attached yet.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#333] flex items-center justify-between text-[10px] text-[#F9F7F2]/50 font-semibold uppercase tracking-wider">
                      <span>Certified Feedback System</span>
                      {isApproved && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Green Tick Awarded</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answer & Submission Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Submission Inspection</span>
                <h3 className="text-2xl font-serif italic text-[#1A1A1A]">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-[#1A1A1A]/10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold block">Student</span>
                  <span className="font-semibold text-sm text-[#1A1A1A]">{selectedItem.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold block">Reviewer</span>
                  <span className="font-semibold text-sm text-[#1A1A1A]">{selectedItem.mentorName || 'Assigned Mentor'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold block">Submitted Time</span>
                  <span className="font-medium">{new Date(selectedItem.submittedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold block">Approval State</span>
                  <span className={`font-bold ${selectedItem.status === 'APPROVED' ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {selectedItem.status === 'APPROVED' ? '✓ Approved (Green Tick)' : 'Pending Faculty Sign-Off'}
                  </span>
                </div>
              </div>

              {/* Questions / Answers Breakdown */}
              {selectedItem.details?.questions && Array.isArray(selectedItem.details.questions) && (
                <div className="space-y-3">
                  <h4 className="text-[11px] uppercase tracking-widest font-bold opacity-70">Interview Questions & Candidate Answers:</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedItem.details.questions.map((q: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/15 space-y-2">
                        <p className="font-semibold text-[#1A1A1A]">Q{i + 1}: {q.question || q.text}</p>
                        <p className="text-[#1A1A1A]/80 italic pl-3 border-l-2 border-indigo-400">
                          Answer: {q.userAnswer || q.transcript || q.answer || 'Student recorded response.'}
                        </p>
                        {q.feedback && (
                          <p className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            AI Evaluation: {q.feedback} (Score: {q.score || 85}/100)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Snippet if Coding Lab */}
              {selectedItem.details?.code && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold opacity-70 mb-1">Submitted Source Code:</h4>
                  <pre className="p-4 rounded-2xl bg-[#1A1A1A] text-emerald-400 font-mono text-[11px] overflow-x-auto">
                    {selectedItem.details.code}
                  </pre>
                </div>
              )}

              {/* Mentor Written Feedback */}
              {selectedItem.mentorNotes && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                  <p className="font-bold text-[11px] uppercase tracking-wider mb-1 text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mentor Approval Notes
                  </p>
                  <p className="italic font-serif text-sm leading-relaxed">{selectedItem.mentorNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Approval Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Faculty Review Request</p>
                <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Submit Work for Mentor Approval</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Submission Category *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="MOCK_INTERVIEW">AI Mock Interview Session</option>
                  <option value="CODING_LAB">Coding Lab Algorithm Solution</option>
                  <option value="APTITUDE_TEST">Quantitative / Technical Assessment</option>
                  <option value="PROJECT_REVIEW">Portfolio Project & System Design</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Session / Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  placeholder="e.g. SDE-1 Backend Mock Interview Round 2"
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Student Notes for Faculty Mentor
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Mention any specific questions or areas where you would like voice feedback and approval..."
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl p-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 rounded-full border border-[#1A1A1A]/30 text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="flex-1 py-3 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {isSubmittingRequest ? 'Submitting...' : 'Send for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
