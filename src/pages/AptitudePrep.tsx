import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AptitudeQuestion, AptitudeCategory } from '../types';
import { Brain, CheckCircle2, Clock, RotateCcw, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface AptitudePrepProps {
  setActiveTab?: (tab: string) => void;
}

export const AptitudePrep: React.FC<AptitudePrepProps> = ({ setActiveTab }) => {
  const { token, addToast } = useAuth();
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AptitudeCategory | 'All'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min timer

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = selectedCategory === 'All'
          ? '/api/aptitude/questions'
          : `/api/aptitude/questions?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          // Default pre-seeded questions if endpoint is empty
          setQuestions([
            {
              id: 'q1',
              category: 'Quantitative',
              topic: 'Time and Work',
              question: 'A can complete a piece of work in 12 days and B in 16 days. If they work together for 4 days, what fraction of the work is left?',
              options: ['1/3', '5/12', '7/12', '1/4'],
              correctAnswer: 1,
              explanation: 'A does 1/12 work/day, B does 1/16 work/day. Together in 1 day = (1/12 + 1/16) = 7/48. In 4 days = 28/48 = 7/12. Remaining = 1 - 7/12 = 5/12.',
              difficulty: 'Medium'
            },
            {
              id: 'q2',
              category: 'Logical Reasoning',
              topic: 'Blood Relations',
              question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
              options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
              correctAnswer: 2,
              explanation: 'Only son of Suresh\'s mother is Suresh himself. So the boy is Suresh\'s son, making Suresh his Father.',
              difficulty: 'Easy'
            },
            {
              id: 'q3',
              category: 'Verbal Ability',
              topic: 'Sentence Correction',
              question: 'Choose the grammatically correct sentence:',
              options: [
                'Neither of the students were present in class.',
                'Neither of the students was present in class.',
                'Neither of the student was present in class.',
                'Neither student were present in class.'
              ],
              correctAnswer: 1,
              explanation: '"Neither" takes a singular verb ("was"), and "students" is plural after "of the".',
              difficulty: 'Easy'
            }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchQuestions();
  }, [selectedCategory, token]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
    setAnswers({ ...answers, [currentIndex]: index });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(answers[currentIndex + 1] ?? null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(answers[currentIndex - 1] ?? null);
    }
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    addToast('Aptitude Test Submitted Successfully!', 'success');
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  const currentQ = questions[currentIndex];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold mb-1">Aptitude Module</p>
          <h1 className="text-4xl font-serif italic text-[#1A1A1A]">Quantitative & Reasoning Lab</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full border border-[#1A1A1A] bg-[#F0EDE5] text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1A1A1A]" /> Time Remaining: <span className="font-serif italic font-bold text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Quantitative', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat as any);
              setCurrentIndex(0);
              setIsSubmitted(false);
              setAnswers({});
            }}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-[#1A1A1A] text-[#F9F7F2]'
                : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Question Interface */}
      {currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Box */}
          <div className="lg:col-span-2 space-y-6 bg-[#F9F7F2] border border-[#1A1A1A] rounded-[32px] p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-50 font-semibold">
                Question {currentIndex + 1} of {questions.length} • {currentQ.category} ({currentQ.topic})
              </span>
              <span className="text-xs px-3 py-1 rounded-full border border-[#1A1A1A]/30 font-semibold">
                {currentQ.difficulty}
              </span>
            </div>

            <p className="text-xl font-serif text-[#1A1A1A] leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx || answers[currentIndex] === idx;
                const isCorrect = isSubmitted && idx === currentQ.correctAnswer;
                const isWrong = isSubmitted && isSelected && !isCorrect;

                let optionStyle = 'border-[#1A1A1A]/20 hover:border-[#1A1A1A] bg-white text-[#1A1A1A]';
                if (isSelected && !isSubmitted) {
                  optionStyle = 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2]';
                } else if (isCorrect) {
                  optionStyle = 'border-emerald-800 bg-emerald-900 text-white font-semibold';
                } else if (isWrong) {
                  optionStyle = 'border-rose-800 bg-rose-900 text-white';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-serif italic font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isSubmitted && (
              <div className="p-5 rounded-2xl bg-[#F0EDE5] border border-[#1A1A1A]/20 text-xs space-y-1">
                <p className="font-semibold uppercase tracking-wider text-[#1A1A1A]">Solution & Logic</p>
                <p className="text-[#1A1A1A]/80 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-6 py-2.5 rounded-full border border-[#1A1A1A]/30 text-xs uppercase tracking-widest font-semibold disabled:opacity-30 text-[#1A1A1A]"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase tracking-widest font-semibold hover:bg-[#333333]"
                >
                  Next Question
                </button>
              ) : (
                !isSubmitted && (
                  <button
                    onClick={handleSubmitTest}
                    className="px-8 py-2.5 rounded-full bg-emerald-800 text-white text-xs uppercase tracking-widest font-semibold hover:bg-emerald-700 shadow-md"
                  >
                    Submit Test
                  </button>
                )
              )}
            </div>
          </div>

          {/* Test Navigator & Score summary */}
          <div className="space-y-6">
            <div className="border border-[#1A1A1A] bg-[#F0EDE5] p-6 rounded-[28px]">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-semibold mb-4">Question Navigator</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setSelectedOption(answers[idx] ?? null);
                      }}
                      className={`h-10 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center border ${
                        isCurrent
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] ring-2 ring-[#1A1A1A]/30'
                          : isAnswered
                          ? 'bg-[#1A1A1A]/20 border-[#1A1A1A]/40 text-[#1A1A1A]'
                          : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {isSubmitted && (
              <div className="border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] p-8 rounded-[32px] text-center space-y-4">
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold">Test Performance</p>
                <div className="text-5xl font-serif italic text-white">
                  {calculateScore()} <span className="text-2xl opacity-50">/ {questions.length}</span>
                </div>
                <p className="text-xs text-[#F9F7F2]/80">
                  Accuracy: <span className="font-bold text-emerald-400">{Math.round((calculateScore() / questions.length) * 100)}%</span>
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setAnswers({});
                    setCurrentIndex(0);
                    setSelectedOption(null);
                    setTimeLeft(600);
                  }}
                  className="w-full py-3 rounded-full bg-[#F9F7F2] text-[#1A1A1A] text-xs font-semibold uppercase tracking-widest hover:bg-white"
                >
                  Retake Test
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
