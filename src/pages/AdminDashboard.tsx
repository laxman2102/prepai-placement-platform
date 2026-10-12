import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Brain, Code2, FolderGit2, Plus, Search, Filter,
  CheckCircle2, XCircle, Trash2, Edit3, UserCheck, RefreshCw,
  Sparkles, BookOpenCheck, ArrowLeft, Building, AlertCircle
} from 'lucide-react';
import { User, AptitudeQuestion, TechnicalQuestion, CodingProblem } from '../types';

interface AdminDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab: initialTab, setActiveTab: setParentTab }) => {
  const { user, token, addToast } = useAuth();
  const [currentTab, setCurrentTab] = useState<'overview' | 'users' | 'questions' | 'coding'>('overview');

  // Sync with prop if passed
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'admin-users') setCurrentTab('users');
      else if (initialTab === 'admin-questions') setCurrentTab('questions');
      else if (initialTab === 'admin-coding') setCurrentTab('coding');
      else if (initialTab === 'dashboard') setCurrentTab('overview');
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'overview' | 'users' | 'questions' | 'coding') => {
    setCurrentTab(tab);
    if (setParentTab) {
      if (tab === 'overview') setParentTab('dashboard');
      else if (tab === 'users') setParentTab('admin-users');
      else if (tab === 'questions') setParentTab('admin-questions');
      else if (tab === 'coding') setParentTab('admin-coding');
    }
  };

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [aptitudeList, setAptitudeList] = useState<AptitudeQuestion[]>([]);
  const [technicalList, setTechnicalList] = useState<TechnicalQuestion[]>([]);
  const [codingList, setCodingList] = useState<CodingProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Question Search
  const [qSearch, setQSearch] = useState('');
  const [qTypeFilter, setQTypeFilter] = useState<'ALL' | 'APTITUDE' | 'TECHNICAL'>('ALL');

  // Coding Search
  const [codingSearch, setCodingSearch] = useState('');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [showAssignMentorModal, setShowAssignMentorModal] = useState<User | null>(null);

  // Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ROLE_STUDENT' | 'ROLE_MENTOR' | 'ROLE_ADMIN'>('ROLE_STUDENT');
  const [newUserSpecialization, setNewUserSpecialization] = useState('AIML');

  // Aptitude Form
  const [aptCategory, setAptCategory] = useState<'Quantitative' | 'Logical Reasoning' | 'Verbal Ability'>('Quantitative');
  const [aptTopic, setAptTopic] = useState('General');
  const [aptQuestion, setAptQuestion] = useState('');
  const [aptOptions, setAptOptions] = useState(['', '', '', '']);
  const [aptCorrect, setAptCorrect] = useState(0);
  const [aptExplanation, setAptExplanation] = useState('');
  const [aptDifficulty, setAptDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Technical Form
  const [techSubject, setTechSubject] = useState('Java');
  const [techQuestion, setTechQuestion] = useState('');
  const [techAnswer, setTechAnswer] = useState('');
  const [techSnippet, setTechSnippet] = useState('');
  const [techDifficulty, setTechDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Coding Form
  const [codeTitle, setCodeTitle] = useState('');
  const [codeDesc, setCodeDesc] = useState('');
  const [codeTopic, setCodeTopic] = useState('Arrays');
  const [codeDifficulty, setCodeDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [codeSampleIn, setCodeSampleIn] = useState('');
  const [codeSampleOut, setCodeSampleOut] = useState('');

  // Selected Mentor to Assign
  const [selectedMentorIdToAssign, setSelectedMentorIdToAssign] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, usersRes, qRes, codeRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/coding', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const usersData = await usersRes.json();
      const qData = await qRes.json();
      const codeData = await codeRes.json();

      if (dashData.success) setDashboardData(dashData.data);
      if (usersData.success && Array.isArray(usersData.data)) setUsersList(usersData.data);
      if (qData.success) {
        setAptitudeList(qData.data.aptitude || []);
        setTechnicalList(qData.data.technical || []);
      }
      if (codeData.success && Array.isArray(codeData.data)) setCodingList(codeData.data);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle Toggle User Status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast(`User account status updated.`, 'success');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to update user status', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user from the system?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('User deleted from system.', 'success');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to delete user', 'error');
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          role: newUserRole,
          specialization: newUserSpecialization
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`User ${newUserName} created successfully.`, 'success');
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        fetchAdminData();
      } else {
        addToast(data.message || 'Failed to create user', 'error');
      }
    } catch {
      addToast('Network error while registering user', 'error');
    }
  };

  // Handle Assign Mentor
  const handleAssignMentor = async () => {
    if (!showAssignMentorModal || !selectedMentorIdToAssign) return;
    try {
      const res = await fetch('/api/admin/assign-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: showAssignMentorModal.id,
          mentorId: selectedMentorIdToAssign
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Mentor assigned to student successfully.', 'success');
        setShowAssignMentorModal(null);
        fetchAdminData();
      }
    } catch {
      addToast('Failed to assign mentor', 'error');
    }
  };

  // Handle Create Aptitude Question
  const handleCreateAptitude = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions/aptitude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: aptCategory,
          topic: aptTopic,
          question: aptQuestion,
          options: aptOptions,
          correctAnswer: aptCorrect,
          explanation: aptExplanation,
          difficulty: aptDifficulty
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Aptitude question added to question bank!', 'success');
        setShowAddAptModal(false);
        setAptQuestion('');
        setAptOptions(['', '', '', '']);
        setAptExplanation('');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to add aptitude question', 'error');
    }
  };

  // Handle Create Technical Question
  const handleCreateTechnical = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions/technical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: techSubject,
          question: techQuestion,
          answer: techAnswer,
          codeSnippet: techSnippet,
          difficulty: techDifficulty
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Technical question added to question bank!', 'success');
        setShowAddTechModal(false);
        setTechQuestion('');
        setTechAnswer('');
        setTechSnippet('');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to add technical question', 'error');
    }
  };

  // Handle Create Coding Problem
  const handleCreateCoding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: codeTitle,
          description: codeDesc,
          topic: codeTopic,
          difficulty: codeDifficulty,
          sampleInput: codeSampleIn,
          sampleOutput: codeSampleOut
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Coding problem added to IDE challenges!', 'success');
        setShowAddCodeModal(false);
        setCodeTitle('');
        setCodeDesc('');
        setCodeSampleIn('');
        setCodeSampleOut('');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to add coding problem', 'error');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (type: 'aptitude' | 'technical', id: string) => {
    if (!window.confirm('Delete this question from the bank?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Question deleted.', 'success');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to delete question', 'error');
    }
  };

  // Delete Coding Problem
  const handleDeleteCoding = async (id: string) => {
    if (!window.confirm('Delete this coding problem?')) return;
    try {
      const res = await fetch(`/api/admin/coding/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Coding problem deleted.', 'success');
        fetchAdminData();
      }
    } catch {
      addToast('Failed to delete problem', 'error');
    }
  };

  const mentorsList = usersList.filter(u => u.role === 'ROLE_MENTOR');

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = userSearch === '' ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 pb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-[10px] uppercase font-bold tracking-widest mb-3">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            Institutional Master Administration
          </div>
          <h1 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A]">
            Admin Control Center, <br />
            <span className="italic font-normal">{user?.fullName || 'Super Administrator'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-3 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-[#1A1A1A] transition-all"
            title="Refresh system telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-4 py-2 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider">
            Root Control
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1A1A1A]/10 pb-4">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            currentTab === 'overview'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Master Telemetry
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            currentTab === 'users'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Users className="w-4 h-4" />
          User Directory ({usersList.length})
        </button>

        <button
          onClick={() => handleTabChange('questions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            currentTab === 'questions'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <Brain className="w-4 h-4" />
          Question Bank ({aptitudeList.length + technicalList.length})
        </button>

        <button
          onClick={() => handleTabChange('coding')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
            currentTab === 'coding'
              ? 'bg-[#1A1A1A] text-[#F9F7F2] shadow-sm'
              : 'bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Coding Problems ({codingList.length})
        </button>
      </div>

      {/* TAB 1: MASTER TELEMETRY / OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div
              onClick={() => handleTabChange('users')}
              className="border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] p-6 rounded-[28px] cursor-pointer hover:scale-[1.02] transition-transform shadow-md"
            >
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-1">Total Students</p>
              <p className="text-4xl font-serif italic font-light">{usersList.filter(u => u.role === 'ROLE_STUDENT').length}</p>
              <span className="text-[10px] opacity-70 block mt-2">Active Candidates</span>
            </div>

            <div
              onClick={() => handleTabChange('users')}
              className="border border-[#1A1A1A]/20 bg-white p-6 rounded-[28px] cursor-pointer hover:border-[#1A1A1A] transition-all shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-semibold mb-1">Faculty Mentors</p>
              <p className="text-4xl font-serif italic font-light text-[#1A1A1A]">{mentorsList.length}</p>
              <span className="text-[10px] text-[#1A1A1A]/60 block mt-2">Certified Reviewers</span>
            </div>

            <div
              onClick={() => handleTabChange('questions')}
              className="border border-[#1A1A1A]/20 bg-white p-6 rounded-[28px] cursor-pointer hover:border-[#1A1A1A] transition-all shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-semibold mb-1">Question Bank</p>
              <p className="text-4xl font-serif italic font-light text-[#1A1A1A]">{aptitudeList.length + technicalList.length}</p>
              <span className="text-[10px] text-[#1A1A1A]/60 block mt-2">Aptitude & Technical</span>
            </div>

            <div
              onClick={() => handleTabChange('coding')}
              className="border border-[#1A1A1A]/20 bg-white p-6 rounded-[28px] cursor-pointer hover:border-[#1A1A1A] transition-all shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-semibold mb-1">Coding Problems</p>
              <p className="text-4xl font-serif italic font-light text-[#1A1A1A]">{codingList.length}</p>
              <span className="text-[10px] text-[#1A1A1A]/60 block mt-2">DSA Practice IDE</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#1A1A1A]/15 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">Manage Institutional Users</h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                Add students, register faculty mentors, assign mentors to candidate cohorts, and control platform access.
              </p>
              <button
                onClick={() => handleTabChange('users')}
                className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:underline pt-2 inline-flex items-center gap-1"
              >
                Open User Directory →
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#1A1A1A]/15 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">Curate Question Bank</h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                Add Quantitative, Logical Reasoning, and Technical MCQs with comprehensive explanations and corporate tags.
              </p>
              <button
                onClick={() => handleTabChange('questions')}
                className="text-xs font-bold uppercase tracking-wider text-amber-900 hover:underline pt-2 inline-flex items-center gap-1"
              >
                Open Question Bank →
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#1A1A1A]/15 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif italic text-[#1A1A1A]">Coding IDE Challenges</h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                Publish DSA coding challenges with boilerplate starters in Java, Python, C++, and automated test cases.
              </p>
              <button
                onClick={() => handleTabChange('coding')}
                className="text-xs font-bold uppercase tracking-wider text-emerald-900 hover:underline pt-2 inline-flex items-center gap-1"
              >
                Open Coding Challenges →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & ACCESS CONTROL */}
      {currentTab === 'users' && (
        <div className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[32px] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">User Directory & Access Control</h2>
              <p className="text-xs text-[#1A1A1A]/60">Manage students, faculty mentors, and institutional permissions.</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase font-bold tracking-wider hover:bg-[#333333] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
              <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3" />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full sm:w-auto"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_STUDENT">Students Only</option>
              <option value="ROLE_MENTOR">Mentors Only</option>
              <option value="ROLE_ADMIN">Admins Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1A1A1A]/20 text-[10px] uppercase tracking-widest opacity-50">
                  <th className="pb-3 font-semibold">User Name</th>
                  <th className="pb-3 font-semibold">Email / Login ID</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Assigned Mentor / Dept</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10">
                {filteredUsers.map((u) => {
                  const assignedMentorName = u.studentProfile?.assignedMentorName ||
                    (u.studentProfile?.assignedMentorId ? mentorsList.find(m => m.id === u.studentProfile?.assignedMentorId)?.fullName : null);

                  return (
                    <tr key={u.id} className="hover:bg-[#1A1A1A]/5 transition-colors">
                      <td className="py-4 font-serif italic text-sm font-bold text-[#1A1A1A]">
                        {u.fullName}
                      </td>
                      <td className="py-4 font-mono text-[#1A1A1A]/70">
                        {u.email}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] border ${
                          u.role === 'ROLE_ADMIN'
                            ? 'bg-purple-100 border-purple-300 text-purple-900'
                            : u.role === 'ROLE_MENTOR'
                            ? 'bg-blue-100 border-blue-300 text-blue-900'
                            : 'bg-[#F0EDE5] border-[#1A1A1A]/20 text-[#1A1A1A]'
                        }`}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="py-4 text-[#1A1A1A]/80">
                        {u.role === 'ROLE_STUDENT' ? (
                          assignedMentorName ? (
                            <span className="font-semibold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {assignedMentorName}
                            </span>
                          ) : (
                            <button
                              onClick={() => setShowAssignMentorModal(u)}
                              className="text-[11px] text-blue-700 hover:underline font-semibold"
                            >
                              + Assign Mentor
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-[#1A1A1A]/60">
                            {u.mentorProfile?.specialization || u.adminProfile?.department || 'AIML'}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                          u.active ? 'text-emerald-800' : 'text-red-700'
                        }`}>
                          {u.active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role === 'ROLE_STUDENT' && (
                            <button
                              onClick={() => setShowAssignMentorModal(u)}
                              className="px-2.5 py-1 rounded-lg border border-[#1A1A1A]/20 hover:bg-white text-[10px] font-semibold uppercase tracking-wider"
                              title="Assign/Change Mentor"
                            >
                              Mentor
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-lg border border-[#1A1A1A]/20 hover:bg-white text-[10px] font-semibold uppercase tracking-wider"
                            title="Toggle Active Status"
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                          {u.role !== 'ROLE_ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION BANK MANAGEMENT */}
      {currentTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Curated Question Bank</h2>
              <p className="text-xs text-[#1A1A1A]/60">Manage Aptitude numericals and Technical interview questions.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddAptModal(true)}
                className="px-4 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase font-bold tracking-wider hover:bg-[#333333] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Aptitude Q
              </button>
              <button
                onClick={() => setShowAddTechModal(true)}
                className="px-4 py-2.5 rounded-full bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase font-bold tracking-wider hover:bg-[#1A1A1A]/5 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Technical Q
              </button>
            </div>
          </div>

          {/* Questions Tabs Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQTypeFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                qTypeFilter === 'ALL' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]'
              }`}
            >
              All Questions ({aptitudeList.length + technicalList.length})
            </button>
            <button
              onClick={() => setQTypeFilter('APTITUDE')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                qTypeFilter === 'APTITUDE' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]'
              }`}
            >
              Aptitude ({aptitudeList.length})
            </button>
            <button
              onClick={() => setQTypeFilter('TECHNICAL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                qTypeFilter === 'TECHNICAL' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#1A1A1A]/20 text-[#1A1A1A]'
              }`}
            >
              Technical ({technicalList.length})
            </button>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {(qTypeFilter === 'ALL' || qTypeFilter === 'APTITUDE') &&
              aptitudeList.map((q) => (
                <div key={q.id} className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Aptitude • {q.category}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#1A1A1A]/60">
                        {q.topic}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion('aptitude', q.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1A1A1A] leading-relaxed">{q.question}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border text-[11px] ${
                          idx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                            : 'bg-[#F9F7F2] border-[#1A1A1A]/10 text-[#1A1A1A]/70'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opt} {idx === q.correctAnswer && '✓ (Correct)'}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/60 italic">Explanation: {q.explanation}</p>
                </div>
              ))}

            {(qTypeFilter === 'ALL' || qTypeFilter === 'TECHNICAL') &&
              technicalList.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                        Technical • {t.subject}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#1A1A1A]/60">
                        {t.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion('technical', t.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1A1A1A] leading-relaxed">{t.question}</h4>
                  <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/80 leading-relaxed">
                    <p>{t.answer}</p>
                  </div>
                  {t.codeSnippet && (
                    <pre className="p-3 bg-[#1A1A1A] text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto">
                      {t.codeSnippet}
                    </pre>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: CODING PROBLEMS REPOSITORY */}
      {currentTab === 'coding' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Coding Problems Repository</h2>
              <p className="text-xs text-[#1A1A1A]/60">Add and manage coding problems with starter boilerplates and test cases.</p>
            </div>

            <button
              onClick={() => setShowAddCodeModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase font-bold tracking-wider hover:bg-[#333333] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Problem
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {codingList.map((prob) => (
              <div key={prob.id} className="p-6 rounded-3xl bg-white border border-[#1A1A1A]/15 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-red-100 border-red-300 text-red-900'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#1A1A1A]/60">
                        {prob.topic}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">{prob.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteCoding(prob.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete Problem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">{prob.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
                    <span className="block font-bold text-[10px] uppercase text-[#1A1A1A]/60 mb-1">Sample Input:</span>
                    <pre className="font-mono text-[11px] text-[#1A1A1A]">{prob.sampleInput}</pre>
                  </div>
                  <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
                    <span className="block font-bold text-[10px] uppercase text-[#1A1A1A]/60 mb-1">Sample Output:</span>
                    <pre className="font-mono text-[11px] text-[#1A1A1A]">{prob.sampleOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER NEW USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Register System User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-[#1A1A1A]/10 rounded-full">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Email / System ID</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. rajesh.sharma@faculty.edu"
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none"
                >
                  <option value="ROLE_STUDENT">Student</option>
                  <option value="ROLE_MENTOR">Faculty Mentor</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
              </div>
              {newUserRole === 'ROLE_MENTOR' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Specialization / Department</label>
                  <input
                    type="text"
                    value={newUserSpecialization}
                    onChange={(e) => setNewUserSpecialization(e.target.value)}
                    placeholder="e.g. AIML, Data Structures, System Design"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN MENTOR TO STUDENT */}
      {showAssignMentorModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Assign Faculty Mentor</h3>
              <button onClick={() => setShowAssignMentorModal(null)} className="p-2 hover:bg-[#1A1A1A]/10 rounded-full">✕</button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-[#1A1A1A]/70">
                Select a certified faculty mentor for candidate <b>{showAssignMentorModal.fullName}</b>:
              </p>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Available Mentors</label>
                <select
                  value={selectedMentorIdToAssign}
                  onChange={(e) => setSelectedMentorIdToAssign(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs text-[#1A1A1A] focus:outline-none"
                >
                  <option value="">-- Select Faculty Mentor --</option>
                  {mentorsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.mentorProfile?.specialization || 'AIML'} - {m.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssignMentor}
                disabled={!selectedMentorIdToAssign}
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333] disabled:opacity-50"
              >
                Confirm Mentor Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD APTITUDE QUESTION */}
      {showAddAptModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Add Aptitude Question</h3>
              <button onClick={() => setShowAddAptModal(false)} className="p-2 hover:bg-[#1A1A1A]/10 rounded-full">✕</button>
            </div>
            <form onSubmit={handleCreateAptitude} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Category</label>
                  <select
                    value={aptCategory}
                    onChange={(e) => setAptCategory(e.target.value as any)}
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                  >
                    <option value="Quantitative">Quantitative</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={aptTopic}
                    onChange={(e) => setAptTopic(e.target.value)}
                    placeholder="e.g. Time and Work"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  required
                  value={aptQuestion}
                  onChange={(e) => setAptQuestion(e.target.value)}
                  placeholder="Enter complete numerical or logic question..."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60">4 Options & Correct Answer</label>
                {aptOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={aptCorrect === i}
                      onChange={() => setAptCorrect(i)}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...aptOptions];
                        copy[i] = e.target.value;
                        setAptOptions(copy);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 p-2.5 rounded-xl border border-[#1A1A1A]/20 bg-white text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={aptExplanation}
                  onChange={(e) => setAptExplanation(e.target.value)}
                  placeholder="Formula and step-by-step breakdown..."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Add Aptitude Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD TECHNICAL QUESTION */}
      {showAddTechModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Add Technical Question</h3>
              <button onClick={() => setShowAddTechModal(false)} className="p-2 hover:bg-[#1A1A1A]/10 rounded-full">✕</button>
            </div>
            <form onSubmit={handleCreateTechnical} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Subject / Domain</label>
                <input
                  type="text"
                  required
                  value={techSubject}
                  onChange={(e) => setTechSubject(e.target.value)}
                  placeholder="e.g. Java, DBMS, Operating Systems, Spring Boot"
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Technical Question</label>
                <input
                  type="text"
                  required
                  value={techQuestion}
                  onChange={(e) => setTechQuestion(e.target.value)}
                  placeholder="e.g. Explain difference between synchronized block and method in Java."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Comprehensive Answer</label>
                <textarea
                  rows={4}
                  required
                  value={techAnswer}
                  onChange={(e) => setTechAnswer(e.target.value)}
                  placeholder="Detailed architectural and conceptual answer..."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={techSnippet}
                  onChange={(e) => setTechSnippet(e.target.value)}
                  placeholder="Optional code snippet or SQL query..."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Add Technical Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD CODING PROBLEM */}
      {showAddCodeModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-4">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A]">Add Coding IDE Problem</h3>
              <button onClick={() => setShowAddCodeModal(false)} className="p-2 hover:bg-[#1A1A1A]/10 rounded-full">✕</button>
            </div>
            <form onSubmit={handleCreateCoding} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={codeTitle}
                    onChange={(e) => setCodeTitle(e.target.value)}
                    placeholder="e.g. Merge Two Sorted Lists"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={codeTopic}
                    onChange={(e) => setCodeTopic(e.target.value)}
                    placeholder="e.g. Linked Lists"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={codeDesc}
                  onChange={(e) => setCodeDesc(e.target.value)}
                  placeholder="Problem statement and algorithmic constraints..."
                  className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Sample Input</label>
                  <input
                    type="text"
                    value={codeSampleIn}
                    onChange={(e) => setCodeSampleIn(e.target.value)}
                    placeholder="[1,2,4], [1,3,4]"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 mb-1">Sample Output</label>
                  <input
                    type="text"
                    value={codeSampleOut}
                    onChange={(e) => setCodeSampleOut(e.target.value)}
                    placeholder="[1,1,2,3,4,4]"
                    className="w-full p-3 rounded-2xl border border-[#1A1A1A]/20 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Publish Coding Challenge
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
