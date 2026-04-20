import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Trophy, Share2, ArrowRight, RefreshCw, AlertCircle, Clock, CheckCircle2, Circle, LogIn, UserCircle2, XCircle } from 'lucide-react';
import { QUESTIONS } from './constants';
import { QuizResult, LeaderboardEntry } from './types';
import { ProgressBar } from './components/ProgressBar';
import { OptionCard } from './components/OptionCard';
import { cn } from './lib/utils';
import { auth, signInWithGoogle } from './lib/firebase';
import { saveScore, getLeaderboard } from './services/scoreService';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [gameState, setGameState] = useState<'landing' | 'quiz' | 'result'>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [result, setResult] = useState<QuizResult>({ score: 0, total: QUESTIONS.length, answers: [], pointsEarned: 0 });
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [reviewTab, setReviewTab] = useState<'mistakes' | 'all'>('mistakes');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (gameState !== 'quiz') return;
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsedTime(`${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  useEffect(() => {
    if (gameState === 'result') {
      fetchLeaderboard();
    }
  }, [gameState]);

  const fetchLeaderboard = async () => {
    const data = await getLeaderboard();
    setLeaderboard(data);
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const handleStart = () => {
    setResult({ score: 0, total: QUESTIONS.length, answers: [], pointsEarned: 0 });
    setCurrentQuestionIndex(0);
    setGameState('quiz');
    setStartTime(Date.now());
    setHasSaved(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || isAnswered) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);

    setResult(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      pointsEarned: isCorrect ? prev.pointsEarned + (currentQuestion.points || 10) : prev.pointsEarned,
      answers: [...prev.answers, { questionId: currentQuestion.id, selectedOption, isCorrect }]
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('result');
    }
  };

  const handleRestart = () => {
    setGameState('landing');
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleLogin = async () => {
    const u = await signInWithGoogle();
    setUser(u);
  };

  const handleSaveScore = async () => {
    if (!user || isSaving || hasSaved) return;
    setIsSaving(true);
    try {
      await saveScore(result.pointsEarned, result.score, result.total);
      setHasSaved(true);
      fetchLeaderboard();
    } catch (e) {
      alert("Erro ao salvar pontuação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const text = `Fiz meu Simulado UNIVESP 2025! Marquei ${result.pointsEarned} pontos (${result.score}/${result.total}). Desafie-me aqui: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    alert('Link e resultado copiados para a área de transferência!');
  };

  const incorrectAnswers = useMemo(() => {
    return result.answers.filter(a => !a.isCorrect).map(a => {
        const q = QUESTIONS.find(question => question.id === a.questionId);
        return { ...a, question: q };
    });
  }, [result.answers]);

  const allReviewData = useMemo(() => {
    return result.answers.map(a => {
      const q = QUESTIONS.find(question => question.id === a.questionId);
      return { ...a, question: q };
    });
  }, [result.answers]);

  const feedbackMessage = useMemo(() => {
    const percentage = (result.score / result.total) * 100;
    if (percentage === 100) return "Desempenho Perfeito! Você está pronto para o vestibular.";
    if (percentage >= 80) return "Excelente! Seus estudos estão muito bem encaminhados.";
    if (percentage >= 60) return "Bom trabalho! Continue revisando os pontos fracos.";
    return "Continue praticando! Identifique o que precisa estudar mais.";
  }, [result.score, result.total]);

  if (gameState === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-xl w-full text-center space-y-8"
        >
          <div className="flex justify-center">
             <div className="w-20 h-20 bg-univesp-brand rounded-2xl flex items-center justify-center shadow-2xl relative">
               <span className="text-white font-black text-4xl">U</span>
               {user && (
                   <img src={user.photoURL || ""} alt={user.displayName || ""} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white shadow-md" referrerPolicy="no-referrer" />
               )}
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">UNIVESP Simulado</h1>
            <p className="text-blue-600 uppercase tracking-widest text-[10px] sm:text-xs font-bold">Estudo & Ranking 2025</p>
            <p className="text-slate-500 text-lg leading-relaxed">
              O modo de estudo interativo com ranking em tempo real para os futuros alunos da UNIVESP.
            </p>
          </div>
          
          <div className="space-y-3">
            <button onClick={handleStart} className="btn-primary w-full shadow-blue-900/40">
              Iniciar Simulado
            </button>
            {!user && (
                <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold text-sm bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all">
                    <LogIn className="w-4 h-4" /> Entrar com Google para Salvar Pontos
                </button>
            )}
          </div>
          
          <div className="pt-6 grid grid-cols-3 gap-2 opacity-60">
              <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-[10px] font-bold uppercase">Feedback</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-slate-200">
                  <Trophy className="w-5 h-5 text-univesp-brand" />
                  <span className="text-[10px] font-bold uppercase">Rankings</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase">Revisão</span>
              </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'quiz') {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
        {/* Header Navigation */}
        <nav className="bg-univesp-brand text-white px-4 sm:px-8 py-3 flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white rounded flex items-center justify-center">
              <span className="text-univesp-brand font-bold text-lg">U</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-tight">UNIVESP Simulado</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none">Vestibular 2025</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="text-right">
              <p className="text-[10px] text-blue-200 uppercase font-bold">Tempo</p>
              <p className="font-mono text-lg leading-tight">{elapsedTime}</p>
            </div>
            <div className="text-right border-l border-blue-400 pl-4">
              <p className="text-[10px] text-blue-200 uppercase font-bold">Pontos</p>
              <p className="font-mono text-lg leading-tight text-univesp-yellow">{result.pointsEarned}</p>
            </div>
          </div>
        </nav>

        {/* Progress Bar Section */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center space-x-4 shrink-0 overflow-x-hidden">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline">Progresso</span>
          <ProgressBar current={result.answers.length} total={QUESTIONS.length} />
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
            {result.answers.length} / {QUESTIONS.length}
          </span>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Question Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-12 flex flex-col bg-slate-50/50">
            <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
              <div className="mb-6 sm:mb-8">
                <span className="inline-block px-2.5 py-1 bg-univesp-brand/10 text-univesp-brand text-[10px] font-black rounded mb-3 uppercase tracking-tighter">
                  {currentQuestion.subject}
                </span>
                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug"
                  >
                    {currentQuestion.text}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                {currentQuestion.options.map((option, idx) => (
                  <OptionCard
                    key={idx}
                    index={idx}
                    text={option}
                    selected={selectedOption === idx}
                    faded={selectedOption !== null && selectedOption !== idx}
                    correct={isAnswered ? (idx === currentQuestion.correctAnswer ? true : (selectedOption === idx ? false : null)) : null}
                    disabled={isAnswered}
                    onClick={handleOptionSelect}
                  />
                ))}
              </div>

              {/* Feedback Modal-like Panel */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "mt-6 p-4 rounded-2xl border-2 shadow-lg",
                        selectedOption === currentQuestion.correctAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}
                  >
                    <div className="flex gap-3">
                      <AlertCircle className={cn("w-5 h-5 shrink-0 mt-0.5", selectedOption === currentQuestion.correctAnswer ? "text-green-600" : "text-univesp-red")} />
                      <div className="text-sm">
                        <span className="font-black uppercase text-[10px] block mb-1">
                            {selectedOption === currentQuestion.correctAnswer ? "Sensacional!" : "Ops, quase lá!"}
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                           {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center mb-8 shrink-0">
                {!isAnswered ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleConfirm}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finalizar e Ver Resultados' : 'Próxima Questão'} <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* Leaderboard/Stats Sidebar (Hidden on mobile) */}
          <aside className="w-80 bg-white border-l border-slate-200 p-6 shrink-0 hidden xl:flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Seu Perfil</h2>
            {user ? (
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                    <img src={user.photoURL || ""} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vestibulando</p>
                    </div>
                </div>
            ) : (
                <button onClick={handleLogin} className="w-full py-4 text-xs font-bold text-univesp-brand bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl mb-8 hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                    <UserCircle2 className="w-4 h-4" /> Fazer Login
                </button>
            )}

            <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Ranking Global (Top 5)</h2>
            <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black",
                                idx === 0 ? "bg-univesp-yellow text-univesp-red" : "bg-slate-100 text-slate-500"
                            )}>
                                {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700 truncate">{entry.userName}</span>
                        </div>
                        <span className="text-xs font-black text-univesp-brand tabular-nums">{entry.score} pts</span>
                    </div>
                ))}
                {leaderboard.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhuma pontuação registrada ainda.</p>
                )}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 overflow-x-hidden">
       {/* Result Summary */}
       <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="lg:col-span-2 space-y-6"
           >
             {/* Score Card */}
             <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-univesp-brand" />
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-univesp-yellow rounded-3xl flex items-center justify-center shadow-lg transform rotate-6 scale-110">
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-univesp-red" />
                    </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Resultado Final</h2>
                <div className="py-6 sm:py-8 space-y-2">
                    <div className="text-6xl sm:text-8xl font-black text-univesp-brand tabular-nums tracking-tighter leading-none">{result.pointsEarned}</div>
                    <p className="text-slate-400 font-black text-[10px] sm:text-sm uppercase tracking-widest px-4">{feedbackMessage}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pb-8 border-b border-slate-100">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Acertos</p>
                        <p className="text-2xl font-black text-green-600">{result.score} / {result.total}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tempo Total</p>
                        <p className="text-2xl font-black text-slate-800">{elapsedTime}</p>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-3">
                   {user ? (
                       <button 
                         onClick={handleSaveScore} 
                         disabled={isSaving || hasSaved}
                         className={cn(
                             "flex-1 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg",
                             hasSaved ? "bg-green-500 text-white shadow-green-200" : "bg-univesp-brand text-white shadow-blue-200"
                         )}
                       >
                           {hasSaved ? <><CheckCircle2 className="w-5 h-5" /> PONTUAÇÃO SALVA</> : 
                            isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                            <><LogIn className="w-5 h-5" /> SALVAR NO RANKING</>}
                       </button>
                   ) : (
                       <button onClick={handleLogin} className="flex-1 bg-white border-2 border-univesp-brand text-univesp-brand py-4 px-6 rounded-2xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                           <LogIn className="w-5 h-5" /> ENTRAR PARA SALVAR
                       </button>
                   )}
                   <button onClick={handleRestart} className="flex-1 bg-slate-100 text-slate-600 py-4 px-6 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                       <RefreshCw className="w-5 h-5" /> NOVO SIMULADO
                   </button>
                </div>
             </div>

             {/* Study Mode: Review Tabs */}
             <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
                     <div className="flex items-center gap-3">
                         <BookOpen className="w-6 h-6 text-univesp-brand" />
                         <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight">Revisão do Simulado</h3>
                     </div>
                     <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                         <button 
                            onClick={() => setReviewTab('mistakes')}
                            className={cn(
                                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                reviewTab === 'mistakes' ? "bg-white text-univesp-brand shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                         >
                             Erros ({incorrectAnswers.length})
                         </button>
                         <button 
                            onClick={() => setReviewTab('all')}
                            className={cn(
                                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                reviewTab === 'all' ? "bg-white text-univesp-brand shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                         >
                             Todas ({QUESTIONS.length})
                         </button>
                     </div>
                 </div>

                 <div className="space-y-4 sm:space-y-6">
                     {(reviewTab === 'mistakes' ? incorrectAnswers : allReviewData).map((err, i) => (
                         <div key={i} className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                             <div className="flex items-center justify-between mb-4 pr-12 sm:pr-16">
                                 <span className="text-[10px] font-black text-slate-300 group-hover:text-univesp-brand transition-colors capitalize">{err.question?.subject}</span>
                                 {reviewTab === 'all' && (
                                     <span className={cn(
                                         "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                                         err.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-univesp-red"
                                     )}>
                                         {err.isCorrect ? "Acerto" : "Erro"}
                                     </span>
                                 )}
                             </div>
                             <h4 className="text-sm font-bold text-slate-800 mb-4 leading-relaxed">{err.question?.text}</h4>
                             <div className="flex flex-col gap-3">
                                 <div className="flex items-start gap-2 text-xs">
                                     <span className={cn(
                                         "shrink-0 w-5 h-5 rounded flex items-center justify-center font-black",
                                         err.isCorrect ? "bg-green-500/10 text-green-600" : "bg-univesp-red/10 text-univesp-red"
                                     )}>
                                         {err.isCorrect ? "✓" : "X"}
                                     </span>
                                     <span className={cn("font-medium", err.isCorrect ? "text-green-700" : "text-slate-500")}>
                                         Sua escolha: {err.question?.options[err.selectedOption]}
                                     </span>
                                 </div>
                                 {!err.isCorrect && (
                                     <div className="flex items-start gap-2 text-xs">
                                         <span className="shrink-0 w-5 h-5 bg-green-500/10 text-green-600 rounded flex items-center justify-center font-black">✓</span>
                                         <span className="text-slate-800 font-bold">Correta: {err.question?.options[err.question?.correctAnswer]}</span>
                                     </div>
                                 )}
                                 
                                 <button 
                                    onClick={() => setExpandedExplanations(prev => ({ ...prev, [err.questionId]: !prev[err.questionId] }))}
                                    className="mt-2 w-fit text-[10px] font-black text-univesp-brand uppercase flex items-center gap-1 hover:text-blue-800 transition-colors"
                                 >
                                    <BookOpen className="w-3 h-3" />
                                    {expandedExplanations[err.questionId] ? "Ocultar explicação" : "Ver explicação"}
                                 </button>

                                 <AnimatePresence>
                                     {expandedExplanations[err.questionId] && (
                                         <motion.div
                                             initial={{ height: 0, opacity: 0 }}
                                             animate={{ height: "auto", opacity: 1 }}
                                             exit={{ height: 0, opacity: 0 }}
                                             className="overflow-hidden"
                                         >
                                             <div className="mt-2 p-4 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed italic shadow-sm">
                                                 <span className="font-bold text-slate-700 not-italic">Reforço: </span> {err.question?.explanation}
                                             </div>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                             </div>
                         </div>
                     ))}
                     {reviewTab === 'mistakes' && incorrectAnswers.length === 0 && (
                         <div className="text-center py-12 bg-green-50 rounded-2xl border border-dashed border-green-200">
                             <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
                             <p className="text-sm font-bold text-green-700">Incrível! Você não errou nenhuma questão.</p>
                             <button onClick={() => setReviewTab('all')} className="mt-4 text-[10px] font-black text-green-600 uppercase underline">Ver todas as questões</button>
                         </div>
                     )}
                 </div>
             </div>
           </motion.div>

           {/* Full Leaderboard Panel */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 h-fit"
           >
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Melhores Tempos</h3>
                  <Share2 onClick={handleShare} className="w-5 h-5 text-slate-400 cursor-pointer hover:text-univesp-brand" />
              </div>
              <div className="space-y-3">
                  {leaderboard.map((entry, idx) => (
                      <div key={entry.id} className={cn(
                          "flex items-center justify-between p-3 rounded-2xl transition-all",
                          entry.userId === user?.uid ? "bg-univesp-brand/5 border border-univesp-brand/10" : "bg-slate-50 border border-transparent"
                      )}>
                          <div className="flex items-center gap-4 min-w-0">
                              <span className={cn(
                                  "w-8 h-8 flex items-center justify-center rounded-xl font-black text-sm",
                                  idx === 0 ? "bg-univesp-yellow text-univesp-red" :
                                  idx === 1 ? "bg-slate-200 text-slate-600" :
                                  idx === 2 ? "bg-orange-100 text-orange-700" :
                                  "bg-white text-slate-300"
                              )}>
                                  {idx + 1}
                              </span>
                              <div className="flex-1 truncate">
                                  <p className={cn("text-xs font-bold truncate", entry.userId === user?.uid ? "text-univesp-brand" : "text-slate-700")}>{entry.userName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold tabular-nums italic">{new Date(entry.timestamp).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="text-right ml-4">
                              <p className="text-sm font-black text-slate-900 tabular-nums">{entry.score}</p>
                              <p className="text-[10px] font-bold text-slate-400 tabular-nums">{entry.correctCount}/{entry.totalQuestions}</p>
                          </div>
                      </div>
                  ))}
                  {leaderboard.length === 0 && (
                      <div className="text-center py-12 space-y-4">
                          <UserCircle2 className="w-12 h-12 text-slate-200 mx-auto" />
                          <p className="text-sm text-slate-400 font-medium italic">Seja o primeiro a marcar presença no ranking!</p>
                      </div>
                  )}
              </div>
           </motion.div>
       </div>

       <footer className="mt-12 text-center text-slate-400 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest mb-2">Simulado UNIVESP • 2025</p>
          <p className="text-[10px] leading-relaxed">Este é um projeto educacional para ajudar candidatos ao vestibular. Compartilhe o link e desafie seus amigos para ver quem marca mais pontos no menor tempo!</p>
       </footer>
    </div>
  );
}
