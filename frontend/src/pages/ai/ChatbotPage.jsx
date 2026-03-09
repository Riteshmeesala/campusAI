import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Card, Typography, TextField, IconButton,
  Avatar, CircularProgress, Chip, Tooltip, Fade
} from '@mui/material';
import {
  Send, SmartToy, Person, Refresh, ContentCopy,
  TrendingUp, School, EventNote, Psychology, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import PageHeader from '../../components/shared/PageHeader';

// ── Quick prompts by category ─────────────────────────────────
const PROMPT_CATEGORIES = [
  {
    label: 'My Data',
    icon: <TrendingUp fontSize="small" />,
    color: '#3b82f6',
    prompts: [
      'Analyze my attendance and tell me if I am at risk',
      'Give me a full analysis of my academic performance',
      'What are my weakest subjects based on results?',
      'How much pending fees do I have?',
    ],
  },
  {
    label: 'Exams',
    icon: <EventNote fontSize="small" />,
    color: '#8b5cf6',
    prompts: [
      'List all my upcoming exams with dates and venues',
      'Create a 2-week study plan for my upcoming exams',
      'How should I prepare for finals effectively?',
    ],
  },
  {
    label: 'Academic Help',
    icon: <School fontSize="small" />,
    color: '#10b981',
    prompts: [
      'Explain what CGPA is and how it is calculated',
      'Give me tips to improve my grades',
      'How do I recover from a bad semester?',
    ],
  },
  {
    label: 'General',
    icon: <Psychology fontSize="small" />,
    color: '#f59e0b',
    prompts: [
      'Explain machine learning in simple terms',
      'What career options are there after my degree?',
      'Help me write a professional email to a professor',
      'What are the best time management techniques for students?',
    ],
  },
];

// ── Markdown-like message renderer ───────────────────────────
function MessageContent({ text }) {
  return (
    <Box>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <Box key={i} sx={{ height: 5 }} />;
        const isHeader = /^#+\s/.test(line);
        const isBullet = /^[-•]\s/.test(line) || /^\d+\.\s/.test(line);
        const clean    = line.replace(/^#+\s/, '').replace(/^[-•]\s/, '');

        const renderBold = (str) =>
          str.split(/\*\*(.*?)\*\*/g).map((p, j) =>
            j % 2 === 1
              ? <Box component="span" key={j} sx={{ fontWeight: 700 }}>{p}</Box>
              : p
          );

        if (isHeader) return (
          <Typography key={i} variant="body2"
            sx={{ fontWeight: 700, fontSize: '0.88rem', color: COLORS.primary, mt: 1.2, mb: 0.4 }}>
            {renderBold(clean)}
          </Typography>
        );
        if (isBullet) return (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.4, pl: 1, alignItems: 'flex-start' }}>
            <Box sx={{
              mt: 0.7, width: 5, height: 5, borderRadius: '50%',
              bgcolor: COLORS.primary, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.65, fontSize: '0.845rem' }}>
              {renderBold(clean)}
            </Typography>
          </Box>
        );
        return (
          <Typography key={i} variant="body2"
            sx={{ lineHeight: 1.7, fontSize: '0.845rem', mb: 0.2 }}>
            {renderBold(line)}
          </Typography>
        );
      })}
    </Box>
  );
}

// ── Chat bubble ───────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isBot = msg.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Fade in timeout={250}>
      <Box sx={{
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        gap: 1.5, mb: 2.5, alignItems: 'flex-start',
      }}>
        <Avatar sx={{
          width: 34, height: 34, flexShrink: 0, mt: 0.3,
          bgcolor: isBot ? COLORS.primary : COLORS.secondary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {isBot ? <SmartToy sx={{ fontSize: 17 }} /> : <Person sx={{ fontSize: 17 }} />}
        </Avatar>

        <Box sx={{ maxWidth: '78%' }}>
          <Box sx={{
            p: '11px 15px',
            borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
            bgcolor: isBot ? (msg.isError ? '#fff5f5' : '#f8faff') : COLORS.primary,
            border: isBot ? `1px solid ${msg.isError ? '#fecaca' : COLORS.border}` : 'none',
            boxShadow: isBot ? '0 1px 4px rgba(0,0,0,0.06)' : '0 3px 10px rgba(15,35,69,0.25)',
          }}>
            {isBot
              ? <MessageContent text={msg.content} />
              : <Typography variant="body2"
                  sx={{ color: '#fff', lineHeight: 1.65, fontSize: '0.845rem', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
            }
          </Box>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4,
            justifyContent: isBot ? 'flex-start' : 'flex-end',
          }}>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.68rem' }}>
              {msg.time}
            </Typography>
            {isBot && (
              <Tooltip title={copied ? 'Copied!' : 'Copy response'}>
                <IconButton size="small" onClick={copy}
                  sx={{ p: 0.3, opacity: 0.45, '&:hover': { opacity: 1 } }}>
                  {copied
                    ? <CheckCircle sx={{ fontSize: 12, color: 'green' }} />
                    : <ContentCopy sx={{ fontSize: 12 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}

// ── Suggestion chips shown after each AI reply ────────────────
function SuggestionChips({ suggestions, onSend, disabled }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mb: 1.5, pl: 6 }}>
      {suggestions.slice(0, 4).map((s, i) => (
        <Chip
          key={i}
          label={s}
          size="small"
          onClick={() => onSend(s)}
          disabled={disabled}
          clickable
          sx={{
            fontSize: '0.72rem', fontWeight: 500,
            bgcolor: `${COLORS.primary}0d`,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}30`,
            height: 'auto', py: 0.3,
            '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
            '&:hover': { bgcolor: `${COLORS.primary}18` },
          }}
        />
      ))}
    </Box>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-end' }}>
      <Avatar sx={{ width: 34, height: 34, bgcolor: COLORS.primary }}>
        <SmartToy sx={{ fontSize: 17 }} />
      </Avatar>
      <Box sx={{
        p: '12px 16px', borderRadius: '4px 16px 16px 16px',
        bgcolor: '#f8faff', border: `1px solid ${COLORS.border}`,
        display: 'flex', gap: 0.5, alignItems: 'center',
      }}>
        {[0, 0.18, 0.36].map((d, i) => (
          <Box key={i} sx={{
            width: 7, height: 7, borderRadius: '50%', bgcolor: COLORS.primary, opacity: 0.7,
            animation: 'campusBounce 1.3s ease infinite',
            animationDelay: `${d}s`,
            '@keyframes campusBounce': {
              '0%,60%,100%': { transform: 'translateY(0)' },
              '30%': { transform: 'translateY(-7px)' },
            },
          }} />
        ))}
        <Typography variant="caption" sx={{ ml: 0.5, color: COLORS.textMuted, fontSize: '0.75rem' }}>
          AI is thinking...
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main chatbot page ─────────────────────────────────────────
export default function ChatbotPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0]
    || user?.name?.split(' ')[0]
    || user?.username
    || 'there';

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content:
      `Hi **${firstName}!** 👋 I'm **CampusMate AI**, your intelligent campus assistant.\n\n`
    + `I can help you with:\n`
    + `- 📊 **Your real campus data** — attendance, results, exams, fees analysis\n`
    + `- 🧠 **Any general question** — coding, career advice, concepts, study tips\n\n`
    + `Pick a quick prompt below or type anything!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);

  const [suggestions,    setSuggestions]    = useState([]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  // ── FIX: track whether Ollama/AI is powering the response ─────────────────
  const [aiPowered, setAiPowered] = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── FIX: Build history for multi-turn context — now passed to backend ─────
  const getHistory = () =>
    messages
      .slice(1)           // skip the welcome greeting
      .slice(-10)         // keep last 10 exchanges for context
      .map(m => ({ role: m.role, content: m.content }));

  // ── Send message ───────────────────────────────────────────────────────────
  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message immediately
    setMessages(prev => [...prev, { role: 'user', content: msg, time: timeStr }]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      // ── FIX: pass history so backend has conversation context ──────────────
      const res = await aiAPI.chat(msg, getHistory());

      // ── FIX: handle both response shapes robustly ──────────────────────────
      // Shape A (AIChatbotService): { data: { data: { response, suggestions, aiPowered } } }
      // Shape B (ChatbotService):   { data: { data: { reply } } }
      // Shape C (fallback):         { data: { response } }
      const outer  = res?.data;
      const inner  = outer?.data || outer || {};
      const reply  = inner.response || inner.reply || 'No response received.';
      const suggs  = inner.suggestions || [];
      const powered = !!inner.aiPowered;   // true = Ollama answered, false = built-in

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiPowered: powered,
      }]);
      setSuggestions(suggs);
      setAiPowered(powered);

    } catch (err) {
      const errMsg = err?.response?.data?.message
        || err?.message
        || 'Connection error — check that the backend is running on port 8080';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Error:** ${errMsg}\n\nMake sure:\n- Spring Boot backend is running on port 8080\n- Ollama is running: \`ollama serve\`\n- Model is pulled: \`ollama pull llama3\``,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }]);
      setSuggestions([]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! How can I help you today? 😊',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setSuggestions([]);
    setAiPowered(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <PageHeader
        title="CampusMate AI"
        // ── FIX: updated subtitle — no longer says "powered by OpenAI" ──────
        subtitle="Ask anything — campus data or general knowledge, powered by Ollama (local AI)"
        breadcrumbs={['Home', 'CampusMate AI']}
        action={
          <Tooltip title="Clear chat">
            <IconButton onClick={clearChat} size="small"><Refresh fontSize="small" /></IconButton>
          </Tooltip>
        }
      />

      <Card sx={{
        height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', border: `1px solid ${COLORS.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: 3,
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{
          px: 2.5, py: 1.8, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a4fa0 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 38, height: 38 }}>
              <SmartToy sx={{ color: '#fff', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography fontWeight={700} color="#fff" fontSize="0.95rem">CampusMate AI</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
                }} />
                {/* FIX: show Ollama / Built-in engine status dynamically */}
                <Typography fontSize="0.7rem" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {aiPowered ? 'Online — Ollama AI' : 'Online — Live DB'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* FIX: replaced "OpenAI" label with Ollama */}
            {['📊 Data Analysis', '🦙 Ollama AI'].map(label => (
              <Chip key={label} label={label} size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.68rem', height: 24,
                }} />
            ))}
          </Box>
        </Box>

        {/* ── Messages ───────────────────────────────────────────────────── */}
        <Box sx={{
          flex: 1, overflowY: 'auto', p: 2.5, bgcolor: '#f9fbff',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}>
          {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {!loading && suggestions.length > 0 && (
            <SuggestionChips suggestions={suggestions} onSend={send} disabled={loading} />
          )}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </Box>

        {/* ── Quick prompts ──────────────────────────────────────────────── */}
        <Box sx={{ px: 2, pt: 1.2, pb: 0.8, bgcolor: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
          <Box sx={{ display: 'flex', gap: 0.8, mb: 1, overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 0 } }}>
            {PROMPT_CATEGORIES.map((cat, idx) => (
              <Chip
                key={cat.label}
                icon={React.cloneElement(cat.icon, {
                  style: { color: activeCategory === idx ? '#fff' : cat.color, fontSize: 14 }
                })}
                label={cat.label}
                size="small"
                onClick={() => setActiveCategory(idx)}
                sx={{
                  flexShrink: 0, fontWeight: 600, fontSize: '0.72rem',
                  bgcolor: activeCategory === idx ? cat.color : `${cat.color}18`,
                  color:   activeCategory === idx ? '#fff' : cat.color,
                  border:  `1px solid ${cat.color}40`,
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: `${cat.color}30` },
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap' }}>
            {PROMPT_CATEGORIES[activeCategory].prompts.map(q => (
              <Chip key={q} label={q} size="small"
                onClick={() => send(q)} disabled={loading} clickable
                sx={{
                  bgcolor: COLORS.bgBase, border: `1px solid ${COLORS.border}`,
                  fontSize: '0.72rem', fontWeight: 500, color: COLORS.textSecondary,
                  height: 'auto', py: 0.35,
                  '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
                  '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primary, color: COLORS.primary },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── Input ──────────────────────────────────────────────────────── */}
        <Box sx={{
          px: 2, pb: 1.5, pt: 1, bgcolor: '#fff',
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex', gap: 1.5, alignItems: 'flex-end',
        }}>
          <TextField
            inputRef={textareaRef}
            fullWidth multiline maxRows={4}
            placeholder="Ask anything — attendance, CGPA, exam tips, coding help, career advice..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
            variant="outlined" size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3, fontSize: '0.875rem',
                '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 2 },
              },
            }}
          />
          <IconButton
            onClick={() => send()}
            disabled={!input.trim() || loading}
            sx={{
              width: 44, height: 44, flexShrink: 0, borderRadius: 2.5,
              background: input.trim() && !loading
                ? `linear-gradient(135deg, ${COLORS.primary}, #3b82f6)` : COLORS.border,
              color: '#fff', transition: 'all 0.2s',
              '&:hover': {
                transform: input.trim() && !loading ? 'scale(1.05)' : 'none',
                background: input.trim() && !loading
                  ? `linear-gradient(135deg, #0f2b5e, #2563eb)` : COLORS.border,
              },
              '&:disabled': { color: COLORS.textMuted },
            }}
          >
            {loading
              ? <CircularProgress size={18} sx={{ color: '#aaa' }} />
              : <Send sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <Box sx={{
          px: 2, pb: 1, bgcolor: '#fff',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.67rem' }}>
            Enter = send • Shift+Enter = new line
          </Typography>
          {/* FIX: dynamic footer — shows which engine answered */}
          <Typography variant="caption" sx={{
            color: aiPowered ? '#7c3aed' : '#10b981',
            fontWeight: 600, fontSize: '0.67rem'
          }}>
            {aiPowered ? '🦙 Ollama llama3 — Local AI' : '⚡ Built-in engine — Live DB'}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}