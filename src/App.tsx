import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/StudentLogin';
import { StudentRegister } from './pages/StudentRegister';
import { MentorLogin } from './pages/MentorLogin';
import { MentorRegister } from './pages/MentorRegister';
import { AdminLogin } from './pages/AdminLogin';

import { StudentDashboard } from './pages/StudentDashboard';
import { AptitudePrep } from './pages/AptitudePrep';
import { CodingLab } from './pages/CodingLab';
import { TechnicalQA } from './pages/TechnicalQA';
import { AIMockInterview } from './pages/AIMockInterview';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { AILearningPath } from './pages/AILearningPath';
import { MentoringGuidance } from './pages/MentoringGuidance';
import { Achievements } from './pages/Achievements';

import { MentorDashboard } from './pages/MentorDashboard';
import { MentorSessionsPage } from './pages/MentorSessionsPage';
import { MentorApprovalPage } from './pages/MentorApprovalPage';
import { MentorSelectionPage } from './pages/MentorSelectionPage';
import { MentorExamPortal } from './pages/MentorExamPortal';
import { StudentExamPortal } from './pages/StudentExamPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Auto-redirect to dashboard when logged in and on a login tab
  React.useEffect(() => {
    if (user && ['landing', 'student-login', 'student-register', 'mentor-login', 'mentor-register', 'admin-login'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [user]);

  const renderContent = () => {
    // Unauthenticated Views
    if (!user) {
      switch (activeTab) {
        case 'student-login':
          return <StudentLogin setActiveTab={setActiveTab} />;
        case 'student-register':
          return <StudentRegister setActiveTab={setActiveTab} />;
        case 'mentor-login':
          return <MentorLogin setActiveTab={setActiveTab} />;
        case 'mentor-register':
          return <MentorRegister setActiveTab={setActiveTab} />;
        case 'admin-login':
          return <AdminLogin setActiveTab={setActiveTab} />;
        case 'landing':
        default:
          return <LandingPage setActiveTab={setActiveTab} />;
      }
    }

    // Student Role Views
    if (user.role === 'ROLE_STUDENT') {
      switch (activeTab) {
        case 'aptitude':
          return <AptitudePrep setActiveTab={setActiveTab} />;
        case 'coding':
          return <CodingLab setActiveTab={setActiveTab} />;
        case 'technical':
          return <TechnicalQA setActiveTab={setActiveTab} />;
        case 'mock-interview':
          return <AIMockInterview setActiveTab={setActiveTab} />;
        case 'resume-analyzer':
          return <ResumeAnalyzer />;
        case 'learning-path':
          return <AILearningPath />;
        case 'mentor':
          return <MentorSelectionPage setActiveTab={setActiveTab} />;
        case 'mentor-sessions':
        case 'mentor-approval':
          return <MentorSessionsPage setActiveTab={setActiveTab} />;
        case 'exams':
        case 'mentor-exams':
          return <StudentExamPortal setActiveTab={setActiveTab} />;
        case 'mentoring':
        case 'mentor-notes':
          return <MentoringGuidance />;
        case 'achievements':
          return <Achievements />;
        case 'profile':
          return <ProfilePage setActiveTab={setActiveTab} />;
        case 'dashboard':
        default:
          return <StudentDashboard setActiveTab={setActiveTab} />;
      }
    }

    // Mentor Role Views
    if (user.role === 'ROLE_MENTOR') {
      switch (activeTab) {
        case 'profile':
          return <ProfilePage setActiveTab={setActiveTab} />;
        case 'mentor-exams':
        case 'exams':
          return <MentorExamPortal setActiveTab={setActiveTab} />;
        case 'dashboard':
        case 'mentor-approvals':
        case 'mentor-students':
        case 'mentor-coding':
        case 'mentor-tasks':
        case 'mentor-feedback':
        case 'mentor-sessions':
        case 'mentor-notes':
        default:
          return <MentorDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      }
    }

    // Admin Role Views
    if (user.role === 'ROLE_ADMIN') {
      switch (activeTab) {
        case 'profile':
          return <ProfilePage setActiveTab={setActiveTab} />;
        case 'dashboard':
        case 'admin-users':
        case 'admin-questions':
        case 'admin-coding':
        default:
          return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      }
    }

    return <StudentDashboard setActiveTab={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#1A1A1A] selection:text-[#F9F7F2]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {user && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 ${user ? 'md:pl-8' : ''} py-4 w-full overflow-x-hidden`}>
          {renderContent()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
