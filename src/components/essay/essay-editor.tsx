'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatTime, cn } from '@/lib/utils';

interface EssayEditorProps {
  scenario: string;
  prompt: string;
  timeLimit: number; // in minutes
  maxScore: number;
  onSubmit: (response: string) => Promise<void>;
  disabled?: boolean;
}

const MIN_WORDS = 50;
const MAX_WORDS = 500;

export function EssayEditor({
  scenario,
  prompt,
  timeLimit,
  maxScore,
  onSubmit,
  disabled = false,
}: EssayEditorProps) {
  const [response, setResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasteBlocked, setIsPasteBlocked] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const charCount = response.length;
  const progress = Math.min((wordCount / MAX_WORDS) * 100, 100);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || disabled) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, disabled]);

  const handleSubmit = useCallback(async () => {
    if (wordCount < MIN_WORDS || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(response);
    } finally {
      setIsSubmitting(false);
    }
  }, [wordCount, isSubmitting, onSubmit, response]);

  // Auto submit when time is up
  useEffect(() => {
    if (timeRemaining === 0 && !disabled && !isSubmitting) {
      handleSubmit();
    }
  }, [timeRemaining, disabled, isSubmitting, handleSubmit]);

  // Prevent paste (copy prevention)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setIsPasteBlocked(true);
      setTimeout(() => setIsPasteBlocked(false), 2000);
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('paste', handlePaste);
      return () => textarea.removeEventListener('paste', handlePaste);
    }
  }, []);

  const isLowTime = timeRemaining <= 60;
  const isCritical = timeRemaining <= 30;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Scenario Panel */}
      <Card className="lg:sticky lg:top-20 h-fit">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Essay Question
            </CardTitle>
            <Badge variant="secondary">Max {maxScore} points</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Scenario */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Scenario
            </h4>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {scenario}
              </p>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Question
            </h4>
            <p className="text-white font-medium leading-relaxed">
              {prompt}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">
              Instructions
            </h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Write a clear and structured response</li>
              <li>• Support your answer with relevant concepts</li>
              <li>• Minimum {MIN_WORDS} words required</li>
              <li>• AI will evaluate based on CFA rubric</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Editor Panel */}
      <Card>
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle>Your Response</CardTitle>
            <motion.div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                isCritical
                  ? 'bg-red-500/20 border border-red-500/30'
                  : isLowTime
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-slate-800'
              )}
              animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Clock
                className={cn(
                  'h-4 w-4',
                  isCritical
                    ? 'text-red-400'
                    : isLowTime
                    ? 'text-amber-400'
                    : 'text-slate-400'
                )}
              />
              <span
                className={cn(
                  'font-mono font-semibold',
                  isCritical
                    ? 'text-red-400'
                    : isLowTime
                    ? 'text-amber-400'
                    : 'text-white'
                )}
              >
                {formatTime(timeRemaining)}
              </span>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Paste blocked warning */}
          {isPasteBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">
                Paste is disabled. Please type your response.
              </span>
            </motion.div>
          )}

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            className="min-h-[400px] mb-4 resize-none"
            disabled={disabled || isSubmitting}
          />

          {/* Word Count & Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">
                {wordCount} / {MAX_WORDS} words
                {wordCount < MIN_WORDS && (
                  <span className="text-amber-400 ml-2">
                    (min {MIN_WORDS} required)
                  </span>
                )}
              </span>
              <span className="text-slate-500">{charCount} characters</span>
            </div>
            <Progress
              value={progress}
              indicatorClassName={cn(
                wordCount >= MIN_WORDS
                  ? 'from-emerald-600 to-teal-600'
                  : 'from-amber-600 to-orange-600'
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={wordCount < MIN_WORDS || isSubmitting || disabled}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI is Scoring...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Response
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-3">
            Your response will be scored by AI within 5 seconds
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

