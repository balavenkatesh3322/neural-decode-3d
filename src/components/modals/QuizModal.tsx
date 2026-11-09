import React, { useState } from 'react';
import { Architecture } from '../../types/architecture';
import { HelpCircle, X, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSfx } from '../../features/audio/audio';

interface QuizModalProps {
  architecture: Architecture;
  onClose: () => void;
  /** Called with the final score fraction (0–1) when the quiz is finished. */
  onComplete?: (score: number) => void;
  /** Fly the 3D camera to the part a question is about. */
  onShowInModel?: (componentId: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ architecture, onClose, onComplete, onShowInModel }) => {
  const questions = architecture.quizQuestions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const q = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === q.correctOptionIndex) {
      setScore((prev) => prev + 1);
      playSfx('correct');
    } else {
      playSfx('wrong');
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      onComplete?.(score / questions.length);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#FBF9F5] border border-[#E8E3D8] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 uppercase">
                3D Architecture Assessment
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                {architecture.name} Knowledge Quiz
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isCompleted ? (
            <>
              {/* Progress & Score Header */}
              <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                <span>
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="font-semibold text-amber-700">Score: {score}</span>
              </div>

              {/* Question Box */}
              <h3 className="font-serif font-semibold text-lg text-stone-900 leading-snug">
                {q.question}
              </h3>

              {/* Option List */}
              <div className="space-y-2.5">
                {q.options.map((option, idx) => {
                  let style =
                    'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50';
                  if (isAnswered) {
                    if (idx === q.correctOptionIndex) {
                      style = 'bg-emerald-500 text-white border-emerald-600 font-semibold shadow-md';
                    } else if (idx === selectedOption) {
                      style = 'bg-rose-500 text-white border-rose-600 font-semibold';
                    } else {
                      style = 'bg-stone-100 border-stone-200 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all duration-300 flex items-center justify-between ${style}`}
                    >
                      <span className="font-sans">{option}</span>
                      {isAnswered && idx === q.correctOptionIndex && (
                        <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== q.correctOptionIndex && (
                        <XCircle className="w-4 h-4 text-white flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-mono font-bold block text-[10px] uppercase text-amber-800">
                    EXPLANATION
                  </span>
                  <p className="font-sans leading-relaxed">{q.explanation}</p>
                  {q.targetNodeId && onShowInModel && (
                    <button
                      onClick={() => onShowInModel(q.targetNodeId!)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-amber-300 text-xs font-semibold hover:bg-black"
                    >
                      Show me this part in 3D →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Quiz Completion Screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-stone-900">Quiz Completed!</h3>
              <p className="text-sm text-stone-600 font-sans">
                You scored <span className="font-bold text-amber-700">{score}</span> out of{' '}
                <span className="font-bold text-stone-900">{questions.length}</span> correct on{' '}
                {architecture.name}.
              </p>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-medium transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Next Button */}
        {!isCompleted && isAnswered && (
          <div className="p-4 border-t border-[#E8E3D8] bg-white flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-md transition-all"
            >
              <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
