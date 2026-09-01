import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, IconButton,
  Avatar, CircularProgress, Tooltip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import {
  AutoAwesome, Refresh, ContentCopy,
  CheckCircle, Mic, MicOff, StopCircle, ArrowUpward,
  LightbulbOutlined,
  CalendarMonth, AccountBalanceWallet, School, AssessmentOutlined,
  TrendingUp, Terminal
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

// ── Inline Rich Text Formatter ───────────────────────────────────────────
function formatInlineText(text) {
  if (!text) return null;

  // Split by inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <Box
          component="code"
          key={`code-${idx}`}
          sx={{
            px: 0.75,
            py: 0.15,
            mx: 0.25,
            bgcolor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#0f172a',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {codeContent}
        </Box>
      );
    }

    // Process bold **text** and italic *text*
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
        const boldText = bPart.slice(2, -2);
        return (
          <Box
            component="strong"
            key={`b-${idx}-${bIdx}`}
            sx={{ fontWeight: 700, color: COLORS.textPrimary }}
          >
            {boldText}
          </Box>
        );
      }

      // Process italic *text*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length >= 2 && !iPart.startsWith('**')) {
          const italicText = iPart.slice(1, -1);
          return (
            <Box
              component="em"
              key={`i-${idx}-${bIdx}-${iIdx}`}
              sx={{ fontStyle: 'italic', color: COLORS.textSecond }}
            >
              {italicText}
            </Box>
          );
        }
        return iPart;
      });
    });
  });
}

// ── Code Block Component with Copy ──────────────────────────────────────
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        my: 1.5,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        bgcolor: '#0f172a',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.75,
          py: 0.75,
          bgcolor: '#1e293b',
          borderBottom: '1px solid #334155',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Terminal sx={{ fontSize: 16, color: '#94a3b8' }} />
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {language || 'CODE'}
          </Typography>
        </Box>
        <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{ color: copied ? '#4ade80' : '#94a3b8', p: 0.3, '&:hover': { color: '#f8fafc' } }}
          >
            {copied ? <CheckCircle sx={{ fontSize: 15 }} /> : <ContentCopy sx={{ fontSize: 15 }} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.75,
          overflowX: 'auto',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '0.84rem',
          lineHeight: 1.6,
          color: '#e2e8f0',
          bgcolor: '#0f172a',
        }}
      >
        <code>{code}</code>
      </Box>
    </Box>
  );
}

// ── Markdown Table Component ────────────────────────────────────────────
function MarkdownTable({ headers, rows }) {
  if (!headers || headers.length === 0) return null;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        my: 1.5,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            {headers.map((h, i) => (
              <TableCell
                key={i}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: '#475569',
                  borderBottom: `1px solid ${COLORS.border}`,
                  py: 1,
                  px: 1.5,
                }}
              >
                {formatInlineText(h.trim())}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rIdx) => (
            <TableRow
              key={rIdx}
              sx={{
                bgcolor: rIdx % 2 === 1 ? '#fafafa' : '#ffffff',
                '&:hover': { bgcolor: '#f1f5f9' },
                transition: 'background-color 0.1s ease',
              }}
            >
              {row.map((cell, cIdx) => (
                <TableCell
                  key={cIdx}
                  sx={{
                    fontSize: '0.82rem',
                    color: COLORS.textPrimary,
                    borderBottom: rIdx === rows.length - 1 ? 'none' : `1px solid ${COLORS.borderLight}`,
                    py: 1,
                    px: 1.5,
                  }}
                >
                  {formatInlineText(cell.trim())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Master Structured Markdown & Visual Parser ─────────────────────────
function MessageContent({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block: ```lang ... ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        language: lang,
        code: codeLines.join('\n'),
      });
      i++;
      continue;
    }

    // 2. Markdown Table Detection: | col1 | col2 |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].slice(1, -1).split('|');
        const isSeparator = tableLines[1].includes('---');
        const rawRows = isSeparator ? tableLines.slice(2) : tableLines.slice(1);
        const rows = rawRows.map(r => r.slice(1, -1).split('|'));

        blocks.push({
          type: 'table',
          headers: rawHeaders,
          rows: rows,
        });
        continue;
      }
    }

    // 3. Callouts & Tips (💡, ⚠️, 👉, ✅, 📌, 📢, > Blockquotes)
    const calloutMatch = line.trim().match(/^(?:>\s*)?(💡|⚠️|👉|✅|📌|📢|\*\*(?:Tip|Note|Action|Warning):\*\*)\s*(.*)/i);
    if (calloutMatch) {
      const icon = calloutMatch[1];
      const rest = calloutMatch[2];
      blocks.push({
        type: 'callout',
        icon: icon,
        text: rest || line.replace(/^[>\s]+/, ''),
      });
      i++;
      continue;
    }

    // 4. Headers: ### Header, ## Header, # Header
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      blocks.push({
        type: 'header',
        level: level,
        text: title,
      });
      i++;
      continue;
    }

    // 5. Numbered List Item: 1. ... or 2. ...
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      blocks.push({
        type: 'numbered_item',
        number: numMatch[1],
        text: numMatch[2],
      });
      i++;
      continue;
    }

    // 6. Bullet List Item: - ... or * ... or • ...
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)/);
    if (bulletMatch) {
      const isIndented = bulletMatch[1].length > 0;
      blocks.push({
        type: 'bullet_item',
        isIndented: isIndented,
        text: bulletMatch[3],
      });
      i++;
      continue;
    }

    // 7. Regular paragraph / empty spacing line
    if (!line.trim()) {
      blocks.push({ type: 'spacer' });
    } else {
      blocks.push({
        type: 'paragraph',
        text: line,
      });
    }
    i++;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {blocks.map((b, idx) => {
        if (b.type === 'code') {
          return <CodeBlock key={idx} language={b.language} code={b.code} />;
        }

        if (b.type === 'table') {
          return <MarkdownTable key={idx} headers={b.headers} rows={b.rows} />;
        }

        if (b.type === 'callout') {
          return (
            <Box
              key={idx}
              sx={{
                my: 1,
                p: 1.25,
                px: 1.75,
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #2563eb',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
              }}
            >
              <Typography sx={{ fontSize: '1rem', lineHeight: 1.4 }}>{b.icon || '💡'}</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  color: '#1e3a8a',
                  fontWeight: 500,
                }}
              >
                {formatInlineText(b.text)}
              </Typography>
            </Box>
          );
        }

        if (b.type === 'header') {
          return (
            <Box
              key={idx}
              sx={{
                mt: idx === 0 ? 0.5 : 1.75,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: b.level <= 2 ? `1px solid ${COLORS.borderLight}` : 'none',
                pb: b.level <= 2 ? 0.5 : 0,
              }}
            >
              <Typography
                variant={b.level === 1 ? 'h5' : b.level === 2 ? 'h6' : 'subtitle1'}
                sx={{
                  fontWeight: 700,
                  fontSize: b.level === 1 ? '1.15rem' : b.level === 2 ? '1rem' : '0.92rem',
                  color: COLORS.textPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                {formatInlineText(b.text)}
              </Typography>
            </Box>
          );
        }

        if (b.type === 'numbered_item') {
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                my: 0.3,
                pl: 0.5,
              }}
            >
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.25,
                  flexShrink: 0,
                }}
              >
                {b.number}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  color: COLORS.textPrimary,
                }}
              >
                {formatInlineText(b.text)}
              </Typography>
            </Box>
          );
        }

        if (b.type === 'bullet_item') {
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                my: 0.25,
                pl: b.isIndented ? 3 : 0.75,
              }}
            >
              <Box
                sx={{
                  width: b.isIndented ? 4 : 5,
                  height: b.isIndented ? 4 : 5,
                  borderRadius: '50%',
                  bgcolor: b.isIndented ? '#94a3b8' : '#2563eb',
                  mt: 0.85,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  color: COLORS.textPrimary,
                }}
              >
                {formatInlineText(b.text)}
              </Typography>
            </Box>
          );
        }

        if (b.type === 'spacer') {
          return <Box key={idx} sx={{ height: 6 }} />;
        }

        return (
          <Typography
            key={idx}
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.65,
              color: COLORS.textPrimary,
              mb: 0.25,
            }}
          >
            {formatInlineText(b.text)}
          </Typography>
        );
      })}
    </Box>
  );
}

// ── Default Quick Actions / Suggestions ────────────────────────────────
const QUICK_SUGGESTIONS = [
  { label: 'Attendance Check', query: 'What is my current attendance percentage and standing?', icon: <AssessmentOutlined sx={{ fontSize: 15 }} /> },
  { label: 'Upcoming Exams', query: 'When is my next scheduled exam and room allocation?', icon: <School sx={{ fontSize: 15 }} /> },
  { label: 'Fee Summary', query: 'Show my pending fee dues and payment status', icon: <AccountBalanceWallet sx={{ fontSize: 15 }} /> },
  { label: 'Daily Timetable', query: 'What is my lecture schedule and timetable for today?', icon: <CalendarMonth sx={{ fontSize: 15 }} /> },
  { label: 'GPA & Grades', query: 'Show my recent CGPA, SGPA, and academic insights', icon: <TrendingUp sx={{ fontSize: 15 }} /> },
  { label: 'Career Blueprint', query: 'How to achieve high success and career growth in software engineering?', icon: <LightbulbOutlined sx={{ fontSize: 15 }} /> },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : (user?.username || 'there');

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const bottomRef       = useRef(null);
  const textareaRef     = useRef(null);
  const recognitionRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        setListening(false);
        if (event.error === 'not-allowed') {
          toast.warning('Microphone permission was denied.');
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.info('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (err) {
        console.error('Speech recognition start failed:', err);
      }
    }
  };

  const executeSend = async (queryText) => {
    const query = queryText.trim();
    if (!query || loading) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: query, time: timeStr };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat(query, history);

      const outer = res?.data;
      const inner = outer?.data || outer || {};
      const reply = inner.response || inner.reply || 'No response received.';
      const suggestions = inner.suggestions || [];

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          suggestions: suggestions,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      const errMsg = err?.response?.data?.message
        || 'Connection error — ensure backend service is operational.';

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `### ⚠️ Connection Notice\n\n${errMsg}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        }
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    executeSend(input);
  };

  const copyResponse = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 88px)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 920,
      mx: 'auto',
      px: { xs: 1, sm: 2 },
    }}>
      {/* Top Header Bar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        borderBottom: `1px solid ${COLORS.borderLight}`,
        mb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AutoAwesome sx={{ fontSize: 19, color: '#2563eb' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.textPrimary, fontSize: '0.92rem', lineHeight: 1.2 }}>
              CampusMate AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontSize: '0.7rem', fontWeight: 600 }}>
              ● Online & Intelligent
            </Typography>
          </Box>
        </Box>

        {messages.length > 0 && (
          <Tooltip title="Reset Conversation">
            <IconButton size="small" onClick={clearChat} sx={{ color: COLORS.textSecond, '&:hover': { color: '#dc2626' } }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main Conversation Stream */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        py: 2,
        px: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Empty State: Greeting + Interactive Quick Suggestions */}
        {messages.length === 0 ? (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}>
            <Box sx={{
              width: 58,
              height: 58,
              borderRadius: 1.5,
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              boxShadow: '0 4px 14px rgba(37,99,235,0.12)',
            }}>
              <AutoAwesome sx={{ fontSize: 32, color: '#2563eb' }} />
            </Box>

            <Typography variant="h4" sx={{
              fontWeight: 700,
              color: COLORS.textPrimary,
              fontSize: { xs: '1.5rem', sm: '1.9rem' },
              letterSpacing: '-0.02em',
              mb: 0.75,
            }}>
              Hello, {firstName}
            </Typography>

            <Typography variant="body1" sx={{
              color: COLORS.textSecond,
              fontSize: { xs: '0.9rem', sm: '1.02rem' },
              maxWidth: 540,
              mb: 3.5,
            }}>
              How can I assist you with your academic inquiries, schedules, or technical guidance today?
            </Typography>

            {/* Quick Action Suggestion Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.25,
              width: '100%',
              maxWidth: 720,
            }}>
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  onClick={() => executeSend(s.query)}
                  sx={{
                    p: 1.5,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    textAlign: 'left',
                    bgcolor: '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: '#f8fafc',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.08)',
                    },
                  }}
                >
                  <Box sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {s.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.83rem', color: COLORS.textPrimary }}>
                      {s.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.72rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Click to ask
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}>
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <Box key={idx} sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                  <Avatar sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: isAssistant ? '#eff6ff' : '#2563eb',
                    border: isAssistant ? '1px solid #bfdbfe' : 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    mt: 0.25,
                  }}>
                    {isAssistant ? (
                      <AutoAwesome sx={{ fontSize: 18, color: '#2563eb' }} />
                    ) : (
                      user?.name ? user.name.charAt(0) : 'U'
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: COLORS.textPrimary }}>
                        {isAssistant ? 'CampusMate AI' : 'You'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.7rem' }}>
                        {m.time}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: isAssistant ? 2 : 1.5,
                      borderRadius: 1.5,
                      bgcolor: isAssistant ? '#ffffff' : '#f8fafc',
                      border: `1px solid ${isAssistant ? '#e2e8f0' : COLORS.border}`,
                      boxShadow: isAssistant ? '0 2px 10px rgba(0,0,0,0.03)' : 'none',
                    }}>
                      {isAssistant ? (
                        <MessageContent text={m.content} />
                      ) : (
                        <Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.textPrimary, whiteSpace: 'pre-wrap' }}>
                          {m.content}
                        </Typography>
                      )}
                    </Box>

                    {isAssistant && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title={copiedIdx === idx ? 'Copied' : 'Copy Full Response'}>
                            <IconButton
                              size="small"
                              onClick={() => copyResponse(m.content, idx)}
                              sx={{ p: 0.4, color: COLORS.textMuted, '&:hover': { color: COLORS.textPrimary } }}
                            >
                              {copiedIdx === idx ? (
                                <CheckCircle sx={{ fontSize: 15, color: '#166534' }} />
                              ) : (
                                <ContentCopy sx={{ fontSize: 15 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>

                        {/* Optional Follow-up suggestion chips */}
                        {m.suggestions && m.suggestions.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                            {m.suggestions.map((sug, sIdx) => (
                              <Chip
                                key={sIdx}
                                label={sug}
                                size="small"
                                onClick={() => executeSend(sug)}
                                sx={{
                                  fontSize: '0.74rem',
                                  bgcolor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AutoAwesome sx={{ fontSize: 18, color: '#60a5fa' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" sx={{ color: COLORS.textSecond, fontSize: '0.8125rem' }}>
                    CampusMate is analyzing your request...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={bottomRef} />
          </Box>
        )}
      </Box>

      {/* Voice Listening Bar */}
      {listening && (
        <Box sx={{
          p: 1,
          px: 2,
          mb: 1,
          bgcolor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#dc2626',
              animation: 'pulse 1.2s infinite',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            }} />
            <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600, fontSize: '0.78rem' }}>
              Microphone Active — Speak clearly now
            </Typography>
          </Box>
          <IconButton size="small" onClick={toggleVoice} sx={{ color: '#991b1b', p: 0.2 }}>
            <StopCircle fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Centered Floating Prompt Input Container */}
      <Box sx={{ pt: 1, pb: 2 }}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSend}
          sx={{
            p: 1,
            px: 1.5,
            bgcolor: '#ffffff',
            border: `1px solid ${listening ? '#ef4444' : COLORS.border}`,
            borderRadius: 1.5,
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:focus-within': {
              borderColor: '#2563eb',
              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          <TextField
            inputRef={textareaRef}
            fullWidth
            multiline
            minRows={1}
            maxRows={6}
            placeholder={listening ? 'Listening to speech...' : 'Ask CampusMate AI (e.g., Attendance, Exam dates, Timetable, Career advice)...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.9rem',
                color: COLORS.textPrimary,
                py: 0.5,
                lineHeight: 1.5,
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75, pt: 0.5, borderTop: `1px solid ${COLORS.borderLight}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Voice Microphone Input Button */}
              <Tooltip title={listening ? 'Stop voice listening' : 'Voice Input (Speech-to-Text)'}>
                <IconButton
                  size="small"
                  onClick={toggleVoice}
                  sx={{
                    p: 0.75,
                    color: listening ? '#dc2626' : COLORS.textSecond,
                    bgcolor: listening ? '#fee2e2' : 'transparent',
                    '&:hover': {
                      bgcolor: listening ? '#fecaca' : '#f1f5f9',
                    }
                  }}
                >
                  {listening ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Send / Submit Button */}
            <IconButton
              type="submit"
              disabled={!input.trim() || loading}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: input.trim() ? '#2563eb' : '#f1f5f9',
                color: input.trim() ? '#ffffff' : '#94a3b8',
                '&:hover': {
                  bgcolor: input.trim() ? '#1d4ed8' : '#f1f5f9',
                }
              }}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          align="center"
          display="block"
          sx={{ color: COLORS.textMuted, fontSize: '0.7rem', mt: 1 }}
        >
          CampusMate AI provides institutional academic insights and assistance. Verify critical grading or fee data with official administration.
        </Typography>
      </Box>
    </Box>
  );
}