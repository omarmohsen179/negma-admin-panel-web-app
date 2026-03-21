import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  TextField,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Alert,
  MenuItem
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  RestartAlt as RestartAltIcon,
  DeleteOutline as DeleteOutlineIcon
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { ImageBaseUrl } from 'app/services/config';
import DocumentPdf from './DocumentPdf';
import DocumentImage from './DocumentImage';
import { GET_UNITS } from 'app/pages/Units/Api';
import { GET_BROKERS } from 'app/pages/Brokers/Api';
import {
  buildFileUrl,
  showFullScreenImage,
  getStatusText,
  getStatusColor,
  getClientSexText,
  getPackageTypeText
} from '../utils/reservationHelpers';
import {
  GET_CONTRACT_HTML,
  SAVE_CONTRACT_HTML,
  CLEAR_CONTRACT_HTML,
  REGENERATE_CONTRACT
} from '../Api';

// Determine which contract template will be used for a reservation
// UnitType enum: Office=0, Clinic=1, Shop=2, HotelApartment=3
// PaymentMethod: returned as string "Cash" or "Installment"
function getContractTemplateName(reservation) {
  const isNpm = process.env.REACT_APP_ENV === 'npm';
  const pay = (reservation.PaymentMethod || '').toLowerCase() === 'installment' ? 'installment' : 'cash';
  if (isNpm) {
    const pkg = reservation.PackageType === 1 ? 'gold' : 'silver';
    const nat = reservation.IsEgyptian ? 'egyptian' : 'foreign';
    return `contract_hotel_${pkg}_${pay}_${nat}`;
  }
  const unitType = reservation.UnitType;
  if (unitType === 2) return `contract_shop_${pay}`;
  if (unitType === 0) return `contract_office_${pay}`;
  return `contract_clinic_${pay}`; // Clinic=1, default
}

// Extract <body> innerHTML from a full HTML string
function extractBodyContent(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
}

// Reconstruct full HTML by replacing body content
function injectBodyContent(originalHtml, newBodyContent) {
  if (/<body[^>]*>/i.test(originalHtml)) {
    return originalHtml.replace(/(<body[^>]*>)([\s\S]*)(<\/body>)/i, `$1${newBodyContent}$3`);
  }
  return newBodyContent;
}

const ReservationDetailsDialog = React.memo(({
  open,
  reservation,
  isFinanceUser,
  // Approval state
  isApproving,
  onApprove,
  // Documents state
  submittedDocuments,
  documentPreviews,
  isSubmittingDocuments,
  onDocumentsChange,
  onRemoveDocument,
  onSubmitDocumentsAndMarkSold,
  // Update documents state
  updateDocuments,
  updateDocumentPreviews,
  isUpdatingDocuments,
  onUpdateDocumentsChange,
  onRemoveUpdateDocument,
  onUpdateDocuments,
  // Downpayment state
  downPaymentAmount,
  reservationFee,
  discountOnCashPercentage = '',
  bankAccount = '',
  bankName = '',
  bankBranch = '',
  swiftCode = '',
  onBankAccountChange,
  onBankNameChange,
  onBankBranchChange,
  onSwiftCodeChange,
  chequeFiles,
  chequeFilePreviews,
  isUploadingDownPayment,
  onDownPaymentAmountChange,
  onReservationFeeChange,
  onDiscountOnCashPercentageChange,
  onChequeImageChange,
  onRemoveChequeImage,
  onDownPaymentSubmit,
  // Actions
  onScheduleClick,
  onExcelUploadClick,
  onClose,
  // Multiple clients (one-to-many)
  clientsList = [],
  onAddClients,
  onRemoveClient,
  onUpdateReservationClient,
  isManagingClients = false,
  onUpdateBrokerDeveloper,
}) => {
  const [addClientsOpen, setAddClientsOpen] = React.useState(false);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = React.useState([]);
  const [tabValue, setTabValue] = React.useState(0);
  const [editingClient, setEditingClient] = React.useState(null);
  const [editClientForm, setEditClientForm] = React.useState({});
  const [ownershipError, setOwnershipError] = React.useState('');
  const [brokerDevEditMode, setBrokerDevEditMode] = React.useState(false);
  const [brokerDevForm, setBrokerDevForm] = React.useState({});
  const [brokerDevLoading, setBrokerDevLoading] = React.useState(false);
  const [brokerDevError, setBrokerDevError] = React.useState('');
  const [brokerDevSuccess, setBrokerDevSuccess] = React.useState('');
  const [unitsList, setUnitsList] = React.useState([]);
  const [brokersList, setBrokersList] = React.useState([]);
  const [unitsLoading, setUnitsLoading] = React.useState(false);
  const [brokersLoading, setBrokersLoading] = React.useState(false);
  const [unitChangeConfirmOpen, setUnitChangeConfirmOpen] = React.useState(false);
  const [pendingBrokerDevPayload, setPendingBrokerDevPayload] = React.useState(null);

  // Contract HTML editor state
  const [contractEditorOpen, setContractEditorOpen] = React.useState(false);
  const [contractFullHtml, setContractFullHtml] = React.useState('');
  const [contractEditorContent, setContractEditorContent] = React.useState('');
  const [contractEditorLoading, setContractEditorLoading] = React.useState(false);
  const [contractSaving, setContractSaving] = React.useState(false);
  const [contractRegenerating, setContractRegenerating] = React.useState(false);
  const contractIframeRef = React.useRef(null);
  const [contractClearing, setContractClearing] = React.useState(false);
  const [contractSnack, setContractSnack] = React.useState({ open: false, msg: '', severity: 'success' });

  if (!reservation) return null;

  const reservationClients = reservation.Clients ?? reservation.clients ?? [];
  const unitDiscount = reservation.UnitDiscount ?? reservation.unitDiscount;
  const reservationDiscount = reservation.ReservationDiscount ?? reservation.reservationDiscount;
  const canManageClients = typeof onAddClients === 'function' && typeof onRemoveClient === 'function';
  const canEditClient = typeof onUpdateReservationClient === 'function';

  const openContractEditor = async () => {
    setContractEditorOpen(true);
    setContractEditorLoading(true);
    try {
      const result = await GET_CONTRACT_HTML(reservation.Id ?? reservation.id);
      const html = typeof result === 'string' ? result : (result?.htmlContent ?? '');
      setContractFullHtml(html);
      setContractEditorContent(extractBodyContent(html));
    } catch (e) {
      setContractSnack({ open: true, msg: 'Failed to load contract HTML', severity: 'error' });
    } finally {
      setContractEditorLoading(false);
    }
  };

  const handleContractSave = async () => {
    setContractSaving(true);
    try {
      // Read current body content from the live iframe (preserves all CSS classes)
      const iframeBody = contractIframeRef.current?.contentDocument?.body;
      const currentBodyHtml = iframeBody ? iframeBody.innerHTML : contractEditorContent;
      const newFullHtml = injectBodyContent(contractFullHtml, currentBodyHtml);
      await SAVE_CONTRACT_HTML(reservation.Id ?? reservation.id, newFullHtml);
      setContractFullHtml(newFullHtml);
      setContractSnack({ open: true, msg: 'Contract HTML saved successfully', severity: 'success' });
    } catch (e) {
      setContractSnack({ open: true, msg: `Save failed: ${e?.message || ''}`, severity: 'error' });
    } finally {
      setContractSaving(false);
    }
  };

  const handleContractRegenerate = async () => {
    if (!window.confirm('Regenerate the contract PDF from the current saved HTML? This will overwrite the existing PDF.')) return;
    setContractRegenerating(true);
    try {
      await REGENERATE_CONTRACT(reservation.Id ?? reservation.id);
      setContractSnack({ open: true, msg: 'Contract PDF regenerated successfully', severity: 'success' });
    } catch (e) {
      setContractSnack({ open: true, msg: `Regeneration failed: ${e?.message || ''}`, severity: 'error' });
    } finally {
      setContractRegenerating(false);
    }
  };

  const handleContractClear = async () => {
    if (!window.confirm('Clear the HTML override? The contract will revert to being generated from the template.')) return;
    setContractClearing(true);
    try {
      await CLEAR_CONTRACT_HTML(reservation.Id ?? reservation.id);
      setContractSnack({ open: true, msg: 'Contract HTML override cleared', severity: 'success' });
      setContractEditorOpen(false);
    } catch (e) {
      setContractSnack({ open: true, msg: `Clear failed: ${e?.message || ''}`, severity: 'error' });
    } finally {
      setContractClearing(false);
    }
  };

  const openEditClient = (c) => {
    const reservationClientId = c.ReservationClientId ?? c.reservationClientId ?? c.Id ?? c.id;
    if (reservationClientId == null) return;
    setEditingClient({ ...c, reservationClientId });
    const dob = c.dateOfBirth ?? c.DateOfBirth;
    let dateOfBirthStr = '';
    if (dob) {
      try {
        const d = typeof dob === 'string' ? new Date(dob) : dob;
        if (!isNaN(d.getTime())) dateOfBirthStr = d.toISOString().slice(0, 10);
      } catch (_) {}
    }
    setEditClientForm({
      contractNote: c.contractNote ?? c.ContractNote ?? '',
      ownershipPercentage: c.ownershipPercentage ?? c.OwnershipPercentage ?? '',
      name: c.clientName ?? c.ClientName ?? '',
      email: c.clientEmail ?? c.ClientEmail ?? '',
      phoneNumber: c.clientPhone ?? c.ClientPhone ?? '',
      dateOfBirth: dateOfBirthStr,
      address: c.address ?? c.Address ?? '',
      nationality: c.nationality ?? c.Nationality ?? '',
      idNumber: c.idNumber ?? c.IdNumber ?? '',
      occupation: c.occupation ?? c.Occupation ?? c.jobTitle ?? c.JobTitle ?? '',
      sex: c.sex ?? c.Sex,
      isEgyptian: c.isEgyptian ?? c.IsEgyptian ?? true,
    });
  };

  const closeEditClient = () => {
    setEditingClient(null);
    setEditClientForm({});
    setOwnershipError('');
  };

  const handleEditClientField = (field, value) => {
    setEditClientForm((prev) => ({ ...prev, [field]: value }));
  };

  const openBrokerDevEdit = async () => {
    setBrokerDevForm({
      unitId: reservation.UnitId ?? null,
      brokerId: reservation.BrokerId ?? reservation.brokerId ?? null,
      directManager: reservation.DirectManager ?? '',
      developerSales: reservation.DeveloperSales ?? '',
      developerCompany: reservation.DeveloperCompany ?? '',
      developerTeamLeader: reservation.DeveloperTeamLeader ?? '',
      feedback: reservation.Feedback ?? '',
    });
    setBrokerDevError('');
    setBrokerDevSuccess('');
    setBrokerDevEditMode(true);
    // Fetch units and brokers in parallel
    setUnitsLoading(true);
    setBrokersLoading(true);
    try {
      const [unitsRes, brokersRes] = await Promise.all([
        GET_UNITS({ UnitStatus: 0 }),
        GET_BROKERS({}),
      ]);
      let units = Array.isArray(unitsRes) ? unitsRes : (unitsRes?.data ?? unitsRes?.Data ?? []);
      // Always include the currently linked unit so the dropdown shows it as selected
      const currentUnitId = reservation.UnitId ?? null;
      if (currentUnitId != null && !units.some(u => u.Id === currentUnitId)) {
        units = [{ Id: currentUnitId, UnitNumber: reservation.UnitNumber ?? String(currentUnitId) }, ...units];
      }
      setUnitsList(units);
      setBrokersList(Array.isArray(brokersRes) ? brokersRes : (brokersRes?.data ?? brokersRes?.Data ?? []));
    } catch (_) {
      // non-fatal — dropdowns will just be empty
    } finally {
      setUnitsLoading(false);
      setBrokersLoading(false);
    }
  };

  const closeBrokerDevEdit = () => {
    setBrokerDevEditMode(false);
    setBrokerDevForm({});
    setBrokerDevError('');
    setBrokerDevSuccess('');
  };

  const buildBrokerDevPayload = () => {
    const original = {
      unitId: reservation.UnitId ?? null,
      brokerId: reservation.BrokerId ?? reservation.brokerId ?? null,
      directManager: reservation.DirectManager ?? '',
      developerSales: reservation.DeveloperSales ?? '',
      developerCompany: reservation.DeveloperCompany ?? '',
      developerTeamLeader: reservation.DeveloperTeamLeader ?? '',
      feedback: reservation.Feedback ?? '',
    };
    const payload = {};
    if (brokerDevForm.unitId !== original.unitId) payload.unitId = brokerDevForm.unitId;
    if (brokerDevForm.brokerId !== original.brokerId) payload.brokerId = brokerDevForm.brokerId ?? 0;
    if (brokerDevForm.directManager !== original.directManager) payload.directManager = brokerDevForm.directManager;
    if (brokerDevForm.developerSales !== original.developerSales) payload.developerSales = brokerDevForm.developerSales;
    if (brokerDevForm.developerCompany !== original.developerCompany) payload.developerCompany = brokerDevForm.developerCompany;
    if (brokerDevForm.developerTeamLeader !== original.developerTeamLeader) payload.developerTeamLeader = brokerDevForm.developerTeamLeader;
    if (brokerDevForm.feedback !== original.feedback) payload.feedback = brokerDevForm.feedback;
    return payload;
  };

  const handleBrokerDevSave = () => {
    const payload = buildBrokerDevPayload();
    if (Object.keys(payload).length === 0) { closeBrokerDevEdit(); return; }
    if (payload.unitId !== undefined) {
      setPendingBrokerDevPayload(payload);
      setUnitChangeConfirmOpen(true);
    } else {
      submitBrokerDev(payload);
    }
  };

  const submitBrokerDev = async (payload) => {
    if (!onUpdateBrokerDeveloper) return;
    setBrokerDevLoading(true);
    setBrokerDevError('');
    try {
      await onUpdateBrokerDeveloper(reservation.Id, payload);
      setBrokerDevSuccess('Saved successfully.');
      setBrokerDevEditMode(false);
    } catch (err) {
      setBrokerDevError(err?.message || 'Failed to save.');
    } finally {
      setBrokerDevLoading(false);
    }
  };

  const handleEditClientSubmit = () => {
    if (!editingClient || !onUpdateReservationClient) return;

    setOwnershipError('');

    let sex = editClientForm.sex;
    if (sex === 0 || sex === '0') sex = 'Male';
    else if (sex === 1 || sex === '1') sex = 'Female';
    const payload = {
      contractNote: editClientForm.contractNote === '' ? null : editClientForm.contractNote,
      ownershipPercentage: editClientForm.ownershipPercentage === '' ? undefined : Number(editClientForm.ownershipPercentage),
      name: editClientForm.name,
      email: editClientForm.email,
      phoneNumber: editClientForm.phoneNumber,
      dateOfBirth: editClientForm.dateOfBirth || null,
      address: editClientForm.address,
      nationality: editClientForm.nationality,
      idNumber: editClientForm.idNumber,
      occupation: editClientForm.occupation,
      sex,
      isEgyptian: editClientForm.isEgyptian === true || editClientForm.isEgyptian === 'true',
    };
    onUpdateReservationClient(editingClient.reservationClientId, payload);
    closeEditClient();
  };

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Reservation Details - ID: {reservation.Id}
      </DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Clients" />
          <Tab label="Unit & Payment" />
          <Tab label="Broker & Developer" />
          <Tab label="Documents" />
          <Tab label="Actions" />
        </Tabs>

        {/* Tab 0: Overview */}
        <Box sx={{ display: tabValue !== 0 ? 'none' : 'block', overflow: 'auto', maxHeight: '65vh' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Unit ID</Typography>
              <Typography variant="body1">{reservation.UnitId}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Sales</Typography>
              <Typography variant="body1">{reservation.SalesName ?? reservation.SalesId ?? 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Chip label={getStatusText(reservation.Status)} color={getStatusColor(reservation.Status)} size="small" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Reservation Details</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Reservation Date</Typography>
              <Typography variant="body1">{new Date(reservation.ReservationDate).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Expiry Date</Typography>
              <Typography variant="body1">{new Date(reservation.ExpiryDate).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Additional Information</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Feedback</Typography>
              <Typography variant="body1">{reservation.Feedback || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              {(reservation.InstallmentScheduleJson || reservation.MaintenancePlanJson) && (
                <Button variant="outlined" color="primary" startIcon={<CalendarIcon fontSize="small" />} onClick={() => onScheduleClick(reservation)} sx={{ mr: 1 }}>
                  View Installment Schedule
                </Button>
              )}
              <Button variant="outlined" color="secondary" startIcon={<TableChartIcon fontSize="small" />} onClick={() => onExcelUploadClick(reservation)}>
                {reservation.InstallmentScheduleJson ? 'Update' : 'Add'} Installments Plan
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>System Information</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
              <Typography variant="body1">{new Date(reservation.CreatedAt).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
              <Typography variant="body1">{new Date(reservation.UpdatedAt).toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Tab 1: Clients – full data for all clients */}
        <Box sx={{ display: tabValue !== 1 ? 'none' : 'block', overflow: 'auto', maxHeight: '65vh' }}>
          <Grid container spacing={2}>
            {(reservationClients.length > 0 || canManageClients) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>All Clients</Typography>
                </Grid>
                {reservationClients.length > 0 && reservationClients.map((c) => {
                  const clientId = c.clientId ?? c.ClientId;
                  const clientName = c.clientName ?? c.ClientName ?? 'N/A';
                  const isOnlyClient = reservationClients.length === 1;
                  const ownership = c.ownershipPercentage ?? c.OwnershipPercentage;
                  const isEgyptian = c.isEgyptian ?? c.IsEgyptian;
                  const idNumber = c.idNumber ?? c.IdNumber ?? 'N/A';
                  const nationality = c.nationality ?? c.Nationality ?? 'N/A';
                  const address = c.address ?? c.Address ?? 'N/A';
                  const jobTitle = c.jobTitle ?? c.JobTitle ?? c.occupation ?? c.Occupation ?? 'N/A';
                  const sex = c.sex ?? c.Sex;
                  const contractNote = c.contractNote ?? c.ContractNote;
                  const reservationClientId = c.ReservationClientId ?? c.reservationClientId ?? c.Id ?? c.id;
                  return (
                    <Grid item xs={12} key={clientId}>
                      <Card variant="outlined" sx={{ overflow: 'visible' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{clientName}</Typography>
                            {canEditClient && reservationClientId != null && (
                              <Button size="small" variant="outlined" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditClient(c)} disabled={isManagingClients}>Edit</Button>
                            )}
                            {canManageClients && !isOnlyClient && (
                              <Button size="small" color="error" variant="outlined" onClick={() => onRemoveClient(reservation.Id, clientId)}>Remove</Button>
                            )}
                          </Box>
                          {contractNote != null && String(contractNote).trim() !== '' && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}><strong>Contract note:</strong> {contractNote}</Typography>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Email</Typography><Typography variant="body2" display="block">{c.clientEmail ?? c.ClientEmail ?? 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography variant="body2" display="block">{c.clientPhone ?? c.ClientPhone ?? 'N/A'}</Typography></Grid>
                            {(ownership !== undefined && ownership !== null) && <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Ownership %</Typography><Typography variant="body2" display="block">{ownership}</Typography></Grid>}
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Egyptian</Typography><Typography variant="body2" display="block">{isEgyptian === true ? 'Yes' : isEgyptian === false ? 'No' : 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">ID Number</Typography><Typography variant="body2" display="block">{idNumber}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Nationality</Typography><Typography variant="body2" display="block">{nationality}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Address</Typography><Typography variant="body2" display="block">{address || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Occupation</Typography><Typography variant="body2" display="block">{jobTitle || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="caption" color="textSecondary">Sex</Typography><Typography variant="body2" display="block">{typeof sex === 'number' ? getClientSexText(sex) : (sex || 'N/A')}</Typography></Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
                {canManageClients && (
                  <Grid item xs={12}>
                    {!addClientsOpen ? (
                      <Button size="small" variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setAddClientsOpen(true)} disabled={isManagingClients}>
                        Add clients
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                        <Autocomplete
                          multiple
                          size="small"
                          options={clientsList.filter((u) => {
                            const id = u.Id ?? u.id;
                            return !reservationClients.some((rc) => (rc.clientId ?? rc.ClientId) === id);
                          })}
                          getOptionLabel={(opt) => opt.UserName ?? opt.userName ?? opt.Email ?? opt.email ?? String(opt.Id ?? opt.id ?? '')}
                          value={selectedUsersToAdd}
                          onChange={(_, newValue) => setSelectedUsersToAdd(newValue)}
                          renderInput={(params) => <TextField {...params} label="Select clients to add" placeholder="Search..." />}
                          sx={{ minWidth: 280 }}
                        />
                        <Button size="small" variant="contained" disabled={isManagingClients || selectedUsersToAdd.length === 0} onClick={() => { const ids = selectedUsersToAdd.map((u) => u.Id ?? u.id); if (ids.length && onAddClients) onAddClients(reservation.Id, ids); setSelectedUsersToAdd([]); setAddClientsOpen(false); }}>
                          Add
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => { setAddClientsOpen(false); setSelectedUsersToAdd([]); }}>Cancel</Button>
                      </Box>
                    )}
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Box>

        {/* Tab 2: Unit & Payment */}
        <Box sx={{ display: tabValue !== 2 ? 'none' : 'block', overflow: 'auto', maxHeight: '65vh' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="h6" gutterBottom>Unit</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Unit Number</Typography><Typography variant="body1">{reservation.UnitNumber ?? reservation.UnitId ?? 'N/A'}</Typography></Grid>
            {(reservation.UnitPrice !== undefined && reservation.UnitPrice !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Unit Price</Typography><Typography variant="body1">{Number(reservation.UnitPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Typography></Grid>}
            {(reservation.UnitType !== undefined && reservation.UnitType !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Unit Type</Typography><Typography variant="body1">{reservation.UnitType}</Typography></Grid>}
            {(reservation.UnitStatus !== undefined && reservation.UnitStatus !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Unit Status</Typography><Typography variant="body1">{reservation.UnitStatus}</Typography></Grid>}
            <Grid item xs={12}><Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Reservation & Payment</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Reservation Date</Typography><Typography variant="body1">{new Date(reservation.ReservationDate).toLocaleString()}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Expiry Date</Typography><Typography variant="body1">{new Date(reservation.ExpiryDate).toLocaleString()}</Typography></Grid>
            {reservation.ReservationFee !== undefined && reservation.ReservationFee !== null && (
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Reservation Fee</Typography><Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{typeof reservation.ReservationFee === 'number' ? reservation.ReservationFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : reservation.ReservationFee}</Typography></Grid>
            )}
            {(unitDiscount !== undefined && unitDiscount !== null && unitDiscount !== '') && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Unit Discount</Typography><Typography variant="body1">{typeof unitDiscount === 'number' ? unitDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(unitDiscount)}</Typography></Grid>}
            {(reservationDiscount !== undefined && reservationDiscount !== null && reservationDiscount !== '') && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Reservation Discount</Typography><Typography variant="body1">{typeof reservationDiscount === 'number' ? reservationDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(reservationDiscount)}</Typography></Grid>}
            {(reservation.Discount !== undefined && reservation.Discount !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Discount (%)</Typography><Typography variant="body1">{typeof reservation.Discount === 'number' ? reservation.Discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : reservation.Discount}</Typography></Grid>}
            {(reservation.DiscountOnCash !== undefined && reservation.DiscountOnCash !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Discount on Cash</Typography><Typography variant="body1">{typeof reservation.DiscountOnCash === 'number' ? reservation.DiscountOnCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : reservation.DiscountOnCash}</Typography></Grid>}
            {(reservation.PriceAfterDiscount !== undefined && reservation.PriceAfterDiscount !== null) && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Price After Discount</Typography><Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{typeof reservation.PriceAfterDiscount === 'number' ? reservation.PriceAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : reservation.PriceAfterDiscount}</Typography></Grid>}
            {reservation.IsEgyptian !== undefined && reservation.IsEgyptian !== null && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Is Egyptian</Typography><Typography variant="body1">{reservation.IsEgyptian ? 'Yes' : 'No'}</Typography></Grid>}
            <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Payment Method</Typography><Typography variant="body1">{reservation.PaymentMethod || 'N/A'}</Typography></Grid>
            {reservation.PackageType !== undefined && reservation.PackageType !== null && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Package Type</Typography><Typography variant="body1">{getPackageTypeText(reservation.PackageType)}</Typography></Grid>}
            <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Installment Years</Typography><Typography variant="body1">{reservation.InstallmentYears || 'N/A'}</Typography></Grid>
            {reservation.TransactionType === 0 && (reservation.BankAccount || reservation.BankName || reservation.BankBranch || reservation.SwiftCode) && (
              <>
                <Grid item xs={12}><Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Bank Account Details</Typography></Grid>
                {reservation.BankAccount?.trim() && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Bank Account</Typography><Typography variant="body1">{reservation.BankAccount}</Typography></Grid>}
                {reservation.BankName?.trim() && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Bank Name</Typography><Typography variant="body1">{reservation.BankName}</Typography></Grid>}
                {reservation.BankBranch?.trim() && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Bank Branch</Typography><Typography variant="body1">{reservation.BankBranch}</Typography></Grid>}
                {reservation.SwiftCode?.trim() && <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Swift Code</Typography><Typography variant="body1">{reservation.SwiftCode}</Typography></Grid>}
              </>
            )}
            {(() => {
              const downPaymentAmount = reservation.DownPaymentAmount;
              const chequeImagePaths = reservation.DownPaymentChequeImagePaths || reservation.DownPaymentChequeImagePath;
              const hasDownPaymentAmount = downPaymentAmount != null && downPaymentAmount !== '' && (typeof downPaymentAmount === 'number' ? downPaymentAmount > 0 : true);
              const chequeImagesArray = Array.isArray(chequeImagePaths) ? chequeImagePaths.filter(p => p && p !== 'N/A' && p.trim() !== '') : (chequeImagePaths && chequeImagePaths !== 'N/A' && chequeImagePaths.trim() !== '' ? [chequeImagePaths] : []);
              const hasChequeImages = chequeImagesArray.length > 0;
              if (!hasDownPaymentAmount && !hasChequeImages) return null;
              return (
                <>
                  <Grid item xs={12}><Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Downpayment Information</Typography></Grid>
                  {hasDownPaymentAmount && <Grid item xs={hasChequeImages ? 6 : 12}><Typography variant="subtitle2" color="textSecondary">Downpayment Amount</Typography><Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{typeof downPaymentAmount === 'number' ? downPaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : downPaymentAmount}</Typography></Grid>}
                  {hasChequeImages && (
                    <Grid item xs={hasDownPaymentAmount ? 6 : 12}>
                      <Typography variant="subtitle2" color="textSecondary">Cheque Image{chequeImagesArray.length > 1 ? 's' : ''} ({chequeImagesArray.length})</Typography>
                      <Grid container spacing={2}>
                        {chequeImagesArray.map((chequePath, index) => {
                          if (!chequePath || chequePath === 'N/A') return null;
                          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(chequePath);
                          const isPdf = /\.pdf$/i.test(chequePath);
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>Cheque {index + 1}</Typography>
                              {isImage ? <DocumentImage path={chequePath} label={`Downpayment Cheque ${index + 1}`} /> : isPdf ? <DocumentPdf path={chequePath} label={`Downpayment Cheque ${index + 1}`} /> : (
                                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                  <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                                  <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all', fontSize: '0.75rem' }}>{chequePath.split('/').pop()}</Typography>
                                  <Button size="small" variant="outlined" startIcon={<ViewIcon />} onClick={() => { const u = buildFileUrl(chequePath); if (u) window.open(u, '_blank'); }} sx={{ mr: 1 }}>View</Button>
                                  <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => { const u = buildFileUrl(chequePath); if (u) { const a = document.createElement('a'); a.href = u; a.download = chequePath.split('/').pop(); a.click(); } }}>Download</Button>
                                </Box>
                              )}
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Grid>
                  )}
                </>
              );
            })()}
          </Grid>
        </Box>

        {/* Tab 3: Broker & Developer */}
        <Box sx={{ display: tabValue !== 3 ? 'none' : 'block', overflow: 'auto', maxHeight: '65vh' }}>
          {brokerDevSuccess && !brokerDevEditMode && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setBrokerDevSuccess('')}>{brokerDevSuccess}</Alert>
          )}
          {!brokerDevEditMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Broker Information</Typography>
                  {typeof onUpdateBrokerDeveloper === 'function' && (
                    <Button size="small" variant="outlined" startIcon={<EditIcon fontSize="small" />} onClick={openBrokerDevEdit}>Edit</Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Broker Name</Typography><Typography variant="body1">{reservation.BrokerName || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Company</Typography><Typography variant="body1">{reservation.BrokerCompany || reservation.DeveloperCompany || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Direct Manager</Typography><Typography variant="body1">{reservation.DirectManager || 'N/A'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Developer Information</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Developer Sales</Typography><Typography variant="body1">{reservation.DeveloperSales || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Developer Company</Typography><Typography variant="body1">{reservation.DeveloperCompany || 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2" color="textSecondary">Developer Team Leader</Typography><Typography variant="body1">{reservation.DeveloperTeamLeader || 'N/A'}</Typography></Grid>
              {reservation.Feedback && (
                <><Grid item xs={12}><Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Feedback</Typography></Grid>
                <Grid item xs={12}><Typography variant="body1">{reservation.Feedback}</Typography></Grid></>
              )}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Edit Broker &amp; Developer</Typography>
              </Grid>
              {/* Unit */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={unitsList}
                  loading={unitsLoading}
                  getOptionLabel={(opt) => opt.UnitNumber ? `${opt.UnitNumber}${opt.Floor != null ? ` — Floor ${opt.Floor}` : ''}` : String(opt.Id ?? '')}
                  value={unitsList.find(u => u.Id === brokerDevForm.unitId) ?? null}
                  onChange={(_, val) => setBrokerDevForm(prev => ({ ...prev, unitId: val?.Id ?? null }))}
                  isOptionEqualToValue={(opt, val) => opt.Id === val?.Id}
                  renderInput={(params) => <TextField {...params} label="Unit" InputProps={{ ...params.InputProps, endAdornment: <>{unitsLoading && <CircularProgress size={16} />}{params.InputProps.endAdornment}</> }} />}
                />
              </Grid>
              {/* Broker */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={brokersList}
                  loading={brokersLoading}
                  getOptionLabel={(opt) => opt.Name ?? String(opt.Id ?? '')}
                  value={brokersList.find(b => b.Id === brokerDevForm.brokerId) ?? null}
                  onChange={(_, val) => setBrokerDevForm(prev => ({ ...prev, brokerId: val?.Id ?? null }))}
                  isOptionEqualToValue={(opt, val) => opt.Id === val?.Id}
                  renderInput={(params) => <TextField {...params} label="Broker Name" InputProps={{ ...params.InputProps, endAdornment: <>{brokersLoading && <CircularProgress size={16} />}{params.InputProps.endAdornment}</> }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Direct Manager" value={brokerDevForm.directManager ?? ''} onChange={(e) => setBrokerDevForm(prev => ({ ...prev, directManager: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Developer Sales" value={brokerDevForm.developerSales ?? ''} onChange={(e) => setBrokerDevForm(prev => ({ ...prev, developerSales: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Developer Company" value={brokerDevForm.developerCompany ?? ''} onChange={(e) => setBrokerDevForm(prev => ({ ...prev, developerCompany: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Developer Team Leader" value={brokerDevForm.developerTeamLeader ?? ''} onChange={(e) => setBrokerDevForm(prev => ({ ...prev, developerTeamLeader: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Feedback" value={brokerDevForm.feedback ?? ''} onChange={(e) => setBrokerDevForm(prev => ({ ...prev, feedback: e.target.value }))} multiline minRows={2} />
              </Grid>
              {brokerDevError && (
                <Grid item xs={12}><Alert severity="error">{brokerDevError}</Alert></Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleBrokerDevSave} disabled={brokerDevLoading} startIcon={brokerDevLoading ? <CircularProgress size={18} color="inherit" /> : null}>
                    {brokerDevLoading ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="outlined" onClick={closeBrokerDevEdit} disabled={brokerDevLoading}>Cancel</Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>

          {/* Tab 4: Documents */}
          {tabValue === 4 && (
          <Box sx={{ overflow: 'auto', maxHeight: '65vh' }}>
          <Grid container spacing={2}>
          {/* Documents Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Documents</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>ID Front Path</Typography>
            {(() => {
              const path = reservation.IdFrontPath;
              if (!path || path === 'N/A') {
                return (
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">No ID Front Image</Typography>
                  </Box>
                );
              }
              
              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(path);
              const isPdf = /\.pdf$/i.test(path);
              
              if (isImage) {
                return <DocumentImage path={path} label="ID Front Image" />;
              } else if (isPdf) {
                return <DocumentPdf path={path} label="ID Front Document" />;
              } else {
                const fullFileSrc = buildFileUrl(path);
                if (!fullFileSrc) {
                  return (
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">No ID Front Document</Typography>
                    </Box>
                  );
                }
                
                return (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    border: '1px solid #ddd', 
                    borderRadius: 1 
                  }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                      {path.split('/').pop()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        const urlParts = fullFileSrc.split('/');
                        if (urlParts.length > 0) {
                          const filename = urlParts[urlParts.length - 1];
                          urlParts[urlParts.length - 1] = encodeURIComponent(filename);
                          window.open(urlParts.join('/'), '_blank', 'noopener,noreferrer');
                        }
                      }}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fullFileSrc;
                        link.download = path.split('/').pop();
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                );
              }
            })()}
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>ID Back Path</Typography>
            {(() => {
              const path = reservation.IdBackPath;
              if (!path || path === 'N/A') {
                return (
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">No ID Back Image</Typography>
                  </Box>
                );
              }
              
              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(path);
              const isPdf = /\.pdf$/i.test(path);
              
              if (isImage) {
                return <DocumentImage path={path} label="ID Back Image" />;
              } else if (isPdf) {
                return <DocumentPdf path={path} label="ID Back Document" />;
              } else {
                const fullFileSrc = buildFileUrl(path);
                if (!fullFileSrc) {
                  return (
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">No ID Back Document</Typography>
                    </Box>
                  );
                }
                
                return (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    border: '1px solid #ddd', 
                    borderRadius: 1 
                  }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                      {path.split('/').pop()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        const urlParts = fullFileSrc.split('/');
                        if (urlParts.length > 0) {
                          const filename = urlParts[urlParts.length - 1];
                          urlParts[urlParts.length - 1] = encodeURIComponent(filename);
                          window.open(urlParts.join('/'), '_blank', 'noopener,noreferrer');
                        }
                      }}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fullFileSrc;
                        link.download = path.split('/').pop();
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                );
              }
            })()}
          </Grid>
          
          {/* Other Documents */}
          {(() => {
            const raw = reservation.OtherDocumentsPath;
            if (!raw || raw === 'N/A') return null;
            const paths = Array.isArray(raw)
              ? raw
              : String(raw).split(',').map((p) => (p && p.trim()) || '').filter(Boolean);
            if (paths.length === 0) return null;
            return true;
          })() && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Other Documents</Typography>
              </Grid>
              {(() => {
                const raw = reservation.OtherDocumentsPath;
                const paths = Array.isArray(raw)
                  ? raw
                  : String(raw).split(',').map((p) => (p && p.trim().replace(/\\/g, '')) || '').filter(Boolean);
                return paths;
              })().map((docPath, index) => {
                if (!docPath || docPath === 'N/A') return null;
                
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(docPath);
                const isPdf = /\.pdf$/i.test(docPath);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Other Document {index + 1}
                    </Typography>
                    {isImage ? (
                      <DocumentImage 
                        path={docPath} 
                        label={`Other Document ${index + 1}`}
                      />
                    ) : isPdf ? (
                      <DocumentPdf 
                        path={docPath} 
                        label={`Other Document ${index + 1}`}
                      />
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        border: '1px solid #ddd', 
                        borderRadius: 1 
                      }}>
                        <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                        <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                          {docPath.split('/').pop()}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => {
                            const fullUrl = buildFileUrl(docPath);
                            if (fullUrl) {
                              window.open(fullUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          sx={{ mt: 1, fontSize: '0.7rem', py: 0.5 }}
                        >
                          View Document
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const fullUrl = buildFileUrl(docPath);
                            if (fullUrl) {
                              const link = document.createElement('a');
                              link.href = fullUrl;
                              link.download = docPath.split('/').pop();
                              link.style.display = 'none';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          sx={{ mt: 1, ml: 1, fontSize: '0.7rem', py: 0.5 }}
                        >
                          Download
                        </Button>
                      </Box>
                    )}
                  </Grid>
                );
              })}
            </>
          )}

          {/* PDF Documents */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>PDF Documents</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Reservation Form PDF</Typography>
            <DocumentPdf 
              path={reservation.ReservationFormPdfPath} 
              label="Reservation Form PDF"
            />
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Contract PDF</Typography>
            <DocumentPdf
              path={reservation.ContractPdfPath}
              label="Contract PDF"
            />
            {reservation.Status === 0 && (
              <Box mt={1}>
                <Box mb={0.5}>
                  <Chip
                    size="small"
                    label={`Template: ${getContractTemplateName(reservation)}`}
                    variant="outlined"
                    color="info"
                    sx={{ fontSize: 10 }}
                  />
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<EditIcon />}
                  onClick={openContractEditor}
                >
                  Edit Contract HTML
                </Button>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Installment Schedule PDF</Typography>
            <DocumentPdf 
              path={reservation.InstallmentSchedulePdfPath} 
              label="Installment Schedule PDF"
            />
          </Grid>

          {/* Submitted Documents */}
          {reservation.SubmittedDocuments && 
           Array.isArray(reservation.SubmittedDocuments) && 
           reservation.SubmittedDocuments.length > 0 && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Submitted Documents</Typography>
              </Grid>
              {reservation.SubmittedDocuments.map((docPath, index) => {
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(docPath);
                const isPdf = /\.pdf$/i.test(docPath);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Document {index + 1}
                    </Typography>
                    {isImage ? (
                      <DocumentImage 
                        path={docPath} 
                        label={`Submitted Document ${index + 1}`}
                      />
                    ) : isPdf ? (
                      <DocumentPdf 
                        path={docPath} 
                        label={`Submitted Document ${index + 1}`}
                      />
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        border: '1px solid #ddd', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="textSecondary">
                          {docPath.split('/').pop()}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const baseUrl = ImageBaseUrl.endsWith('/') ? ImageBaseUrl : ImageBaseUrl + '/';
                            const cleanPath = docPath.startsWith('/') ? docPath.substring(1) : docPath;
                            const fullUrl = baseUrl + cleanPath;
                            window.open(fullUrl, '_blank');
                          }}
                          sx={{ mt: 1 }}
                        >
                          View Document
                        </Button>
                      </Box>
                    )}
                  </Grid>
                );
              })}
            </>
          )}

          </Grid>
          </Box>
          )}

          {/* Tab 5: Actions */}
          {tabValue === 5 && (
          <Box sx={{ overflow: 'auto', maxHeight: '65vh' }}>
          <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>System Information</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
            <Typography variant="body1">{new Date(reservation.CreatedAt).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
            <Typography variant="body1">{new Date(reservation.UpdatedAt).toLocaleString()}</Typography>
          </Grid>

          {/* Approvals History */}
          {Array.isArray(reservation.Approvals) && reservation.Approvals.length > 0 && (
            <>
              <Grid item xs={12}>
                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                  <Typography variant="h6" gutterBottom>Approvals</Typography>
                  <Grid container spacing={2}>
                    {reservation.Approvals.map((approval) => {
                      const adminRoleLabel = approval.AdminType === 0 ? 'Operation' : approval.AdminType === 1 ? 'Finance' : approval.AdminType === 2 ? 'Customer Support' : `Type ${approval.AdminType}`;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={approval.Sequence}>
                          <Card variant="outlined">
                            <CardContent sx={{ pb: '12px !important', pt: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="subtitle2" fontWeight="bold">{approval.AdminName}</Typography>
                              </Box>
                              <Chip
                                label={adminRoleLabel}
                                size="small"
                                color={approval.AdminType === 0 ? 'primary' : approval.AdminType === 1 ? 'warning' : 'success'}
                                sx={{ mb: 0.75 }}
                              />
                              <Typography variant="caption" color="textSecondary" display="block">
                                #{approval.Sequence} &middot; {new Date(approval.ApprovedAt).toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Grid>
            </>
          )}

          {/* Approval Section */}
          {reservation.Status === 0 && (
            <>
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 3, 
                  pt: 2, 
                  borderTop: '2px solid #e0e0e0' 
                }}>
                  <Typography variant="h6" gutterBottom>
                    Admin Approval
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    This reservation requires approval from 2 admins before it can be confirmed.
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: reservation.IsApprovedByCurrentUser ? 'success.light' : 'grey.100',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: reservation.IsApprovedByCurrentUser ? 'success.main' : 'grey.300',
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {reservation.IsApprovedByCurrentUser ? (
                        <>
                          <CheckCircleIcon color="success" />
                          <Typography variant="body1" color="success.dark" fontWeight="bold">
                            You have approved this reservation
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          You have not approved this reservation yet
                        </Typography>
                      )}
                    </Box>
                    
                    {reservation.ApprovalCount !== undefined && (
                      <Typography variant="body2" color="textSecondary">
                        Current approvals: {reservation.ApprovalCount} / 2
                      </Typography>
                    )}
                  </Box>

                  {!reservation.IsApprovedByCurrentUser && (() => {
                    const isInstallment = reservation.PaymentMethod && reservation.PaymentMethod.toLowerCase() !== 'cash';
                    const scheduleJson = reservation.InstallmentScheduleJson;
                    const maintenanceJson = reservation.MaintenancePlanJson;
                    const scheduleEmpty = !scheduleJson || scheduleJson === '[]' || scheduleJson.trim() === '';
                    const maintenanceEmpty = !maintenanceJson || maintenanceJson === '[]' || maintenanceJson.trim() === '';
                    const missingDocs = isFinanceUser && (scheduleEmpty || maintenanceEmpty);
                    return (
                      <>
                        {missingDocs && (
                          <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                            You cannot approve this installment reservation yet. Please upload the missing documents first:
                            <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                              {scheduleEmpty && <li>Installment Schedule</li>}
                              {maintenanceEmpty && <li>Maintenance Plan</li>}
                            </Box>
                          </Alert>
                        )}
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={isApproving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                          onClick={onApprove}
                          disabled={isApproving || missingDocs}
                          sx={{ mt: 1 }}
                        >
                          {isApproving ? 'Approving...' : 'Approve Reservation'}
                        </Button>
                      </>
                    );
                  })()}
                </Box>
              </Grid>
            </>
          )}

          {/* Update Submitted Documents Section */}
          {reservation.Status === 2 && 
           reservation.SubmittedDocuments && 
           Array.isArray(reservation.SubmittedDocuments) && 
           reservation.SubmittedDocuments.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '2px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom>
                  Update Submitted Documents
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Upload new documents to replace the existing submitted documents. This will replace all current documents.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      accept="image/*,.pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="update-documents-input"
                      type="file"
                      multiple
                      onChange={onUpdateDocumentsChange}
                    />
                    <label htmlFor="update-documents-input">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        {updateDocuments.length > 0 
                          ? `Change Documents (${updateDocuments.length} selected)` 
                          : 'Select New Documents'}
                      </Button>
                    </label>
                    
                    {updateDocumentPreviews.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          New Documents ({updateDocuments.length}):
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {updateDocumentPreviews.map((preview, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box sx={{ 
                                position: 'relative', 
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                p: 1,
                                bgcolor: 'background.paper'
                              }}>
                                {preview.type === 'image' && preview.preview ? (
                                  <img
                                    src={preview.preview}
                                    alt={`Preview ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      maxHeight: '150px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => showFullScreenImage(preview.preview)}
                                  />
                                ) : preview.type === 'pdf' ? (
                                  <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <PdfIcon sx={{ fontSize: 48, color: '#d32f2f' }} />
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Document
                                    </Typography>
                                  </Box>
                                )}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    mt: 1, 
                                    wordBreak: 'break-all',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {preview.file.name}
                                </Typography>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => onRemoveUpdateDocument(index)}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 8, 
                                    right: 8,
                                    minWidth: 'auto',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '16px',
                                    p: 0
                                  }}
                                >
                                  ×
                                </Button>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onUpdateDocuments}
                      disabled={isUpdatingDocuments || updateDocuments.length === 0}
                      startIcon={isUpdatingDocuments ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      {isUpdatingDocuments ? 'Updating...' : 'Update Documents'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Submit Documents and Mark as Sold Section */}
          {reservation.Status === 1 && (
            <Grid item xs={12}>
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '2px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom>
                  Submit Documents and Mark Unit as Sold
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Upload required documents (images, PDFs, Word documents, etc.) and mark this unit as SOLD.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      accept="image/*,.pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="documents-input"
                      type="file"
                      multiple
                      onChange={onDocumentsChange}
                    />
                    <label htmlFor="documents-input">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        {submittedDocuments.length > 0 
                          ? `Change Documents (${submittedDocuments.length} selected)` 
                          : 'Upload Documents'}
                      </Button>
                    </label>
                    
                    {documentPreviews.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Selected Documents ({submittedDocuments.length}):
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {documentPreviews.map((preview, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box sx={{ 
                                position: 'relative', 
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                p: 1,
                                bgcolor: 'background.paper'
                              }}>
                                {preview.type === 'image' && preview.preview ? (
                                  <img
                                    src={preview.preview}
                                    alt={`Preview ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      maxHeight: '150px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => showFullScreenImage(preview.preview)}
                                  />
                                ) : preview.type === 'pdf' ? (
                                  <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <PdfIcon sx={{ fontSize: 48, color: '#d32f2f' }} />
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Document
                                    </Typography>
                                  </Box>
                                )}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    mt: 1, 
                                    wordBreak: 'break-all',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {preview.file.name}
                                </Typography>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => onRemoveDocument(index)}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 8, 
                                    right: 8,
                                    minWidth: 'auto',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '16px',
                                    p: 0
                                  }}
                                >
                                  ×
                                </Button>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={onSubmitDocumentsAndMarkSold}
                      disabled={isSubmittingDocuments || submittedDocuments.length === 0}
                      startIcon={isSubmittingDocuments ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                      sx={{ mt: 1 }}
                    >
                      {isSubmittingDocuments ? 'Submitting...' : 'Mark as SOLD'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Downpayment Upload Section */}
          {isFinanceUser && (
            <Grid item xs={12}>
              <Box sx={{ 
                mt: 3, 
                pt: 2, 
                borderTop: '2px solid #e0e0e0' 
              }}>
                <Typography variant="h6" gutterBottom>
                  {reservation.DownPaymentAmount ? 'Update' : 'Upload'} Downpayment Information
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {reservation.DownPaymentAmount 
                    ? 'Update downpayment amount and cheque image (if available).'
                    : 'Upload downpayment amount and cheque image (if available).'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Downpayment Amount"
                      type="number"
                      value={downPaymentAmount || 0}
                      onChange={onDownPaymentAmountChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                      helperText="Enter the downpayment amount"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reservation Fee"
                      type="number"
                      value={reservationFee || 0}
                      onChange={onReservationFeeChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                      helperText="Enter the reservation fee"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Discount on cash (%)"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                      value={discountOnCashPercentage === '' ? '' : discountOnCashPercentage}
                      onChange={onDiscountOnCashPercentageChange}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="e.g. 10"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      helperText="Percentage discount applied for cash (0–100)"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Discount on cash (total after discount)"
                      type="text"
                      value={(() => {
                        const unitPrice = reservation.UnitPrice ?? reservation.unitPrice ?? 0;
                        const pct = parseFloat(discountOnCashPercentage) || 0;
                        if (unitPrice <= 0 || pct < 0 || pct > 100) return '';
                        const afterDiscount = unitPrice * (1 - pct / 100);
                        return afterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                      helperText="Unit price after discount (read-only)"
                    />
                  </Grid>
                  <Grid item xs={12}><Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>Bank details (optional – updated on reservation)</Typography></Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Bank Account" value={bankAccount || ''} onChange={onBankAccountChange} placeholder="e.g. 123456789" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Bank Name" value={bankName || ''} onChange={onBankNameChange} placeholder="e.g. Bank name" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Bank Branch" value={bankBranch || ''} onChange={onBankBranchChange} placeholder="e.g. Branch name" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Swift Code" value={swiftCode || ''} onChange={onSwiftCodeChange} placeholder="e.g. SWIFT123" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <input
                        style={{ display: 'none' }}
                        id="cheque-image-input"
                        type="file"
                        multiple
                        onChange={onChequeImageChange}
                      />
                      <label htmlFor="cheque-image-input">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          sx={{ mb: 2 }}
                        >
                          {chequeFiles.length > 0
                            ? `Change Files (${chequeFiles.length} selected)`
                            : 'Select Files'}
                        </Button>
                      </label>
                      
                      {chequeFilePreviews.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Selected Files ({chequeFiles.length}):
                          </Typography>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            {chequeFilePreviews.map((preview, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box sx={{ 
                                  position: 'relative', 
                                  border: '1px solid #ddd',
                                  borderRadius: 1,
                                  p: 1,
                                  bgcolor: 'background.paper'
                                }}>
                                  {preview.type === 'image' && preview.preview ? (
                                    <img
                                      src={preview.preview}
                                      alt={`Preview ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        maxHeight: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => showFullScreenImage(preview.preview)}
                                    />
                                  ) : preview.type === 'pdf' ? (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <PdfIcon sx={{ fontSize: 48, color: '#d32f2f' }} />
                                    </Box>
                                  ) : (
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <DescriptionIcon sx={{ fontSize: 32, color: 'action.active' }} />
                                    </Box>
                                  )}
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      display: 'block', 
                                      mt: 1, 
                                      wordBreak: 'break-all',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    {preview.file.name}
                                  </Typography>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => onRemoveChequeImage(index)}
                                    sx={{ 
                                      position: 'absolute', 
                                      top: 8, 
                                      right: 8,
                                      minWidth: 'auto',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                                    }}
                                  >
                                    ×
                                  </Button>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      {chequeFiles.length > 0 && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                          Files are optional but recommended
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onDownPaymentSubmit}
                      disabled={isUploadingDownPayment}
                      startIcon={isUploadingDownPayment ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      {isUploadingDownPayment ? 'Uploading...' : 'Submit Downpayment'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
          </Box>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Edit reservation client dialog */}
    <Dialog open={!!editingClient} onClose={closeEditClient} maxWidth="sm" fullWidth>
      <DialogTitle>Edit client</DialogTitle>
      <DialogContent>
        {editingClient && (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Contract note (optional)" value={editClientForm.contractNote ?? ''} onChange={(e) => handleEditClientField('contractNote', e.target.value)} multiline minRows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" inputProps={{ min: 0, max: 100, step: 0.01 }} label="Ownership %" value={editClientForm.ownershipPercentage ?? ''} onChange={(e) => handleEditClientField('ownershipPercentage', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={editClientForm.name ?? ''} onChange={(e) => handleEditClientField('name', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="email" label="Email" value={editClientForm.email ?? ''} onChange={(e) => handleEditClientField('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={editClientForm.phoneNumber ?? ''} onChange={(e) => handleEditClientField('phoneNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date of birth" value={editClientForm.dateOfBirth ?? ''} onChange={(e) => handleEditClientField('dateOfBirth', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nationality" value={editClientForm.nationality ?? ''} onChange={(e) => handleEditClientField('nationality', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="ID Number" value={editClientForm.idNumber ?? ''} onChange={(e) => handleEditClientField('idNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Occupation" value={editClientForm.occupation ?? ''} onChange={(e) => handleEditClientField('occupation', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Sex" value={editClientForm.sex ?? ''} onChange={(e) => handleEditClientField('sex', e.target.value)}>
                <MenuItem value="">—</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value={0}>Male (0)</MenuItem>
                <MenuItem value={1}>Female (1)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Is Egyptian" value={editClientForm.isEgyptian === true || editClientForm.isEgyptian === 'true' ? 'yes' : 'no'} onChange={(e) => handleEditClientField('isEgyptian', e.target.value === 'yes')}>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" value={editClientForm.address ?? ''} onChange={(e) => handleEditClientField('address', e.target.value)} multiline minRows={2} />
            </Grid>
            {ownershipError && (
              <Grid item xs={12}>
                <Alert severity="error">{ownershipError}</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeEditClient}>Cancel</Button>
        <Button variant="contained" onClick={handleEditClientSubmit} disabled={isManagingClients}>Save</Button>
      </DialogActions>
    </Dialog>

    {/* Unit change confirmation dialog */}
    <Dialog open={unitChangeConfirmOpen} onClose={() => setUnitChangeConfirmOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Change Unit?</DialogTitle>
      <DialogContent>
        <Typography>
          Changing the unit will release the current unit and reserve the new one. Continue?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { setUnitChangeConfirmOpen(false); setPendingBrokerDevPayload(null); }}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={() => { setUnitChangeConfirmOpen(false); submitBrokerDev(pendingBrokerDevPayload); setPendingBrokerDevPayload(null); }}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>

    {/* Contract HTML Editor Dialog */}
    <Dialog open={contractEditorOpen} onClose={() => setContractEditorOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Contract HTML</DialogTitle>
      <DialogContent dividers>
        {contractEditorLoading ? (
          <Box display="flex" justifyContent="center" mt={4} mb={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Edit the contract text below. Do not delete text in curly braces like <code>{'{{CLIENT_NAME}}'}</code> — these are placeholders replaced with real data when the contract is generated.
            </Alert>
            <Box sx={{ direction: 'rtl' }}>
              <Box
                sx={{
                  background: '#e8e8e8',
                  borderRadius: 1,
                  p: 2,
                  overflowY: 'auto',
                  height: '65vh',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <iframe
                  ref={contractIframeRef}
                  title="contract-editor"
                  srcDoc={contractFullHtml}
                  style={{
                    width: '794px',
                    minHeight: '1123px',
                    flexShrink: 0,
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                    background: '#fff',
                  }}
                  onLoad={() => {
                    const doc = contractIframeRef.current?.contentDocument;
                    if (!doc?.body) return;
                    doc.body.contentEditable = 'true';
                    doc.body.style.outline = 'none';
                    doc.body.style.cursor = 'text';
                    doc.body.style.padding = '40px 50px';
                    doc.body.style.boxSizing = 'border-box';
                  }}
                />
              </Box>
            </Box>
          </>
        )}
        <Box mt={2}>
          {contractSnack.open && (
            <Alert severity={contractSnack.severity} onClose={() => setContractSnack(s => ({ ...s, open: false }))} sx={{ mb: 1 }}>
              {contractSnack.msg}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          color="error"
          variant="outlined"
          startIcon={contractClearing ? <CircularProgress size={16} /> : <DeleteOutlineIcon />}
          onClick={handleContractClear}
          disabled={contractClearing || contractSaving || contractRegenerating}
        >
          Clear Override
        </Button>
        <Button
          color="warning"
          variant="outlined"
          startIcon={contractRegenerating ? <CircularProgress size={16} /> : <RestartAltIcon />}
          onClick={handleContractRegenerate}
          disabled={contractRegenerating || contractSaving || contractClearing}
        >
          {contractRegenerating ? 'Regenerating...' : 'Regenerate PDF'}
        </Button>
        <Button onClick={() => setContractEditorOpen(false)} disabled={contractSaving || contractRegenerating || contractClearing}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={contractSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleContractSave}
          disabled={contractSaving || contractRegenerating || contractClearing || contractEditorLoading}
        >
          {contractSaving ? 'Saving...' : 'Save HTML'}
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
});

ReservationDetailsDialog.displayName = 'ReservationDetailsDialog';

export default ReservationDetailsDialog;
