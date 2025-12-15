# CFA Practice Platform

A comprehensive AI-powered CFA exam preparation platform built with Next.js, featuring MCQ quizzes, Item Sets, Essay practice, and personalized study plans.

![CFA Practice Platform](https://via.placeholder.com/1200x600/1e293b/818cf8?text=CFA+Practice+Platform)

## 🎯 Features

### Core Features

- **Quiz Engine** - Practice MCQ questions by topic with timed modes
  - Topic selection
  - Randomized questions
  - Timed mode (Practice/Timed/Exam)
  - Instant explanations with formulas
  - Score tracking

- **Item Set Simulator** - Level II vignette-style questions
  - Load vignette content
  - 3-6 questions per case
  - Long reading format
  - Time countdown
  - Auto navigation

- **Essay Practice (Level III)** - Constructed response with AI scoring
  - Text input interface
  - AI scoring based on CFA rubric
  - Model answer comparison
  - Missing points feedback
  - Copy prevention

- **AI Explanations** - Powered by OpenAI
  - Detailed answer explanations
  - Mistake category diagnosis
  - Suggested readings & LOS
  - Formula & reasoning

- **Analytics Dashboard**
  - Topic performance tracking
  - Accuracy by question type
  - Error classification
  - Personalized recommendations

- **Study Plan**
  - 12-week roadmap
  - Weekly tasks
  - Exam countdown
  - Progress tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: Zustand
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: OpenAI API
- **Charts**: Recharts

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CFA
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cfa_practice?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard layout routes
│   │   ├── analytics/     # Analytics page
│   │   ├── dashboard/     # Main dashboard
│   │   ├── essays/        # Essay practice
│   │   ├── item-sets/     # Item set simulator
│   │   ├── quiz/          # Quiz engine
│   │   └── study-plan/    # Study planner
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── analytics/         # Analytics components
│   ├── essay/             # Essay components
│   ├── item-set/          # Item set components
│   ├── layout/            # Layout components
│   ├── quiz/              # Quiz components
│   ├── study-plan/        # Study plan components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── openai.ts          # OpenAI integration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── store/
│   ├── quiz-store.ts      # Quiz state management
│   └── user-store.ts      # User state management
└── prisma/
    └── schema.prisma      # Database schema
```

## 🎨 Design System

The platform uses a modern dark theme with:
- **Primary**: Indigo/Violet gradients
- **Background**: Slate 950
- **Cards**: Semi-transparent with backdrop blur
- **Typography**: Outfit font family
- **Animations**: Smooth Framer Motion transitions

## 📊 Database Schema

Key models:
- `User` - User accounts and subscriptions
- `Topic` - CFA curriculum topics
- `Question` - MCQ questions
- `ItemSet` - Vignette-based questions
- `EssayQuestion` - Constructed response questions
- `QuizAttempt` - Quiz session tracking
- `TopicPerformance` - Analytics data
- `StudyPlan` - Personalized study plans

## 🔒 Subscription Model

- **Free Tier**: 30 questions per day
- **Premium Monthly**: Unlimited access
- **Premium Yearly**: Discounted unlimited access
- **Add-on modules**: Level II/III specific content

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t cfa-practice .
docker run -p 3000:3000 cfa-practice
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This platform is not affiliated with CFA Institute. "CFA" and "Chartered Financial Analyst" are registered trademarks owned by CFA Institute.

---

Built with ❤️ for CFA candidates worldwide.
