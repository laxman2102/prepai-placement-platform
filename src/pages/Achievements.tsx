import React from 'react';
import { Achievement } from '../types';
import { Award, Trophy, Zap, Star, ShieldCheck, Flame } from 'lucide-react';

export const Achievements: React.FC = () => {
  const achievementsList: Achievement[] = [
    {
      id: 'a1',
      title: 'Aptitude Prodigy',
      description: 'Score 80%+ accuracy across 5 Quantitative & Logical test series.',
      iconName: 'Trophy',
      isUnlocked: true,
      progressPercentage: 100,
      unlockedAt: '2026-08-01'
    },
    {
      id: 'a2',
      title: 'Algorithm Craftsman',
      description: 'Solve 25 DSA and SQL problem statements in the Coding IDE.',
      iconName: 'Zap',
      isUnlocked: true,
      progressPercentage: 100,
      unlockedAt: '2026-08-06'
    },
    {
      id: 'a3',
      title: 'AI Mock Virtuoso',
      description: 'Complete 3 AI Technical Mock Interviews with score > 80%.',
      iconName: 'Star',
      isUnlocked: false,
      progressPercentage: 66
    },
    {
      id: 'a4',
      title: 'ATS Resume Master',
      description: 'Achieve an ATS Resume Match score of 80%+ for target role.',
      iconName: 'ShieldCheck',
      isUnlocked: true,
      progressPercentage: 100,
      unlockedAt: '2026-08-08'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold mb-1">Gamification & Badges</p>
          <h1 className="text-4xl font-serif italic text-[#1A1A1A]">Placement Badges & Milestones</h1>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400" /> 5-Day Active Streak
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievementsList.map((ach) => (
          <div
            key={ach.id}
            className={`border rounded-[28px] p-6 shadow-lg flex items-start gap-5 transition-all ${
              ach.isUnlocked
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2]'
                : 'border-[#1A1A1A]/20 bg-[#F9F7F2] text-[#1A1A1A]'
            }`}
          >
            <div className={`p-4 rounded-full font-serif italic text-2xl shrink-0 ${
              ach.isUnlocked ? 'bg-[#F9F7F2] text-[#1A1A1A]' : 'bg-[#F0EDE5] text-[#1A1A1A]/40'
            }`}>
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${
                  ach.isUnlocked ? 'text-emerald-400' : 'opacity-40'
                }`}>
                  {ach.isUnlocked ? 'Unlocked Badge' : 'In Progress'}
                </span>
                {ach.unlockedAt && (
                  <span className="text-[10px] opacity-60 font-mono">{ach.unlockedAt}</span>
                )}
              </div>

              <h3 className={`text-xl font-serif italic ${ach.isUnlocked ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {ach.title}
              </h3>
              <p className={`text-xs leading-relaxed font-sans ${ach.isUnlocked ? 'text-[#F9F7F2]/80' : 'text-[#1A1A1A]/70'}`}>
                {ach.description}
              </p>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="h-1.5 w-full bg-[#1A1A1A]/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ach.isUnlocked ? 'bg-emerald-400' : 'bg-[#1A1A1A]'}`}
                    style={{ width: `${ach.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
