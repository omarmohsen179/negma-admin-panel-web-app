import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress,
  IconButton, Paper, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography
} from '@mui/material';
import { Edit as EditIcon, Refresh as RefreshIcon, Storage as SeedIcon } from '@mui/icons-material';
import { GET_TEMPLATES, SEED_TEMPLATES, RESET_TEMPLATE } from './Api';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [resettingKey, setResettingKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GET_TEMPLATES();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      setSnack({ open: true, msg: 'Failed to load templates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await SEED_TEMPLATES();
      setSnack({ open: true, msg: 'Templates seeded from files successfully', severity: 'success' });
      load();
    } catch (e) {
      setSnack({ open: true, msg: 'Seed failed', severity: 'error' });
    } finally {
      setSeeding(false);
    }
  };

  const handleReset = async (key) => {
    if (!window.confirm(`Reset template "${key}" to original file content?`)) return;
    setResettingKey(key);
    try {
      await RESET_TEMPLATE(key);
      setSnack({ open: true, msg: `Template "${key}" reset to original`, severity: 'success' });
      load();
    } catch (e) {
      setSnack({ open: true, msg: `Reset failed: ${e?.message || ''}`, severity: 'error' });
    } finally {
      setResettingKey(null);
    }
  };

  const currentEnv = process.env.REACT_APP_ENV; // 'negma' = PROD build, 'npm' = NPM build
  const isNpm = currentEnv === 'npm';

  const prodTemplates = templates.filter(t => t.environment === 'prod');
  const npmTemplates = templates.filter(t => t.environment === 'npm');
  const sharedTemplates = templates.filter(t => t.environment === 'shared');

  const labelMeta = {
    PROD:   { color: 'primary',  title: 'Production Templates' },
    NPM:    { color: 'warning',  title: 'NPM / Hotel Templates' },
    SHARED: { color: 'success',  title: 'Shared Templates (used in all environments)' },
  };

  const renderTable = (rows, label) => (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        <Chip label={label} color={labelMeta[label]?.color ?? 'default'} size="small" sx={{ mr: 1 }} />
        {labelMeta[label]?.title ?? label}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}><strong>Key</strong></TableCell>
              <TableCell align="center"><strong>Display Name</strong></TableCell>
              <TableCell align="center"><strong>Last Modified</strong></TableCell>
              <TableCell align="center"><strong>Modified By</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No templates found. Click "Seed Templates" to load from files.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.map(t => (
              <TableRow key={t.templateKey} hover>
                <TableCell sx={{ pl: 3 }}><code style={{ fontSize: 11 }}>{t.templateKey}</code></TableCell>
                <TableCell align="center">{t.displayName}</TableCell>
                <TableCell align="center">{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="center">{t.updatedBy || '-'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/templates/${t.templateKey}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset to original">
                    <span>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleReset(t.templateKey)}
                        disabled={resettingKey === t.templateKey}
                      >
                        {resettingKey === t.templateKey ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Template Management</Typography>
        <Button
          variant="outlined"
          startIcon={seeding ? <CircularProgress size={16} /> : <SeedIcon />}
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? 'Seeding...' : 'Seed Templates from Files'}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          {!isNpm && renderTable(prodTemplates, 'PROD')}
          {isNpm && renderTable(npmTemplates, 'NPM')}
          {renderTable(sharedTemplates, 'SHARED')}
        </>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
