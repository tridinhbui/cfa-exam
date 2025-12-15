'use client';

import { motion } from 'framer-motion';
import { Check, X, HelpCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizQuestion } from '@/store/quiz-store';

interface QuizCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showResult: boolean;
  showExplanation: boolean;
  onToggleExplanation: () => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  showExplanation,
  onToggleExplanation,
  questionNumber,
  totalQuestions,
}: QuizCardProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const options = [
    { label: 'A', value: question.optionA },
    { label: 'B', value: question.optionB },
    { label: 'C', value: question.optionC },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border-b border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="default">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge variant="secondary">{question.topic.name}</Badge>
          </div>
          <p className="text-lg text-white leading-relaxed">{question.content}</p>
        </div>

        <CardContent className="p-6">
          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.label;
              const isCorrectAnswer = question.correctAnswer === option.label;
              
              let optionClass = 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800';
              
              if (showResult) {
                if (isCorrectAnswer) {
                  optionClass = 'border-emerald-500 bg-emerald-500/10';
                } else if (isSelected && !isCorrectAnswer) {
                  optionClass = 'border-red-500 bg-red-500/10';
                }
              } else if (isSelected) {
                optionClass = 'border-indigo-500 bg-indigo-500/10';
              }

              return (
                <motion.button
                  key={option.label}
                  onClick={() => !showResult && onSelectAnswer(option.label)}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    optionClass,
                    showResult && 'cursor-default'
                  )}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  disabled={showResult}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                      showResult && isCorrectAnswer
                        ? 'bg-emerald-500 text-white'
                        : showResult && isSelected && !isCorrectAnswer
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    )}
                  >
                    {showResult && isCorrectAnswer ? (
                      <Check className="h-5 w-5" />
                    ) : showResult && isSelected && !isCorrectAnswer ? (
                      <X className="h-5 w-5" />
                    ) : (
                      option.label
                    )}
                  </div>
                  <p className="text-slate-200 pt-2">{option.value}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Result and Explanation */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {/* Result Banner */}
              <div
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl mb-4',
                  isCorrect
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                )}
              >
                {isCorrect ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-400">Correct!</p>
                      <p className="text-sm text-slate-400">Great job on this question.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">Incorrect</p>
                      <p className="text-sm text-slate-400">
                        The correct answer is {question.correctAnswer}.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Toggle Explanation */}
              <Button
                variant="outline"
                onClick={onToggleExplanation}
                className="w-full mb-4"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </Button>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="h-5 w-5 text-indigo-400" />
                    <h4 className="font-semibold text-white">Explanation</h4>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {question.explanation}
                  </p>
                  
                  {question.formula && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Formula</p>
                      <p className="text-indigo-300 font-mono">{question.formula}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

