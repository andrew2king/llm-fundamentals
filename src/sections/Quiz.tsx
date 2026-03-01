import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, XCircle, HelpCircle, Trophy, RotateCcw, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const quizQuestions = [
  {
    question: 'Transformer架构的核心创新是什么？',
    options: [
      '使用更深的神经网络',
      '引入自注意力机制',
      '使用更大的数据集',
      '采用卷积神经网络',
    ],
    correct: 1,
    explanation: 'Transformer的核心创新是自注意力机制（Self-Attention），它允许模型在处理序列时动态地关注输入的不同部分，而无需依赖循环或卷积结构。',
  },
  {
    question: 'Tokenization的作用是什么？',
    options: [
      '将文本转换为token序列',
      '训练神经网络',
      '生成文本摘要',
      '评估模型性能',
    ],
    correct: 0,
    explanation: 'Tokenization是将原始文本分割成模型可理解的token单元的过程，这是模型处理文本的第一步。',
  },
  {
    question: '什么是"幻觉"（Hallucination）？',
    options: [
      '模型运行速度变慢',
      '模型生成错误但看似合理的内容',
      '模型无法处理长文本',
      '模型参数过多',
    ],
    correct: 1,
    explanation: '幻觉是指模型生成看似合理但实际错误或虚构的内容，这是大语言模型的一个固有问题。',
  },
  {
    question: 'Temperature参数的作用是什么？',
    options: [
      '控制模型的运行温度',
      '控制输出的随机性',
      '限制上下文长度',
      '调整学习率',
    ],
    correct: 1,
    explanation: 'Temperature控制模型输出的随机性。较高的Temperature使输出更随机、创造性更强；较低的Temperature使输出更确定、保守。',
  },
  {
    question: 'RAG技术的主要目的是什么？',
    options: [
      '提高模型推理速度',
      '减少模型幻觉',
      '增加模型参数量',
      '降低训练成本',
    ],
    correct: 1,
    explanation: 'RAG（检索增强生成）通过从外部知识库检索相关信息来辅助生成，有效减少模型幻觉，提高回答的准确性。',
  },
  {
    question: 'Fine-tuning（微调）的优势是什么？',
    options: [
      '需要从头训练模型',
      '可以使用预训练知识并适应特定任务',
      '增加模型的参数量',
      '提高模型的推理速度',
    ],
    correct: 1,
    explanation: '微调允许我们在预训练模型的基础上，使用特定任务数据进行进一步训练，既保留了预训练知识，又能适应特定需求，且比从头训练更高效。',
  },
  {
    question: '上下文窗口（Context Window）决定了什么？',
    options: [
      '模型的参数量',
      '模型一次能处理的最大token数',
      '模型的训练速度',
      '模型的输出长度',
    ],
    correct: 1,
    explanation: '上下文窗口决定了模型一次能处理的最大token数量，这直接影响模型能"记住"多少信息和处理多长的文本。',
  },
  {
    question: '多头注意力（Multi-Head Attention）的作用是什么？',
    options: [
      '增加模型的参数量',
      '从不同角度捕捉词间关系',
      '减少计算量',
      '提高推理速度',
    ],
    correct: 1,
    explanation: '多头注意力使用多组不同的注意力权重，让模型能够从不同角度（如语法、语义、指代等）捕捉词与词之间的关系。',
  },
];

// Helper to load saved quiz state from localStorage
function loadQuizState() {
  try {
    const saved = localStorage.getItem('llm_quiz_state');
    if (!saved) return null;
    return JSON.parse(saved) as {
      currentQuestion?: number;
      selectedAnswer?: number | null;
      showResult?: boolean;
      score?: number;
      answers?: number[];
      quizCompleted?: boolean;
    };
  } catch {
    return null;
  }
}

const savedState = loadQuizState();

export default function Quiz() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentQuestion, setCurrentQuestion] = useState(savedState?.currentQuestion ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(savedState?.selectedAnswer ?? null);
  const [showResult, setShowResult] = useState(savedState?.showResult ?? false);
  const [score, setScore] = useState(savedState?.score ?? 0);
  const [answers, setAnswers] = useState<number[]>(savedState?.answers ?? []);
  const [quizCompleted, setQuizCompleted] = useState(savedState?.quizCompleted ?? false);

  useEffect(() => {
    const payload = JSON.stringify({
      currentQuestion,
      selectedAnswer,
      showResult,
      score,
      answers,
      quizCompleted,
    });
    localStorage.setItem('llm_quiz_state', payload);
  }, [currentQuestion, selectedAnswer, showResult, score, answers, quizCompleted]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.quiz-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setAnswers([...answers, selectedAnswer]);

    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizCompleted(false);
    localStorage.removeItem('llm_quiz_state');
  };

  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / quizQuestions.length) * 100;

  return (
    <section ref={sectionRef} id="quiz" className="relative py-32 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="quiz-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>知识测验</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            测试你的<span className="text-gradient">LLM知识</span>
          </h2>
          <p className="text-white/60">通过互动问答巩固你对大语言模型的理解</p>
        </div>

        {!quizCompleted ? (
          <>
            {/* Progress Bar */}
            <div className="quiz-item mb-8 opacity-0">
              <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                <span>
                  问题 {currentQuestion + 1} / {quizQuestions.length}
                </span>
                <span>得分: {score}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-spacex-blue to-spacex-orange transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="quiz-item p-8 rounded-2xl bg-white/[0.03] border border-white/10 opacity-0">
              <h3 className="text-xl font-semibold mb-6">{currentQ.question}</h3>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correct;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                        showCorrect
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : showWrong
                          ? 'bg-red-500/20 border-2 border-red-500'
                          : isSelected
                          ? 'bg-spacex-orange/20 border-2 border-spacex-orange'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          showCorrect
                            ? 'bg-green-500 text-white'
                            : showWrong
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-spacex-orange text-white'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-spacex-orange" />
                    解析
                  </h4>
                  <p className="text-white/70">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6 flex justify-end">
                {!showResult ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 rounded-xl bg-spacex-orange text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spacex-orange/80 transition-colors"
                  >
                    提交答案
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-spacex-blue text-white font-medium hover:bg-spacex-blue/80 transition-colors flex items-center gap-2"
                  >
                    {currentQuestion < quizQuestions.length - 1 ? '下一题' : '查看结果'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results */
          <div className="quiz-item p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center opacity-0">
            <Trophy className="w-16 h-16 text-spacex-orange mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">测验完成!</h3>
            <div className="text-6xl font-bold text-gradient mb-4">
              {score} / {quizQuestions.length}
            </div>
            <p className="text-white/60 mb-8">
              {score === quizQuestions.length
                ? '完美!你是LLM专家!'
                : score >= quizQuestions.length * 0.7
                ? '很棒!你对LLM有很好的理解'
                : score >= quizQuestions.length * 0.5
                ? '不错!继续学习提升自己'
                : '继续加油!多复习一下知识点'}
            </p>

            {/* Review */}
            <div className="text-left mb-8">
              <h4 className="font-semibold mb-4">答题回顾</h4>
              <div className="space-y-2">
                {quizQuestions.map((q, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      answers[i] === q.correct ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {answers[i] === q.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm truncate">{q.question}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              重新测验
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
