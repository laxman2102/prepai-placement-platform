import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentoringSession, MentorApprovalItem } from '../types';
import {
  Video, Calendar, Clock, CheckCircle2, AlertCircle, Play, Pause, Volume2,
  Mic, MessageSquare, Award, ArrowLeft, RefreshCw, FileText, Code2, Bot,
  Users, ChevronRight, UserCheck, Sparkles, Filter, Check, HelpCircle,
  ExternalLink, Copy, Radio, ShieldCheck
} from 'lucide-react';

interface MentorSessionsPageProps {
  setActiveTab?: (tab: string) => void;
}

export const MentorSessionsPage: React.FC<MentorSessionsPageProps> = ({ setActiveTab }) => {
  const { user, token, addToast } = useAuth();
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [approvals, setApprovals] = useState<MentorApprovalItem[]>([]);
  const [activeTab, setActiveTabState] = useState<'sessions' | 'approvals'>('sessions');
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Playback State for Voice Note in approvals tab
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<MentorApprovalItem | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessRes, apprRes] = await Promise.all([
        fetch('/api/student/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/approvals', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const sessData = await sessRes.json();
      const apprData = await apprRes.json();

      if (sessData.success && Array.isArray(sessData.data)) {
        setSessions(sessData.data);
      }
      if (apprData.success && Array.isArray(apprData.data)) {
        setApprovals(apprData.data);
      }
    } catch (e) {
      console.error('Failed to load mentor sessions:', e);
      addToast('Network error while loading sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 15 seconds so if mentor starts a live session, student sees it immediately!
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const liveSessions = sessions.filter(s => s.status === 'Live');
  const scheduledSessions = sessions.filter(s => s.status === 'Scheduled');

  const filteredSessions = sessions.filter(s => {
    if (sessionFilter === 'ALL') return true;
    if (sessionFilter === 'LIVE') return s.status === 'Live';
    if (sessionFilter === 'SCHEDULED') return s.status === 'Scheduled';
    return true;
  });

  const handleCopyLink = (link: string, id: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    addToast('Meeting link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleToggleVoiceNote = (item: MentorApprovalItem) => {
    if (!item.mentorVoiceNoteUrl) return;

    if (playingId === item.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
          setPlayingId(null);
        }
      }
    } else {
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
        setPlayingId(null);
        addToast('Could not play mentor audio', 'error');
      });
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Back Button */}
      {setActiveTab && (
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors py-2 px-3 rounded-full hover:bg-[#1A1A1A]/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] uppercase font-bold tracking-widest">
              <Video className="w-3.5 h-3.5 text-emerald-700" />
              Mentor Video & Guidance Suite
            </div>
            {liveSessions.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] uppercase font-bold tracking-widest animate-pulse shadow-sm">
                <Radio className="w-3.5 h-3.5" />
                {liveSessions.length} Live Session Now
              </div>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A]">
            Mentor Sessions & Live Meetings
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 max-w-2xl mt-2 leading-relaxed">
            Attend live 1-on-1 guidance calls and group placement masterclasses scheduled by your mentor. Access direct Google Meet session links and review certifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all"
            title="Refresh sessions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('mentoring')}
              className="px-4 py-2.5 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-all"
            >
              Mentor Notes Drive
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs (Sessions vs Submissions) */}
      <div className="flex items-center gap-3 border-b border-[#1A1A1A]/10 pb-4">
        <button
          onClick={() => setActiveTabState('sessions')}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-md'
              : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-400" />
          Mentor Sessions ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTabState('approvals')}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-md'
              : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Evaluations & Green Ticks ({approvals.length})
        </button>
      </div>

      {/* SESSIONS SECTION */}
      {activeTab === 'sessions' && (
        <div className="space-y-8">
          {/* URGENT LIVE SESSIONS BANNER */}
          {liveSessions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping inline-block" />
                <h2 className="text-xl font-serif italic text-rose-900 font-bold">
                  Happening Live Right Now
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {liveSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-[#1A1A1A] to-neutral-900 text-white shadow-xl border-2 border-rose-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
                  >
                    <div className="space-y-2 relative z-10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] uppercase font-bold tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                          <Radio className="w-3 h-3 animate-pulse" />
                          Live Broadcast Session
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] uppercase font-semibold">
                          {sess.sessionType === 'GROUP' ? 'Group Masterclass' : '1-on-1 Guidance'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono">
                          Duration: {sess.durationMinutes} Mins
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-serif italic text-white font-bold leading-tight">
                        {sess.title}
                      </h3>

                      <p className="text-xs text-white/80 flex flex-wrap items-center gap-3">
                        <span>Mentor: <b>{sess.mentorName}</b> ({sess.mentorCode || 'MT0001'})</span>
                        <span>•</span>
                        <span>Started at: {new Date(sess.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>

                      {sess.notes && (
                        <p className="text-xs text-amber-200 italic mt-1 bg-white/5 p-2 rounded-xl border border-white/10">
                          Note: "{sess.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg inline-flex items-center justify-center gap-2.5 transform hover:scale-105"
                      >
                        <Video className="w-4 h-4" />
                        Join Live Meeting Now
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(sess.meetingLink, sess.id)}
                        className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                        title="Copy meeting link"
                      >
                        {copiedId === sess.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">All Mentoring Guidance Calls</h3>
              <p className="text-xs text-[#1A1A1A]/60">Sessions scheduled by your verified campus faculty lead.</p>
            </div>

            <div className="flex items-center gap-1 bg-[#F9F7F2] p-1 rounded-2xl border border-[#1A1A1A]/10 text-[10px] font-bold">
              {(['ALL', 'LIVE', 'SCHEDULED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSessionFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    sessionFilter === filter
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/20 rounded-3xl space-y-4">
              <Video className="w-12 h-12 mx-auto text-[#1A1A1A]/40" />
              <h3 className="text-xl font-serif italic text-[#1A1A1A]">No Mentoring Sessions Found</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                When your mentor schedules a 1-on-1 guidance call or initiates a live meeting, the meeting link will automatically appear here.
              </p>
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab('mentor')}
                  className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-all"
                >
                  Check Mentor Connection
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSessions.map((sess) => {
                const isLive = sess.status === 'Live';
                const isGroup = sess.sessionType === 'GROUP';
                const sessionDate = new Date(sess.scheduledAt);

                return (
                  <div
                    key={sess.id}
                    className={`rounded-3xl p-6 transition-all border flex flex-col justify-between gap-5 shadow-sm ${
                      isLive
                        ? 'bg-rose-50/40 border-rose-400 hover:border-rose-600'
                        : 'bg-white border-[#1A1A1A]/20 hover:border-[#1A1A1A]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                            isLive
                              ? 'bg-rose-100 border-rose-300 text-rose-900 animate-pulse'
                              : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          }`}
                        >
                          {isLive && <Radio className="w-3 h-3" />}
                          {sess.status.toUpperCase()}
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                          {isGroup ? 'Group Session' : '1-on-1 Session'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xl font-serif font-bold text-[#1A1A1A] leading-snug">
                          {sess.title}
                        </h4>
                        <p className="text-xs text-[#1A1A1A]/70 mt-1">
                          Conducted by: <b className="text-[#1A1A1A]">{sess.mentorName}</b> ({sess.mentorCode || 'MT0001'})
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]" />
                            {sessionDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="font-semibold text-[#1A1A1A]">
                            {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1A1A]/60 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#1A1A1A]" />
                            Duration
                          </span>
                          <span className="font-mono font-bold text-[#1A1A1A]">
                            {sess.durationMinutes} Minutes
                          </span>
                        </div>
                      </div>

                      {sess.notes && (
                        <p className="text-xs italic text-[#1A1A1A]/70">
                          "{sess.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#1A1A1A]/10 flex items-center gap-2">
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex-1 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs ${
                          isLive
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-[#1A1A1A] hover:bg-[#333] text-[#F9F7F2]'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        {isLive ? 'Join Live Now' : 'Join Session Link'}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(sess.meetingLink, sess.id)}
                        className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all"
                        title="Copy session URL"
                      >
                        {copiedId === sess.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EVALUATIONS & CERTIFICATIONS TAB */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Mentor Green Tick Certifications</h3>
              <p className="text-xs text-[#1A1A1A]/60">
                Official faculty approval logs for your AI mock interviews, coding labs, and technical reviews.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
              {approvals.filter(a => a.status === 'APPROVED').length} Certified ✓
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/20 rounded-3xl space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
              <h4 className="text-lg font-serif italic text-[#1A1A1A]">No Submissions Awaiting Certification</h4>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                Complete AI mock interviews or coding challenges in the Practice Lab. Your mentor will inspect and certify them with verified Green Ticks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvals.map((item) => {
                const isApproved = item.status === 'APPROVED';
                const hasVoiceNote = !!item.mentorVoiceNoteUrl;
                const isPlaying = playingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`border rounded-3xl p-6 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                      isApproved ? 'border-emerald-600/30 bg-emerald-50/20' : 'border-[#1A1A1A]/20 bg-white'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                              : 'bg-amber-100 border-amber-300 text-amber-900'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {item.status}
                        </span>

                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                          {item.itemType}
                        </span>

                        {item.details?.score !== undefined && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                            Score: {item.details.score}%
                          </span>
                        )}
                      </div>

                      <h4 className="text-xl font-serif font-bold text-[#1A1A1A]">{item.title}</h4>
                      <p className="text-xs text-[#1A1A1A]/70">
                        Submitted on: {new Date(item.submittedAt).toLocaleDateString()}
                        {item.reviewedAt && ` • Certified on: ${new Date(item.reviewedAt).toLocaleDateString()}`}
                      </p>

                      {item.mentorNotes && (
                        <div className="mt-2 p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]">
                          <span className="font-bold text-[10px] text-emerald-900 uppercase block mb-1">
                            Mentor Feedback & Guidance:
                          </span>
                          "{item.mentorNotes}"
                        </div>
                      )}

                      {/* Voice Note Player if available */}
                      {hasVoiceNote && (
                        <div className="mt-2 p-3 rounded-2xl bg-emerald-100/60 border border-emerald-300 flex items-center gap-3 max-w-md">
                          <button
                            onClick={() => handleToggleVoiceNote(item)}
                            className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 hover:bg-emerald-700 transition-all shadow-xs"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                              Mentor Voice Note ({item.mentorVoiceNoteDuration || 15}s)
                            </span>
                            <div className="w-full bg-emerald-300/60 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-emerald-800 h-full transition-all duration-200"
                                style={{ width: `${isPlaying ? playbackProgress : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
