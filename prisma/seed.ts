import { PrismaClient, CFALevel, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // 1. Create Topics
    const topicsData = [
        { id: 'ethics', name: 'Ethics', slug: 'ethics', cfaLevel: CFALevel.LEVEL_1, order: 1 },
        { id: 'quant', name: 'Quantitative Methods', slug: 'quant', cfaLevel: CFALevel.LEVEL_1, order: 2 },
        { id: 'economics', name: 'Economics', slug: 'economics', cfaLevel: CFALevel.LEVEL_1, order: 3 },
        { id: 'fra', name: 'Financial Reporting', slug: 'fra', cfaLevel: CFALevel.LEVEL_1, order: 4 },
        { id: 'corporate', name: 'Corporate Issuers', slug: 'corporate', cfaLevel: CFALevel.LEVEL_1, order: 5 },
        { id: 'equity', name: 'Equity Investments', slug: 'equity', cfaLevel: CFALevel.LEVEL_1, order: 6 },
        { id: 'fixed-income', name: 'Fixed Income', slug: 'fixed-income', cfaLevel: CFALevel.LEVEL_1, order: 7 },
        { id: 'derivatives', name: 'Derivatives', slug: 'derivatives', cfaLevel: CFALevel.LEVEL_1, order: 8 },
        { id: 'alts', name: 'Alternative Investments', slug: 'alts', cfaLevel: CFALevel.LEVEL_1, order: 9 },
        { id: 'pm', name: 'Portfolio Management', slug: 'pm', cfaLevel: CFALevel.LEVEL_1, order: 10 },
    ];

    for (const topic of topicsData) {
        await prisma.topic.upsert({
            where: { slug: topic.slug },
            update: topic,
            create: topic,
        });
    }
    console.log('Topics created/updated.');

    // 2. Mock Questions from Frontend
    const questionsData = [
        {
            id: 'mock-1',
            content: 'According to the CFA Institute Code of Ethics, members and candidates must place the integrity of the investment profession and the interests of clients above their own personal interests. Which of the following actions would most likely violate this principle?',
            optionA: 'A portfolio manager who discloses potential conflicts of interest to clients',
            optionB: 'An analyst who recommends a security in which she owns shares, without disclosure',
            optionC: 'A financial advisor who refers clients to other professionals when appropriate',
            correctAnswer: 'B',
            explanation: 'Standard VI(A) - Disclosure of Conflicts requires members and candidates to make full and fair disclosure of all matters that could reasonably be expected to impair their independence and objectivity. An analyst who recommends a security in which she owns shares without disclosing this ownership is violating this standard by not revealing a potential conflict of interest.',
            formula: null,
            difficulty: Difficulty.MEDIUM,
            topicId: 'ethics',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-2',
            content: 'A bond has a Macaulay duration of 7.5 years and a yield to maturity of 6%. What is the approximate modified duration?',
            optionA: '7.08 years',
            optionB: '7.50 years',
            optionC: '7.95 years',
            correctAnswer: 'A',
            explanation: 'Modified Duration = Macaulay Duration / (1 + YTM). Therefore, Modified Duration = 7.5 / (1 + 0.06) = 7.5 / 1.06 = 7.08 years. Modified duration measures the price sensitivity of a bond to changes in interest rates.',
            formula: 'Modified Duration = Macaulay Duration / (1 + YTM)',
            difficulty: Difficulty.MEDIUM,
            topicId: 'fixed-income',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-3',
            content: 'Which of the following statements about the efficient market hypothesis (EMH) is most accurate?',
            optionA: 'Weak-form EMH implies that technical analysis cannot be used to earn abnormal returns',
            optionB: 'Semi-strong form EMH implies that insider information cannot be used to earn abnormal returns',
            optionC: 'Strong-form EMH implies that only fundamental analysis can be used to earn abnormal returns',
            correctAnswer: 'A',
            explanation: 'Weak-form EMH states that current stock prices fully reflect all past price and volume information. This means that technical analysis, which relies on historical price patterns, cannot be used to achieve returns in excess of the market. Semi-strong form EMH includes public information, while strong-form EMH includes all information including insider information.',
            formula: null,
            difficulty: Difficulty.MEDIUM,
            topicId: 'equity',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-4',
            content: 'A company has a debt-to-equity ratio of 0.5, a tax rate of 30%, cost of equity of 12%, and cost of debt of 6%. What is the weighted average cost of capital (WACC)?',
            optionA: '9.40%',
            optionB: '9.00%',
            optionC: '10.40%',
            correctAnswer: 'A',
            explanation: 'With D/E = 0.5, we have: Weight of debt = 0.5/(1+0.5) = 33.33%, Weight of equity = 1/(1+0.5) = 66.67%. WACC = (0.6667 × 12%) + (0.3333 × 6% × (1-0.30)) = 8% + 1.4% = 9.4%',
            formula: 'WACC = (E/V × Re) + (D/V × Rd × (1-T))',
            difficulty: Difficulty.MEDIUM,
            topicId: 'corporate',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-5',
            content: 'In a perfect capital market, according to Modigliani and Miller Proposition I, the value of a firm is:',
            optionA: 'Independent of its capital structure',
            optionB: 'Maximized when the firm uses 100% equity financing',
            optionC: 'Maximized when the firm uses 100% debt financing',
            correctAnswer: 'A',
            explanation: 'Modigliani and Miller Proposition I (without taxes) states that in a perfect capital market, the total value of a firm is independent of its capital structure. The value of the firm depends only on its expected future operating cash flows and the risk of those cash flows, not on how the firm is financed.',
            formula: 'VL = VU (in perfect markets without taxes)',
            difficulty: Difficulty.MEDIUM,
            topicId: 'corporate',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-6',
            content: 'Which of the following best describes the central limit theorem?',
            optionA: 'The mean of a large sample will always equal the population mean',
            optionB: 'The sampling distribution of the sample mean approaches a normal distribution as sample size increases',
            optionC: 'Larger samples always have smaller standard deviations',
            correctAnswer: 'B',
            explanation: 'The Central Limit Theorem states that for a population with mean μ and finite variance σ², the sampling distribution of the sample mean approaches a normal distribution with mean μ and variance σ²/n as the sample size n increases, regardless of the shape of the original population distribution.',
            formula: 'Standard Error = σ / √n',
            difficulty: Difficulty.MEDIUM,
            topicId: 'quant',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-7',
            content: 'An investor purchases a European call option with a strike price of $50 for a premium of $5. At expiration, the underlying stock price is $58. What is the profit or loss on the position?',
            optionA: '$3 profit',
            optionB: '$8 profit',
            optionC: '$5 loss',
            correctAnswer: 'A',
            explanation: 'At expiration, the call option is in the money. The intrinsic value = Max(0, S - K) = Max(0, $58 - $50) = $8. The profit = Intrinsic value - Premium paid = $8 - $5 = $3 profit.',
            formula: 'Call Payoff = Max(0, ST - K); Profit = Payoff - Premium',
            difficulty: Difficulty.MEDIUM,
            topicId: 'derivatives',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-8',
            content: 'According to IFRS, which of the following would most likely be recognized as an intangible asset?',
            optionA: 'Internally generated goodwill',
            optionB: 'Research costs',
            optionC: 'Development costs that meet specific criteria',
            correctAnswer: 'C',
            explanation: 'Under IFRS, development costs can be capitalized as an intangible asset if they meet specific criteria (technical feasibility, intention to complete, ability to use or sell, probable future economic benefits, availability of resources, and reliable measurement). Research costs must be expensed, and internally generated goodwill cannot be recognized.',
            formula: null,
            difficulty: Difficulty.MEDIUM,
            topicId: 'fra',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-9',
            content: 'If GDP increases by 4% while the GDP deflator increases by 2%, what is the approximate real GDP growth rate?',
            optionA: '2%',
            optionB: '6%',
            optionC: '8%',
            correctAnswer: 'A',
            explanation: 'Real GDP growth ≈ Nominal GDP growth - Inflation (GDP deflator growth). Therefore, Real GDP growth ≈ 4% - 2% = 2%. This approximation works well for small percentage changes.',
            formula: 'Real GDP Growth ≈ Nominal GDP Growth - Inflation',
            difficulty: Difficulty.MEDIUM,
            topicId: 'economics',
            cfaLevel: CFALevel.LEVEL_1,
        },
        {
            id: 'mock-10',
            content: 'Which of the following is most likely a characteristic of a well-diversified portfolio?',
            optionA: 'Eliminates all risk',
            optionB: 'Eliminates systematic risk only',
            optionC: 'Eliminates unsystematic risk only',
            correctAnswer: 'C',
            explanation: 'Diversification reduces unsystematic (company-specific or idiosyncratic) risk by spreading investments across many securities. However, systematic (market) risk cannot be eliminated through diversification as it affects all securities in the market. A well-diversified portfolio will have minimal unsystematic risk but will still be exposed to systematic risk.',
            formula: 'Total Risk = Systematic Risk + Unsystematic Risk',
            difficulty: Difficulty.MEDIUM,
            topicId: 'pm',
            cfaLevel: CFALevel.LEVEL_1,
        },
    ];

    for (const q of questionsData) {
        await prisma.question.upsert({
            where: { id: q.id },
            update: q,
            create: q,
        });
    }
    console.log('Questions created/updated.');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
