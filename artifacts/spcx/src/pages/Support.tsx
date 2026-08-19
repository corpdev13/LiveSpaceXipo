import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Menu, Paperclip, Send, ArrowUpFromLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useChatWithAssistant } from '@workspace/api-client-react';
import SideNav from '../components/SideNav';
import NotificationBell from '../components/NotificationBell';

type ChatMessage = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
  showOrderButton?: boolean;
};

export default function Support() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const chatMutation = useChatWithAssistant();

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('spcx_user') || 'null') : null;

  useEffect(() => {
    if (!user) setLocation('/signin');
  }, [user, setLocation]);

  const handleSignOut = () => {
    localStorage.removeItem('spcx_user');
    setLocation('/');
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hi there! Thanks for reaching out to SPCX Support. How can we assist you today?", sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    const conversation = [...messages, newUserMsg];
    setMessages(conversation);
    setInput('');

    chatMutation.mutate(
      {
        data: {
          messages: conversation.map((message) => ({
            role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: message.text,
          })),
        },
      },
      {
        onSuccess: (response) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: response.reply,
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              showOrderButton: response.showOrderButton,
            },
          ]);
        },
        onError: (error: any) => {
          toast.error(error?.data?.error || 'The assistant is unavailable right now.');
        },
      },
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white selection:bg-white/20 flex flex-col">
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} onSignOut={handleSignOut} />

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
        <button onClick={() => setMenuOpen(true)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
        <NotificationBell />
      </header>

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">
        <div className="px-6 py-8 shrink-0 text-center flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-[#0d1117] border border-white/10 rounded-full flex items-center justify-center text-xl font-display font-bold text-white uppercase">
              SP
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#1a8a4a] border-2 border-[#050a0f] rounded-full"></div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold font-display uppercase tracking-widest">Live Support</h1>
            <span className="bg-[#1a8a4a]/20 text-[#1a8a4a] text-[10px] font-display font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">ONLINE</span>
          </div>
          <p className="text-sm text-white/50 tracking-wider font-display uppercase mb-5">We're here to help with your SPCX account and investments.</p>
          <button
            onClick={() => setLocation('/orders?mode=withdraw')}
            className="flex items-center gap-2 border border-white/15 px-4 py-2 text-xs text-white/70 font-display font-bold tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUpFromLine className="w-4 h-4" /> Crypto withdrawal
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 scrollbar-hide">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <div className="text-xs text-white/30 font-display tracking-widest uppercase">TODAY</div>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-[#1a8a4a] text-white rounded-br-sm' : 'bg-[#111827] border border-white/5 text-white/90 rounded-bl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {msg.showOrderButton && (
                      <button
                        onClick={() => setLocation('/orders')}
                        className="mt-4 w-full bg-white text-black px-4 py-2.5 font-display font-bold text-xs tracking-widest uppercase hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        Fund Account / View Options
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-white/30 mt-1 font-display tracking-wider">{msg.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 p-6 pt-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Why buy SPCX now?', 'How do I pay?', 'How do withdrawals work?', 'What are the risks?'].map(pill => (
              <button
                key={pill}
                onClick={() => handleSend(pill)}
                className="px-4 py-1.5 rounded-full text-xs font-display font-medium tracking-widest border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer bg-[#0d1117]"
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-[#0d1117] border border-white/10 rounded-full p-2 pl-4 focus-within:border-white/30 transition-colors">
            <button className="text-white/40 hover:text-white/80 transition-colors cursor-pointer">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || chatMutation.isPending}
              className="w-10 h-10 rounded-full bg-[#1a8a4a] hover:bg-[#1a9a52] disabled:bg-white/10 disabled:text-white/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              {chatMutation.isPending ? <span className="text-xs font-display">...</span> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
