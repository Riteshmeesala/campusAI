import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, IconButton,
  Avatar, CircularProgress, Tooltip, Paper
} from '@mui/material';
import {
  AutoAwesome, Refresh, ContentCopy,
  CheckCircle, Mic, MicOff, StopCircle, ArrowUpward
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

// ── Markdown-like message renderer ───────────────────────────
function MessageContent({ text }) {
  if (!text) return null;
  return (
    <Box>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <Box key={i} sx={{ height: 6 }} />;
        const isHeader = /^#+\s/.test(line);
        const isBullet = /^[-•*]\s/.test(line) || /^\d+\.\s/.test(line);
        const clean    = line.replace(/^#+\s/, '').replace(/^[-•*]\s/, '');

        const renderBold = (str) =>
          str.split(/\*\*(.*?)\*\*/g).map((p, j) =>
            j % 2 === 1
              ? <Box component="span" key={j} sx={{ fontWeight: 700, color: COLORS.textPrimary }}>{p}</Box>
              : p
          );

        if (isHeader) {
          return (
            <Typography
              key={i}
              variant="subtitle1"
              sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary, mt: 1.5, mb: 0.5 }}
            >
              {renderBold(clean)}
            </Typography>
          );
        }

        if (isBullet) {
          return (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5, pl: 0.5, alignItems: 'flex-start' }}>
              <Box sx={{
                mt: 0.75, width: 4, height: 4, borderRadius: 0,
                bgcolor: '#3b82f6', flexShrink: 0
              }} />
              <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '0.875rem', color: COLORS.textPrimary }}>
                {renderBold(clean)}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography key={i} variant="body1" sx={{ lineHeight: 1.65, fontSize: '0.875rem', color: COLORS.textPrimary, mb: 0.4 }}>
            {renderBold(line)}
          </Typography>
        );
      })}
    </Box>
  );
}

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

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
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

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
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
          content: `Error: ${errMsg}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        }
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
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
      maxWidth: 880,
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
            width: 32,
            height: 32,
            borderRadius: 0.5,
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AutoAwesome sx={{ fontSize: 18, color: '#2563eb' }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.textPrimary, fontSize: '0.92rem' }}>
            CampusMate AI
          </Typography>
        </Box>

        {messages.length > 0 && (
          <Tooltip title="Reset Conversation">
            <IconButton size="small" onClick={clearChat} sx={{ color: COLORS.textSecond }}>
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
        {/* Empty State: Gemini-Style Greeting */}
        {messages.length === 0 ? (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            py: 6,
          }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: 0.5,
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 4px 14px rgba(37,99,235,0.15)',
            }}>
              <AutoAwesome sx={{ fontSize: 32, color: '#2563eb' }} />
            </Box>

            <Typography variant="h3" sx={{
              fontWeight: 700,
              color: COLORS.textPrimary,
              fontSize: { xs: '1.6rem', sm: '2.1rem' },
              letterSpacing: '-0.02em',
              mb: 1,
            }}>
              Hello, {firstName}
            </Typography>

            <Typography variant="h5" sx={{
              fontWeight: 400,
              color: COLORS.textSecond,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              maxWidth: 500,
            }}>
              How can I assist you with your academic inquiries today?
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}>
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0.5,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: COLORS.textPrimary }}>
                        {isAssistant ? 'CampusMate AI' : 'You'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.7rem' }}>
                        {m.time}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: isAssistant ? 0 : 1.5,
                      borderRadius: 0.5,
                      bgcolor: isAssistant ? 'transparent' : '#f8fafc',
                      border: isAssistant ? 'none' : `1px solid ${COLORS.border}`,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Tooltip title={copiedIdx === idx ? 'Copied' : 'Copy Response'}>
                          <IconButton
                            size="small"
                            onClick={() => copyResponse(m.content, idx)}
                            sx={{ p: 0.4, color: COLORS.textMuted, '&:hover': { color: COLORS.textPrimary } }}
                          >
                            {copiedIdx === idx ? (
                              <CheckCircle sx={{ fontSize: 14, color: '#166534' }} />
                            ) : (
                              <ContentCopy sx={{ fontSize: 14 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}

            {loading && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0.5,
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
          borderRadius: 0.5,
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

      {/* Gemini-Style Centered Floating Prompt Input Container */}
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
            borderRadius: 0.5,
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:focus-within': {
              borderColor: '#2563eb',
              boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.08)',
            },
          }}
        >
          <TextField
            inputRef={textareaRef}
            fullWidth
            multiline
            minRows={1}
            maxRows={6}
            placeholder={listening ? 'Listening to speech...' : 'Ask CampusMate AI...'}
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
                borderRadius: 0.5,
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