'use client';

import { motion } from 'framer-motion';
import { Check, X, HelpCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizQuestion } from '@/store/quiz-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
        <div className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                Question {questionNumber} of {totalQuestions}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-black text-[10px] bg-slate-800 text-slate-300 border-slate-700 uppercase tracking-widest">
                {question.topic.name}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "font-black text-[10px] uppercase tracking-widest border-2",
                  question.difficulty === 'EASY' && "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
                  question.difficulty === 'MEDIUM' && "text-amber-500 border-amber-500/20 bg-amber-500/5",
                  question.difficulty === 'HARD' && "text-rose-500 border-rose-500/20 bg-rose-500/5"
                )}
              >
                {question.difficulty}
              </Badge>
            </div>
          </div>
          <div className="markdown-content text-2xl font-extrabold text-foreground leading-[1.4] tracking-tight">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <span className="inline-block mb-2">{children}</span>,
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-6 rounded-xl border border-border bg-card/50">
                    <table className="w-full border-collapse" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => <thead className="bg-muted/50" {...props} />,
                th: ({ ...props }) => <th className="border-b border-border p-3 text-left font-black uppercase text-xs tracking-wider" {...props} />,
                td: ({ ...props }) => <td className="border-b border-border/50 p-3 text-sm font-medium" {...props} />,
              }}
            >
              {question.content}
            </ReactMarkdown>
          </div>
        </div>


        <CardContent className="p-6">
          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.label;
              const isCorrectAnswer = question.correctAnswer === option.label;

              let optionClass = 'border-border hover:border-primary/50 hover:bg-muted/50';

              if (showResult) {
                if (isCorrectAnswer) {
                  optionClass = 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10';
                } else if (isSelected && !isCorrectAnswer) {
                  optionClass = 'border-red-500 bg-red-500/5 dark:bg-red-500/10';
                }
              } else if (isSelected) {
                optionClass = 'border-primary bg-primary/5 dark:bg-primary/10';
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
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
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
                  <div className="text-foreground pt-1.5 font-medium markdown-content-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <span className="inline-block">{children}</span>,
                      }}
                    >
                      {option.value}
                    </ReactMarkdown>
                  </div>
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
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">Correct!</p>
                      <p className="text-sm text-muted-foreground font-medium">Great job on this question.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-red-600 dark:text-red-400">Incorrect</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        The correct answer is {question.correctAnswer}.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Toggle Explanation Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExplanation}
                  className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </Button>
              </div>

              {/* Explanation Content */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-violet-500 mt-1 shrink-0" />
                    <div className="w-full">
                      <h4 className="font-bold text-violet-900 dark:text-violet-100 mb-2">Explanation</h4>
                      <div className="markdown-content text-sm text-violet-800/80 dark:text-violet-200/80 leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            table: ({ ...props }) => (
                              <div className="overflow-x-auto my-4 rounded-lg border border-violet-200 dark:border-violet-800">
                                <table className="w-full border-collapse" {...props} />
                              </div>
                            ),
                            thead: ({ ...props }) => <thead className="bg-violet-100/50 dark:bg-violet-900/50" {...props} />,
                            th: ({ ...props }) => <th className="border-b border-violet-200 dark:border-violet-800 p-2 text-left font-bold" {...props} />,
                            td: ({ ...props }) => <td className="border-b border-violet-100 dark:border-violet-900 p-2" {...props} />,
                          }}
                        >
                          {question.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}


        </CardContent>
      </Card>
    </motion.div >
  );
}
