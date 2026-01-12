'use client';

import { motion } from 'framer-motion';
import { Check, X, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ItemSetQuestionProps {
  question: {
    id: string;
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    correctAnswer?: string;
    explanation?: string;
  };
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  showResult?: boolean;
}

export function ItemSetQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  showResult = false,
}: ItemSetQuestionProps) {
  const options = [
    { label: 'A', value: question.optionA },
    { label: 'B', value: question.optionB },
    { label: 'C', value: question.optionC },
  ];

  const cleanLatex = (text: string) => {
    if (!text) return '';
    return text
      // Simplifying: Collapse any combo of backslashes/spaces before "text" into a single command
      .replace(/[\\ ]+\\text/g, ' \\text')
      // Standard cleanup
      // 3. Unescape ALL escaped dollars globally
      .replace(/\\\$/g, () => '$')
      // 3.5. Re-escape dollars if they are followed by a digit (Currency protection)
      // We use double backslash to ensure it survives one pass of markdown processing if needed, 
      // but usually single \ is enough. However, sticking to single \ for now with function replacement.
      .replace(/\$(?=\d)/g, () => '\\$')
      .replace(/\(\s*\$/g, '(')
      .replace(/\$\s*\)/g, ')')
      // 5. Auto-format simple exponents (base^{exp}) that are missing delimiters
      .replace(/(\((?:[\d\.\s\-\+\*]+)\)\^\{[^\}]+\})/g, (match) => '$' + match + '$');
    // .replace(/\$\s*\\frac/g, '\\frac')
    // .replace(/\$\$/g, '$');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          {/* Question Number */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-slate-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    i + 1 === questionNumber
                      ? 'bg-indigo-500'
                      : i + 1 < questionNumber
                        ? 'bg-slate-600'
                        : 'bg-slate-800'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Question Content */}
          {/* Question Content */}
          <div className="text-white text-lg leading-relaxed mb-6 [&>p]:mb-4">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}>
              {cleanLatex(question.content)}
            </ReactMarkdown>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.label;
              const isCorrect = showResult && question.correctAnswer === option.label;
              const isWrong = showResult && isSelected && question.correctAnswer !== option.label;

              return (
                <motion.button
                  key={option.label}
                  onClick={() => !showResult && onSelectAnswer(option.label)}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    showResult && isCorrect
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : showResult && isWrong
                        ? 'border-red-500 bg-red-500/10'
                        : isSelected
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                  )}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  disabled={showResult}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold',
                      showResult && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showResult && isWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {showResult && isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : showResult && isWrong ? (
                      <X className="h-4 w-4" />
                    ) : (
                      option.label
                    )}
                  </div>
                  <div className="text-slate-300 pt-1 w-full">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}>
                      {cleanLatex(option.value)}
                    </ReactMarkdown>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation (shown after submit) */}
          {showResult && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-6"
            >
              <h4 className="font-semibold text-white mb-2 text-lg">Explanation</h4>

              <div className="text-slate-300 text-base leading-relaxed [&>p]:mb-4">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}>
                  {cleanLatex(question.explanation)}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={isFirst}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {isLast ? (
              <Button onClick={onSubmit} variant="success">
                <Send className="h-4 w-4 mr-2" />
                Submit All
              </Button>
            ) : (
              <Button onClick={onNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


