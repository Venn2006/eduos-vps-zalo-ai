export interface GeneratedVocabulary {
  word: string;
  type: string;
  meaning: string;
  example: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CurriculumGenerationResult {
  cefrLevel: string;
  vocabulary: GeneratedVocabulary[];
  quizQuestions: GeneratedQuizQuestion[];
  clozeTest: string;
  writingPrompt: string;
  teacherNoteDraft: string;
}

export function generateDemoCurriculum(passageTitle: string): CurriculumGenerationResult {
  // Deterministic mock generation based on the passage title (or just return static mock)
  
  return {
    cefrLevel: "B1",
    vocabulary: [
      {
        word: "Sustainable",
        type: "adj",
        meaning: "Bền vững",
        example: "We need to find sustainable sources of energy."
      },
      {
        word: "Environment",
        type: "noun",
        meaning: "Môi trường",
        example: "Protecting the environment is everyone's responsibility."
      },
      {
        word: "Impact",
        type: "noun",
        meaning: "Tác động",
        example: "Pollution has a negative impact on our health."
      }
    ],
    quizQuestions: [
      {
        question: "What does the author suggest is the primary cause of modern environmental issues?",
        options: [
          "A. Overpopulation",
          "B. Industrial pollution",
          "C. Deforestation",
          "D. Lack of education"
        ],
        correctAnswer: "B. Industrial pollution",
        explanation: "In paragraph 2, the author clearly states that industrial pollution is the root cause."
      },
      {
        question: "Which word is closest in meaning to 'sustainable'?",
        options: [
          "A. Temporary",
          "B. Renewable",
          "C. Harmful",
          "D. Expensive"
        ],
        correctAnswer: "B. Renewable",
        explanation: "Renewable means capable of being renewed, which fits the context of sustainable energy."
      }
    ],
    clozeTest: "The modern world is facing unprecedented challenges regarding the ________ (environment). Many experts argue that ________ (sustainable) practices must be adopted immediately.",
    writingPrompt: "Do you agree that individuals can make a significant impact on environmental protection? Write an essay (150-200 words) explaining your view.",
    teacherNoteDraft: "Bài tập này tập trung vào từ vựng chủ đề Môi trường (B1). Phù hợp làm bài tập về nhà sau Unit 4. Khuyến nghị cho thêm 1 bài nghe ngắn đi kèm để củng cố từ vựng."
  };
}
