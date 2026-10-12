import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, GraduationCap, Users, Menu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ROLE_STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#1A1A1A] text-[#F9F7F2]">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
      case 'ROLE_MENTOR':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#1A1A1A] text-[#F9F7F2]">
            <Users className="w-3 h-3" /> Mentor
          </span>
        );
      case 'ROLE_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#1A1A1A] text-[#F9F7F2]">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
    }
  };

  return (
    <header id="main-app-navbar" className="sticky top-0 z-30 bg-[#F9F7F2]/95 backdrop-blur-md border-b border-[#1A1A1A]/10 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            id="btn-sidebar-toggle"
            className="md:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#1A1A1A]/5 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div
            onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#F9F7F2] font-serif italic text-lg font-bold shadow-sm">
              E
            </div>
            <div>
              <span className="font-serif italic font-extrabold text-2xl tracking-tighter text-[#1A1A1A]">
                PrepAI.
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.25em] opacity-50 ml-2 font-semibold">
                Placement Intelligence
              </span>
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            {getRoleBadge()}
            
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-[#1A1A1A] font-serif italic">{user.fullName}</span>
              <span className="text-[10px] uppercase tracking-widest opacity-50">{user.email}</span>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              id="btn-nav-profile"
              className="p-2 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-all"
              title="Profile"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              id="btn-nav-logout"
              className="p-2 rounded-full border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-rose-900 hover:text-white transition-all text-[#1A1A1A]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('student-login')}
              id="btn-login-student"
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all"
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab('mentor-login')}
              id="btn-login-mentor"
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-all"
            >
              Mentor Portal
            </button>
            <button
              onClick={() => setActiveTab('admin-login')}
              id="btn-login-admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1A1A1A]/20 text-[10px] font-semibold uppercase tracking-widest text-[#1A1A1A]/80 hover:text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all"
            >
              <Shield className="w-3 h-3 text-[#1A1A1A]" />
              Admin Access
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
