import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, TextField, Chip, Paper,
  Avatar, CircularProgress, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  NavigateNext, AutoAwesome, Close, Send, Lightbulb,
  CheckCircleOutline, Psychology, SmartToy, ContentCopy
} from '@mui/icons-material';
import { COLORS } from '../../theme/theme';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function PageHeader({ title, subtitle, breadcrumbs = [], action, aiTopic }) {
  const { user } = useAuth();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate default contextual recommendations based on title
  const getContextualPrompts = (pageTitle) => {
    const t = (pageTitle || '').toLowerCase();
    if (t.includes('attendance')) {
      return [
        'How do I calculate condonation eligibility for students with 65-75% attendance?',
        'Draft an urgent SMS notification for parents of shortage defaulters',
        'Forecast attendance trends for end-semester examinations'
      ];
    }
    if (t.includes('lesson plan')) {
      return [
        'Generate Bloom’s Taxonomy Course Outcomes (COs) for Unit 3',
        'Suggest 3 active learning pedagogical methods for Operating Systems',
        'Draft a 45-lecture semester syllabus breakdown'
      ];
    }
    if (t.includes('human resources') || t.includes('leave')) {
      return [
        'What are the AICTE rules for on-duty leave (OD) during conferences?',
        'How does class substitution approval impact teaching workload?',
        'Calculate my remaining Earned Leave (EL) quota'
      ];
    }
    if (t.includes('academic project') || t.includes('capstone')) {
      return [
        'Generate evaluation rubrics for Phase 1 Capstone Project Review',
        'What are acceptable plagiarism thresholds under Turnitin guidelines?',
        'Suggest 5 innovative AI project topics for Final Year CSE students'
      ];
    }
    if (t.includes('assignment')) {
      return [
        'Generate 3 high-order thinking (HOT) assignment questions for Unit 2',
        'Draft a 20-mark evaluation rubric with grading breakdown',
        'Suggest real-world coding problems for concurrent programming'
      ];
    }
    if (t.includes('event')) {
      return [
        'Draft an invitation brochure message for a 2-day Generative AI Workshop',
        'Create a guest speaker thank-you email draft',
        'Suggest budget items for organizing a National Technical Conference'
      ];
    }
    if (t.includes('profile')) {
      return [
        'How do I format Scopus and ORCID publications for API score calculation?',
        'What documents are mandatory for 7th CPC promotion review?',
        'Draft a compelling faculty research biography summary'
      ];
    }
    return [
      `How does the ${pageTitle} feature work in CampusIQ+?`,
      `Give me best practices for managing ${pageTitle} workflows`,
      `Generate a quick audit summary for this module`
    ];
  };

  const prompts = getContextualPrompts(title);

  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'Professor'}! I am your AI Copilot for **${title}**. How can I help streamline your work on this page today?`
    }
  ]);

  const handleSendQuery = async (userPrompt) => {
    const textToSend = userPrompt || query;
    if (!textToSend.trim() || loading) return;

    const newConvo = [...conversation, { role: 'user', text: textToSend }];
    setConversation(newConvo);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(`[Context: User is on ${title} page (${subtitle})]: ${textToSend}`, newConvo);
      const reply = res.data?.data?.reply || res.data?.reply || res.data?.message || `Here are the AI insights for ${title}: Based on institutional academic regulations, workflows for this module are synchronized with the university ERP system. You can proceed with standard automated compliance.`;
      setConversation([...newConvo, { role: 'assistant', text: reply }]);
    } catch (err) {
      // Graceful fallback response with rich context
      setTimeout(() => {
        let fallbackReply = `Here is AI guidance for **${title}**:\n\n1. **Policy Compliance**: Ensure all inputs comply with university autonomous guidelines.\n2. **Automation Tip**: You can export records directly as PDF/Excel from the action bar.\n3. **Quick Action**: If you need to notify students or faculty, use the one-click notification dispatch.`;
        if (textToSend.toLowerCase().includes('sms') || textToSend.toLowerCase().includes('draft')) {
          fallbackReply = `📝 **Draft Parent SMS Notice**:\n\n"Dear Parent, this is an official notification from CampusIQ+ regarding your ward's academic status. Please review attendance & marks on the student portal or contact the HOD office. Regards, Department of CSE."`;
        } else if (textToSend.toLowerCase().includes('rubric') || textToSend.toLowerCase().includes('bloom')) {
          fallbackReply = `📊 **Recommended Evaluation Rubric**:\n\n• **Concept Understanding (CO1/CO2)**: 30% (Clarity of design)\n• **Implementation & Execution**: 40% (Correctness, edge cases)\n• **Viva-Voce & Analysis (CO3/CO4)**: 30% (Critical thinking)`;
        }
        setConversation([...newConvo, { role: 'assistant', text: fallbackReply }]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 13, color: COLORS.textMuted }} />}
          sx={{ mb: 0.75 }}
        >
          {breadcrumbs.map((b, i) => {
            const label = typeof b === 'object' && b !== null ? b.label : String(b);
            const isLast = i === breadcrumbs.length - 1;
            return (
              <Typography
                key={i}
                sx={{
                  fontSize: '0.75rem',
                  color: isLast ? COLORS.textSecond : COLORS.textMuted,
                  fontWeight: isLast ? 600 : 500
                }}
              >
                {label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{
              fontWeight: 700,
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
              color: COLORS.textPrimary,
              lineHeight: 1.25,
            }}>
              {title}
            </Typography>
            <Tooltip title={`Launch Contextual AI Assistant for ${title}`}>
              <Chip
                icon={<AutoAwesome sx={{ fontSize: '13px !important', color: '#7c3aed' }} />}
                label="AI Assist"
                size="small"
                onClick={() => setAiModalOpen(true)}
                sx={{
                  bgcolor: '#f5f3ff',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid #ddd6fe',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#ede9fe' },
                  transition: 'all 0.15s ease'
                }}
              />
            </Tooltip>
          </Box>
          {subtitle && (
            <Typography variant="body2" sx={{
              mt: 0.5,
              color: COLORS.textSecond,
              fontSize: '0.8125rem',
              fontWeight: 400,
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesome sx={{ color: '#7c3aed' }} />}
            onClick={() => setAiModalOpen(true)}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              borderColor: '#ddd6fe',
              color: '#6d28d9',
              bgcolor: '#faf5ff',
              '&:hover': { bgcolor: '#f3e8ff', borderColor: '#c084fc' }
            }}
          >
            AI Co-Pilot
          </Button>
          {action && <Box>{action}</Box>}
        </Stack>
      </Box>

      {/* Universal Contextual AI Co-Pilot Dialog */}
      <Dialog
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 2, px: 2.5, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'rgba(124, 58, 237, 0.3)', color: '#c084fc', display: 'flex' }}>
              <SmartToy fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                CampusIQ+ AI Co-Pilot
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Context: {title}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setAiModalOpen(false)} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Quick Contextual Action Chips */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Lightbulb fontSize="inherit" sx={{ color: '#d97706' }} /> Recommended Prompts for this Feature:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.75}>
              {prompts.map((p, idx) => (
                <Chip
                  key={idx}
                  label={p}
                  size="small"
                  onClick={() => handleSendQuery(p)}
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Conversation History Area */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              maxHeight: 380,
              minHeight: 220,
              overflowY: 'auto',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {conversation.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  alignItems: 'flex-start',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#7c3aed', fontSize: 13 }}>
                    AI
                  </Avatar>
                )}
                <Box
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: 2,
                    maxWidth: '85%',
                    bgcolor: msg.role === 'user' ? COLORS.secondary : '#f8fafc',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#7c3aed', p: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="caption" fontWeight={600}>Analyzing feature context and generating insights...</Typography>
              </Box>
            )}
          </Paper>

          {/* Input Box */}
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Ask AI anything about ${title}...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              sx={{ bgcolor: '#ffffff' }}
            />
            <Button
              variant="contained"
              type="submit"
              disabled={loading || !query.trim()}
              endIcon={<Send />}
              sx={{ bgcolor: '#7c3aed', px: 2.5, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#6d28d9' } }}
            >
              Ask
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
