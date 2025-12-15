'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VignetteReaderProps {
  title: string;
  content: string;
  timeLimit: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function VignetteReader({
  title,
  content,
  timeLimit,
  currentQuestion,
  totalQuestions,
}: VignetteReaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split content into paragraphs for better reading
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <Card className={cn(
      'transition-all duration-300',
      isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''
    )}>
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-slate-400">Item Set Vignette</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {timeLimit} min
            </Badge>
            <Badge variant="default">
              Q{currentQuestion}/{totalQuestions}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(
        'p-6',
        isExpanded ? 'max-h-none' : 'max-h-[400px] overflow-y-auto'
      )}>
        <div className="prose prose-invert prose-sm max-w-none">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-slate-300 leading-relaxed mb-4"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

