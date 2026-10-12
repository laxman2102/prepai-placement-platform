import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, CheckCircle2, Circle, Sparkles, Trophy } from 'lucide-react';

export const AILearningPath: React.FC = () => {
  const { token, addToast } = useAuth();
  const [weeks, setWeeks] = useState([
    {
      weekNumber: 1,
      title: 'Aptitude Mastery & Core Java Fundamentals',
      focusArea: 'Quantitative Aptitude, OOP Concepts & Collection Framework',
      topics: [
        { name: 'Time, Speed & Distance / Work Efficiency Formulas', type: 'Aptitude', description: 'Master relative speed and fraction-based work calculations.', completed: true },
        { name: 'Java Multithreading & ConcurrentHashMap Synchronization', type: 'Technical', description: 'Understand locks, synchronized keywords, and atomic counters.', completed: true },
        { name: 'Arrays & Two-Pointer Pattern in Coding IDE', type: 'Coding', description: 'Solve Two Sum, 3Sum, and Container With Most Water.', completed: false }
      ]
    },
    {
      weekNumber: 2,
      title: 'Spring Boot 3, Microservices & Database Tuning',
      focusArea: 'REST API Security, JPA/Hibernate & SQL Optimization',
      topics: [
        { name: 'Spring Security 6 & JWT Auth Filters', type: 'Technical', description: 'Implement SecurityFilterChain, UserDetailsService & Bearer tokens.', completed: true },
        { name: 'Index Optimization & B-Tree Execution Plans in MySQL', type: 'Technical', description: 'Explain composite indexes, EXPLAIN command, and deadlock avoidance.', completed: false },
        { name: 'AI Mock Interview: Technical Round #01', type: 'Interview', description: 'Complete a 15-minute AI technical mock interview on backend concepts.', completed: false }
      ]
    },
    {
      weekNumber: 3,
      title: 'System Design, Mock Interviews & Resume Polishing',
      focusArea: 'High-Level System Design, HR Behavioral & ATS Audit',
      topics: [
        { name: 'Rate Limiting & Caching Architecture (Redis)', type: 'Technical', description: 'Design token bucket algorithm and Redis cache-aside strategy.', completed: false },
        { name: 'ATS Resume Audit & Action Verbs Optimization', type: 'Resume', description: 'Audit keywords for product-based company screening.', completed: false },
        { name: 'Final Comprehensive Mock Interview Round', type: 'Interview', description: 'Mixed technical + HR interview with AI feedback report.', completed: false }
      ]
    }
  ]);

  const toggleTopic = (weekIdx: number, topicIdx: number) => {
    const updated = [...weeks];
    updated[weekIdx].topics[topicIdx].completed = !updated[weekIdx].topics[topicIdx].completed;
    setWeeks(updated);
    addToast('Learning progress updated!', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold mb-1">Personalized Intelligence Roadmap</p>
          <h1 className="text-4xl font-serif italic text-[#1A1A1A]">AI 3-Week Learning Path</h1>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4 text-emerald-400" /> Dynamic Curriculum
        </div>
      </div>

      {/* Weeks Timeline */}
      <div className="space-y-8">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[32px] p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-40">
                  Week 0{week.weekNumber}
                </span>
                <h2 className="text-2xl font-serif italic text-[#1A1A1A] mt-0.5">{week.title}</h2>
              </div>
              <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#F0EDE5] border border-[#1A1A1A]/20 text-[#1A1A1A]">
                {week.focusArea}
              </span>
            </div>

            <div className="space-y-3">
              {week.topics.map((t, tIdx) => (
                <div
                  key={tIdx}
                  onClick={() => toggleTopic(wIdx, tIdx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    t.completed
                      ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                      : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 shrink-0">
                      {t.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#1A1A1A]/30" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.completed ? 'opacity-70' : 'opacity-40'}`}>
                          {t.type}
                        </span>
                      </div>
                      <p className={`text-sm font-serif italic ${t.completed ? 'line-through text-[#F9F7F2]/70' : 'text-[#1A1A1A]'}`}>
                        {t.name}
                      </p>
                      <p className={`text-xs mt-1 leading-snug ${t.completed ? 'text-[#F9F7F2]/60' : 'text-[#1A1A1A]/70'}`}>
                        {t.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
