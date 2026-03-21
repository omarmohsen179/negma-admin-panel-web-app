import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Typography
} from '@mui/material';
import { ArrowBack, Save, Visibility, RestartAlt } from '@mui/icons-material';
import { GET_TEMPLATE, SAVE_TEMPLATE, RESET_TEMPLATE, PREVIEW_TEMPLATE } from './Api';

// Reconstruct full HTML: replace body content
function injectBody(originalHtml, newBodyContent) {
  if (/<body[^>]*>/i.test(originalHtml)) {
    return originalHtml.replace(/(<body[^>]*>)([\s\S]*)(<\/body>)/i, `$1${newBodyContent}$3`);
  }
  return newBodyContent;
}

export default function TemplateEditor() {
  const { key } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [fullHtml, setFullHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const iframeRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const t = await GET_TEMPLATE(key);
      setTemplate(t);
      setFullHtml(t.htmlContent);
    } catch (e) {
      setSnack({ open: true, msg: 'Failed to load template', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  const getCurrentFullHtml = () => {
    const iframeBody = iframeRef.current?.contentDocument?.body;
    const currentBodyHtml = iframeBody ? iframeBody.innerHTML : '';
    return injectBody(fullHtml, currentBodyHtml);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newFullHtml = getCurrentFullHtml();
      await SAVE_TEMPLATE(key, newFullHtml);
      setFullHtml(newFullHtml);
      setSnack({ open: true, msg: 'Template saved successfully', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, msg: `Save failed: ${e?.message || ''}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const currentHtml = getCurrentFullHtml();
      const blob = await PREVIEW_TEMPLATE(key, currentHtml);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (e) {
      setSnack({ open: true, msg: 'Preview failed', severity: 'error' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset to original file content? All your changes will be lost.')) return;
    setResetting(true);
    try {
      await RESET_TEMPLATE(key);
      await load();
      setSnack({ open: true, msg: 'Reset to original', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, msg: 'Reset failed', severity: 'error' });
    } finally {
      setResetting(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;
    doc.body.contentEditable = 'true';
    doc.body.style.outline = 'none';
    doc.body.style.cursor = 'text';
    doc.body.style.padding = '40px 50px';
    doc.body.style.boxSizing = 'border-box';
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/templates')} variant="outlined" size="small">
          Back
        </Button>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {template?.displayName || key}
        </Typography>
        <Button
          variant="outlined"
          color="warning"
          startIcon={resetting ? <CircularProgress size={16} /> : <RestartAlt />}
          onClick={handleReset}
          disabled={resetting || saving}
          size="small"
        >
          Reset to Original
        </Button>
        <Button
          variant="outlined"
          startIcon={previewing ? <CircularProgress size={16} /> : <Visibility />}
          onClick={handlePreview}
          disabled={previewing || saving}
          size="small"
        >
          {previewing ? 'Generating...' : 'Preview PDF'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving || previewing}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        You can edit the text content of this template. Do not delete text in curly braces like <code>{'{{CLIENT_NAME}}'}</code> — these are replaced automatically with real data when the contract is generated.
      </Alert>

      {/* Iframe WYSIWYG editor — A4 paper simulation */}
      <Box
        sx={{
          background: '#e8e8e8',
          borderRadius: 1,
          p: 3,
          overflowY: 'auto',
          height: '75vh',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <iframe
          ref={iframeRef}
          title="template-editor"
          srcDoc={fullHtml}
          onLoad={handleIframeLoad}
          style={{
            width: '794px',        // A4 at 96dpi
            minHeight: '1123px',   // A4 height — expands with content
            flexShrink: 0,
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            background: '#fff',
          }}
        />
      </Box>

      {/* PDF Preview Dialog */}
      <Dialog open={previewOpen} onClose={closePreview} maxWidth="lg" fullWidth>
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh' }}>
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
