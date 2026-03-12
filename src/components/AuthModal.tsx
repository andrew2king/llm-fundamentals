import { useState } from 'react';
import { X, Mail, User, ArrowRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'welcome' | 'register'>('welcome');

  if (!isOpen) return null;

  const handleRegister = () => {
    if (name.trim() && email.trim()) {
      login(email.trim(), name.trim());
      onClose();
    }
  };

  const handleSkip = () => {
    // 允许跳过注册，使用匿名身份
    login('guest@example.com', '访客用户');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[#0b0b14] border border-white/10 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'welcome' ? (
          <div className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L28 8V24L16 30L4 24V8L16 2Z"
                  stroke="url(#gradient)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path d="M16 8L22 11V21L16 24L10 21V11L16 8Z" fill="white" />
                <defs>
                  <linearGradient id="gradient" x1="4" y1="2" x2="28" y2="30">
                    <stop stopColor="#FF6B35" />
                    <stop offset="1" stopColor="#005288" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              欢迎来到 LLM基础
            </h2>
            <p className="text-white/60 text-center mb-8">
              登录后可以追踪学习进度、获得学习证书
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('register')}
                className="w-full py-3 px-4 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors flex items-center justify-center gap-2"
              >
                开始学习
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
              >
                先看看再说
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-2">创建账号</h2>
            <p className="text-white/60 text-center mb-6">
              填写信息，开启你的学习之旅
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">姓名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="你的名字"
                    className="w-full py-3 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full py-3 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={!name.trim() || !email.trim()}
                className="w-full py-3 px-4 rounded-xl bg-spacex-orange text-white font-medium hover:bg-spacex-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                开始学习
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setStep('welcome')}
                className="w-full py-2 text-white/60 text-sm hover:text-white transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}