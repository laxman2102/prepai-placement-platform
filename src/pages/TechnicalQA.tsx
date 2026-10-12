import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TechnicalQuestion } from '../types';
import { BookOpen, Search, Bookmark, Check, ChevronDown, ChevronUp, Code2, ArrowLeft } from 'lucide-react';

interface TechnicalQAProps {
  setActiveTab?: (tab: string) => void;
}

export const TechnicalQA: React.FC<TechnicalQAProps> = ({ setActiveTab }) => {
  const { token, addToast } = useAuth();
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/technical/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          // Pre-seeded core Technical Questions
          setQuestions([
            {
              id: 't1',
              subject: 'Java',
              topic: 'Core Java & Multithreading',
              question: 'Explain the difference between HashMap, ConcurrentHashMap, and Hashtable in Java.',
              answer: '1. HashMap is unsynchronized and allows one null key and multiple null values.\n2. Hashtable is thread-safe using full method-level lock synchronization, which degrades concurrency.\n3. ConcurrentHashMap uses segment-level/bucket-level locking (CAS + synchronized blocks on nodes) allowing high concurrent throughput without locking the entire map.',
              codeSnippet: `// ConcurrentHashMap Example\nConcurrentMap<String, Integer> map = new ConcurrentHashMap<>();\nmap.putIfAbsent("key", 100);`,
              difficulty: 'Medium',
              companyTags: ['Amazon', 'Google', 'Flipkart']
            },
            {
              id: 't2',
              subject: 'DBMS',
              topic: 'Transactions & ACID',
              question: 'What are ACID properties in Database Management Systems and how are they enforced?',
              answer: 'Atomicity: All operations in a transaction succeed or none do (enforced via Undo Log).\nConsistency: Database satisfies all schema constraints before & after transaction.\nIsolation: Concurrent transactions execute without mutual interference (enforced via Locking / MVCC).\nDurability: Committed data persists even after system crash (enforced via Redo Log / WAL).',
              difficulty: 'Medium',
              companyTags: ['Microsoft', 'Oracle']
            },
            {
              id: 't3',
              subject: 'Operating Systems',
              topic: 'Process Management',
              question: 'Distinguish between Deadlock Avoidance (Banker\'s Algorithm) and Deadlock Prevention.',
              answer: 'Deadlock Prevention disables at least one of the 4 necessary conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait).\nDeadlock Avoidance dynamically checks resource allocation state to ensure the system never enters an unsafe state (e.g., Dijkstra\'s Banker\'s Algorithm).',
              difficulty: 'Hard',
              companyTags: ['Cisco', 'Qualcomm']
            },
            {
              id: 't4',
              subject: 'Data Structures',
              topic: 'Trees & Graphs',
              question: 'Compare Breadth-First Search (BFS) vs Depth-First Search (DFS) in graph traversal.',
              answer: 'BFS uses a Queue (FIFO) and visits nodes layer-by-layer. It guarantees finding the shortest path in unweighted graphs.\nDFS uses a Stack / Recursion and explores paths as deep as possible before backtracking. Space complexity is O(V) or O(H).',
              codeSnippet: `// BFS using Queue\nQueue<Integer> q = new LinkedList<>();\nq.add(startNode);\nvisited[startNode] = true;`,
              difficulty: 'Easy',
              companyTags: ['TCS', 'Infosys', 'Wipro']
            }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchQuestions();
  }, [token]);

  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarkedIds);
    if (next.has(id)) {
      next.delete(id);
      addToast('Question removed from bookmarks', 'info');
    } else {
      next.add(id);
      addToast('Question saved to bookmarks', 'success');
    }
    setBookmarkedIds(next);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

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
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 font-semibold mb-1">Knowledge Repository</p>
          <h1 className="text-4xl font-serif italic text-[#1A1A1A]">Technical Q&A Bank</h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, questions..."
            className="w-full bg-white border border-[#1A1A1A]/30 rounded-full pl-10 pr-4 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Java', 'DBMS', 'Operating Systems', 'Data Structures', 'C++', 'SQL'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedSubject === sub
                ? 'bg-[#1A1A1A] text-[#F9F7F2]'
                : 'border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          const isBookmarked = bookmarkedIds.has(q.id);

          return (
            <div
              key={q.id}
              className="border border-[#1A1A1A] bg-[#F9F7F2] rounded-[24px] p-6 transition-all hover:shadow-lg space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="cursor-pointer space-y-2 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">
                      {q.subject} • {q.topic}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-[#1A1A1A]/20 font-semibold">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif italic text-[#1A1A1A] leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className={`p-2 rounded-full border transition-all ${
                      isBookmarked
                        ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                        : 'border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                    title="Bookmark Question"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-2 rounded-full border border-[#1A1A1A]/20 text-[#1A1A1A]"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Company Tags */}
              {q.companyTags && q.companyTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider opacity-40 font-semibold">Asked in:</span>
                  {q.companyTags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#F0EDE5] border border-[#1A1A1A]/10 font-medium text-[#1A1A1A]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded Answer Section */}
              {isExpanded && (
                <div className="pt-4 border-t border-[#1A1A1A]/10 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-semibold">Explanation</p>
                    <p className="text-sm text-[#1A1A1A]/90 whitespace-pre-wrap leading-relaxed font-sans">
                      {q.answer}
                    </p>
                  </div>

                  {q.codeSnippet && (
                    <div className="bg-[#1A1A1A] text-[#F9F7F2] p-4 rounded-2xl">
                      <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-2">Code Snippet</p>
                      <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                        {q.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
