import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExplanationResult {
  explanation: string;
  mistakeCategory?: string;
  suggestedReading?: string;
  formula?: string;
  keyPoints: string[];
}

export async function generateExplanation(
  question: string,
  options: { a: string; b: string; c: string },
  correctAnswer: string,
  userAnswer: string,
  topic: string
): Promise<ExplanationResult> {
  const isCorrect = userAnswer === correctAnswer;

  const prompt = `You are a CFA exam tutor. A student answered a question ${isCorrect ? 'correctly' : 'incorrectly'}.

Topic: ${topic}

Question: ${question}

Options:
A) ${options.a}
B) ${options.b}
C) ${options.c}

Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Provide a detailed explanation including:
1. Why the correct answer is right
2. ${!isCorrect ? `Why the student's answer (${userAnswer}) is wrong` : 'What makes this a strong understanding'}
3. The key concept or formula involved
4. Related CFA LOS or reading suggestion

Format your response as JSON:
{
  "explanation": "detailed explanation",
  "mistakeCategory": "${!isCorrect ? 'category of error (conceptual/calculation/misread)' : 'null'}",
  "suggestedReading": "relevant CFA reading or topic",
  "formula": "any relevant formula if applicable",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CFA tutor. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      explanation: content,
      keyPoints: [],
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      explanation: 'Unable to generate explanation at this time.',
      keyPoints: [],
    };
  }
}

export async function generateStudyRecommendations(
  topicPerformances: Array<{ topic: string; accuracy: number; attempts: number }>
): Promise<string[]> {
  const prompt = `Based on the following CFA study performance, provide 5 specific study recommendations:

${topicPerformances.map(t => `- ${t.topic}: ${Math.round(t.accuracy * 100)}% accuracy (${t.attempts} attempts)`).join('\n')}

Provide actionable recommendations focusing on weak areas. Format as a JSON array of strings:
["recommendation 1", "recommendation 2", ...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are a CFA study advisor. Respond with a JSON array of strings.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return ['Continue practicing regularly', 'Focus on weak topics'];
  } catch (error) {
    console.error('OpenAI API error:', error);
    return ['Continue practicing regularly'];
  }
}

export default openai;


