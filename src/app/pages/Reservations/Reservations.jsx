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

      for (let wsIndex = 0; wsIndex < workbook.worksheets.length; wsIndex++) {
        const ws = workbook.worksheets[wsIndex];
        if (ws.rowCount > 0) {
          worksheet = ws;
          break;
        }
      }

      if (!worksheet) {
        throw new Error('Excel file is empty or invalid');
      }

      // Format a JS Date as D/M/YYYY
      const formatDateDisplay = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      };

      // Get cell text - handles ExcelJS-specific cell types (formulas, richText, dates, errors)
      const getCellText = (cell) => {
        if (!cell || cell.value === null || cell.value === undefined) return '';
        const value = cell.value;

        // Direct Date object
        if (value instanceof Date) return formatDateDisplay(value);

        // Formula cell: { formula: "...", result: <value> }
        if (typeof value === 'object' && value !== null && value.formula !== undefined) {
          const result = value.result;
          if (result === null || result === undefined) return '';
          if (result instanceof Date) return formatDateDisplay(result);
          if (typeof result === 'object') {
            // Excel error object e.g. { error: '#REF!' } or unknown object
            if (result.error) return '';
            if (result.richText) return result.richText.map(rt => rt.text || '').join('');
            if (result.text) return String(result.text).trim();
            return '';
          }
          return String(result).trim();
        }

        // RichText cell
        if (typeof value === 'object' && value !== null && value.richText) {
          return value.richText.map(rt => rt.text || '').join('');
        }

        // Hyperlink or other object with .text
        if (typeof value === 'object' && value !== null) {
          if (value.text) return String(value.text).trim();
          if (value.error) return '';
          return '';
        }

        return String(value).trim();
      };

      // Parse number - same as Google Sheets parser (handles European format: 1.234,56)
      const parseNum = (v) => {
        if (v == null || v === '') return 0;
        // For formula/object cells, extract numeric result directly
        if (typeof v === 'object' && v !== null) {
          if (v instanceof Date) return 0;
          if (v.result !== undefined) return parseNum(v.result);
          return 0;
        }
        if (typeof v === 'number') return isNaN(v) ? 0 : v;
        let s = String(v).trim();
        if (!s) return 0;
        // European format: 1.234,56 or 1.138.510,19
        if (/,\d{1,3}$/.test(s)) {
          s = s.replace(/\./g, '').replace(',', '.');
        } else {
          s = s.replace(/,/g, '');
        }
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      };

      const toLower = (s) => (s || '').toLowerCase().trim();

      // Scan rows 1-20 for the header row (same as Google Sheets: scan first 20 rows)
      let headerRowIndex = -1;
      let yearCol = -1, installmentCol = -1, pctCol = -1, dueDateCol = -1, amountCol = -1;

      for (let r = 1; r <= Math.min(20, worksheet.rowCount); r++) {
        const row = worksheet.getRow(r);
        let foundInstallment = false, foundAmount = false;
        let rYear = -1, rInst = -1, rPct = -1, rDue = -1, rAmt = -1;

        for (let c = 1; c <= Math.max(row.cellCount, 10); c++) {
          const cell = toLower(getCellText(row.getCell(c)));
          if ((cell === 'year' || cell.includes('year')) && rYear < 0) rYear = c;
          if ((cell === 'installment' || cell.includes('installment') || cell.includes('payment')) && rInst < 0) { rInst = c; foundInstallment = true; }
          if ((cell === '%' || cell === 'percent' || cell.includes('percent')) && rPct < 0) rPct = c;
          if ((cell === 'due date' || cell.includes('due date') || (cell === 'date' && !cell.includes('amount'))) && rDue < 0) rDue = c;
          if ((cell === 'amount' || cell.includes('amount')) && rAmt < 0) { rAmt = c; foundAmount = true; }
        }

        if (foundInstallment && foundAmount) {
          headerRowIndex = r;
          yearCol = rYear > 0 ? rYear : 1;
          installmentCol = rInst;
          pctCol = rPct > 0 ? rPct : -1;
          dueDateCol = rDue > 0 ? rDue : -1;
          amountCol = rAmt;
          break;
        }
      }

      if (headerRowIndex === -1) {
        throw new Error('Could not find installments table in Excel file. Ensure the file has "Installment" and "Amount" column headers.');
      }

      console.log(`Found table: Header at row ${headerRowIndex}, Year col: ${yearCol}, Installment col: ${installmentCol}, % col: ${pctCol}, Due Date col: ${dueDateCol}, Amount col: ${amountCol}`);

      const installments = [];
      const maintenanceDeposit = [];
      const profitData = [];
      let currentId = 1;
      let maintenanceId = 1;
      let foundMaintenanceSection = false;
      let foundProfitSection = false;
      let profitColsExcel = null;
      let maintenanceCols = null;

      for (let i = headerRowIndex + 1; i <= Math.min(headerRowIndex + 200, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        if (!row) continue;

        // Check for profit table header
        if (!foundProfitSection) {
          let hasProfitHeader = false;
          let tempCols = [];
          for (let c = 1; c <= Math.max(row.cellCount, 15); c++) {
            const txt = getCellText(row.getCell(c)).trim();
            tempCols.push(txt);
            if (toLower(txt).includes('operation year')) hasProfitHeader = true;
          }
          if (hasProfitHeader) {
            foundProfitSection = true;
            profitColsExcel = tempCols;
            continue;
          }
        }

        // Collect profit rows
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
          if (hasAnyValue) profitData.push(rowObj);
          continue;
        }

        let yearVal, installmentVal, amountRaw, pctRaw, dueRaw;

        if (foundMaintenanceSection && maintenanceCols !== null) {
          installmentVal = getCellText(row.getCell(maintenanceCols.inst)).trim();
          pctRaw = row.getCell(maintenanceCols.pct)?.value;
          dueRaw = row.getCell(maintenanceCols.due)?.value;
          amountRaw = row.getCell(maintenanceCols.amount)?.value;
          yearVal = '';
        } else {
          yearVal = yearCol > 0 ? getCellText(row.getCell(yearCol)).trim() : '';
          installmentVal = getCellText(row.getCell(installmentCol)).trim();
          amountRaw = row.getCell(amountCol)?.value;
          pctRaw = pctCol > 0 ? row.getCell(pctCol)?.value : null;
          dueRaw = dueDateCol > 0 ? row.getCell(dueDateCol)?.value : null;
        }

        const instLower = toLower(installmentVal);
        const yearLower = toLower(yearVal);

        // Detect maintenance section (check year cell too, same as Google Sheets)
        if (yearLower.includes('maintenance') || yearLower.includes('deposit') ||
            instLower.includes('maintenance') || instLower.includes('deposit')) {
          foundMaintenanceSection = true;
          continue;
        }

        // Detect maintenance sub-header row by scanning for its own column positions
        if (foundMaintenanceSection && maintenanceCols === null) {
          let mInst = -1, mPct = -1, mDue = -1, mAmt = -1;
          const rowCellCount = Math.max(row.cellCount, 10);
          for (let c = 1; c <= rowCellCount; c++) {
            const cellTxt = toLower(getCellText(row.getCell(c)));
            if ((cellTxt === 'installment' || cellTxt.includes('installment')) && mInst < 0) mInst = c;
            if ((cellTxt === '%' || cellTxt === 'percent' || cellTxt.includes('percent')) && mPct < 0) mPct = c;
            if ((cellTxt === 'due date' || cellTxt.includes('due date') || (cellTxt === 'date' && !cellTxt.includes('amount'))) && mDue < 0) mDue = c;
            if ((cellTxt === 'amount' || cellTxt.includes('amount')) && mAmt < 0) mAmt = c;
          }
          if (mInst > 0 && mAmt > 0) {
            maintenanceCols = { inst: mInst, pct: mPct > 0 ? mPct : mInst + 1, due: mDue > 0 ? mDue : mInst + 2, amount: mAmt };
            continue;
          }
        }

        // Skip header-like rows and totals
        if (instLower === 'installment' || instLower === 'total') continue;
        if (!installmentVal && parseNum(amountRaw) === 0) continue;

        const rawAmount = parseNum(amountRaw);

        // Parse due date
        let rawDate = parseExcelDate(dueRaw);
        if (!rawDate && dueRaw != null) {
          const dueText = typeof dueRaw === 'object' ? getCellText({ value: dueRaw }) : String(dueRaw);
          const ddmmyyyy = dueText.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
          if (ddmmyyyy) {
            rawDate = new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
            if (isNaN(rawDate.getTime())) rawDate = null;
          } else {
            rawDate = parseExcelDate(dueText);
          }
        }

        // Fallback: calculate date from firstPaymentDate
        if (!rawDate && firstPaymentDate) {
          try {
            rawDate = addMonths(new Date(firstPaymentDate), (currentId - 1) * 3);
          } catch (e) { /* ignore */ }
        }

        const effectiveAmtCol = (foundMaintenanceSection && maintenanceCols) ? maintenanceCols.amount : amountCol;
        const effectiveDueCol = (foundMaintenanceSection && maintenanceCols) ? maintenanceCols.due : (dueDateCol > 0 ? dueDateCol : -1);
        const effectivePctCol = (foundMaintenanceSection && maintenanceCols) ? maintenanceCols.pct : (pctCol > 0 ? pctCol : -1);
        // Amount: always display with 2 decimal places
        const amountStr = rawAmount !== 0 ? rawAmount.toFixed(2) : null;
        const dueStr = effectiveDueCol > 0 ? (getCellText(row.getCell(effectiveDueCol)).trim() || null) : null;
        // Pct: convert decimal (0.1667) or percent string to "XX.XX%" with 2 decimals
        const pctCellText = effectivePctCol > 0 ? getCellText(row.getCell(effectivePctCol)).trim() : '';
        const rawPctForDisplay = parsePercentageForApi(pctCellText || null);
        const pctStr = rawPctForDisplay != null ? rawPctForDisplay.toFixed(2) + '%' : (pctCellText || null);

        if (rawAmount === 0) continue;

        const installmentData = {
          id: foundMaintenanceSection ? maintenanceId++ : currentId++,
          year: yearVal || null,
          number: installmentVal || (foundMaintenanceSection ? `Maintenance ${maintenanceId - 1}` : `Installment ${currentId - 1}`),
          amount: amountStr,
          dueDate: dueStr,
          percentage: pctStr,
          rawAmount,
          rawDate,
          rawPercentage: parsePercentageForApi(pctStr)
        };

        if (foundMaintenanceSection) {
          maintenanceDeposit.push(installmentData);
        } else {
          installments.push(installmentData);
        }
      }

      console.log(`Parsed ${installments.length} installments, ${maintenanceDeposit.length} maintenance rows, ${profitData.length} profit rows`);

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
      icon: "trash",
      condition: (row) => row.Status !== 1 // hide for Confirmed (Status=1)
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
        onResendSuccess={() => selectedReservation?.Id && refreshSelectedReservation(selectedReservation.Id)}
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
