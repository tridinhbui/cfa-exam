'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/quiz-card';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { QuizResults } from '@/components/quiz/quiz-results';
import { useQuizStore, QuizQuestion } from '@/store/quiz-store';
import Link from 'next/link';

// Mock questions for demo
const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    content: 'According to the CFA Institute Code of Ethics, members and candidates must place the integrity of the investment profession and the interests of clients above their own personal interests. Which of the following actions would most likely violate this principle?',
    optionA: 'A portfolio manager who discloses potential conflicts of interest to clients',
    optionB: 'An analyst who recommends a security in which she owns shares, without disclosure',
    optionC: 'A financial advisor who refers clients to other professionals when appropriate',
    correctAnswer: 'B',
    explanation: 'Standard VI(A) - Disclosure of Conflicts requires members and candidates to make full and fair disclosure of all matters that could reasonably be expected to impair their independence and objectivity. An analyst who recommends a security in which she owns shares without disclosing this ownership is violating this standard by not revealing a potential conflict of interest.',
    formula: null,
    topic: { id: 'ethics', name: 'Ethics' },
  },
  {
    id: '2',
    content: 'A bond has a Macaulay duration of 7.5 years and a yield to maturity of 6%. What is the approximate modified duration?',
    optionA: '7.08 years',
    optionB: '7.50 years',
    optionC: '7.95 years',
    correctAnswer: 'A',
    explanation: 'Modified Duration = Macaulay Duration / (1 + YTM). Therefore, Modified Duration = 7.5 / (1 + 0.06) = 7.5 / 1.06 = 7.08 years. Modified duration measures the price sensitivity of a bond to changes in interest rates.',
    formula: 'Modified Duration = Macaulay Duration / (1 + YTM)',
    topic: { id: 'fixed-income', name: 'Fixed Income' },
  },
  {
    id: '3',
    content: 'Which of the following statements about the efficient market hypothesis (EMH) is most accurate?',
    optionA: 'Weak-form EMH implies that technical analysis cannot be used to earn abnormal returns',
    optionB: 'Semi-strong form EMH implies that insider information cannot be used to earn abnormal returns',
    optionC: 'Strong-form EMH implies that only fundamental analysis can be used to earn abnormal returns',
    correctAnswer: 'A',
    explanation: 'Weak-form EMH states that current stock prices fully reflect all past price and volume information. This means that technical analysis, which relies on historical price patterns, cannot be used to achieve returns in excess of the market. Semi-strong form EMH includes public information, while strong-form EMH includes all information including insider information.',
    formula: null,
    topic: { id: 'equity', name: 'Equity Investments' },
  },
  {
    id: '4',
    content: 'A company has a debt-to-equity ratio of 0.5, a tax rate of 30%, cost of equity of 12%, and cost of debt of 6%. What is the weighted average cost of capital (WACC)?',
    optionA: '9.40%',
    optionB: '9.00%',
    optionC: '10.40%',
    correctAnswer: 'A',
    explanation: 'With D/E = 0.5, we have: Weight of debt = 0.5/(1+0.5) = 33.33%, Weight of equity = 1/(1+0.5) = 66.67%. WACC = (0.6667 × 12%) + (0.3333 × 6% × (1-0.30)) = 8% + 1.4% = 9.4%',
    formula: 'WACC = (E/V × Re) + (D/V × Rd × (1-T))',
    topic: { id: 'corporate', name: 'Corporate Issuers' },
  },
  {
    id: '5',
    content: 'In a perfect capital market, according to Modigliani and Miller Proposition I, the value of a firm is:',
    optionA: 'Independent of its capital structure',
    optionB: 'Maximized when the firm uses 100% equity financing',
    optionC: 'Maximized when the firm uses 100% debt financing',
    correctAnswer: 'A',
    explanation: 'Modigliani and Miller Proposition I (without taxes) states that in a perfect capital market, the total value of a firm is independent of its capital structure. The value of the firm depends only on its expected future operating cash flows and the risk of those cash flows, not on how the firm is financed.',
    formula: 'VL = VU (in perfect markets without taxes)',
    topic: { id: 'corporate', name: 'Corporate Issuers' },
  },
  {
    id: '6',
    content: 'Which of the following best describes the central limit theorem?',
    optionA: 'The mean of a large sample will always equal the population mean',
    optionB: 'The sampling distribution of the sample mean approaches a normal distribution as sample size increases',
    optionC: 'Larger samples always have smaller standard deviations',
    correctAnswer: 'B',
    explanation: 'The Central Limit Theorem states that for a population with mean μ and finite variance σ², the sampling distribution of the sample mean approaches a normal distribution with mean μ and variance σ²/n as the sample size n increases, regardless of the shape of the original population distribution.',
    formula: 'Standard Error = σ / √n',
    topic: { id: 'quant', name: 'Quantitative Methods' },
  },
  {
    id: '7',
    content: 'An investor purchases a European call option with a strike price of $50 for a premium of $5. At expiration, the underlying stock price is $58. What is the profit or loss on the position?',
    optionA: '$3 profit',
    optionB: '$8 profit',
    optionC: '$5 loss',
    correctAnswer: 'A',
    explanation: 'At expiration, the call option is in the money. The intrinsic value = Max(0, S - K) = Max(0, $58 - $50) = $8. The profit = Intrinsic value - Premium paid = $8 - $5 = $3 profit.',
    formula: 'Call Payoff = Max(0, ST - K); Profit = Payoff - Premium',
    topic: { id: 'derivatives', name: 'Derivatives' },
  },
  {
    id: '8',
    content: 'According to IFRS, which of the following would most likely be recognized as an intangible asset?',
    optionA: 'Internally generated goodwill',
    optionB: 'Research costs',
    optionC: 'Development costs that meet specific criteria',
    correctAnswer: 'C',
    explanation: 'Under IFRS, development costs can be capitalized as an intangible asset if they meet specific criteria (technical feasibility, intention to complete, ability to use or sell, probable future economic benefits, availability of resources, and reliable measurement). Research costs must be expensed, and internally generated goodwill cannot be recognized.',
    formula: null,
    topic: { id: 'fra', name: 'Financial Reporting' },
  },
  {
    id: '9',
    content: 'If GDP increases by 4% while the GDP deflator increases by 2%, what is the approximate real GDP growth rate?',
    optionA: '2%',
    optionB: '6%',
    optionC: '8%',
    correctAnswer: 'A',
    explanation: 'Real GDP growth ≈ Nominal GDP growth - Inflation (GDP deflator growth). Therefore, Real GDP growth ≈ 4% - 2% = 2%. This approximation works well for small percentage changes.',
    formula: 'Real GDP Growth ≈ Nominal GDP Growth - Inflation',
    topic: { id: 'economics', name: 'Economics' },
  },
  {
    id: '10',
    content: 'Which of the following is most likely a characteristic of a well-diversified portfolio?',
    optionA: 'Eliminates all risk',
    optionB: 'Eliminates systematic risk only',
    optionC: 'Eliminates unsystematic risk only',
    correctAnswer: 'C',
    explanation: 'Diversification reduces unsystematic (company-specific or idiosyncratic) risk by spreading investments across many securities. However, systematic (market) risk cannot be eliminated through diversification as it affects all securities in the market. A well-diversified portfolio will have minimal unsystematic risk but will still be exposed to systematic risk.',
    formula: 'Total Risk = Systematic Risk + Unsystematic Risk',
    topic: { id: 'pm', name: 'Portfolio Management' },
  },
];

export default function QuizSessionPage() {
  const {
    questions,
    currentIndex,
    answers,
    isCompleted,
    showExplanation,
    startQuiz,
    setAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    toggleExplanation,
  } = useQuizStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start quiz with mock questions
    startQuiz(mockQuestions, 'PRACTICE');
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, [startQuiz]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading quiz...</p>
        </motion.div>
      </div>
    );
  }

  if (isCompleted) {
    return <QuizResults />;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id] || null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/quiz">
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
        </Link>
        <QuizTimer />
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Flag
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <QuizProgress />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuizCard
            key={currentQuestion.id}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(answer) => setAnswer(currentQuestion.id, answer)}
            showResult={selectedAnswer !== null}
            showExplanation={showExplanation}
            onToggleExplanation={toggleExplanation}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground font-medium">
          {Object.keys(answers).length} of {questions.length} answered
        </span>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={submitQuiz} variant="success">
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

