import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorApprovalItem, UploadedNote } from '../types';
import {
  Users, CheckSquare, MessageSquare, Calendar, Plus, Send,
  CheckCircle2, Clock, AlertCircle, Play, Pause, Mic, MicOff,
  Volume2, RefreshCw, FileText, Code2, Bot, Brain, Sparkles,
  Check, ChevronRight, UserCheck, Star, Video, ExternalLink,
  FolderArchive, FileUp, Download, Trash2, Search, Eye, Layers,
  HardDrive, FileCheck, ArrowUpRight, FileSpreadsheet, Terminal, X, Copy, Award
} from 'lucide-react';

interface MentorDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ activeTab: initialTab, setActiveTab: setParentTab }) => {
  const { user, token, addToast } = useAuth();
  const [currentTab, setCurrentTab] = useState<'overview' | 'approvals' | 'students' | 'coding' | 'tasks' | 'feedback' | 'sessions'>('overview');

  // Sync internal tab state with sidebar activeTab prop
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'dashboard') {
        setCurrentTab('overview');
      } else if (initialTab === 'mentor-approvals') {
        setCurrentTab('approvals');
      } else if (initialTab === 'mentor-students') {
        setCurrentTab('students');
      } else if (initialTab === 'mentor-coding') {
        setCurrentTab('coding');
      } else if (initialTab === 'mentor-tasks') {
        setCurrentTab('tasks');
      } else if (initialTab === 'mentor-feedback') {
        setCurrentTab('feedback');
      } else if (initialTab === 'mentor-sessions' || initialTab === 'mentor-notes') {
        setCurrentTab('sessions');
      }
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'overview' | 'approvals' | 'students' | 'coding' | 'tasks' | 'feedback' | 'sessions') => {
    setCurrentTab(tab);
    if (setParentTab) {
      if (tab === 'overview') setParentTab('dashboard');
      else if (tab === 'approvals') setParentTab('mentor-approvals');
      else if (tab === 'students') setParentTab('mentor-students');
      else if (tab === 'coding') setParentTab('mentor-coding');
      else if (tab === 'tasks') setParentTab('mentor-tasks');
      else if (tab === 'feedback') setParentTab('mentor-feedback');
      else if (tab === 'sessions') setParentTab('mentor-sessions');
    }
  };

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [approvals, setApprovals] = useState<MentorApprovalItem[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<UploadedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review & Approval Modal State
  const [selectedApproval, setSelectedApproval] = useState<MentorApprovalItem | null>(null);
  const [mentorNotes, setMentorNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Task Assignment State
  const [taskStudentId, setTaskStudentId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [isAssigningTask, setIsAssigningTask] = useState(false);

  // Feedback State
  const [fbStudentId, setFbStudentId] = useState('');
  const [fbCategory, setFbCategory] = useState<'Mock Interview' | 'Coding Problem' | 'Aptitude' | 'Soft Skills' | 'General'>('Mock Interview');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbComment, setFbComment] = useState('');
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);

  // Student Mentorship Connection Requests State
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);

  // Session Block 1: One to One Mentoring Session State
  const [sessStudentId, setSessStudentId] = useState('');
  const [sess1MentorName, setSess1MentorName] = useState('');
  const [sess1Title, setSess1Title] = useState('');
  const [sess1Date, setSess1Date] = useState('');
  const [sess1Duration, setSess1Duration] = useState(45);
  const [sess1Link, setSess1Link] = useState('');
  const [isStarting1on1, setIsStarting1on1] = useState(false);

  // Session Block 2: Group Mentoring Session State
  const [sessGroupMentorName, setSessGroupMentorName] = useState('');
  const [sessGroupTitle, setSessGroupTitle] = useState('');
  const [sessGroupDate, setSessGroupDate] = useState('');
  const [sessGroupDuration, setSessGroupDuration] = useState(60);
  const [sessGroupLink, setSessGroupLink] = useState('');
  const [isStartingGroup, setIsStartingGroup] = useState(false);

  // Uploaded Notes (Drive) State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteCategory, setNoteCategory] = useState<string>('Lecture Notes');
  const [noteStudentId, setNoteStudentId] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string; dataUrl: string } | null>(null);
  const [isUploadingNote, setIsUploadingNote] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesFilterType, setNotesFilterType] = useState('ALL');
  const [previewNote, setPreviewNote] = useState<UploadedNote | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Coding & Student Progress State
  const [codingProgressList, setCodingProgressList] = useState<any[]>([]);
  const [selectedStudentProg, setSelectedStudentProg] = useState<any | null>(null);
  const [inspectedProblem, setInspectedProblem] = useState<any | null>(null);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);
  const [isLoadingCoding, setIsLoadingCoding] = useState(false);

  // Authoring New Coding Problem Form
  const [newProbTitle, setNewProbTitle] = useState('');
  const [newProbDesc, setNewProbDesc] = useState('');
  const [newProbDifficulty, setNewProbDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newProbTopic, setNewProbTopic] = useState('Algorithms & Data Structures');
  const [newProbCategory, setNewProbCategory] = useState('Core Problem Solving');
  const [newProbInputFormat, setNewProbInputFormat] = useState('Single integer / array input');
  const [newProbOutputFormat, setNewProbOutputFormat] = useState('Computed solution value');
  const [newProbConstraints, setNewProbConstraints] = useState('1 <= N <= 10^5');
  const [newProbSampleInput, setNewProbSampleInput] = useState('5');
  const [newProbSampleOutput, setNewProbSampleOutput] = useState('15');
  const [newProbStarterJava, setNewProbStarterJava] = useState('import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write code here\n    }\n}');
  const [newProbStarterPython, setNewProbStarterPython] = useState('def solve():\n    # Write code here\n    pass\n\nif __name__ == "__main__":\n    solve()');
  const [newProbStarterCpp, setNewProbStarterCpp] = useState('#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}');
  const [newProbStarterJs, setNewProbStarterJs] = useState('function solve() {\n    // Write code here\n}');
  const [newProbTestCases, setNewProbTestCases] = useState<{ input: string; expectedOutput: string }[]>([
    { input: '5', expectedOutput: '15' }
  ]);

  const fetchCodingProgress = async () => {
    setIsLoadingCoding(true);
    try {
      const res = await fetch('/api/mentor/coding/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : (data.data?.students || []);
        setCodingProgressList(list);
        if (list.length > 0) {
          setSelectedStudentProg((prev: any) => {
            if (!prev) return list[0];
            const updated = list.find((s: any) => s.studentId === prev.studentId);
            return updated || list[0];
          });
        }
      }
    } catch (e) {
      console.error('Failed to load mentor coding progress:', e);
    } finally {
      setIsLoadingCoding(false);
    }
  };

  const fetchMentorData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, apprRes, tasksRes, fbRes, sessRes, notesRes, reqsRes, codingRes] = await Promise.all([
        fetch('/api/mentor/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/approvals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/feedback', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/notes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/mentor/coding/progress', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const apprData = await apprRes.json();
      const tasksData = await tasksRes.json();
      const fbData = await fbRes.json();
      const sessData = await sessRes.json();
      const notesData = await notesRes.json();
      const reqsData = await reqsRes.json();
      const codingData = await codingRes.json();

      if (dashData.success) {
        setDashboardData(dashData.data);
        if (dashData.data?.assignedStudents?.length > 0 && !taskStudentId) {
          const firstId = dashData.data.assignedStudents[0].studentId || dashData.data.assignedStudents[0].userId;
          setTaskStudentId(firstId);
          setFbStudentId(firstId);
          setSessStudentId(firstId);
        }
      }
      if (apprData.success && Array.isArray(apprData.data)) {
        setApprovals(apprData.data);
      }
      if (tasksData.success && Array.isArray(tasksData.data)) {
        setTasksList(tasksData.data);
      }
      if (fbData.success && Array.isArray(fbData.data)) {
        setFeedbacksList(fbData.data);
      }
      if (sessData.success && Array.isArray(sessData.data)) {
        setSessionsList(sessData.data);
      }
      if (notesData.success && Array.isArray(notesData.data)) {
        setNotesList(notesData.data);
      }
      if (reqsData.success && Array.isArray(reqsData.data)) {
        setMentorshipRequests(reqsData.data);
      }
      if (codingData.success) {
        const list = Array.isArray(codingData.data) ? codingData.data : (codingData.data?.students || []);
        setCodingProgressList(list);
        if (list.length > 0) {
          setSelectedStudentProg((prev: any) => prev || list[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load mentor suite data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, [token]);

  // File selection for Uploaded Notes Drive
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    let detectedType = 'pdf';
    if (['ppt', 'pptx'].includes(extension)) detectedType = 'ppt';
    else if (['doc', 'docx'].includes(extension)) detectedType = 'doc';
    else if (['txt', 'md'].includes(extension)) detectedType = 'txt';
    else if (['zip', 'rar', 'tar'].includes(extension)) detectedType = 'zip';
    else if (['js', 'ts', 'java', 'py', 'cpp', 'c', 'sql'].includes(extension)) detectedType = 'code';

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(1)} MB` 
      : `${Math.round(file.size / 1024) || 1} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: formattedSize,
        type: detectedType,
        dataUrl: reader.result as string
      });
      if (!noteTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNoteTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      addToast('Please provide a document title', 'error');
      return;
    }
    if (!selectedFile) {
      addToast('Please choose a notes file to upload (PDF, PPT, DOC, etc.)', 'error');
      return;
    }

    setIsUploadingNote(true);
    try {
      const res = await fetch('/api/mentor/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle.trim(),
          description: noteDesc.trim(),
          topicCategory: noteCategory,
          targetStudentId: noteStudentId,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          fileDataUrl: selectedFile.dataUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`✓ "${selectedFile.name}" uploaded to Drive! Mentees can now access and download it.`, 'success');
        setNoteTitle('');
        setNoteDesc('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to upload document', 'error');
      }
    } catch {
      addToast('Network error while uploading document to Drive', 'error');
    } finally {
      setIsUploadingNote(false);
    }
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from Drive? Mentees will no longer be able to download it.`)) return;
    try {
      const res = await fetch(`/api/mentor/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Removed "${title}" from Drive`, 'success');
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to delete note', 'error');
      }
    } catch {
      addToast('Network error while deleting note', 'error');
    }
  };

  const handleDownloadFile = (note: UploadedNote) => {
    try {
      const element = document.createElement('a');
      if (note.fileDataUrl && note.fileDataUrl.startsWith('data:')) {
        element.setAttribute('href', note.fileDataUrl);
      } else {
        const fallbackText = `${note.title}\nPrepared by ${note.mentorName} (${note.mentorCode || 'MT0001'})\n\n${note.description || 'Instructional material.'}`;
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

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          setRecordedDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      addToast('Microphone access denied. Using synthetic voice option.', 'error');
      // Synthetic fallback audio
      setRecordedAudioUrl('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      setRecordedDuration(12);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const togglePreviewAudio = () => {
    if (!recordedAudioUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(recordedAudioUrl);
      previewAudioRef.current.onended = () => setIsPlayingRecorded(false);
    }
    if (isPlayingRecorded) {
      previewAudioRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingRecorded(true);
    }
  };

  // Handle Approve Session / Task
  const handleApproveSession = async (status: 'APPROVED' | 'PENDING') => {
    if (!selectedApproval) return;
    setIsSubmittingReview(true);

    try {
      const payload: any = {
        status,
        mentorNotes: mentorNotes.trim() || 'Verified by Faculty Mentor. Approved for institutional placement records.'
      };

      if (recordedAudioUrl) {
        payload.mentorVoiceNoteUrl = recordedAudioUrl;
        payload.mentorVoiceNoteDuration = recordedDuration || 15;
      }

      const res = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        addToast(
          status === 'APPROVED'
            ? '✓ Verified! Official Green Tick certificate granted to candidate.'
            : 'Session feedback updated.',
          'success'
        );
        setSelectedApproval(null);
        setMentorNotes('');
        setRecordedAudioUrl(null);
        setRecordedDuration(0);
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to update approval status', 'error');
      }
    } catch {
      addToast('Network error while certifying session', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Assign Task
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskStudentId || !taskTitle) return;
    setIsAssigningTask(true);
    try {
      const res = await fetch('/api/mentor/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: taskStudentId,
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate,
          priority: taskPriority
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Task "${taskTitle}" dispatched to student.`, 'success');
        setTaskTitle('');
        setTaskDesc('');
        fetchMentorData();
      }
    } catch {
      addToast('Failed to assign task', 'error');
    } finally {
      setIsAssigningTask(false);
    }
  };

  // Handle Submit Feedback
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbStudentId || !fbComment) return;
    setIsSubmittingFb(true);
    try {
      const res = await fetch('/api/mentor/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: fbStudentId,
          category: fbCategory,
          rating: fbRating,
          comment: fbComment
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Feedback successfully recorded in student report.', 'success');
        setFbComment('');
        fetchMentorData();
      }
    } catch {
      addToast('Failed to record feedback', 'error');
    } finally {
      setIsSubmittingFb(false);
    }
  };

  // Handle Mentorship Requests (Accept / Decline)
  const handleAcceptMentorshipRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/mentor/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('✓ Mentorship request accepted! Student added to cohort. You can now see their progress and conduct exams.', 'success');
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to accept request', 'error');
      }
    } catch {
      addToast('Network error accepting request', 'error');
    }
  };

  const handleDeclineMentorshipRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this student request?')) return;
    try {
      const res = await fetch(`/api/mentor/requests/${requestId}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Mentorship request declined.', 'info');
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to decline request', 'error');
      }
    } catch {
      addToast('Network error declining request', 'error');
    }
  };

  // Handle Add Coding Question (Mentor can author any coding problem for student practice)
  const handleAddCodingProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbTitle.trim()) {
      addToast('Problem title is required', 'error');
      return;
    }
    if (!newProbDesc.trim()) {
      addToast('Problem description is required', 'error');
      return;
    }

    setIsSubmittingProblem(true);
    try {
      const res = await fetch('/api/mentor/coding/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newProbTitle.trim(),
          description: newProbDesc.trim(),
          difficulty: newProbDifficulty,
          topic: newProbTopic.trim(),
          category: newProbCategory.trim(),
          inputFormat: newProbInputFormat.trim(),
          outputFormat: newProbOutputFormat.trim(),
          constraints: newProbConstraints.trim(),
          sampleInput: newProbSampleInput.trim(),
          sampleOutput: newProbSampleOutput.trim(),
          starterCode: {
            java: newProbStarterJava,
            python: newProbStarterPython,
            cpp: newProbStarterCpp,
            javascript: newProbStarterJs
          },
          testCases: newProbTestCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('🎉 Coding question published to IDE! Students can now practice it.', 'success');
        setShowAddProblemModal(false);
        setNewProbTitle('');
        setNewProbDesc('');
        setNewProbSampleInput('');
        setNewProbSampleOutput('');
        fetchCodingProgress();
      } else {
        addToast(data.message || 'Failed to add coding problem', 'error');
      }
    } catch {
      addToast('Network error while authoring coding problem', 'error');
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  // Block 1: Handle Start or Schedule 1-on-1 Session
  const handleOneToOneSession = async (e: React.FormEvent, isLiveNow: boolean) => {
    e.preventDefault();
    const effectiveMentorName = sess1MentorName.trim() || user?.fullName || 'Faculty Mentor';
    if (!sess1Title.trim()) {
      addToast('Please enter a session topic for 1-on-1 guidance', 'error');
      return;
    }
    if (!sessStudentId) {
      addToast('Please select a student mentee for the 1-on-1 session', 'error');
      return;
    }

    setIsStarting1on1(true);
    try {
      const res = await fetch('/api/mentor/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionType: 'ONE_TO_ONE',
          mentorName: effectiveMentorName,
          studentId: sessStudentId,
          title: sess1Title.trim(),
          scheduledAt: isLiveNow ? new Date().toISOString() : (sess1Date || new Date().toISOString()),
          durationMinutes: Number(sess1Duration) || 45,
          meetingLink: sess1Link.trim(),
          isLiveNow
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          isLiveNow
            ? '🔴 Live 1-on-1 session started! Meeting link shared with student in Mentor Sessions.'
            : '✓ 1-on-1 mentoring session scheduled! Student received link.',
          'success'
        );
        setSess1Title('');
        setSess1Link('');
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to create 1-on-1 session', 'error');
      }
    } catch {
      addToast('Network error creating 1-on-1 session', 'error');
    } finally {
      setIsStarting1on1(false);
    }
  };

  // Block 2: Handle Start or Schedule Group Session
  const handleGroupSession = async (e: React.FormEvent, isLiveNow: boolean) => {
    e.preventDefault();
    const effectiveMentorName = sessGroupMentorName.trim() || user?.fullName || 'Faculty Mentor';
    if (!sessGroupTitle.trim()) {
      addToast('Please enter a session topic for group mentoring', 'error');
      return;
    }

    setIsStartingGroup(true);
    try {
      const res = await fetch('/api/mentor/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionType: 'GROUP',
          mentorName: effectiveMentorName,
          studentId: 'all',
          title: sessGroupTitle.trim(),
          scheduledAt: isLiveNow ? new Date().toISOString() : (sessGroupDate || new Date().toISOString()),
          durationMinutes: Number(sessGroupDuration) || 60,
          meetingLink: sessGroupLink.trim(),
          isLiveNow
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          isLiveNow
            ? '🔴 Live Group session started! Meeting link broadcast to all mentees in Mentor Sessions.'
            : '✓ Group mentoring session scheduled! All mentees received the link.',
          'success'
        );
        setSessGroupTitle('');
        setSessGroupLink('');
        fetchMentorData();
      } else {
        addToast(data.message || 'Failed to create group session', 'error');
      }
    } catch {
      addToast('Network error creating group session', 'error');
    } finally {
      setIsStartingGroup(false);
    }
  };

  const assignedStudents = dashboardData?.assignedStudents || [];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-[10px] uppercase font-bold tracking-widest">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              Institutional Faculty Suite
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] text-amber-300 font-mono text-[11px] font-bold tracking-wider shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Faculty ID: {user?.code || 'MT0001'}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A]">
            Mentor Portal, <br />
            <span className="italic font-normal">{user?.fullName || 'Faculty Lead'}</span>
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 max-w-xl mt-2">
            Inspect submissions, certify candidate sessions with Green Ticks, host 1-on-1 guidance calls, and upload notes, PPTs, and PDF guides to Drive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMentorData}
            disabled={isLoading}
            className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all"
            title="Refresh mentor records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-4 py-2 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider">
            {user?.mentorProfile?.specialization || 'System Design & DSA'}
          </div>
        </div>
      </header>

      {/* Mentor Portal Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1A1A1A]/10">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'overview'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => handleTabChange('approvals')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'approvals'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Approvals ({approvals.length})
        </button>
        <button
          onClick={() => handleTabChange('students')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'students'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Mentees ({assignedStudents.length})
        </button>
        <button
          onClick={() => handleTabChange('coding')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'coding'
              ? 'bg-purple-800 text-white shadow-md'
              : 'bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-purple-600" />
          Coding & Student Progress
        </button>
        <button
          onClick={() => handleTabChange('tasks')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'tasks'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Tasks ({tasksList.length})
        </button>
        <button
          onClick={() => handleTabChange('feedback')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'feedback'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Feedback
        </button>
        <button
          onClick={() => handleTabChange('sessions')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'sessions'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
          Sessions & Notes
        </button>
        {setParentTab && (
          <button
            onClick={() => setParentTab('mentor-exams')}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            Exams Portal
          </button>
        )}
      </nav>

      {/* OVERVIEW SECTION (DEFAULT WHEN OPENING MENTOR OVERVIEW) */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive Faculty Banner */}
          <div className="p-8 rounded-[32px] bg-[#1A1A1A] text-[#F9F7F2] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-mono font-bold">
                  Code: {user?.code || 'MT0001'}
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-60">Verified Institutional Mentor</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white">
                Welcome back, {user?.fullName || 'Faculty Lead'}
              </h2>
              <p className="text-xs text-[#F9F7F2]/70 max-w-xl">
                All mentor operations are accessible directly from your left navigation menu. You can inspect submissions, assign coding tasks, give feedback, schedule live sessions, and upload lecture notes and PPTs to Drive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => handleTabChange('sessions')}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
              >
                <FolderArchive className="w-4 h-4" />
                Sessions & Notes
              </button>
              {setParentTab && (
                <button
                  onClick={() => setParentTab('mentor-exams')}
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Conduct Exams
                </button>
              )}
              <button
                onClick={() => handleTabChange('approvals')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Approvals ({approvals.length})
              </button>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Mentoring Sessions */}
            <div className="p-6 rounded-[28px] bg-white border border-[#1A1A1A]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-serif italic text-lg text-[#1A1A1A]">Upcoming Sessions</h3>
                </div>
                <button
                  onClick={() => handleTabChange('sessions')}
                  className="text-[11px] uppercase font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  Manage Sessions <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {sessionsList.length === 0 ? (
                <p className="text-xs text-[#1A1A1A]/60 py-4 italic">No scheduled live mentoring calls yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {sessionsList.slice(0, 3).map((sess) => (
                    <div key={sess.id} className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{sess.title}</p>
                        <p className="text-[11px] text-[#1A1A1A]/60">Mentee: {sess.studentName} • {new Date(sess.scheduledAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        {sess.durationMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drive Uploaded Notes Snapshot */}
            <div className="p-6 rounded-[28px] bg-white border border-[#1A1A1A]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-amber-600" />
                  <h3 className="font-serif italic text-lg text-[#1A1A1A]">Uploaded Notes (Drive)</h3>
                </div>
                <button
                  onClick={() => handleTabChange('sessions')}
                  className="text-[11px] uppercase font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  Open Drive <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {notesList.length === 0 ? (
                <p className="text-xs text-[#1A1A1A]/60 py-4 italic">No notes uploaded yet. Head to Sessions Schedule to upload notes.</p>
              ) : (
                <div className="space-y-2.5">
                  {notesList.slice(0, 3).map((note) => (
                    <div key={note.id} className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] ${
                          note.fileType === 'pdf' ? 'bg-rose-100 text-rose-800' :
                          note.fileType === 'ppt' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {note.fileType.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A1A1A] line-clamp-1">{note.title}</p>
                          <p className="text-[11px] text-[#1A1A1A]/60">{note.fileName} ({note.fileSize})</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(note)}
                        className="p-2 rounded-full hover:bg-white text-[#1A1A1A] border border-transparent hover:border-[#1A1A1A]/20 transition-all"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: STUDENT APPROVALS & INSPECTION */}
      {currentTab === 'approvals' && (
        <div className="space-y-8">
          {/* SECTION A: STUDENT MENTORSHIP REQUESTS (Add Mentor by Mentor ID) */}
          <div className="bg-white border-2 border-[#1A1A1A]/20 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[10px] uppercase font-bold tracking-widest mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  Student Mentorship Invitations
                </div>
                <h2 className="text-2xl font-serif italic text-[#1A1A1A]">
                  Student Mentorship Requests ({mentorshipRequests.length})
                </h2>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Students request mentorship by entering your Mentor ID (<b>{user?.code || 'MT0001'}</b>) in their portal. Accepting a request enables you to view their progress, test attempts, and mock interviews.
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1A1A1A] text-white rounded-full">
                {mentorshipRequests.filter(r => r.status === 'PENDING').length} Pending
              </span>
            </div>

            {mentorshipRequests.length === 0 ? (
              <div className="p-8 text-center bg-[#F9F7F2] border border-[#1A1A1A]/10 rounded-2xl text-xs text-[#1A1A1A]/60 italic space-y-1">
                <p>No new mentorship connection requests.</p>
                <p className="text-[11px] opacity-75">
                  When a student enters your Mentor ID (<code>{user?.code || 'MT0001'}</code>) in their Mentor section, their invitation will appear here for you to accept or decline.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {mentorshipRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isAccepted = req.status === 'ACCEPTED';

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isPending
                          ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                          : isAccepted
                          ? 'bg-emerald-50/30 border-emerald-300'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isAccepted
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2]">
                            ID: {req.studentCode || 'ST0001'}
                          </span>
                          <span className="text-xs text-[#1A1A1A]/60">
                            Requested: {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                          {req.studentName} <span className="font-normal font-sans text-xs text-[#1A1A1A]/60">({req.studentEmail})</span>
                        </h3>

                        <p className="text-xs text-[#1A1A1A]/80">
                          {req.studentCollege || 'SRM Institute of Science and Technology'} • {req.studentBranch || 'Computer Science'} • Target: <b>{req.studentTargetRole || 'SDE'}</b>
                        </p>

                        {req.message && (
                          <p className="text-xs italic text-[#1A1A1A]/70 pt-1">
                            "{req.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleAcceptMentorshipRequest(req.id)}
                              className="flex-1 md:flex-initial px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleDeclineMentorshipRequest(req.id)}
                              className="flex-1 md:flex-initial px-4 py-2.5 rounded-full border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider transition-all"
                            >
                              Decline
                            </button>
                          </>
                        ) : isAccepted ? (
                          <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full border border-emerald-300 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Accepted (Cohort Member)
                          </div>
                        ) : (
                          <span className="text-xs text-rose-700 font-semibold px-3 py-1 bg-rose-50 rounded-full border border-rose-200">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: CANDIDATE SUBMISSIONS AWAITING CERTIFICATION */}
          <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Candidate Submissions Awaiting Certification</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Inspect AI mock interview recordings, code submissions, and certify with verified Green Ticks.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1A1A1A]/5 rounded-full text-[#1A1A1A]">
              {approvals.length} Submissions
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#1A1A1A]/20 rounded-3xl space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">All Student Submissions Reviewed</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                When students complete AI mock interviews or submit coding labs, they will appear here for your review and Green Tick sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvals.map((item) => {
                const isPending = item.status === 'PENDING';
                return (
                  <div
                    key={item.id}
                    className={`border rounded-3xl p-6 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                      isPending
                        ? 'border-[#1A1A1A]/30 bg-white hover:border-[#1A1A1A]'
                        : 'border-emerald-600/30 bg-emerald-50/20'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        }`}>
                          {item.status}
                        </span>

                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                          {item.itemType}
                        </span>

                        {item.score !== undefined && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                            Score: {item.score}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">{item.title}</h3>
                      <p className="text-xs text-[#1A1A1A]/70">
                        Student: <b className="text-[#1A1A1A]">{item.studentName}</b> • Submitted {new Date(item.submittedAt).toLocaleDateString()}
                      </p>

                      {item.mentorNotes && (
                        <div className="mt-2 p-3 rounded-2xl bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs italic text-[#1A1A1A]">
                          <span className="font-semibold not-italic block text-[10px] text-emerald-800 uppercase">Your Notes:</span>
                          "{item.mentorNotes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => {
                          setSelectedApproval(item);
                          setMentorNotes(item.mentorNotes || '');
                          setRecordedAudioUrl(item.mentorVoiceNoteUrl || null);
                          setRecordedDuration(item.mentorVoiceNoteDuration || 0);
                        }}
                        className={`w-full md:w-auto px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isPending
                            ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                            : 'bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        {isPending ? 'Inspect & Approve' : 'Edit Certification'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNED CANDIDATES */}
      {currentTab === 'students' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Assigned Student Cohort</h2>
              <p className="text-xs text-[#1A1A1A]/60">Track candidate test attempts, coding performance, and readiness scores.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedStudents.map((s: any) => (
              <div key={s.studentId || s.userId} className="p-6 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center font-serif text-xl font-bold">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">{s.name}</h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white">
                          {s.code || 'ST0001'}
                        </span>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/60 font-mono">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Readiness: {s.readinessScore || 85}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-[#1A1A1A]/10 text-center">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">Branch</span>
                    <span className="text-xs font-bold text-[#1A1A1A]">{s.branch || 'CSE'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">Tests Taken</span>
                    <span className="text-xs font-bold text-[#1A1A1A]">{s.testsTaken || 4}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">Coding Solved</span>
                    <span className="text-xs font-bold text-[#1A1A1A]">{s.codingSolved || 12}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setTaskStudentId(s.studentId || s.userId);
                      handleTabChange('tasks');
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-[#1A1A1A] text-[#F9F7F2] text-[11px] font-bold uppercase tracking-wider hover:bg-[#333] transition-all text-center"
                  >
                    Assign Task
                  </button>
                  <button
                    onClick={() => {
                      setFbStudentId(s.studentId || s.userId);
                      handleTabChange('feedback');
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-white border border-[#1A1A1A]/30 text-[#1A1A1A] text-[11px] font-bold uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all text-center"
                  >
                    Give Feedback
                  </button>
                  <button
                    onClick={() => {
                      setSessStudentId(s.studentId || s.userId);
                      handleTabChange('sessions');
                    }}
                    className="p-2.5 rounded-2xl border border-[#1A1A1A]/30 hover:bg-[#1A1A1A]/5 text-[#1A1A1A]"
                    title="Schedule Mentoring Session"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CODING LAB & STUDENT PROGRESS MONITOR */}
      {currentTab === 'coding' && (
        <div className="space-y-8">
          {/* Top Banner */}
          <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#1A1A1A] via-[#241738] to-[#2D1B4E] text-[#F9F7F2] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] uppercase font-mono font-bold">
                  IDE Problem Authoring & Inspection
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-60">Faculty Coding Control</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white">
                Student Coding & Error Progress Monitor
              </h2>
              <p className="text-xs text-[#F9F7F2]/70 max-w-2xl">
                Students practice in the Coding Lab with real-time AI error detection that identifies syntax/logical flaws without giving away solutions. Track each candidate's code submissions, completion status, and author custom coding problems anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddProblemModal(true)}
                className="px-6 py-3 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Coding Question
              </button>
              <button
                onClick={fetchCodingProgress}
                disabled={isLoadingCoding}
                className="px-4 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2"
                title="Refresh student progress data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCoding ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold block">Tracked Mentees</span>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A1A] mt-1">{codingProgressList.length}</p>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Assigned students practicing in IDE</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold block">Problems Solved</span>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700 mt-1">
                {codingProgressList.reduce((acc, curr) => acc + (curr.completedProblemsCount || 0), 0)}
              </p>
              <p className="text-[11px] text-emerald-800/60 mt-1">Total questions completed by mentees</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold block">Avg Completion</span>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-purple-700 mt-1">
                {codingProgressList.length > 0
                  ? Math.round(codingProgressList.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / codingProgressList.length)
                  : 0}%
              </p>
              <p className="text-[11px] text-purple-800/60 mt-1">Average problem completion rate</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold block">Available IDE Questions</span>
              <p className="text-2xl sm:text-3xl font-bold font-serif text-indigo-700 mt-1">
                {codingProgressList[0]?.totalProblems || 8}
              </p>
              <p className="text-[11px] text-indigo-800/60 mt-1">Standard 8 + Mentor authored questions</p>
            </div>
          </div>

          {/* Student Coding Progress & Problem Breakdown */}
          {codingProgressList.length === 0 ? (
            <div className="p-12 text-center rounded-[32px] bg-white border border-[#1A1A1A]/10 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">No Student Progress Data Yet</h3>
              <p className="text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
                Students will appear here as they practice coding questions in their Coding Lab. You can also author new problems anytime using the button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Student List Selector */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Select Mentee</h3>
                  <span className="text-[11px] text-[#1A1A1A]/50">{codingProgressList.length} Students</span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {codingProgressList.map((st: any) => {
                    const isSelected = selectedStudentProg?.studentId === st.studentId;
                    return (
                      <div
                        key={st.studentId}
                        onClick={() => setSelectedStudentProg(st)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900 text-white border-purple-800 shadow-md ring-2 ring-purple-600'
                            : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-[#1A1A1A]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold font-serif">{st.studentName}</h4>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-purple-800 text-purple-200' : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/70'}`}>
                                {st.studentCode}
                              </span>
                            </div>
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-purple-200' : 'text-[#1A1A1A]/60'}`}>
                              {st.targetRole || 'Software Development Engineer'}
                            </p>
                          </div>
                          <span className={`text-xs font-bold font-mono px-2 py-1 rounded-xl ${
                            isSelected ? 'bg-purple-800 text-purple-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {st.completedProblemsCount || 0}/{st.totalProblems || 8}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] uppercase font-semibold">
                            <span className={isSelected ? 'text-purple-300' : 'text-[#1A1A1A]/50'}>Problem Completion</span>
                            <span className={isSelected ? 'text-purple-200' : 'text-purple-900'}>{st.completionRate || 0}%</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isSelected ? 'bg-purple-950' : 'bg-[#1A1A1A]/10'}`}>
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${st.completionRate || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Problem Breakdown for Selected Student */}
              <div className="lg:col-span-8 bg-white border border-[#1A1A1A]/10 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
                {selectedStudentProg ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A1A1A]/10 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold font-serif text-[#1A1A1A]">
                            {selectedStudentProg.studentName}'s Coding Record
                          </h3>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1A1A1A] text-white">
                            {selectedStudentProg.studentCode}
                          </span>
                        </div>
                        <p className="text-xs text-[#1A1A1A]/60 mt-1">
                          {selectedStudentProg.college || 'Engineering College'} • {selectedStudentProg.branch || 'CSE'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 block">Solved Rate</span>
                          <span className="text-lg font-bold text-emerald-700">
                            {selectedStudentProg.completedProblemsCount || 0} / {selectedStudentProg.totalProblems || 8} ({selectedStudentProg.completionRate || 0}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Problem list */}
                    <div className="space-y-3">
                      {selectedStudentProg.problemBreakdown?.map((prob: any, idx: number) => (
                        <div
                          key={prob.problemId}
                          className="p-4 rounded-2xl border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#1A1A1A]/40">#{idx + 1}</span>
                              <h4 className="text-sm font-bold text-[#1A1A1A]">{prob.problemTitle}</h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                prob.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prob.difficulty === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {prob.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#1A1A1A]/60">
                              <span>Topic: {prob.topic || 'Algorithms'}</span>
                              {prob.attemptsCount > 0 && (
                                <span>• {prob.attemptsCount} AI Check attempts</span>
                              )}
                              {prob.completedAt && (
                                <span>• Solved {new Date(prob.completedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {prob.isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                Completed
                              </span>
                            ) : prob.attemptsCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                Not Attempted
                              </span>
                            )}

                            {prob.lastCode ? (
                              <button
                                onClick={() => setInspectedProblem({
                                  ...prob,
                                  studentName: selectedStudentProg.studentName,
                                  studentCode: selectedStudentProg.studentCode
                                })}
                                className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect Code
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-xs font-medium cursor-not-allowed"
                              >
                                No Code Yet
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-[#1A1A1A]/50">Select a student mentee to inspect coding progress.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGN DIRECT TASKS */}
      {currentTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#1A1A1A] text-[#F9F7F2] rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-[#333] pb-4">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Direct Action</span>
              <h2 className="text-2xl font-serif italic text-white mt-1">Assign Mentoring Task</h2>
              <p className="text-xs text-[#F9F7F2]/70 mt-1">
                Prescribe specific algorithmic drills or system design targets.
              </p>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">
                  Select Candidate
                </label>
                <select
                  value={taskStudentId}
                  onChange={(e) => setTaskStudentId(e.target.value)}
                  className="w-full bg-[#262626] border border-[#333] rounded-2xl px-4 py-3 text-xs text-[#F9F7F2] focus:outline-none"
                >
                  {assignedStudents.map((s: any) => (
                    <option key={s.studentId || s.userId} value={s.studentId || s.userId}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Solve 5 Dynamic Programming Knapsack Problems"
                  className="w-full bg-[#262626] border border-[#333] rounded-2xl px-4 py-3 text-xs text-[#F9F7F2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-[#262626] border border-[#333] rounded-2xl px-3 py-2.5 text-xs text-[#F9F7F2]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#262626] border border-[#333] rounded-2xl px-3 py-2 text-xs text-[#F9F7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">
                  Instructions & Deliverables
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Include requirements and expected submission details..."
                  className="w-full bg-[#262626] border border-[#333] rounded-2xl p-4 text-xs text-[#F9F7F2] focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isAssigningTask}
                className="w-full py-3.5 rounded-full bg-[#F9F7F2] text-[#1A1A1A] text-xs font-semibold uppercase tracking-widest hover:bg-white transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {isAssigningTask ? 'Dispatching...' : 'Assign to Candidate'}
              </button>
            </form>
          </div>

          {/* Assigned Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-serif italic text-[#1A1A1A]">Dispatched Tasks Log</h3>
            <div className="space-y-3">
              {tasksList.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'High' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {t.priority} Priority
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/60">Due: {t.dueDate || 'Next Week'}</span>
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#1A1A1A] mt-1">{t.title}</h4>
                      <p className="text-xs text-[#1A1A1A]/70">Candidate: <b>{t.studentName}</b></p>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      t.status === 'Completed' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  {t.description && <p className="text-xs text-[#1A1A1A]/70 italic">{t.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT FEEDBACK */}
      {currentTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white border border-[#1A1A1A]/20 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-blue-700 font-semibold">Evaluation Record</span>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A] mt-1">Submit Student Feedback</h2>
              <p className="text-xs text-[#1A1A1A]/60 mt-1">
                Provide structured evaluation notes and domain ratings.
              </p>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Candidate
                </label>
                <select
                  value={fbStudentId}
                  onChange={(e) => setFbStudentId(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none"
                >
                  {assignedStudents.map((s: any) => (
                    <option key={s.studentId || s.userId} value={s.studentId || s.userId}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Domain Category
                </label>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value as any)}
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none"
                >
                  <option value="Mock Interview">Mock Interview & Communication</option>
                  <option value="Coding Problem">Coding & Data Structures</option>
                  <option value="Aptitude">Quantitative & Logic</option>
                  <option value="Soft Skills">Soft Skills & HR Readiness</option>
                  <option value="General">Overall Placement Readiness</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Rating (1-5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFbRating(star)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                  Constructive Feedback Note *
                </label>
                <textarea
                  rows={4}
                  required
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  placeholder="Detail strengths, areas for improvement, and action steps..."
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl p-4 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFb}
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-all"
              >
                {isSubmittingFb ? 'Saving...' : 'Record Feedback'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-serif italic text-[#1A1A1A]">Candidate Feedback Archive</h3>
            <div className="space-y-3">
              {feedbacksList.map((fb) => (
                <div key={fb.id} className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                        {fb.category}
                      </span>
                      <p className="text-xs text-[#1A1A1A]/60 mt-1">Given on {new Date(fb.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#1A1A1A] italic leading-relaxed">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SESSIONS SCHEDULE & UPLOADED NOTES DRIVE */}
      {currentTab === 'sessions' && (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] uppercase font-bold tracking-widest mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Live Sessions & Document Distribution
              </div>
              <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Sessions Schedule & Uploaded Notes</h2>
              <p className="text-xs text-[#1A1A1A]/60 mt-1 max-w-2xl">
                Schedule 1-on-1 code reviews and mock interview video calls. Use the <b>Uploaded Notes</b> column below to upload PPT, PDF, and revision notes to Drive for your mentees.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1A1A1A] text-[#F9F7F2] rounded-full">
                Drive: {notesList.length} files
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COLUMN 1: SESSIONS SCHEDULE (TWO BLOCKS: ONE-TO-ONE & GROUP) (6 COLS) */}
            <div className="lg:col-span-6 space-y-6">
              {/* BLOCK 1: ONE TO ONE SESSION */}
              <div className="bg-white border-2 border-emerald-600/30 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">Block 1</span>
                    <h3 className="text-xl font-serif italic text-[#1A1A1A]">One to One Session</h3>
                    <p className="text-[11px] text-[#1A1A1A]/60">
                      Personalized 1-on-1 mock interview or code review with assigned mentee.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    1-on-1 Call
                  </span>
                </div>

                <form className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Mentor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={sess1MentorName || user?.fullName || ''}
                        onChange={(e) => setSess1MentorName(e.target.value)}
                        placeholder="Mentor Name"
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Select Mentee *
                      </label>
                      <select
                        value={sessStudentId}
                        onChange={(e) => setSessStudentId(e.target.value)}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                      >
                        {assignedStudents.map((s: any) => (
                          <option key={s.studentId || s.userId} value={s.studentId || s.userId}>
                            {s.name} ({s.code || 'ST0001'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Session Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={sess1Title}
                      onChange={(e) => setSess1Title(e.target.value)}
                      placeholder="e.g. Graph Algorithms & Mock Round Review"
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={sess1Date}
                        onChange={(e) => setSess1Date(e.target.value)}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Duration (min) *</label>
                      <input
                        type="number"
                        value={sess1Duration}
                        onChange={(e) => setSess1Duration(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Session Video Link (Google Meet / Zoom)
                    </label>
                    <input
                      type="text"
                      value={sess1Link}
                      onChange={(e) => setSess1Link(e.target.value)}
                      placeholder="Leave empty to auto-generate Google Meet link"
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isStarting1on1}
                      onClick={(e) => handleOneToOneSession(e, true)}
                      className="py-2.5 px-3 rounded-full bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Start Live Now
                    </button>
                    <button
                      type="button"
                      disabled={isStarting1on1}
                      onClick={(e) => handleOneToOneSession(e, false)}
                      className="py-2.5 px-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      Schedule 1-on-1 Session
                    </button>
                  </div>
                </form>
              </div>

              {/* BLOCK 2: GROUP SESSION */}
              <div className="bg-white border-2 border-indigo-600/30 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-indigo-700 font-bold">Block 2</span>
                    <h3 className="text-xl font-serif italic text-[#1A1A1A]">Group Session</h3>
                    <p className="text-[11px] text-[#1A1A1A]/60">
                      Cohort masterclass, system design webinar, or group Q&A for all mentees.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                    Group Class
                  </span>
                </div>

                <form className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Mentor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={sessGroupMentorName || user?.fullName || ''}
                        onChange={(e) => setSessGroupMentorName(e.target.value)}
                        placeholder="Mentor Name"
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        disabled
                        value="All Assigned Mentees (Cohort)"
                        className="w-full bg-[#EAE6DE] border border-[#1A1A1A]/15 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A] font-semibold opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Session Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={sessGroupTitle}
                      onChange={(e) => setSessGroupTitle(e.target.value)}
                      placeholder="e.g. Distributed Caching & High Availability Masterclass"
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={sessGroupDate}
                        onChange={(e) => setSessGroupDate(e.target.value)}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">Duration (min) *</label>
                      <input
                        type="number"
                        value={sessGroupDuration}
                        onChange={(e) => setSessGroupDuration(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3 py-2 text-xs text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Session Video Link (Google Meet / Zoom)
                    </label>
                    <input
                      type="text"
                      value={sessGroupLink}
                      onChange={(e) => setSessGroupLink(e.target.value)}
                      placeholder="Leave empty to auto-generate Google Meet link"
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-3.5 py-2 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isStartingGroup}
                      onClick={(e) => handleGroupSession(e, true)}
                      className="py-2.5 px-3 rounded-full bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Start Live Group Class
                    </button>
                    <button
                      type="button"
                      disabled={isStartingGroup}
                      onClick={(e) => handleGroupSession(e, false)}
                      className="py-2.5 px-3 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      Schedule Group Session
                    </button>
                  </div>
                </form>
              </div>

              {/* Scheduled Guidance Calls List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-lg font-serif italic text-[#1A1A1A] flex items-center justify-between">
                  <span>Active & Scheduled Sessions</span>
                  <span className="text-xs font-mono font-normal opacity-60">({sessionsList.length})</span>
                </h4>

                {sessionsList.length === 0 ? (
                  <div className="p-6 text-center bg-white border border-[#1A1A1A]/10 rounded-2xl text-xs text-[#1A1A1A]/60 italic">
                    No sessions scheduled yet. Use Block 1 or Block 2 above.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sessionsList.map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                                s.status === 'Live'
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              }`}>
                                {s.status === 'Live' ? '🔴 Live Now' : 'Scheduled'}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                                {s.sessionType === 'GROUP' ? 'Group Class' : '1-on-1'}
                              </span>
                              <span className="text-[10px] text-[#1A1A1A]/60">{s.durationMinutes} Mins</span>
                            </div>
                            <h5 className="text-sm font-serif font-bold text-[#1A1A1A] mt-1">{s.title}</h5>
                            <p className="text-xs text-[#1A1A1A]/70">
                              Target: <b>{s.sessionType === 'GROUP' ? 'All Mentees' : s.studentName}</b> • {new Date(s.scheduledAt).toLocaleString()}
                            </p>
                          </div>

                          {s.meetingLink && (
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-[10px] font-bold uppercase tracking-wider hover:bg-[#333] inline-flex items-center gap-1 shrink-0"
                            >
                              <Video className="w-3 h-3 text-emerald-400" />
                              Join Call
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: UPLOADED NOTES (FACULTY DRIVE) (6 COLS) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Drive Upload Box */}
              <div className="bg-white border-2 border-[#1A1A1A]/20 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-amber-700 text-[10px] uppercase font-bold tracking-widest">
                      <FolderArchive className="w-4 h-4 text-amber-600" />
                      Column: Uploaded Notes (Drive)
                    </div>
                    <h3 className="text-2xl font-serif italic text-[#1A1A1A] mt-0.5">Upload Notes, PPT, & PDF</h3>
                    <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                      Upload reference documents. Mentees under your guidance will instantly receive and download them in their portal.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold font-mono">
                    Drive Sync Active
                  </div>
                </div>

                <form onSubmit={handleUploadNote} className="space-y-4">
                  {/* File Picker Drag & Drop / Button */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1.5">
                      Select Notes / File to Upload (PPT, PDF, DOC, Code, TXT) *
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip,.rar,.java,.py,.cpp,.c,.sql,.json,.png,.jpg"
                      className="hidden"
                      id="mentor-file-upload-input"
                    />

                    <label
                      htmlFor="mentor-file-upload-input"
                      className="border-2 border-dashed border-[#1A1A1A]/20 hover:border-[#1A1A1A] bg-[#F9F7F2] hover:bg-[#F2EFE8] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                    >
                      <FileUp className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to Browse File or Drag & Drop'}
                      </span>
                      <span className="text-[10px] text-[#1A1A1A]/50 mt-1">
                        {selectedFile ? `${selectedFile.size} • Type: ${selectedFile.type.toUpperCase()}` : 'Supports PDF, PowerPoint (.ppt, .pptx), Word (.doc), Code files, etc.'}
                      </span>
                    </label>
                  </div>

                  {/* Document Title & Topic Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Document / Notes Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="e.g. Dynamic Programming Master Guide"
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                        Document Category
                      </label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A]"
                      >
                        <option value="Lecture Notes">Lecture Notes</option>
                        <option value="Presentation (PPT)">Presentation Slides (PPT)</option>
                        <option value="PDF Reference">PDF Reference & Handbook</option>
                        <option value="Code Samples">Code Samples & Blueprints</option>
                        <option value="Interview Questions">Interview Question Bank</option>
                        <option value="Other">Other Placement Notes</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Mentee Selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={noteStudentId}
                      onChange={(e) => setNoteStudentId(e.target.value)}
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A]"
                    >
                      <option value="all">All Assigned Students (Mentees)</option>
                      {assignedStudents.map((s: any) => (
                        <option key={s.studentId || s.userId} value={s.studentId || s.userId}>
                          Only for: {s.name} ({s.code || 'ST0001'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remarks / Brief Description */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#1A1A1A]/70 mb-1">
                      Faculty Remarks & Instructions for Students
                    </label>
                    <textarea
                      rows={2}
                      value={noteDesc}
                      onChange={(e) => setNoteDesc(e.target.value)}
                      placeholder="Add key highlights, exam weightage, or topics to focus on..."
                      className="w-full bg-[#F9F7F2] border border-[#1A1A1A]/20 rounded-2xl p-3 text-xs text-[#1A1A1A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingNote}
                    className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <FileUp className="w-4 h-4" />
                    {isUploadingNote ? 'Uploading to Drive...' : 'Upload Notes to Drive'}
                  </button>
                </form>
              </div>

              {/* Drive File Explorer & Library */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-amber-600" />
                      Uploaded Notes Drive Library
                    </h4>
                    <p className="text-[11px] text-[#1A1A1A]/60">Files synced in real-time with mentee student accounts.</p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-[#F9F7F2] p-1 rounded-2xl border border-[#1A1A1A]/10 text-[10px] font-bold">
                    {['ALL', 'PDF', 'PPT', 'DOCS'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setNotesFilterType(f)}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          notesFilterType === f ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                  <input
                    type="text"
                    value={notesSearch}
                    onChange={(e) => setNotesSearch(e.target.value)}
                    placeholder="Search notes by title, filename, or student..."
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-2xl pl-9 pr-4 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                {/* Files List */}
                {notesList.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#1A1A1A]/10 rounded-3xl space-y-2">
                    <FolderArchive className="w-8 h-8 mx-auto text-amber-600" />
                    <p className="font-bold text-sm text-[#1A1A1A]">No notes uploaded yet</p>
                    <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
                      Use the upload box above to share PPT slides, PDF cheatsheets, and coding notes with your students.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {notesList
                      .filter(note => {
                        const matchesSearch = !notesSearch ||
                          note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                          note.fileName.toLowerCase().includes(notesSearch.toLowerCase()) ||
                          (note.targetStudentName && note.targetStudentName.toLowerCase().includes(notesSearch.toLowerCase()));
                        if (!matchesSearch) return false;
                        if (notesFilterType === 'ALL') return true;
                        if (notesFilterType === 'PDF') return note.fileType === 'pdf';
                        if (notesFilterType === 'PPT') return note.fileType === 'ppt';
                        if (notesFilterType === 'DOCS') return ['doc', 'docx', 'txt'].includes(note.fileType);
                        return true;
                      })
                      .map((note) => {
                        const isPdf = note.fileType === 'pdf';
                        const isPpt = note.fileType === 'ppt';
                        return (
                          <div
                            key={note.id}
                            className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/15 shadow-sm hover:border-[#1A1A1A]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isPdf ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                isPpt ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {note.fileType.toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                                    {note.topicCategory}
                                  </span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    note.targetStudentId === 'all'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'bg-indigo-100 text-indigo-900'
                                  }`}>
                                    {note.targetStudentName || 'All Mentees'}
                                  </span>
                                  <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                                    {note.fileSize}
                                  </span>
                                </div>

                                <h5 className="text-sm font-serif font-bold text-[#1A1A1A] truncate">{note.title}</h5>
                                <p className="text-[11px] text-[#1A1A1A]/60 truncate font-mono mt-0.5">
                                  File: {note.fileName} • {new Date(note.uploadedAt).toLocaleDateString()}
                                </p>
                                {note.description && (
                                  <p className="text-[11px] text-[#1A1A1A]/70 line-clamp-1 italic mt-1 bg-[#F9F7F2] p-1.5 rounded-lg">
                                    "{note.description}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewNote(note)}
                                className="p-2 rounded-xl border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F7F2] transition-all"
                                title="Preview Note Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(note)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#333] transition-all inline-flex items-center gap-1 shadow-sm"
                                title="Download File"
                              >
                                <Download className="w-3 h-3 text-emerald-400" />
                                Download
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id, note.title)}
                                className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                                title="Delete from Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENTOR REVIEW & APPROVAL MODAL WITH VOICE MESSAGE STUDIO */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[36px] max-w-3xl w-full p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Faculty Review & Sign-Off</span>
                <h3 className="text-3xl font-serif italic text-[#1A1A1A]">{selectedApproval.title}</h3>
                <p className="text-xs text-[#1A1A1A]/70 mt-1">
                  Candidate: <b>{selectedApproval.studentName}</b> • Submitted on {new Date(selectedApproval.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-2 rounded-full hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Submission Content & Answers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]/80">
                  Student's Session Answers & Evidence:
                </h4>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/10 font-mono font-semibold">
                  {selectedApproval.itemType}
                </span>
              </div>

              {/* Questions/Answers list if mock interview */}
              {selectedApproval.details?.questions && Array.isArray(selectedApproval.details.questions) && (
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {selectedApproval.details.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#1A1A1A]/15 text-xs space-y-2">
                      <p className="font-bold text-[#1A1A1A]">Question {idx + 1}: {q.question || q.text}</p>
                      <div className="pl-3 border-l-2 border-indigo-400 bg-indigo-50/50 p-2 rounded-r-xl italic">
                        <span className="not-italic font-semibold block text-[10px] text-indigo-900 uppercase">Candidate Response:</span>
                        "{q.userAnswer || q.transcript || q.answer || 'Student recorded response.'}"
                      </div>
                      {q.feedback && (
                        <p className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                          AI Diagnostic: {q.feedback} (Score: {q.score || 85}/100)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Code snippet if coding problem */}
              {selectedApproval.details?.code && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">
                    Student Source Code
                  </label>
                  <pre className="p-4 rounded-2xl bg-[#1A1A1A] text-emerald-400 font-mono text-xs overflow-x-auto">
                    {selectedApproval.details.code}
                  </pre>
                </div>
              )}

              {/* Student notes if any */}
              {selectedApproval.details?.studentNotes && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1A1A1A]/10 text-xs">
                  <span className="font-semibold block text-[10px] uppercase opacity-50">Student's Note to Mentor:</span>
                  <p className="italic text-[#1A1A1A] mt-0.5">"{selectedApproval.details.studentNotes}"</p>
                </div>
              )}
            </div>

            {/* Mentor Instruction & Voice Note Studio */}
            <div className="space-y-5 pt-4 border-t border-[#1A1A1A]/10">
              {/* Written Note */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#1A1A1A]/80 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  Mentor Note & Written Instructions for Student *
                </label>
                <textarea
                  rows={3}
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Write feedback, praise, or specific instructional directives for this session (e.g. Excellent explanation of HashMap bucketing. For tree traversals, remember to handle edge cases where root is null.)..."
                  className="w-full bg-white border border-[#1A1A1A]/30 rounded-2xl p-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] leading-relaxed"
                />
              </div>

              {/* Voice Message Studio */}
              <div className="bg-[#1A1A1A] text-[#F9F7F2] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-[#333] pb-3">
                  <div>
                    <h5 className="font-serif italic text-lg text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-emerald-400" />
                      Record Mentor Voice Message
                    </h5>
                    <p className="text-[11px] text-[#F9F7F2]/60 mt-0.5">
                      Send personalized voice instructions directly to the student's portal.
                    </p>
                  </div>

                  {isRecording && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 rounded-full text-[10px] font-mono font-bold animate-pulse text-white">
                      <span className="w-2 h-2 rounded-full bg-white" /> REC {recordingTime}s
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" /> Start Voice Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" /> Stop & Attach Audio ({recordingTime}s)
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <div className="flex items-center gap-3 bg-[#262626] border border-[#444] rounded-2xl px-4 py-2 flex-1 w-full">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#1A1A1A] flex items-center justify-center shrink-0 transition-transform active:scale-95"
                      >
                        {isPlayingRecorded ? <Pause className="w-3.5 h-3.5 fill-[#1A1A1A]" /> : <Play className="w-3.5 h-3.5 fill-[#1A1A1A] ml-0.5" />}
                      </button>
                      <div className="flex-1 text-[10px] font-mono text-[#F9F7F2]/80">
                        <span>Voice Note Ready ({recordedDuration}s)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecordedAudioUrl(null);
                          setRecordedDuration(0);
                        }}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Re-record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Approval Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#1A1A1A]/30 text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A]/5 transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleApproveSession('PENDING')}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-[#1A1A1A] bg-white text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider hover:bg-gray-100 transition-all"
                >
                  Save Feedback Only
                </button>

                <button
                  type="button"
                  disabled={isSubmittingReview}
                  id="btn-confirm-green-tick-approval"
                  onClick={() => handleApproveSession('APPROVED')}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 fill-white text-emerald-800" />
                  {isSubmittingReview ? 'Certifying...' : 'Approve with Green Tick ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW UPLOADED NOTE MODAL */}
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
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                    Drive Document
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
                <span className="text-[#1A1A1A]/50">Target Mentees:</span>
                <span className="font-bold text-emerald-800">{previewNote.targetStudentName || 'All Mentees'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#1A1A1A]/50">Uploaded On:</span>
                <span>{new Date(previewNote.uploadedAt).toLocaleString()}</span>
              </div>

              {previewNote.description && (
                <div className="mt-3 pt-3 border-t border-[#1A1A1A]/10">
                  <span className="font-bold text-[10px] uppercase text-[#1A1A1A]/60 block mb-1">
                    Faculty Remarks:
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

      {/* MODAL 1: INSPECT STUDENT CODE & AI LOGS */}
      {inspectedProblem && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    Student Source Code & Verification
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1A1A1A]/60">
                    ID: {inspectedProblem.studentCode}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">
                  {inspectedProblem.problemTitle}
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Submitted by {inspectedProblem.studentName} • Language: <span className="font-mono font-bold uppercase text-purple-700">{inspectedProblem.lastLanguage || 'Java'}</span>
                </p>
              </div>

              <button
                onClick={() => setInspectedProblem(null)}
                className="w-9 h-9 rounded-full border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status and Diagnostics Banner */}
            <div className={`p-4 rounded-2xl flex items-center justify-between text-xs ${
              inspectedProblem.isCompleted
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {inspectedProblem.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Problem Status: <b>Completed & Errors Cleared</b></span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Problem Status: <b>In Progress ({inspectedProblem.attemptsCount} attempts)</b></span>
                  </>
                )}
              </div>
              {inspectedProblem.completedAt && (
                <span className="text-[11px] font-mono text-[#1A1A1A]/60">
                  Completed on {new Date(inspectedProblem.completedAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Code Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase font-bold tracking-wider text-[#1A1A1A]/70 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-700" />
                  Candidate Source Code
                </label>
                <button
                  onClick={() => {
                    if (inspectedProblem.lastCode) {
                      navigator.clipboard.writeText(inspectedProblem.lastCode);
                      addToast('Code copied to clipboard', 'info');
                    }
                  }}
                  className="text-xs text-[#1A1A1A]/70 hover:text-[#1A1A1A] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#1A1A1A] shadow-md bg-[#1E1E1E]">
                <div className="bg-[#2D2D2D] px-4 py-2 border-b border-[#3D3D3D] flex items-center justify-between text-xs text-gray-300 font-mono">
                  <span>Solution.{inspectedProblem.lastLanguage === 'python' ? 'py' : inspectedProblem.lastLanguage === 'cpp' ? 'cpp' : inspectedProblem.lastLanguage === 'javascript' ? 'js' : 'java'}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Read-Only Mentor View</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
                  {inspectedProblem.lastCode || '// No code recorded'}
                </pre>
              </div>
            </div>

            {/* AI Error Feedback History / Diagnostic Log */}
            {inspectedProblem.aiCheckLogs && inspectedProblem.aiCheckLogs.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-[#1A1A1A]/70 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Error Check & Guidance Logs ({inspectedProblem.aiCheckLogs.length} attempts)
                </label>
                <p className="text-[11px] text-[#1A1A1A]/60">
                  The AI detected these errors and provided pedagogical guidance without writing the solution for the student:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inspectedProblem.aiCheckLogs.map((log: any, lIdx: number) => (
                    <div
                      key={lIdx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        log.hasError
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>Attempt {lIdx + 1}: {log.errorTitle || (log.hasError ? 'Logic Error' : 'All Errors Cleared')}</span>
                        <span className="text-[10px] text-[#1A1A1A]/50 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      {log.errorDescription && (
                        <p className="text-[11px] opacity-90">{log.errorDescription}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10">
              <button
                type="button"
                onClick={() => setInspectedProblem(null)}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW CODING QUESTION */}
      {showAddProblemModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Faculty Problem Authoring
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">
                  Add Coding Question to IDE
                </h3>
                <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                  Publish a new question for students. The AI will evaluate their code and explain errors without solving it.
                </p>
              </div>

              <button
                onClick={() => setShowAddProblemModal(false)}
                className="w-9 h-9 rounded-full border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCodingProblem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProbTitle}
                    onChange={(e) => setNewProbTitle(e.target.value)}
                    placeholder="e.g. Find the Missing Number in Range"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={newProbDifficulty}
                    onChange={(e) => setNewProbDifficulty(e.target.value as any)}
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Topic / Data Structure
                  </label>
                  <input
                    type="text"
                    value={newProbTopic}
                    onChange={(e) => setNewProbTopic(e.target.value)}
                    placeholder="e.g. Arrays, Strings, Bit Manipulation"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProbCategory}
                    onChange={(e) => setNewProbCategory(e.target.value)}
                    placeholder="e.g. Core Problem Solving, Dynamic Programming"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                  Problem Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProbDesc}
                  onChange={(e) => setNewProbDesc(e.target.value)}
                  placeholder="Clearly explain the problem statement, rules, and mathematical definition..."
                  className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Input Format
                  </label>
                  <input
                    type="text"
                    value={newProbInputFormat}
                    onChange={(e) => setNewProbInputFormat(e.target.value)}
                    placeholder="e.g. A single integer n"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Output Format
                  </label>
                  <input
                    type="text"
                    value={newProbOutputFormat}
                    onChange={(e) => setNewProbOutputFormat(e.target.value)}
                    placeholder="e.g. The computed result"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Constraints
                  </label>
                  <input
                    type="text"
                    value={newProbConstraints}
                    onChange={(e) => setNewProbConstraints(e.target.value)}
                    placeholder="e.g. 1 <= n <= 10^5"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3 py-2 text-xs text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Sample Input
                  </label>
                  <input
                    type="text"
                    value={newProbSampleInput}
                    onChange={(e) => setNewProbSampleInput(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                    Sample Output
                  </label>
                  <input
                    type="text"
                    value={newProbSampleOutput}
                    onChange={(e) => setNewProbSampleOutput(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-mono"
                  />
                </div>
              </div>

              {/* Starter Code Java */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70 mb-1">
                  Starter Java Code Blueprint
                </label>
                <textarea
                  rows={4}
                  value={newProbStarterJava}
                  onChange={(e) => setNewProbStarterJava(e.target.value)}
                  className="w-full bg-[#1E1E1E] text-emerald-400 font-mono text-xs rounded-xl p-3 border border-[#1A1A1A]"
                />
              </div>

              {/* Test Cases Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70">
                    Evaluation Test Cases ({newProbTestCases.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewProbTestCases(prev => [...prev, { input: '', expectedOutput: '' }])}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Test Case
                  </button>
                </div>

                <div className="space-y-2">
                  {newProbTestCases.map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1A1A1A]/50 w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewProbTestCases(prev => prev.map((t, i) => i === idx ? { ...t, input: val } : t));
                        }}
                        className="flex-1 bg-white border border-[#1A1A1A]/20 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewProbTestCases(prev => prev.map((t, i) => i === idx ? { ...t, expectedOutput: val } : t));
                        }}
                        className="flex-1 bg-white border border-[#1A1A1A]/20 rounded-lg px-3 py-1.5 text-xs font-mono"
                      />
                      {newProbTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewProbTestCases(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setShowAddProblemModal(false)}
                  className="px-6 py-2.5 rounded-full border border-[#1A1A1A]/30 text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1A1A]/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingProblem}
                  className="px-6 py-2.5 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  {isSubmittingProblem ? 'Publishing...' : 'Publish Question to IDE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
