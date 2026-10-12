import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorTask, MentoringSession, UploadedNote } from '../types';
import {
  Users, Calendar, CheckSquare, MessageSquare, Clock, Plus,
  FolderArchive, Download, Search, Eye, FileText, HardDrive,
  Sparkles, CheckCircle2
} from 'lucide-react';

export const MentoringGuidance: React.FC = () => {
  const { user, token, addToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'sessions' | 'notes'>('notes');
  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [notes, setNotes] = useState<UploadedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesFilter, setNotesFilter] = useState('ALL');
  const [previewNote, setPreviewNote] = useState<UploadedNote | null>(null);

  const fetchStudentGuidanceData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, notesRes] = await Promise.all([
        fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/notes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const notesData = await notesRes.json();

      if (dashData.success && dashData.data) {
        if (Array.isArray(dashData.data.pendingTasks)) {
          setTasks(dashData.data.pendingTasks);
        }
        if (Array.isArray(dashData.data.upcomingSessions)) {
          setSessions(dashData.data.upcomingSessions);
        }
      }

      if (notesData.success && Array.isArray(notesData.data)) {
        setNotes(notesData.data);
      } else if (dashData.success && Array.isArray(dashData.data.uploadedNotes)) {
        setNotes(dashData.data.uploadedNotes);
      }
    } catch (e) {
      console.error('Failed to load mentoring notes/guidance:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentGuidanceData();
  }, [token]);

  const toggleTaskStatus = async (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: t.status === 'Completed' ? 'In Progress' : 'Completed' } : t)));
    addToast('Task status updated!', 'success');
  };

  const handleDownloadFile = (note: UploadedNote) => {
    try {
      const element = document.createElement('a');
      if (note.fileDataUrl && note.fileDataUrl.startsWith('data:')) {
        element.setAttribute('href', note.fileDataUrl);
      } else {
        const fallbackText = `${note.title}\nPrepared by ${note.mentorName} (${note.mentorCode || 'MT0001'})\n\n${note.description || 'Instructional material provided by faculty mentor.'}`;
        const blob = new Blob([fallbackText], { type: 'text/plain' });
        element.setAttribute('href', URL.createObjectURL(blob));
      }
      element.setAttribute('download', note.fileName || `${note.title}.${note.fileType || 'pdf'}`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      addToast(`Downloading "${note.fileName}"`, 'success');
    } catch {
      addToast('Failed to download file', 'error');
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = !notesSearch ||
      note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
      note.fileName.toLowerCase().includes(notesSearch.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(notesSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (notesFilter === 'ALL') return true;
    if (notesFilter === 'PDF') return note.fileType === 'pdf';
    if (notesFilter === 'PPT') return note.fileType === 'ppt';
    if (notesFilter === 'DOCS') return ['doc', 'docx', 'txt'].includes(note.fileType);
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] uppercase font-bold tracking-widest mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            Official Faculty Mentorship
          </div>
          <h1 className="text-4xl font-serif italic text-[#1A1A1A]">Mentor Guidance & Drive</h1>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-lg">
            Access study notes, presentations, and guides uploaded by your mentor. Complete assigned tasks and attend live mentoring sessions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            Uploaded Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            Assigned Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
                : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            Live Sessions ({sessions.length})
          </button>
        </div>
      </div>

      {/* UPLOADED NOTES (DRIVE) SECTION */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] text-[#F9F7F2] rounded-[32px] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                Faculty Materials Drive
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white">
                Uploaded Notes from Your Mentor
              </h2>
              <p className="text-xs text-[#F9F7F2]/70 max-w-xl leading-relaxed">
                Whenever your assigned mentor uploads notes, lecture PPTs, or PDF guides, they are automatically available here for one-click downloading and offline study.
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#262626] border border-[#444] text-xs font-mono text-center shrink-0">
              <span className="text-[10px] text-[#F9F7F2]/60 uppercase tracking-wider block">Drive Storage</span>
              <span className="text-emerald-400 font-bold">{notes.length} Reference Files</span>
            </div>
          </div>

          {/* Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
              <input
                type="text"
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                placeholder="Search notes by topic, file name, or keyword..."
                className="w-full bg-white border border-[#1A1A1A]/15 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#1A1A1A]/15 text-xs font-bold">
              {['ALL', 'PDF', 'PPT', 'DOCS'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setNotesFilter(f)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    notesFilter === f ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl space-y-3">
              <FolderArchive className="w-10 h-10 mx-auto text-amber-600" />
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">No Uploaded Notes Found</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                Your mentor has not uploaded any notes matching this search yet. Check back soon or contact your faculty mentor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const isPdf = note.fileType === 'pdf';
                const isPpt = note.fileType === 'ppt';
                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm hover:border-[#1A1A1A]/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPdf ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          isPpt ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {note.fileType.toUpperCase()}
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                          {note.topicCategory}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-serif font-bold text-[#1A1A1A] leading-snug">
                          {note.title}
                        </h4>
                        <p className="text-xs text-[#1A1A1A]/60 font-mono mt-0.5">
                          {note.fileName} • {note.fileSize}
                        </p>
                      </div>

                      {note.description && (
                        <p className="text-xs text-[#1A1A1A]/70 italic bg-[#F9F7F2] p-2.5 rounded-xl leading-relaxed">
                          "{note.description}"
                        </p>
                      )}

                      <div className="text-[10px] text-[#1A1A1A]/50 flex items-center justify-between pt-1 border-t border-[#1A1A1A]/5">
                        <span>By: <b>{note.mentorName}</b> ({note.mentorCode || 'MT0001'})</span>
                        <span>{new Date(note.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#1A1A1A]/10">
                      <button
                        onClick={() => setPreviewNote(note)}
                        className="p-2.5 rounded-2xl border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F7F2] transition-all"
                        title="Preview Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(note)}
                        className="flex-1 py-2.5 rounded-2xl bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        Download File
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tasks Section */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-sm font-serif italic text-[#1A1A1A]">No pending tasks assigned.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[24px] p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-40">
                      Assigned by {task.mentorName} • Due: {task.dueDate}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        task.priority === 'High' ? 'bg-rose-900 text-white' : 'bg-[#F0EDE5] text-[#1A1A1A]'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-xl font-serif italic text-[#1A1A1A]">{task.title}</h3>
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-sans">{task.description}</p>
                </div>

                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`px-6 py-2.5 rounded-full text-xs uppercase font-semibold tracking-wider transition-all shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333333]'
                  }`}
                >
                  {task.status === 'Completed' ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sessions Section */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-sm font-serif italic text-[#1A1A1A]">No scheduled sessions currently active.</p>
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] rounded-[28px] p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-semibold">
                      {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif italic text-white">{sess.title}</h3>
                  <p className="text-xs text-[#F9F7F2]/70 font-sans">With Faculty Mentor {sess.mentorName}</p>
                </div>

                {sess.meetingLink && (
                  <a
                    href={sess.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-3 rounded-full bg-[#F9F7F2] text-[#1A1A1A] text-xs font-semibold uppercase tracking-widest hover:bg-white inline-block text-center shadow-lg"
                  >
                    Join Video Call
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Preview Modal for Students */}
      {previewNote && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[36px] max-w-xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  previewNote.fileType === 'pdf' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  previewNote.fileType === 'ppt' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {previewNote.fileType.toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                    Faculty Study Material
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">{previewNote.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="p-2 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#1A1A1A]/10 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/50">File Name:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{previewNote.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/50">File Size:</span>
                <span className="font-mono text-[#1A1A1A]">{previewNote.fileSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/50">Category:</span>
                <span className="font-semibold text-[#1A1A1A]">{previewNote.topicCategory}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/5">
                <span className="text-[#1A1A1A]/50">Faculty Mentor:</span>
                <span className="font-bold text-emerald-800">{previewNote.mentorName} ({previewNote.mentorCode || 'MT0001'})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#1A1A1A]/50">Uploaded On:</span>
                <span>{new Date(previewNote.uploadedAt).toLocaleString()}</span>
              </div>

              {previewNote.description && (
                <div className="mt-3 pt-3 border-t border-[#1A1A1A]/10">
                  <span className="font-bold text-[10px] uppercase text-[#1A1A1A]/60 block mb-1">
                    Mentor Note:
                  </span>
                  <p className="italic text-[#1A1A1A] bg-[#F9F7F2] p-3 rounded-xl leading-relaxed">
                    "{previewNote.description}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewNote(null)}
                className="px-6 py-2.5 rounded-full border border-[#1A1A1A]/30 text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A]/5"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleDownloadFile(previewNote)}
                className="px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
