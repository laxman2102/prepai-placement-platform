import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Brain, Code2, BookOpenCheck, Bot, FileText, Compass,
  Users, Award, User, Shield, CheckSquare, MessageSquare, Calendar, FolderGit2,
  CheckCircle2, UserCheck, FolderArchive, FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all ${
      isActive
        ? 'bg-[#1A1A1A] text-[#F9F7F2] font-semibold shadow-sm'
        : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 font-medium'
    }`;
  };

  const renderStudentLinks = () => (
    <>
      <div className="px-3 pt-2 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
        Preparation Modules
      </div>
      
      <button onClick={() => handleNavClick('dashboard')} className={navItemClass('dashboard')}>
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        Overview
      </button>

      <button onClick={() => handleNavClick('aptitude')} className={navItemClass('aptitude')}>
        <Brain className="w-4 h-4 shrink-0" />
        Aptitude Lab
      </button>

      <button onClick={() => handleNavClick('coding')} className={navItemClass('coding')}>
        <Code2 className="w-4 h-4 shrink-0" />
        Coding IDE
      </button>

      <button onClick={() => handleNavClick('technical')} className={navItemClass('technical')}>
        <BookOpenCheck className="w-4 h-4 shrink-0" />
        Technical Q&A
      </button>

      <div className="px-3 pt-6 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
        AI Intelligence
      </div>

      <button onClick={() => handleNavClick('mock-interview')} className={navItemClass('mock-interview')}>
        <Bot className="w-4 h-4 shrink-0" />
        AI Mock Interview
      </button>

      <button onClick={() => handleNavClick('resume-analyzer')} className={navItemClass('resume-analyzer')}>
        <FileText className="w-4 h-4 shrink-0" />
        Resume Insight
      </button>

      <button onClick={() => handleNavClick('learning-path')} className={navItemClass('learning-path')}>
        <Compass className="w-4 h-4 shrink-0" />
        Learning Path
      </button>

      <div className="px-3 pt-6 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
        Mentorship & Approvals
      </div>

      <button onClick={() => handleNavClick('mentor')} className={navItemClass('mentor')}>
        <UserCheck className="w-4 h-4 shrink-0 text-blue-600" />
        Mentor
      </button>

      <button onClick={() => handleNavClick('mentor-sessions')} className={navItemClass('mentor-sessions')}>
        <Calendar className="w-4 h-4 shrink-0 text-emerald-600" />
        Mentor Sessions
      </button>

      <button onClick={() => handleNavClick('exams')} className={navItemClass('exams')}>
        <FileSpreadsheet className="w-4 h-4 shrink-0 text-indigo-600" />
        Exams & Tests
      </button>

      <button onClick={() => handleNavClick('mentoring')} className={navItemClass('mentoring')}>
        <FolderArchive className="w-4 h-4 shrink-0 text-amber-600" />
        Mentor Notes & Drive
      </button>

      <button onClick={() => handleNavClick('achievements')} className={navItemClass('achievements')}>
        <Award className="w-4 h-4 shrink-0" />
        Achievements
      </button>
    </>
  );

  const renderMentorLinks = () => (
    <>
      <div className="px-3 pt-2 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
        Mentor Suite
      </div>
      
      <button onClick={() => handleNavClick('dashboard')} className={navItemClass('dashboard')}>
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        Mentor Overview
      </button>

      <button onClick={() => handleNavClick('mentor-approvals')} className={navItemClass('mentor-approvals')}>
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
        Student Approvals
      </button>

      <button onClick={() => handleNavClick('mentor-students')} className={navItemClass('mentor-students')}>
        <Users className="w-4 h-4 shrink-0" />
        Assigned Students
      </button>

      <button onClick={() => handleNavClick('mentor-coding')} className={navItemClass('mentor-coding')}>
        <Code2 className="w-4 h-4 shrink-0 text-purple-600" />
        Coding & Progress
      </button>

      <button onClick={() => handleNavClick('mentor-exams')} className={navItemClass('mentor-exams')}>
        <FileSpreadsheet className="w-4 h-4 shrink-0 text-indigo-600" />
        Conduct Exams
      </button>

      <button onClick={() => handleNavClick('mentor-tasks')} className={navItemClass('mentor-tasks')}>
        <CheckSquare className="w-4 h-4 shrink-0" />
        Assign Tasks
      </button>

      <button onClick={() => handleNavClick('mentor-feedback')} className={navItemClass('mentor-feedback')}>
        <MessageSquare className="w-4 h-4 shrink-0" />
        Student Feedback
      </button>

      <button onClick={() => handleNavClick('mentor-sessions')} className={navItemClass('mentor-sessions')}>
        <Calendar className="w-4 h-4 shrink-0" />
        Sessions Schedule
      </button>

      <button onClick={() => handleNavClick('mentor-notes')} className={navItemClass('mentor-notes')}>
        <FolderArchive className="w-4 h-4 shrink-0 text-amber-600" />
        Uploaded Notes (Drive)
      </button>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <div className="px-3 pt-2 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
        Admin Controls
      </div>

      <button onClick={() => handleNavClick('dashboard')} className={navItemClass('dashboard')}>
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        Admin Overview
      </button>

      <button onClick={() => handleNavClick('admin-users')} className={navItemClass('admin-users')}>
        <Shield className="w-4 h-4 shrink-0" />
        User Directory
      </button>

      <button onClick={() => handleNavClick('admin-questions')} className={navItemClass('admin-questions')}>
        <Brain className="w-4 h-4 shrink-0" />
        Question Bank
      </button>

      <button onClick={() => handleNavClick('admin-coding')} className={navItemClass('admin-coding')}>
        <FolderGit2 className="w-4 h-4 shrink-0" />
        Coding Problems
      </button>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#1A1A1A]/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-[#F9F7F2] border-r border-[#1A1A1A]/10 p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-1">
          {user.role === 'ROLE_STUDENT' && renderStudentLinks()}
          {user.role === 'ROLE_MENTOR' && renderMentorLinks()}
          {user.role === 'ROLE_ADMIN' && renderAdminLinks()}

          <div className="px-3 pt-6 pb-2 text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold">
            Account
          </div>
          <button onClick={() => handleNavClick('profile')} className={navItemClass('profile')}>
            <User className="w-4 h-4 shrink-0" />
            My Profile
          </button>
        </div>

        {/* Bottom Profile Widget */}
        <div className="pt-6 border-t border-[#1A1A1A]/10 flex items-center gap-3 mt-8">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#F9F7F2] font-serif italic text-lg shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-semibold truncate text-[#1A1A1A] font-serif italic">{user.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] opacity-50 uppercase tracking-widest truncate">{user.role.replace('ROLE_', '')}</span>
              {user.code && (
                <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-amber-300 px-1.5 py-0.5 rounded-full">
                  {user.code}
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
