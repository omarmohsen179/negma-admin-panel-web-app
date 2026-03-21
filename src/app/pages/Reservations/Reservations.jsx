import CrudMUI from "app/components/CrudTable/CrudMUI";
import PageLayout from "app/components/PageLayout/PageLayout";
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DELETE_RESERVATION, GET_RESERVATIONS, GET_RESERVATION_BY_ID, UPDATE_RESERVATION_STATUS, APPROVE_RESERVATION, UPLOAD_DOWNPAYMENT, SUBMIT_DOCUMENTS_AND_MARK_SOLD, UPDATE_SUBMITTED_DOCUMENTS, UPDATE_RESERVATION_JSON_FIELDS, FETCH_GOOGLE_SHEET_CSV, ADD_RESERVATION_CLIENTS, REMOVE_RESERVATION_CLIENT, UPDATE_RESERVATION_CLIENT, UPDATE_BROKER_DEVELOPER } from "./Api";
import { GET_USERS } from "../Admins/Api";
import ExcelJS from "exceljs";
import { useState } from "react";
import { useEffect } from "react";

// Import components
import ReservationDetailsDialog from "./components/ReservationDetailsDialog";
import StatusChangeDialog from "./components/StatusChangeDialog";
import ScheduleDialog from "./components/ScheduleDialog";
import ExcelUploadDialog from "./components/ExcelUploadDialog";

// Import helper functions
import { getStatusText, getCurrentUserAdminType } from "./utils/reservationHelpers";

// Parse percentage string to number for API submit only (handles "1,75%", "1.75%", etc.)
const parsePercentageForApi = (pct) => {
  if (pct == null || pct === '') return undefined;
  if (typeof pct === 'number' && !isNaN(pct)) return pct;
  let s = String(pct).replace(/%/g, '').trim();
  if (/,\d{1,3}$/.test(s) || /^\d+,\d+$/.test(s)) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return isNaN(n) ? undefined : (n > 0 && n < 1 ? n * 100 : n >= 100 && n <= 9999 ? n / 100 : n);
};

// Parse amount string to number for API submit only (handles "249.049,10", "189,751.70", etc.)
const parseAmountForApi = (v) => {
  if (v == null || v === '') return undefined;
  if (typeof v === 'number' && !isNaN(v)) return v;
  let s = String(v).trim();
  if (/,\d{1,3}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return isNaN(n) ? undefined : n;
};

const Reservations = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [statusChangeReservation, setStatusChangeReservation] = useState(null);
  const [newStatus, setNewStatus] = useState(0);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleReservation, setScheduleReservation] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [reservationFee, setReservationFee] = useState("");
  const [discountOnCashPercentage, setDiscountOnCashPercentage] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [chequeFiles, setChequeFiles] = useState([]);
  const [chequeFilePreviews, setChequeFilePreviews] = useState([]);
  const [isUploadingDownPayment, setIsUploadingDownPayment] = useState(false);
  const [submittedDocuments, setSubmittedDocuments] = useState([]);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [isSubmittingDocuments, setIsSubmittingDocuments] = useState(false);
  const [updateDocuments, setUpdateDocuments] = useState([]);
  const [updateDocumentPreviews, setUpdateDocumentPreviews] = useState([]);
  const [isUpdatingDocuments, setIsUpdatingDocuments] = useState(false);
  const [excelUploadOpen, setExcelUploadOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelInstallments, setExcelInstallments] = useState([]);
  const [maintenanceDepositInstallments, setMaintenanceDepositInstallments] = useState([]);
  const [profitRows, setProfitRows] = useState([]);
  const [excelParsingError, setExcelParsingError] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isLoadingGoogleSheet, setIsLoadingGoogleSheet] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [isManagingClients, setIsManagingClients] = useState(false);

  const isFinanceUser = getCurrentUserAdminType() === 1;

  // Load users for "Add clients" when details dialog opens
  useEffect(() => {
    if (detailsOpen) {
      GET_USERS({ pageSize: 1000, pageIndex: 0 })
        .then((res) => setAvailableClients(res?.Data ?? []))
        .catch(() => setAvailableClients([]));
    }
  }, [detailsOpen]);

  const refreshTable = useCallback(() => {
    setTableRefreshKey(prev => prev + 1);
  }, []);

  // Helper function to parse installments from JSON
  const parseInstallmentsFromJson = useCallback((jsonString, isMaintenance = false) => {
    if (!jsonString) return [];
    
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      
      if (!Array.isArray(parsed) || parsed.length === 0) return [];
      
      return parsed
        .filter(item => {
          if (!item) return false;
          if (isMaintenance) {
            const amount = parseFloat(item.Amount || item.amount || 0);
            return amount > 0;
          } else {
            return item.Number && item.Number !== 'Total';
          }
        })
        .map((item, index) => {
          const amountRaw = item.Amount ?? item.amount;
          const dueDateRaw = item.DueDate ?? item.dueDate;
          const pctRaw = item.Percentage ?? item.percentage ?? null;
          const amountStr = amountRaw != null ? String(amountRaw) : null;
          const dueDateStr = dueDateRaw != null ? String(dueDateRaw) : null;
          const percentageStr = pctRaw != null ? String(pctRaw) : null;
          let parsedDate = null;
          if (dueDateRaw) {
            try {
              const d = new Date(dueDateRaw);
              if (!isNaN(d.getTime())) parsedDate = d;
            } catch (e) {}
          }
          let numAmount = 0;
          if (amountRaw != null) {
            let s = String(amountRaw).trim();
            if (/,\d{1,3}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
            else s = s.replace(/,/g, '');
            const n = parseFloat(s.replace(/[^\d.-]/g, ''));
            if (!isNaN(n)) numAmount = n;
          }

          return {
            id: item.Id || item.id || index + 1,
            year: item.Year ?? item.year ?? null,
            number: item.Number || item.number || (isMaintenance ? `Maintenance ${index + 1}` : `Installment ${index + 1}`),
            amount: amountStr,
            dueDate: dueDateStr,
            percentage: percentageStr,
            rawAmount: numAmount,
            rawDate: parsedDate,
            rawPercentage: parsePercentageForApi(pctRaw)
          };
        });
    } catch (error) {
      console.error(`Error parsing ${isMaintenance ? 'maintenance' : 'installment'} JSON:`, error);
      return [];
    }
  }, []);

  const refreshSelectedReservation = useCallback(async (reservationId) => {
    if (!reservationId) return;
    try {
      const updatedReservation = await GET_RESERVATION_BY_ID(reservationId);
      console.log('Updated reservation:', updatedReservation);
      // Check if response is a valid reservation (has id or Id property) and not an error message
      if (updatedReservation && (updatedReservation.id || updatedReservation.Id)) {
        setSelectedReservation(updatedReservation);
        // Update form fields with refreshed data (handle both PascalCase and camelCase property names)
        const downPayment = updatedReservation.DownPaymentAmount ?? updatedReservation.downPaymentAmount;
        const reservationFeeValue = updatedReservation.ReservationFee ?? updatedReservation.reservationFee;
        
        if (downPayment) {
          setDownPaymentAmount(downPayment.toString());
        } else {
          setDownPaymentAmount("");
        }
        if (reservationFeeValue) {
          setReservationFee(reservationFeeValue.toString());
        } else {
          setReservationFee("");
        }
        const discountPct = updatedReservation.DiscountOnCashPercentage ?? updatedReservation.discountOnCashPercentage ?? updatedReservation.Discount ?? updatedReservation.discount;
        if (discountPct !== undefined && discountPct !== null && discountPct !== '') {
          setDiscountOnCashPercentage(String(discountPct));
        } else {
          setDiscountOnCashPercentage('');
        }
        setBankAccount(updatedReservation.BankAccount ?? updatedReservation.bankAccount ?? '');
        setBankName(updatedReservation.BankName ?? updatedReservation.bankName ?? '');
        setBankBranch(updatedReservation.BankBranch ?? updatedReservation.bankBranch ?? '');
        setSwiftCode(updatedReservation.SwiftCode ?? updatedReservation.swiftCode ?? '');

        // Parse installments from JSON fields if they exist
        const installmentScheduleJson = updatedReservation.InstallmentScheduleJson ?? updatedReservation.installmentScheduleJson;
        const maintenancePlanJson = updatedReservation.MaintenancePlanJson ?? updatedReservation.maintenancePlanJson;

        if (installmentScheduleJson) {
          const formattedInstallments = parseInstallmentsFromJson(installmentScheduleJson, false);
          if (formattedInstallments.length > 0) {
            setExcelInstallments(formattedInstallments);
            console.log(`Loaded ${formattedInstallments.length} installments from reservation JSON`);
          }
        }

        if (maintenancePlanJson) {
          const formattedMaintenance = parseInstallmentsFromJson(maintenancePlanJson, true);
          if (formattedMaintenance.length > 0) {
            setMaintenanceDepositInstallments(formattedMaintenance);
            console.log(`Loaded ${formattedMaintenance.length} maintenance installments from reservation JSON`);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing reservation data:', error);
    }
  }, [parseInstallmentsFromJson]);

  const handleDetailsClick = useCallback((row) => {
    console.log('Reservation data:', row);
    console.log('DownPaymentAmount:', row.DownPaymentAmount);
    console.log('DownPaymentChequeImagePath:', row.DownPaymentChequeImagePath);
    console.log('DownPaymentChequeImagePaths:', row.DownPaymentChequeImagePaths);
    setSelectedReservation(row);
    // Pre-populate downpayment amount if it exists
    if (row.DownPaymentAmount) {
      setDownPaymentAmount(row.DownPaymentAmount.toString());
    } else {
      setDownPaymentAmount("");
    }
    // Pre-populate reservation fee if it exists
    if (row.ReservationFee) {
      setReservationFee(row.ReservationFee.toString());
    } else {
      setReservationFee("");
    }
    const discountPct = row.DiscountOnCashPercentage ?? row.discountOnCashPercentage ?? row.Discount ?? row.discount;
    if (discountPct !== undefined && discountPct !== null && discountPct !== '') {
      setDiscountOnCashPercentage(String(discountPct));
    } else {
      setDiscountOnCashPercentage("");
    }
    setBankAccount(row.BankAccount ?? row.bankAccount ?? '');
    setBankName(row.BankName ?? row.bankName ?? '');
    setBankBranch(row.BankBranch ?? row.bankBranch ?? '');
    setSwiftCode(row.SwiftCode ?? row.swiftCode ?? '');
    setDetailsOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (row) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete reservation ID: ${row.Id}?\n\n` +
      `Unit: ${row.UnitNumber}\n` +
      `Client: ${row.ClientName}\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await DELETE_RESERVATION(row.Id);
      alert('Reservation deleted successfully!');
      // Refresh the table data
      refreshTable();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Failed to delete reservation. Please try again.');
    }
  }, [refreshTable]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedReservation(null);
    // Reset downpayment form
    setDownPaymentAmount(0);
    setReservationFee(0);
    setDiscountOnCashPercentage("");
    setBankAccount("");
    setBankName("");
    setBankBranch("");
    setSwiftCode("");
    setChequeFiles([]);
    setChequeFilePreviews([]);
    // Reset documents form
    setSubmittedDocuments([]);
    setDocumentPreviews([]);
    // Reset update documents form
    setUpdateDocuments([]);
    setUpdateDocumentPreviews([]);
  }, []);

  const handleAddReservationClients = useCallback(async (reservationId, clientIds) => {
    if (!clientIds?.length) return;
    try {
      setIsManagingClients(true);
      await ADD_RESERVATION_CLIENTS(reservationId, clientIds);
      alert('Clients added successfully.');
      await refreshSelectedReservation(reservationId);
      refreshTable();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Failed to add clients.');
    } finally {
      setIsManagingClients(false);
    }
  }, [refreshSelectedReservation, refreshTable]);

  const handleRemoveReservationClient = useCallback(async (reservationId, clientId) => {
    try {
      setIsManagingClients(true);
      await REMOVE_RESERVATION_CLIENT(reservationId, clientId);
      alert('Client removed.');
      await refreshSelectedReservation(reservationId);
      refreshTable();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove client.';
      alert(msg.includes('only client') ? 'Cannot remove the only client.' : msg);
    } finally {
      setIsManagingClients(false);
    }
  }, [refreshSelectedReservation, refreshTable]);

  const handleUpdateReservationClient = useCallback(async (reservationClientId, payload) => {
    try {
      setIsManagingClients(true);
      await UPDATE_RESERVATION_CLIENT(reservationClientId, payload);
      alert('Client updated.');
      if (selectedReservation?.Id) {
        await refreshSelectedReservation(selectedReservation.Id);
      }
      refreshTable();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Failed to update client.');
    } finally {
      setIsManagingClients(false);
    }
  }, [selectedReservation?.Id, refreshSelectedReservation, refreshTable]);

  const handleUpdateBrokerDeveloper = useCallback(async (reservationId, payload) => {
    await UPDATE_BROKER_DEVELOPER(reservationId, payload);
    if (selectedReservation?.Id) {
      await refreshSelectedReservation(selectedReservation.Id);
    }
    refreshTable();
  }, [selectedReservation?.Id, refreshSelectedReservation, refreshTable]);


  const handleCloseStatusChange = useCallback(() => {
    setStatusChangeOpen(false);
    setStatusChangeReservation(null);
    setNewStatus(0);
    setCancellationReason("");
    setIsSubmitting(false);
  }, []);

  const handleStatusSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      console.log('Updating reservation status:', {
        id: statusChangeReservation.Id,
        oldStatus: statusChangeReservation.Status,
        newStatus: newStatus
      });

      await UPDATE_RESERVATION_STATUS(statusChangeReservation.Id, newStatus, newStatus === 3 ? cancellationReason : null);

      alert(`Status updated successfully from ${getStatusText(statusChangeReservation.Status)} to ${getStatusText(newStatus)}`);
      
      handleCloseStatusChange();
      
      // Refresh the table data
      refreshTable();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
      setIsSubmitting(false);
    }
  }, [isSubmitting, statusChangeReservation, newStatus, cancellationReason, refreshTable, handleCloseStatusChange]);

  const handleScheduleClick = useCallback((reservation) => {
    setScheduleReservation(reservation);
    setScheduleOpen(true);
  }, []);

  const handleCloseSchedule = useCallback(() => {
    setScheduleOpen(false);
    setScheduleReservation(null);
  }, []);

  const handleApproveReservation = useCallback(async () => {
    if (isApproving || !selectedReservation) return;

    // Validate total ownership equals 100% before approving
    const clients = selectedReservation.ReservationClients ?? selectedReservation.reservationClients ?? [];
    if (clients.length > 0) {
      const total = clients.reduce((sum, c) => {
        const pct = c.ownershipPercentage ?? c.OwnershipPercentage;
        return sum + (pct != null ? Number(pct) : 0);
      }, 0);
      if (Math.abs(total - 100) > 0.01) {
        alert(`Cannot approve: total ownership across all clients must equal 100%. Current total is ${total.toFixed(2)}%.`);
        return;
      }
    }

    try {
      setIsApproving(true);
      await APPROVE_RESERVATION(selectedReservation.Id);
      alert('Reservation approved successfully!');
      // Refresh the table data and selected reservation
      refreshTable();
      await refreshSelectedReservation(selectedReservation.Id);
      setIsApproving(false);
    } catch (error) {
      console.error('Error approving reservation:', error);
      alert('Failed to approve reservation. Please try again.');
      setIsApproving(false);
    }
  }, [isApproving, selectedReservation, refreshTable, refreshSelectedReservation]);

  const handleChequeImageChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setChequeFiles(files);

    const previews = [];
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({
            file,
            preview: reader.result,
            type: 'image'
          });
          if (previews.length === files.filter((f) => f.type.startsWith('image/')).length) {
            setChequeFilePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({
          file,
          preview: null,
          type: file.type.includes('pdf') ? 'pdf' : 'document'
        });
        if (previews.length === files.length) {
          setChequeFilePreviews(previews);
        }
      }
    });

    if (previews.length === files.length) {
      setChequeFilePreviews(previews);
    }
  }, []);

  const handleRemoveChequeImage = useCallback((indexToRemove = null) => {
    if (indexToRemove === null) {
      setChequeFiles([]);
      setChequeFilePreviews([]);
    } else {
      setChequeFiles(prev => prev.filter((_, i) => i !== indexToRemove));
      setChequeFilePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    }

    const fileInput = document.getElementById('cheque-image-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleDownPaymentSubmit = useCallback(async () => {
    if (!selectedReservation) return;
    
    // Convert to numbers and handle NaN
    const downPaymentValue = parseFloat(downPaymentAmount) || 0;
    const reservationFeeValue = parseFloat(reservationFee) || 0;
    
    if (downPaymentValue <= 0 && reservationFeeValue <= 0) {
      alert('Please enter a valid downpayment amount or reservation fee.');
      return;
    }
    if (isUploadingDownPayment) return;

    const unitPrice = selectedReservation.UnitPrice ?? selectedReservation.unitPrice ?? 0;
    const pct = parseFloat(discountOnCashPercentage) || 0;
    const discountOnCashValue = unitPrice > 0 && pct >= 0 && pct <= 100
      ? unitPrice * (1 - pct / 100)
      : null;

    try {
      setIsUploadingDownPayment(true);
      await UPLOAD_DOWNPAYMENT(
        selectedReservation.Id,
        downPaymentValue,
        chequeFiles,
        reservationFeeValue,
        discountOnCashPercentage !== '' ? discountOnCashPercentage : null,
        discountOnCashValue,
        { BankAccount: bankAccount || undefined, BankName: bankName || undefined, BankBranch: bankBranch || undefined, SwiftCode: swiftCode || undefined }
      );
      alert('Downpayment information uploaded successfully!');
      // Clear file inputs
      setChequeFiles([]);
      setChequeFilePreviews([]);
      const fileInput = document.getElementById('cheque-image-input');
      if (fileInput) {
        fileInput.value = '';
      }
      // Refresh the table data and selected reservation (this will update the form fields with server data)
      refreshTable();
      await refreshSelectedReservation(selectedReservation.Id);
      setIsUploadingDownPayment(false);
    } catch (error) {
      console.error('Error uploading downpayment:', error);
      alert('Failed to upload downpayment information. Please try again.');
      setIsUploadingDownPayment(false);
    }
  }, [selectedReservation, downPaymentAmount, reservationFee, discountOnCashPercentage, bankAccount, bankName, bankBranch, swiftCode, chequeFiles, isUploadingDownPayment, refreshTable, refreshSelectedReservation]);

  const handleDocumentsChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setSubmittedDocuments(files);
    
    const previews = [];
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({
            file: file,
            preview: reader.result,
            type: 'image'
          });
          if (previews.length === files.filter(f => f.type.startsWith('image/')).length) {
            setDocumentPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({
          file: file,
          preview: null,
          type: file.type.includes('pdf') ? 'pdf' : 'document'
        });
        if (previews.length === files.length) {
          setDocumentPreviews(previews);
        }
      }
    });
    
    if (previews.length === files.length) {
      setDocumentPreviews(previews);
    }
  }, []);

  const handleRemoveDocument = useCallback((index) => {
    setSubmittedDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentPreviews(prev => prev.filter((_, i) => i !== index));
    
    const fileInput = document.getElementById('documents-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleSubmitDocumentsAndMarkSold = useCallback(async () => {
    if (!selectedReservation) return;
    
    if (submittedDocuments.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }

    if (isSubmittingDocuments) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit these documents and mark this unit as SOLD? This action cannot be undone.'
    );
    
    if (!confirmSubmit) return;

    try {
      setIsSubmittingDocuments(true);
      await SUBMIT_DOCUMENTS_AND_MARK_SOLD(
        selectedReservation.Id,
        submittedDocuments
      );
      alert('Documents submitted successfully and unit marked as SOLD!');
      setSubmittedDocuments([]);
      setDocumentPreviews([]);
      const fileInput = document.getElementById('documents-input');
      if (fileInput) {
        fileInput.value = '';
      }
      // Refresh the table data and selected reservation
      refreshTable();
      await refreshSelectedReservation(selectedReservation.Id);
      setIsSubmittingDocuments(false);
    } catch (error) {
      console.error('Error submitting documents:', error);
      alert('Failed to submit documents. Please try again.');
      setIsSubmittingDocuments(false);
    }
  }, [selectedReservation, submittedDocuments, isSubmittingDocuments, refreshTable, refreshSelectedReservation]);

  const handleUpdateDocumentsChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUpdateDocuments(files);
    
    const previews = [];
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({
            file: file,
            preview: reader.result,
            type: 'image'
          });
          if (previews.length === files.filter(f => f.type.startsWith('image/')).length) {
            setUpdateDocumentPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({
          file: file,
          preview: null,
          type: file.type.includes('pdf') ? 'pdf' : 'document'
        });
        if (previews.length === files.length) {
          setUpdateDocumentPreviews(previews);
        }
      }
    });
    
    if (previews.length === files.length) {
      setUpdateDocumentPreviews(previews);
    }
  }, []);

  const handleRemoveUpdateDocument = useCallback((index) => {
    setUpdateDocuments(prev => prev.filter((_, i) => i !== index));
    setUpdateDocumentPreviews(prev => prev.filter((_, i) => i !== index));
    
    const fileInput = document.getElementById('update-documents-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleUpdateDocuments = useCallback(async () => {
    if (!selectedReservation) return;
    
    if (updateDocuments.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }

    if (isUpdatingDocuments) return;

    const confirmUpdate = window.confirm(
      'Are you sure you want to replace the existing documents with these new ones? This action will replace all existing submitted documents.'
    );
    
    if (!confirmUpdate) return;

    try {
      setIsUpdatingDocuments(true);
      await UPDATE_SUBMITTED_DOCUMENTS(
        selectedReservation.Id,
        updateDocuments
      );
      alert('Documents updated successfully!');
      setUpdateDocuments([]);
      setUpdateDocumentPreviews([]);
      const fileInput = document.getElementById('update-documents-input');
      if (fileInput) {
        fileInput.value = '';
      }
      // Refresh the table data and selected reservation
      refreshTable();
      await refreshSelectedReservation(selectedReservation.Id);
      setIsUpdatingDocuments(false);
    } catch (error) {
      console.error('Error updating documents:', error);
      alert('Failed to update documents. Please try again.');
      setIsUpdatingDocuments(false);
    }
  }, [selectedReservation, updateDocuments, isUpdatingDocuments, refreshTable, refreshSelectedReservation]);

  const mainColumnAttributes = useMemo(() => {
    return [
      {
        caption: "Id",
        captionEn: "Id",
        field: "Id",
        required: false,
        disable: true,
        type: "number",
      },
      {
        caption: "Unit",
        captionEn: "Unit",
        field: "UnitNumber",
      },
      {
        caption: "Sales",
        captionEn: "Sales",
        field: "SalesName",
      },
      {
        caption: "Reservation Date",
        captionEn: "Reservation Date",
        field: "ReservationDate",
        required: true,
        type: "datetime",
      },
      {
        caption: "Status",
        captionEn: "Status", 
        field: "Status",
        required: true,
        type: "select",
        data: [
          { Id: 0, CategoryName: "Pending" },
          { Id: 1, CategoryName: "Confirmed" },
          { Id: 2, CategoryName: "Purchased" },
          { Id: 3, CategoryName: "Cancelled" }
        ],
        value: "Id",
        display: "CategoryName",
        disable: true,
      }
    ];
  }, []);

  // Display schedule exactly as stored in backend (no transformation)
  const scheduleData = useMemo(() => {
    if (!scheduleReservation?.InstallmentScheduleJson) {
      return [];
    }
    const raw = scheduleReservation.InstallmentScheduleJson;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          Id: item.id ?? item.Id ?? index + 1,
          Year: item.year ?? item.Year ?? null,
          Number: item.number ?? item.Number ?? null,
          DueDate: item.dueDate ?? item.DueDate ?? null,
          Amount: item.amount ?? item.Amount ?? null,
          Percentage: item.percentage ?? item.Percentage ?? null,
        }));
      }
    } catch (error) {
      console.error("Failed to parse InstallmentScheduleJson:", error);
    }
    return [];
  }, [scheduleReservation]);

  const maintenanceScheduleData = useMemo(() => {
    if (!scheduleReservation?.MaintenancePlanJson) {
      return [];
    }
    const raw = scheduleReservation.MaintenancePlanJson;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          Id: item.id ?? item.Id ?? index + 1,
          Number: item.number ?? item.Number ?? null,
          Installment: item.number ?? item.Number ?? item.installment ?? item.Installment ?? null,
          DueDate: item.dueDate ?? item.DueDate ?? null,
          Amount: item.amount ?? item.Amount ?? null,
          Percentage: item.percentage ?? item.Percentage ?? null,
        }));
      }
    } catch (error) {
      console.error("Failed to parse MaintenancePlanJson:", error);
    }
    return [];
  }, [scheduleReservation]);

  const profitScheduleData = useMemo(() => {
    if (!scheduleReservation?.ProfitJson) return [];
    try {
      const parsed = typeof scheduleReservation.ProfitJson === 'string'
        ? JSON.parse(scheduleReservation.ProfitJson)
        : scheduleReservation.ProfitJson;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [scheduleReservation]);

  const handleDownPaymentAmountChange = useCallback((e) => {
    const value = e.target.value;
    setDownPaymentAmount(value);
  }, []);

  const handleReservationFeeChange = useCallback((e) => {
    const value = e.target.value;
    setReservationFee(value);
  }, []);

  const handleDiscountOnCashPercentageChange = useCallback((e) => {
    setDiscountOnCashPercentage(e.target.value);
  }, []);

  // Helper function to parse Excel date (handles formula cells returning { result: number } or { result: Date })
  const parseExcelDate = (value) => {
    if (value === null || value === undefined) return null;

    // Excel formula cells return { formula: "...", result: number_or_date }
    if (typeof value === 'object') {
      if (value instanceof Date) return value;
      if (value.result !== undefined && value.result !== null) {
        return parseExcelDate(value.result);
      }
      return null;
    }
    
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof value === 'string') {
      const numFromStr = parseFloat(value.replace(/[^\d.-]/g, ''));
      if (!isNaN(numFromStr) && numFromStr > 1000 && numFromStr < 1000000) {
        return parseExcelDate(numFromStr);
      }
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  };

  // Helper function to add months to a date
  const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const handleExcelUpload = async (file) => {
    if (!file) {
      setExcelFile(null);
      setExcelInstallments([]);
      setExcelParsingError('');
      return;
    }

    setExcelFile(file);
    setExcelParsingError('');
    setExcelInstallments([]);

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      let worksheet = null;
      let worksheetIndex = 0;
      
      for (let wsIndex = 0; wsIndex < workbook.worksheets.length; wsIndex++) {
        const ws = workbook.worksheets[wsIndex];
        console.log(`Checking worksheet ${wsIndex + 1}: "${ws.name}", rows: ${ws.rowCount}`);
        if (ws.rowCount > 0) {
          worksheet = ws;
          worksheetIndex = wsIndex;
          break;
        }
      }
      
      if (!worksheet) {
        throw new Error('Excel file is empty or invalid');
      }

      console.log(`Using worksheet ${worksheetIndex + 1}: "${worksheet.name}", Total rows: ${worksheet.rowCount}, Total columns: ${worksheet.columnCount}`);
      
      const getCellText = (cell) => {
        if (!cell || cell.value === null || cell.value === undefined) return '';
        
        const value = cell.value;
        
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        
        if (typeof value === 'object' && value !== null && value.formula) {
          const formulaStr = value.formula || '';
          const fallbackMatch = formulaStr.match(/,"([^"]+)"/);
          if (fallbackMatch && fallbackMatch[1]) {
            return fallbackMatch[1].trim();
          }
          if (value.result !== undefined) {
            return String(value.result);
          }
        }
        
        if (typeof value === 'object' && value.richText) {
          return value.richText.map(rt => rt.text || '').join('');
        }
        
        return String(value).trim();
      };

      // Find the payment plan table by looking for header row
      let headerRowIndex = -1;
      let yearColIndex = -1;
      let installmentColIndex = -1;
      let amountColIndex = -1;
      let dueDateColIndex = -1;
      let percentageColIndex = -1;

      // Check row 11 directly as it's likely the header row
      console.log('Checking row 11 for header (Year | Installment | % | Due Date | Amount)...');
      const row11 = worksheet.getRow(11);
      if (row11) {
        let foundInstallment = false;
        let foundAmount = false;
        
        for (let j = 1; j <= row11.cellCount; j++) {
          const cell = row11.getCell(j);
          const cellText = getCellText(cell).toLowerCase().trim();
          const cellValue = cell?.value;
          
          let checkText = cellText;
          if (!checkText && cellValue) {
            checkText = String(cellValue).toLowerCase().trim();
          }
          
          if ((checkText === 'year' || checkText.includes('year')) && yearColIndex <= 0) {
            yearColIndex = j;
          }
          
          if ((checkText === 'installment' || 
               checkText.includes('installment') || 
               checkText === 'payment' ||
               checkText.includes('payment') ||
               checkText === 'quarter') && installmentColIndex <= 0) {
            installmentColIndex = j;
            foundInstallment = true;
          }
          
          if ((checkText === 'amount' || 
               checkText.includes('amount') ||
               checkText === 'value' ||
               checkText.includes('value')) && amountColIndex <= 0) {
            amountColIndex = j;
            foundAmount = true;
          }
          
          if ((checkText === 'due date' || 
               checkText.includes('due date') ||
               (checkText === 'date' && !checkText.includes('amount'))) && dueDateColIndex <= 0) {
            dueDateColIndex = j;
          }

          if ((checkText === '%' || 
               checkText === 'percent' || 
               checkText === 'percentage' ||
               checkText.includes('percent')) && percentageColIndex <= 0) {
            percentageColIndex = j;
          }
        }

        if (foundInstallment && foundAmount) {
          headerRowIndex = 11;
        } else {
          const row12 = worksheet.getRow(12);
          if (row12) {
            const col2Text = getCellText(row12.getCell(2)).toLowerCase().trim();
            const col5Value = row12.getCell(5)?.value;
            
            const hasInstallmentData = col2Text === 'q1' || col2Text === 'q2' || col2Text === 'q3' || 
                                     col2Text === 'q4' || col2Text.includes('down payment') || 
                                     col2Text.includes('downpayment');
            
            const hasAmountData = (typeof col5Value === 'number' && col5Value > 1000) ||
                                 (typeof col5Value === 'string' && parseFloat(col5Value.replace(/[^\d.-]/g, '')) > 1000);
            
            if (hasInstallmentData && hasAmountData) {
              yearColIndex = 1;
              installmentColIndex = 2;
              amountColIndex = 5;
              dueDateColIndex = 4;
              percentageColIndex = 3;
              headerRowIndex = 11;
              foundInstallment = true;
              foundAmount = true;
            }
          }
        }
      }

      // If row 11 doesn't have the header, search from row 11 onwards
      if (headerRowIndex === -1 || installmentColIndex <= 0 || amountColIndex <= 0) {
        console.log('Row 11 check failed, searching from row 11 onwards for header row...');
        for (let i = 11; i <= Math.min(50, worksheet.rowCount); i++) {
          const row = worksheet.getRow(i);
          if (!row) continue;

          let foundInstallment = false;
          let foundAmount = false;

          for (let j = 1; j <= row.cellCount; j++) {
            const cell = row.getCell(j);
            const cellText = getCellText(cell).toLowerCase().trim();
            
            if ((cellText === 'year' || cellText.includes('year')) && yearColIndex <= 0) {
              yearColIndex = j;
            }

            if ((cellText === 'installment' || 
                 cellText.includes('installment') || 
                 cellText === 'payment' ||
                 cellText.includes('payment') ||
                 cellText === 'quarter') && installmentColIndex <= 0) {
              installmentColIndex = j;
              foundInstallment = true;
            }
            
            if ((cellText === 'amount' || 
                 cellText.includes('amount') ||
                 cellText === 'value' ||
                 cellText.includes('value')) && amountColIndex <= 0) {
              amountColIndex = j;
              foundAmount = true;
            }
            
            if ((cellText === 'due date' || 
                 cellText.includes('due date') ||
                 cellText === 'date' ||
                 cellText.includes('date')) && dueDateColIndex <= 0) {
              dueDateColIndex = j;
            }

            if ((cellText === '%' || 
                 cellText === 'percent' || 
                 cellText === 'percentage' ||
                 cellText.includes('percent')) && percentageColIndex <= 0) {
              percentageColIndex = j;
            }
          }

          if (foundInstallment && foundAmount) {
            headerRowIndex = i;
            break;
          }
        }
      }
      
      // If header not found by text, try to find by data pattern
      if (headerRowIndex === -1 || installmentColIndex <= 0 || amountColIndex <= 0) {
        console.log('Header row not found by text, trying data pattern detection starting from row 12...');
        for (let i = 12; i <= Math.min(50, worksheet.rowCount); i++) {
          const row = worksheet.getRow(i);
          if (!row) continue;
          
          for (let j = 1; j <= row.cellCount; j++) {
            const cell = row.getCell(j);
            const cellText = getCellText(cell).toLowerCase().trim();
            
            const isQuarterlyInstallment = cellText === 'q1' || 
                                          cellText === 'q2' || 
                                          cellText === 'q3' || 
                                          cellText === 'q4' ||
                                          cellText.includes('down payment') ||
                                          cellText.includes('downpayment');
            
            if (isQuarterlyInstallment && installmentColIndex <= 0) {
              for (let k = j + 1; k <= Math.min(j + 10, row.cellCount); k++) {
                const testCell = row.getCell(k);
                const testValue = testCell?.value;
                
                if (testValue instanceof Date) {
                  if (dueDateColIndex <= 0) {
                    dueDateColIndex = k;
                  }
                  continue;
                }
                
                let isValidAmount = false;
                if (typeof testValue === 'number') {
                  if (testValue > 1000 && testValue < 100000000) {
                    isValidAmount = true;
                  }
                } else if (typeof testValue === 'string') {
                  const numValue = parseFloat(testValue.replace(/[^\d.-]/g, ''));
                  if (!isNaN(numValue) && numValue > 1000 && numValue < 100000000) {
                    isValidAmount = true;
                  }
                }
                
                if (isValidAmount) {
                  installmentColIndex = j;
                  amountColIndex = k;
                  headerRowIndex = i > 1 ? i - 1 : i;
                  break;
                }
              }
              
              if (installmentColIndex > 0 && amountColIndex > 0) break;
            }
          }
          
          if (installmentColIndex > 0 && amountColIndex > 0) break;
        }
      }
      
      // Final fallback: Check row 12 directly for data and infer columns
      if (headerRowIndex === -1 || installmentColIndex <= 0 || amountColIndex <= 0) {
        console.log('Trying final fallback: checking row 12 for data pattern...');
        const row12 = worksheet.getRow(12);
        if (row12) {
          for (let j = 1; j <= row12.cellCount; j++) {
            const cell = row12.getCell(j);
            const cellText = getCellText(cell).toLowerCase().trim();
            
            const isInstallment = cellText === 'q1' || 
                                 cellText === 'q2' || 
                                 cellText === 'q3' || 
                                 cellText === 'q4' ||
                                 cellText.includes('down payment') ||
                                 cellText.includes('downpayment');
            
            if (isInstallment && installmentColIndex <= 0) {
              installmentColIndex = j;
              let maxAmount = 0;
              let maxAmountCol = -1;
              
              for (let k = j + 1; k <= Math.min(j + 5, row12.cellCount); k++) {
                const testCell = row12.getCell(k);
                const testValue = testCell?.value;
                
                if (testValue instanceof Date) {
                  if (!dueDateColIndex) {
                    dueDateColIndex = k;
                  }
                  continue;
                }
                
                let amount = 0;
                if (typeof testValue === 'number') {
                  if (testValue > 1000 && testValue < 100000000) {
                    amount = testValue;
                  }
                } else if (typeof testValue === 'string') {
                  const numValue = parseFloat(testValue.replace(/[^\d.-]/g, ''));
                  if (!isNaN(numValue) && numValue > 1000 && numValue < 100000000) {
                    amount = numValue;
                  }
                }
                
                if (amount > maxAmount) {
                  maxAmount = amount;
                  maxAmountCol = k;
                }
              }
              
              if (maxAmountCol > 0) {
                amountColIndex = maxAmountCol;
                headerRowIndex = 11;
                break;
              }
            }
          }
        }
      }
      
      if (headerRowIndex === -1 || installmentColIndex <= 0 || amountColIndex <= 0) {
        throw new Error('Could not find installments table in Excel file. Please ensure the file has columns for Installment and Amount starting from row 11 or 12.');
      }

      console.log(`Found table: Header at row ${headerRowIndex}, Year column: ${yearColIndex > 0 ? yearColIndex : 'N/A'}, Installment column: ${installmentColIndex}, Amount column: ${amountColIndex}, Due Date column: ${dueDateColIndex > 0 ? dueDateColIndex : 'N/A'}, Percentage column: ${percentageColIndex > 0 ? percentageColIndex : 'N/A'}`);

      // Read installments starting from headerRowIndex + 1
      const installments = [];
      const maintenanceDeposit = [];
      const profitData = [];
      let currentId = 1;
      let foundMaintenanceSection = false;
      let foundProfitSection = false;
      let profitColsExcel = null;
      let processedRows = 0;
      let skippedRows = 0;

      console.log(`Starting to read data from row ${headerRowIndex + 1} to ${worksheet.rowCount}`);

      for (let i = headerRowIndex + 1; i <= Math.min(headerRowIndex + 100, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        if (!row) {
          skippedRows++;
          continue;
        }

        const yearCell = yearColIndex > 0 ? row.getCell(yearColIndex) : null;
        const installmentCell = row.getCell(installmentColIndex);
        const amountCell = row.getCell(amountColIndex);
        const dueDateCell = dueDateColIndex > 0 ? row.getCell(dueDateColIndex) : null;
        const percentageCell = percentageColIndex > 0 ? row.getCell(percentageColIndex) : null;

        const yearText = yearCell ? getCellText(yearCell).trim() : null;
        const installmentTextRaw = getCellText(installmentCell).trim();
        const installmentText = installmentTextRaw.toLowerCase();
        const amountValue = amountCell?.value;
        const dueDateValue = dueDateCell?.value;

        // Debug first few rows
        if (i <= headerRowIndex + 10) {
          console.log(`Row ${i}: installmentText="${installmentTextRaw}" (lowercase: "${installmentText}"), amountValue=${amountValue}, amountType=${typeof amountValue}, amountCell.text=${getCellText(amountCell)}, dueDateValue=${dueDateValue}`);
        }

        // Check for profit table header (any cell containing "operation year")
        if (!foundProfitSection) {
          for (let j = 1; j <= Math.max(row.cellCount, 15); j++) {
            if (getCellText(row.getCell(j)).toLowerCase().includes('operation year')) {
              foundProfitSection = true;
              profitColsExcel = [];
              for (let k = 1; k <= Math.max(row.cellCount, 15); k++) {
                profitColsExcel.push(getCellText(row.getCell(k)).trim());
              }
              break;
            }
          }
          if (foundProfitSection) continue;
        }

        // Collect profit section rows
        if (foundProfitSection && profitColsExcel) {
          const rowObj = {};
          let hasAnyValue = false;
          for (let k = 0; k < profitColsExcel.length; k++) {
            const headerName = profitColsExcel[k];
            if (!headerName) continue;
            const cellVal = getCellText(row.getCell(k + 1)).trim();
            rowObj[headerName] = cellVal;
            if (cellVal) hasAnyValue = true;
          }
          if (hasAnyValue) { profitData.push(rowObj); processedRows++; }
          continue;
        }

        // Check if we've reached the maintenance deposit section
        if (installmentText.includes('maintenance') || installmentText.includes('deposit')) {
          foundMaintenanceSection = true;
          continue;
        }

        // Parse amount - try multiple methods
        let rawAmount = 0;
        
        // First, try direct numeric value
        if (typeof amountValue === 'number') {
          rawAmount = amountValue;
        } 
        // Try formula result
        else if (amountValue && typeof amountValue === 'object' && amountValue.result !== undefined) {
          if (typeof amountValue.result === 'number') {
            rawAmount = amountValue.result;
          } else if (typeof amountValue.result === 'string') {
            const cleaned = amountValue.result.replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) {
              rawAmount = parsed;
            }
          }
        }
        // Try text representation
        else if (amountValue !== null && amountValue !== undefined) {
          // Try to extract number from formatted text
          const amountText = getCellText(amountCell);
          if (amountText) {
            // Remove currency symbols, commas, spaces, etc.
            const cleaned = amountText.replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && parsed !== 0) {
              rawAmount = parsed;
            }
          }
          // Also try direct value if it's a string
          if (rawAmount === 0 && typeof amountValue === 'string') {
            const cleaned = amountValue.replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && parsed !== 0) {
              rawAmount = parsed;
            }
          }
        }

        // Skip if both installment text and amount are empty/zero
        if (!installmentText && rawAmount === 0) {
          skippedRows++;
          continue;
        }

        // If we have installment text (like Q1, Q2, Down Payment, etc.), process it even with small amounts
        const hasValidInstallmentName = installmentText && (
          installmentText.includes('q1') || 
          installmentText.includes('q2') || 
          installmentText.includes('q3') || 
          installmentText.includes('q4') ||
          installmentText.includes('down payment') ||
          installmentText.includes('downpayment') ||
          installmentText.includes('installment') ||
          /^\d+$/.test(installmentText) // Just a number
        );

        // Skip if amount is too small (likely a percentage or invalid) - but allow if we have valid installment text
        if (rawAmount > 0 && rawAmount < 10 && !hasValidInstallmentName && !installmentText) {
          skippedRows++;
          continue;
        }

        // Parse due date (try raw value first, then text for formula cells without computed result)
        let rawDate = null;
        if (dueDateValue) {
          rawDate = parseExcelDate(dueDateValue);
          if (!rawDate && dueDateCell) {
            const dateText = getCellText(dueDateCell);
            if (dateText) {
              const numFromText = parseFloat(dateText.replace(/[^\d.-]/g, ''));
              if (!isNaN(numFromText) && numFromText > 1000) {
                rawDate = parseExcelDate(numFromText);
              } else {
                rawDate = parseExcelDate(dateText);
              }
            }
          }
        }

        // Percentage: display exactly as in Excel (string, no modification)
        const percentageDisplay = percentageCell ? getCellText(percentageCell).trim() : '';
        const percentageStr = percentageDisplay || null;
        const rawPercentage = percentageStr != null ? parsePercentageForApi(percentageStr) : null;

        // If no date found and we have firstPaymentDate, calculate based on installment number
        if (!rawDate && firstPaymentDate) {
          try {
            const baseDate = new Date(firstPaymentDate);
            const installmentNumber = currentId;
            // Assume quarterly installments (every 3 months)
            rawDate = addMonths(baseDate, (installmentNumber - 1) * 3);
          } catch (error) {
            console.error('Error calculating date from firstPaymentDate:', error);
          }
        }

        // Determine installment name - use original case for display
        let installmentName = installmentTextRaw || installmentText;
        if (!installmentName && rawAmount > 0) {
          // Create default name based on position
          if (installments.length === 0 && !foundMaintenanceSection) {
            installmentName = 'Down Payment';
          } else if (foundMaintenanceSection) {
            installmentName = `Maintenance ${maintenanceDeposit.length + 1}`;
          } else {
            installmentName = `Q${((installments.length) % 4) + 1}`;
          }
        }

        // Only create installment if we have a valid amount or name
        if (rawAmount > 0 || installmentName) {
          const amountDisplay = amountCell ? getCellText(amountCell).trim() : '';
          const dueDateDisplay = dueDateCell ? getCellText(dueDateCell).trim() : '';
          const installmentData = {
            id: currentId++,
            year: yearText || null,
            number: installmentName || `Installment ${currentId - 1}`,
            amount: amountDisplay || null,
            dueDate: dueDateDisplay || null,
            percentage: percentageStr,
            rawAmount: rawAmount,
            rawDate: rawDate,
            rawPercentage: rawPercentage
          };

          if (foundMaintenanceSection) {
            maintenanceDeposit.push(installmentData);
          } else {
            installments.push(installmentData);
          }
          processedRows++;
        } else {
          skippedRows++;
        }
      }

      console.log(`Parsed ${installments.length} installments and ${maintenanceDeposit.length} maintenance deposit installments`);
      console.log(`Processed ${processedRows} rows, skipped ${skippedRows} rows`);

      console.log(`Parsed ${profitData.length} profit rows`);

      setExcelInstallments(installments);
      setMaintenanceDepositInstallments(maintenanceDeposit);
      setProfitRows(profitData);
      setExcelParsingError('');
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setExcelParsingError(error.message || 'Invalid file format');
      setExcelInstallments([]);
      setMaintenanceDepositInstallments([]);
      setProfitRows([]);
      setSnackbar({
        open: true,
        message: `Error parsing Excel file: ${error.message || 'Invalid file format'}`,
        severity: 'error'
      });
    }
  };

  const handleExcelFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleExcelUpload(file);
    }
  };

  // Get Google Sheet CSV export URL from the edit URL (same structure as Excel: Year, Installment, %, Due Date, Amount)
  const getGoogleSheetExportUrl = (editUrl) => {
    if (!editUrl || typeof editUrl !== 'string') return null;
    const trimmed = editUrl.trim();
    const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!idMatch) return null;
    const sheetId = idMatch[1];
    const gidMatch = trimmed.match(/(?:[?&]|#)gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  };

  // Simple CSV parse (handles quoted fields)
  const parseCSV = (text) => {
    const rows = [];
    let current = [];
    let inQuotes = false;
    let field = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        field += c;
      } else if (c === ',' || c === '\t') {
        current.push(field.trim());
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        current.push(field.trim());
        field = '';
        if (current.some(cell => cell !== '')) rows.push(current);
        current = [];
      } else {
        field += c;
      }
    }
    if (field !== '' || current.length > 0) {
      current.push(field.trim());
      if (current.some(cell => cell !== '')) rows.push(current);
    }
    return rows;
  };

  const handleLoadFromGoogleSheet = useCallback(async () => {
    const url = (googleSheetUrl || '').trim();
    if (!url) {
      setSnackbar({ open: true, message: 'Please enter a Google Sheet URL.', severity: 'warning' });
      return;
    }
    const exportUrl = getGoogleSheetExportUrl(url);
    if (!exportUrl) {
      setExcelParsingError('Invalid Google Sheet URL. Use a link like: https://docs.google.com/spreadsheets/d/.../edit?gid=...');
      setSnackbar({ open: true, message: 'Invalid Google Sheet URL.', severity: 'error' });
      return;
    }
    setIsLoadingGoogleSheet(true);
    setExcelParsingError('');
    setExcelInstallments([]);
    setMaintenanceDepositInstallments([]);
    setProfitRows([]);
    setExcelFile(null);

    let csvText = null;
    try {
      try {
        const response = await FETCH_GOOGLE_SHEET_CSV(url);
        csvText = typeof response === 'string' ? response : (response?.csv ?? response?.data ?? null);
      } catch (apiErr) {
        const corsProxy = process.env.REACT_APP_GOOGLE_SHEET_CORS_PROXY;
        if (corsProxy) {
          const res = await fetch(corsProxy + encodeURIComponent(exportUrl));
          if (!res.ok) throw new Error('Failed to fetch sheet');
          csvText = await res.text();
        } else {
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Error fetching Google Sheet:', err);
      const msg = err?.message || (err?.error || 'Could not load Google Sheet. Ensure the sheet is shared (Anyone with link can view) or add a backend proxy for reservation/fetch-google-sheet, or set REACT_APP_GOOGLE_SHEET_CORS_PROXY.');
      setExcelParsingError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
      setIsLoadingGoogleSheet(false);
      return;
    }

    try {
      const rows = parseCSV(csvText);
      if (!rows.length) {
        setExcelParsingError('Sheet is empty or could not parse CSV.');
        setIsLoadingGoogleSheet(false);
        return;
      }
      const toLower = (s) => (s || '').toLowerCase().trim();
      let headerRowIndex = -1;
      let yearCol = -1, installmentCol = -1, pctCol = -1, dueDateCol = -1, amountCol = -1;
      for (let r = 0; r < Math.min(20, rows.length); r++) {
        const row = rows[r];
        for (let c = 0; c < row.length; c++) {
          const cell = toLower(row[c]);
          if (cell === 'year' || cell.includes('year')) yearCol = c;
          if (cell === 'installment' || cell.includes('installment') || cell.includes('payment')) installmentCol = c;
          if (cell === '%' || cell === 'percent' || cell.includes('percent')) pctCol = c;
          if (cell === 'due date' || cell.includes('due date') || (cell === 'date' && !cell.includes('amount'))) dueDateCol = c;
          if (cell === 'amount' || cell.includes('amount')) amountCol = c;
        }
        if (installmentCol >= 0 && amountCol >= 0) {
          headerRowIndex = r;
          if (yearCol < 0) yearCol = 0;
          if (dueDateCol < 0) dueDateCol = 3;
          if (pctCol < 0) pctCol = 2;
          break;
        }
      }
      if (headerRowIndex === -1 || installmentCol < 0 || amountCol < 0) {
        setExcelParsingError('Could not find table headers (Year, Installment, %, Due Date, Amount) in the sheet.');
        setIsLoadingGoogleSheet(false);
        return;
      }

      const installments = [];
      const maintenanceDeposit = [];
      const profitDataSheet = [];
      let currentId = 1;
      let maintenanceId = 1;
      let foundMaintenance = false;
      let foundProfitSheet = false;
      let profitHeaderColsSheet = null;
      const parseNum = (v) => {
        if (v == null || v === '') return 0;
        let s = String(v).trim();
        if (!s) return 0;
        // European format: 189.751,70 or 1.138.510,19 (dot=thousands, comma=decimal)
        if (/,\d{1,3}$/.test(s)) {
          s = s.replace(/\./g, '').replace(',', '.');
        } else {
          s = s.replace(/,/g, '');
        }
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      };
      // Parse date: support DD/MM/YYYY, DD-MM-YYYY, and ISO
      const parseDate = (v) => {
        if (!v || typeof v !== 'string') return null;
        const s = String(v).trim();
        if (!s) return null;
        const ddmmyyyy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (ddmmyyyy) {
          const day = parseInt(ddmmyyyy[1], 10);
          const month = parseInt(ddmmyyyy[2], 10) - 1;
          const year = parseInt(ddmmyyyy[3], 10);
          const d = new Date(year, month, day);
          return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };

      let maintenanceCols = null;

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r];
        const firstCell = toLower((row[0] || '').trim());
        let yearVal, installmentVal, amountVal, pctVal, dueVal, rawAmount, rawDate, instLower;

        // Check for profit table header (any cell containing "operation year")
        if (!foundProfitSheet) {
          for (let c = 0; c < row.length; c++) {
            if (toLower(row[c]).includes('operation year')) {
              foundProfitSheet = true;
              profitHeaderColsSheet = row.map(h => (h || '').trim());
              break;
            }
          }
          if (foundProfitSheet) continue;
        }

        // Collect profit section rows
        if (foundProfitSheet && profitHeaderColsSheet) {
          const rowObj = {};
          let hasAnyValue = false;
          for (let c = 0; c < profitHeaderColsSheet.length; c++) {
            const headerName = profitHeaderColsSheet[c];
            if (!headerName) continue;
            const cellVal = (row[c] || '').trim();
            rowObj[headerName] = cellVal;
            if (cellVal) hasAnyValue = true;
          }
          if (hasAnyValue) profitDataSheet.push(rowObj);
          continue;
        }

        if (foundMaintenance && maintenanceCols !== null) {
          installmentVal = (row[maintenanceCols.inst] || '').trim();
          pctVal = row[maintenanceCols.pct];
          dueVal = row[maintenanceCols.due];
          amountVal = row[maintenanceCols.amount];
          yearVal = '';
        } else {
          yearVal = yearCol >= 0 ? (row[yearCol] || '').trim() : '';
          installmentVal = (row[installmentCol] || '').trim();
          amountVal = row[amountCol];
          pctVal = pctCol >= 0 ? row[pctCol] : '';
          dueVal = dueDateCol >= 0 ? row[dueDateCol] : '';
        }

        rawAmount = parseNum(amountVal);
        const dueValStr = (dueVal != null && String(dueVal).trim() !== '') ? String(dueVal).trim() : null;
        const amountStrSheet = (amountVal != null && String(amountVal).trim() !== '') ? String(amountVal).trim() : null;
        rawDate = parseDate(dueVal);
        instLower = (installmentVal || '').toLowerCase();
        const percentageStrSheet = (pctVal != null && String(pctVal).trim() !== '') ? String(pctVal).trim() : null;
        const yearLower = (yearVal || '').toLowerCase();

        if (yearLower.includes('maintenance') || yearLower.includes('deposit') || instLower.includes('maintenance') || instLower.includes('deposit')) {
          foundMaintenance = true;
          continue;
        }
        if (instLower === 'total' || (!installmentVal && rawAmount === 0)) continue;
        if (foundMaintenance && maintenanceCols === null) {
          const secondCell = toLower((row[1] || '').trim());
          if (firstCell === 'installment' || firstCell === '%') {
            maintenanceCols = { inst: 0, pct: 1, due: 2, amount: 3 };
            continue;
          }
          if (secondCell === 'installment' && (row[0] === '' || row[0] == null)) {
            maintenanceCols = { inst: 1, pct: 2, due: 3, amount: 4 };
            continue;
          }
        }
        if (foundMaintenance && (instLower === 'installment' || firstCell === 'installment')) continue;

        const hasValidName = /q1|q2|q3|q4|down payment|downpayment|first|second|third|fourth|fifth|sixth|\d+/.test(instLower) || installmentVal;
        if (!hasValidName && rawAmount === 0) continue;

        if (foundMaintenance) {
          maintenanceDeposit.push({
            id: maintenanceId++,
            year: null,
            number: installmentVal || `Maintenance ${maintenanceId - 1}`,
            amount: amountStrSheet,
            dueDate: dueValStr,
            percentage: percentageStrSheet,
            rawAmount,
            rawDate,
            rawPercentage: parsePercentageForApi(percentageStrSheet)
          });
        } else {
          installments.push({
            id: currentId++,
            year: (yearVal || '').trim() || null,
            number: installmentVal || `Installment ${currentId - 1}`,
            amount: amountStrSheet,
            dueDate: dueValStr,
            percentage: percentageStrSheet,
            rawAmount,
            rawDate,
            rawPercentage: parsePercentageForApi(percentageStrSheet)
          });
        }
      }

      setProfitRows(profitDataSheet);

      setExcelInstallments(installments);
      setMaintenanceDepositInstallments(maintenanceDeposit);
      setSnackbar({ open: true, message: `Loaded ${installments.length} installments, ${maintenanceDeposit.length} maintenance rows${profitDataSheet.length > 0 ? `, and ${profitDataSheet.length} profit rows` : ''} from Google Sheet.`, severity: 'success' });
    } catch (parseErr) {
      console.error('Error parsing Google Sheet CSV:', parseErr);
      setExcelParsingError(parseErr?.message || 'Failed to parse sheet data.');
      setSnackbar({ open: true, message: parseErr?.message || 'Failed to parse sheet data.', severity: 'error' });
    }
    setIsLoadingGoogleSheet(false);
  }, [googleSheetUrl]);

  const handleGoogleSheetUrlChange = useCallback((e) => {
    setGoogleSheetUrl(e.target.value || '');
  }, []);

  const handleSubmitExcelData = useCallback(async () => {
    if (!selectedReservation) return;
    
    if (excelInstallments.length === 0) {
      alert('Please upload an Excel file with installments data first.');
      return;
    }

    if (isUploadingExcel) return;

    try {
      setIsUploadingExcel(true);

      // Send to API exactly as in Excel/Sheet: all string format, no conversion
      const installmentSchedule = excelInstallments.map(item => ({
        id: item.id,
        year: item.year != null ? String(item.year) : undefined,
        number: item.number != null ? String(item.number) : undefined,
        dueDate: item.dueDate != null ? String(item.dueDate) : undefined,
        amount: item.amount != null ? String(item.amount) : undefined,
        ...(item.percentage != null && item.percentage !== '' && { percentage: String(item.percentage) })
      }));

      const maintenancePlan = maintenanceDepositInstallments.length > 0
        ? maintenanceDepositInstallments.map(item => ({
            id: item.id,
            year: item.year != null ? String(item.year) : undefined,
            number: item.number != null ? String(item.number) : undefined,
            dueDate: item.dueDate != null ? String(item.dueDate) : undefined,
            amount: item.amount != null ? String(item.amount) : undefined,
            ...(item.percentage != null && item.percentage !== '' && { percentage: String(item.percentage) })
          }))
        : null;

      const profitJson = profitRows.length > 0
        ? profitRows.map(row => {
            const strRow = {};
            Object.keys(row).forEach(k => { strRow[k] = String(row[k]); });
            return strRow;
          })
        : null;

      await UPDATE_RESERVATION_JSON_FIELDS(
        selectedReservation.Id,
        installmentSchedule,
        maintenancePlan,
        profitJson
      );

      alert('Installments plan and maintenance plan updated successfully!');

      setExcelFile(null);
      setExcelInstallments([]);
      setMaintenanceDepositInstallments([]);
      setProfitRows([]);
      setExcelParsingError('');
      setFirstPaymentDate('');
      
      const fileInput = document.getElementById('excel-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      setExcelUploadOpen(false);
      
      // Refresh the table data and selected reservation
      refreshTable();
      await refreshSelectedReservation(selectedReservation.Id);
      setIsUploadingExcel(false);
    } catch (error) {
      console.error('Error updating installments:', error);
      alert('Failed to update installments plan. Please try again.');
      setIsUploadingExcel(false);
    }
  }, [selectedReservation, excelInstallments, maintenanceDepositInstallments, profitRows, isUploadingExcel, refreshTable, refreshSelectedReservation]);

  const handleCloseExcelUpload = useCallback(() => {
    setExcelUploadOpen(false);
    setExcelFile(null);
    setExcelInstallments([]);
    setMaintenanceDepositInstallments([]);
    setProfitRows([]);
    setExcelParsingError('');
    setFirstPaymentDate('');
    setGoogleSheetUrl('');
    
    const fileInput = document.getElementById('excel-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleExcelUploadClick = useCallback((reservation) => {
    setExcelUploadOpen(true);
    if (reservation.FirstPaymentDate) {
      const date = new Date(reservation.FirstPaymentDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFirstPaymentDate(`${year}-${month}-${day}`);
    }
    
    // Load installments from reservation JSON if they exist and aren't already loaded
    if (excelInstallments.length === 0) {
      const installmentScheduleJson = reservation.InstallmentScheduleJson ?? reservation.installmentScheduleJson;
      const maintenancePlanJson = reservation.MaintenancePlanJson ?? reservation.maintenancePlanJson;

      if (installmentScheduleJson) {
        const formattedInstallments = parseInstallmentsFromJson(installmentScheduleJson, false);
        if (formattedInstallments.length > 0) {
          setExcelInstallments(formattedInstallments);
        }
      }

      if (maintenancePlanJson) {
        const formattedMaintenance = parseInstallmentsFromJson(maintenancePlanJson, true);
        if (formattedMaintenance.length > 0) {
          setMaintenanceDepositInstallments(formattedMaintenance);
        }
      }
    }
  }, [excelInstallments.length, parseInstallmentsFromJson]);

  const columnAttributesWithDetails = useMemo(() => [
    ...mainColumnAttributes,
    {
      caption: "Details",
      captionEn: "Details",
      field: "details",
      type: "buttons",
      widthRatio: 100,
      func: handleDetailsClick,
      text: "View Details",
      icon: "info"
    },
    {
      caption: "Delete",
      captionEn: "Delete",
      field: "delete",
      type: "buttons",
      widthRatio: 100,
      func: handleDeleteClick,
      text: "Delete",
      icon: "trash"
    },
  ], [mainColumnAttributes, handleDetailsClick, handleDeleteClick]);

  // Memoize apiPayload to prevent unnecessary table refreshes on every render
  const memoizedApiPayload = useMemo(() => ({
    refreshKey: tableRefreshKey
  }), [tableRefreshKey]);

  return (
    <PageLayout>
      <CrudMUI
        id={"Id"}
        colAttributes={columnAttributesWithDetails}
        view={true}
        GET={GET_RESERVATIONS}
        apiKey={"Id"}
        apiPayload={memoizedApiPayload}
      />
      
      <ReservationDetailsDialog
        open={detailsOpen}
        reservation={selectedReservation}
        isFinanceUser={isFinanceUser}
        isApproving={isApproving}
        onApprove={handleApproveReservation}
        submittedDocuments={submittedDocuments}
        documentPreviews={documentPreviews}
        isSubmittingDocuments={isSubmittingDocuments}
        onDocumentsChange={handleDocumentsChange}
        onRemoveDocument={handleRemoveDocument}
        onSubmitDocumentsAndMarkSold={handleSubmitDocumentsAndMarkSold}
        updateDocuments={updateDocuments}
        updateDocumentPreviews={updateDocumentPreviews}
        isUpdatingDocuments={isUpdatingDocuments}
        onUpdateDocumentsChange={handleUpdateDocumentsChange}
        onRemoveUpdateDocument={handleRemoveUpdateDocument}
        onUpdateDocuments={handleUpdateDocuments}
        downPaymentAmount={downPaymentAmount}
        reservationFee={reservationFee}
        discountOnCashPercentage={discountOnCashPercentage}
        bankAccount={bankAccount}
        bankName={bankName}
        bankBranch={bankBranch}
        swiftCode={swiftCode}
        onBankAccountChange={(e) => setBankAccount(e.target.value)}
        onBankNameChange={(e) => setBankName(e.target.value)}
        onBankBranchChange={(e) => setBankBranch(e.target.value)}
        onSwiftCodeChange={(e) => setSwiftCode(e.target.value)}
        chequeFiles={chequeFiles}
        chequeFilePreviews={chequeFilePreviews}
        isUploadingDownPayment={isUploadingDownPayment}
        onDownPaymentAmountChange={handleDownPaymentAmountChange}
        onReservationFeeChange={handleReservationFeeChange}
        onDiscountOnCashPercentageChange={handleDiscountOnCashPercentageChange}
        onChequeImageChange={handleChequeImageChange}
        onRemoveChequeImage={handleRemoveChequeImage}
        onDownPaymentSubmit={handleDownPaymentSubmit}
        onScheduleClick={handleScheduleClick}
        onExcelUploadClick={handleExcelUploadClick}
        onClose={handleCloseDetails}
        clientsList={availableClients}
        onAddClients={handleAddReservationClients}
        onRemoveClient={handleRemoveReservationClient}
        onUpdateReservationClient={handleUpdateReservationClient}
        isManagingClients={isManagingClients}
        onUpdateBrokerDeveloper={handleUpdateBrokerDeveloper}
      />
      
      {/* <StatusChangeDialog
        open={statusChangeOpen}
        reservation={statusChangeReservation}
        newStatus={newStatus}
        cancellationReason={cancellationReason}
        isSubmitting={isSubmitting}
        onClose={handleCloseStatusChange}
        onStatusChange={(e) => setNewStatus(e.target.value)}
        onCancellationReasonChange={(e) => setCancellationReason(e.target.value)}
        onSubmit={handleStatusSubmit}
      />
       */}
      <ScheduleDialog
        open={scheduleOpen}
        reservation={scheduleReservation}
        scheduleData={scheduleData}
        maintenanceData={maintenanceScheduleData}
        profitData={profitScheduleData}
        onClose={handleCloseSchedule}
      />
      
      <ExcelUploadDialog
        open={excelUploadOpen}
        reservation={selectedReservation}
        excelFile={excelFile}
        excelInstallments={excelInstallments}
        maintenanceDepositInstallments={maintenanceDepositInstallments}
        profitRows={profitRows}
        excelParsingError={excelParsingError}
        isUploading={isUploadingExcel}
        snackbar={snackbar}
        googleSheetUrl={googleSheetUrl}
        onGoogleSheetUrlChange={handleGoogleSheetUrlChange}
        onLoadFromGoogleSheet={handleLoadFromGoogleSheet}
        isLoadingGoogleSheet={isLoadingGoogleSheet}
        onClose={handleCloseExcelUpload}
        onFileChange={handleExcelFileChange}
        onSubmit={handleSubmitExcelData}
        onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </PageLayout>
  );
};

export default Reservations;
