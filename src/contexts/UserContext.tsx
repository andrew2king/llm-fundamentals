import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 用户信息类型
type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

// 学习进度类型
type LearningProgress = {
  visitedSections: string[];
  completedSections: string[];
  quizScores: Record<string, number>;
  lastVisit: string;
};

// 上下文类型
type UserContextType = {
  user: User | null;
  isAuthenticated: boolean;
  learningProgress: LearningProgress;
  login: (email: string, name: string) => void;
  logout: () => void;
  markSectionVisited: (sectionId: string) => void;
  markSectionCompleted: (sectionId: string) => void;
  saveQuizScore: (quizId: string, score: number) => void;
  getOverallProgress: () => number;
};

// 默认学习进度
const defaultProgress: LearningProgress = {
  visitedSections: [],
  completedSections: [],
  quizScores: {},
  lastVisit: new Date().toISOString(),
};

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined);

// 所有 section ID 列表（用于计算进度）
const ALL_SECTIONS = [
  'learning-path',
  'core-knowledge',
  'what-is-llm',
  'core-concepts',
  'architecture',
  'visualizer',
  'training',
  'code',
  'stats',
  'compare',
  'benchmarks',
  'safety',
  'applications',
  'rag',
  'rag-evaluation',
  'tool-calling',
  'structured-output',
  'long-context',
  'deployment',
  'cases',
  'agent-system',
  'agents',
  'agent-flow',
  'agent-teams',
  'prompt-skill',
  'prompt-advanced',
  'prompt-library',
  'skills',
  'skill-library',
  'skill-ecosystem',
  'multimodal',
  'papers',
  'videos',
  'glossary',
  'quiz',
  'calculator',
  'resource-hub',
  'resource-library',
  'resources',
];

// LocalStorage keys
const STORAGE_KEYS = {
  USER: 'llm_user',
  PROGRESS: 'llm_learning_progress',
};

type UserProviderProps = {
  children: ReactNode;
};

// 从 localStorage 加载数据的辅助函数
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch {
    // 忽略解析错误
  }
  return defaultValue;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(() => loadFromStorage(STORAGE_KEYS.USER, null));
  const [learningProgress, setLearningProgress] = useState<LearningProgress>(() =>
    loadFromStorage(STORAGE_KEYS.PROGRESS, defaultProgress)
  );

  // 保存进度到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(learningProgress));
  }, [learningProgress]);

  // 登录
  const login = (email: string, name: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  // 登出
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // 标记 section 为已访问
  const markSectionVisited = (sectionId: string) => {
    setLearningProgress((prev) => {
      if (prev.visitedSections.includes(sectionId)) {
        return { ...prev, lastVisit: new Date().toISOString() };
      }
      return {
        ...prev,
        visitedSections: [...prev.visitedSections, sectionId],
        lastVisit: new Date().toISOString(),
      };
    });
  };

  // 标记 section 为已完成
  const markSectionCompleted = (sectionId: string) => {
    setLearningProgress((prev) => {
      if (prev.completedSections.includes(sectionId)) {
        return prev;
      }
      return {
        ...prev,
        completedSections: [...prev.completedSections, sectionId],
      };
    });
  };

  // 保存测验分数
  const saveQuizScore = (quizId: string, score: number) => {
    setLearningProgress((prev) => ({
      ...prev,
      quizScores: { ...prev.quizScores, [quizId]: score },
    }));
  };

  // 计算整体进度
  const getOverallProgress = () => {
    const completedCount = learningProgress.completedSections.length;
    return Math.round((completedCount / ALL_SECTIONS.length) * 100);
  };

  const value: UserContextType = {
    user,
    isAuthenticated: user !== null,
    learningProgress,
    login,
    logout,
    markSectionVisited,
    markSectionCompleted,
    saveQuizScore,
    getOverallProgress,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook for using user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 导出所有 section 列表
export { ALL_SECTIONS };