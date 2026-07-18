import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { quizQuestions } from '../data/quizQuestions';
import { HelpCircle, Award, CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuizModule: React.FC = () => {
  const { setQuizHighScore } = useSimulator();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = quizQuestions[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || isSubmitted) return;
    
    setIsSubmitted(true);
    if (selectedAnswer === activeQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      setQuizHighScore(score + (selectedAnswer === activeQuestion.correctIndex ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const getOptionClass = (idx: number) => {
    if (!isSubmitted) {
      return selectedAnswer === idx
        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-300';
    }

    if (idx === activeQuestion.correctIndex) {
      return 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold';
    }

    if (selectedAnswer === idx) {
      return 'border-rose-500 bg-rose-950/30 text-rose-400';
    }

    return 'border-slate-900 bg-slate-950/40 text-slate-500 opacity-60';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel rounded-xl p-6 border-slate-800 flex flex-col justify-between min-h-[460px]"
          >
            {/* Header progress */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
                  KNOWLEDGE ASSESSMENT
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Question {currentIdx + 1} of {quizQuestions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-mono font-bold text-slate-200 leading-relaxed">
                {activeQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {activeQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleOptionClick(idx)}
                    className={`w-full text-left font-mono text-xs p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${getOptionClass(
                      idx
                    )}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && idx === activeQuestion.correctIndex && (
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />
                    )}
                    {isSubmitted && selectedAnswer === idx && idx !== activeQuestion.correctIndex && (
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Submitted Feedback details */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2 mt-4"
                >
                  <span className={`font-mono text-xs font-bold block ${
                    selectedAnswer === activeQuestion.correctIndex ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedAnswer === activeQuestion.correctIndex ? '✓ Correct Answer!' : '✗ Incorrect'}
                  </span>
                  <p className="text-xs font-mono text-slate-400 leading-relaxed">
                    {activeQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center border-t border-slate-800/60 pt-4 mt-6">
              {!isSubmitted ? (
                <button
                  disabled={selectedAnswer === null}
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs py-2 px-5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  SUBMIT ANSWER
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {currentIdx === quizQuestions.length - 1 ? 'FINISH QUIZ' : 'NEXT QUESTION'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-xl p-8 border-slate-800 text-center space-y-6"
          >
            <div className="flex justify-center">
              <Award className="h-16 w-16 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-mono font-bold text-white tracking-wide uppercase">
                ASSESSMENT COMPLETE!
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Your performance score has been compiled and saved.
              </p>
            </div>

            {/* Score block */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-xs mx-auto space-y-2">
              <span className="text-[10px] text-slate-500 font-mono block">FINAL SCORE:</span>
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                {score} / {quizQuestions.length}
              </span>
              <div className="text-[10px] text-slate-400 font-mono pt-1">
                {score >= 8 ? (
                  <span className="text-emerald-400">Security Professional Status Achieved!</span>
                ) : score >= 5 ? (
                  <span className="text-cyan-400">Intermediate Competency verified.</span>
                ) : (
                  <span className="text-slate-500">Practice recommended. Try reading the Exploit Library.</span>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-slate-800 max-w-sm mx-auto">
              <button
                onClick={handleRestart}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-lg font-mono text-xs text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> RETAKE QUIZ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
