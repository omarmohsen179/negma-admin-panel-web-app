import { createQueryString } from "app/services/SharedData";
import REQUEST from "../../services/Request";

export const GET_RESERVATIONS = async (data) => {
  return await REQUEST({
    method: "GET",
    url: "reservation/filter?" + createQueryString(data),
  });
};

export const GET_RESERVATION_BY_ID = async (id) => {
  const result = await REQUEST({
    method: "GET",
    url: `reservation/${id}`,
  });
  // Backend may return response body as a JSON string; parse to object
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  }
  return result;
};

export const EDIT_RESERVATION = async (data) => {
  return await REQUEST({
    method: data.Id > 0 ? "PUT" : "POST",
    url: "reservation",
    data,
  });
};

export const DELETE_RESERVATION = async (id) => {
  return await REQUEST({
    method: "DELETE",
    url: "reservation/" + id,
  });
};

export const UPDATE_RESERVATION_STATUS = async (id, newStatus, cancellationReason = null) => {
  const requestData = {
    newStatus: getStatusString(newStatus),
    ...(cancellationReason && { cancellationReason })
  };

  return await REQUEST({
    method: "PUT",
    url: `reservation/${id}/status`,
    data: requestData,
  });
};

export const APPROVE_RESERVATION = async (id) => {
  return await REQUEST({
    method: "POST",
    url: `reservation/${id}/approve`,
  });
};

export const UPLOAD_DOWNPAYMENT = async (
  id,
  downPaymentAmount,
  chequeFiles,
  reservationFee = null,
  discountOnCashPercentage = null,
  discountOnCash = null,
  bankDetails = null
) => {
  const formData = new FormData();
  formData.append('ReservationId', id.toString());

  // Convert to number and handle NaN - ensure it's always a valid number
  const downPaymentValue = isNaN(downPaymentAmount) || downPaymentAmount === null || downPaymentAmount === undefined
    ? 0
    : parseFloat(downPaymentAmount) || 0;
  formData.append('DownPaymentAmount', downPaymentValue.toString());

  // Convert reservation fee to number and handle NaN
  if (reservationFee !== null && reservationFee !== undefined && reservationFee !== '') {
    const reservationFeeValue = isNaN(reservationFee) ? 0 : (parseFloat(reservationFee) || 0);
    formData.append('ReservationFee', reservationFeeValue.toString());
  }

  if (discountOnCashPercentage !== null && discountOnCashPercentage !== undefined && discountOnCashPercentage !== '') {
    const pct = isNaN(discountOnCashPercentage) ? 0 : (parseFloat(discountOnCashPercentage) || 0);
    formData.append('DiscountOnCashPercentage', pct.toString());
  }
  if (discountOnCash !== null && discountOnCash !== undefined && discountOnCash !== '') {
    const val = isNaN(discountOnCash) ? 0 : (parseFloat(discountOnCash) || 0);
    formData.append('DiscountOnCash', val.toString());
  }

  // Optional bank details (update on reservation)
  if (bankDetails && typeof bankDetails === 'object') {
    if (bankDetails.BankAccount != null && bankDetails.BankAccount !== '') {
      formData.append('BankAccount', String(bankDetails.BankAccount).trim());
    }
    if (bankDetails.BankName != null && bankDetails.BankName !== '') {
      formData.append('BankName', String(bankDetails.BankName).trim());
    }
    if (bankDetails.BankBranch != null && bankDetails.BankBranch !== '') {
      formData.append('BankBranch', String(bankDetails.BankBranch).trim());
    }
    if (bankDetails.SwiftCode != null && bankDetails.SwiftCode !== '') {
      formData.append('SwiftCode', String(bankDetails.SwiftCode).trim());
    }
  }

  if (chequeFiles && chequeFiles.length > 0) {
    chequeFiles.forEach((file) => {
      formData.append('ChequeImages', file);
    });
  }

  return await REQUEST({
    method: "POST",
    url: `reservation/${id}/downpayment`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const SUBMIT_DOCUMENTS_AND_MARK_SOLD = async (id, documents) => {
  const formData = new FormData();
  formData.append('ReservationId', id.toString());
  
  // Append all documents to the form data
  if (documents && documents.length > 0) {
    documents.forEach((file) => {
      formData.append('Documents', file);
    });
  }

  return await REQUEST({
    method: "POST",
    url: `reservation/${id}/submit-documents`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const UPDATE_SUBMITTED_DOCUMENTS = async (id, documents) => {
  const formData = new FormData();
  formData.append('ReservationId', id.toString());
  
  // Append all documents to the form data
  if (documents && documents.length > 0) {
    documents.forEach((file) => {
      formData.append('Documents', file);
    });
  }

  return await REQUEST({
    method: "PUT",
    url: `reservation/${id}/submit-documents`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const UPDATE_RESERVATION_JSON_FIELDS = async (id, installmentSchedule, maintenancePlan, profitJson) => {
  const requestData = {
    id: id,
    ...(installmentSchedule && { installmentSchedule }),
    ...(maintenancePlan && { maintenancePlan }),
    ...(profitJson && { profitJson })
  };

  return await REQUEST({
    method: "PUT",
    url: `reservation/${id}/json-fields`,
    data: requestData,
  });
};

/**
 * Fetch Google Sheet as CSV (backend should proxy the request to avoid CORS).
 * Pass the full sheet edit URL; backend returns CSV string.
 * If backend does not implement this, use a CORS proxy via REACT_APP_GOOGLE_SHEET_CORS_PROXY.
 */
export const FETCH_GOOGLE_SHEET_CSV = async (sheetUrl) => {
  return await REQUEST({
    method: "GET",
    url: "reservation/fetch-google-sheet",
    params: { url: sheetUrl },
  });
};

/** Add one or more clients to a reservation. Body: { clientIds: string[] } */
export const ADD_RESERVATION_CLIENTS = async (reservationId, clientIds) => {
  return await REQUEST({
    method: "POST",
    url: `reservation/${reservationId}/clients`,
    data: { clientIds: Array.isArray(clientIds) ? clientIds : [clientIds] },
  });
};

/** Remove a client from a reservation. Returns 400 if it's the only client. */
export const REMOVE_RESERVATION_CLIENT = async (reservationId, clientId) => {
  return await REQUEST({
    method: "DELETE",
    url: `reservation/${reservationId}/clients/${clientId}`,
  });
};

/**
 * Update reservation client link and client data together.
 * PUT /api/Reservation/client/{reservationClientId}
 * Body: contractNote (nullable), ownershipPercentage, name, email, phoneNumber, dateOfBirth, address, nationality, idNumber, occupation, sex, isEgyptian
 */
export const UPDATE_RESERVATION_CLIENT = async (reservationClientId, data) => {
  return await REQUEST({
    method: "PUT",
    url: `reservation/client/${reservationClientId}`,
    data: {
      ...(data.contractNote !== undefined && { contractNote: data.contractNote == null || data.contractNote === '' ? null : data.contractNote }),
      ...(data.ownershipPercentage !== undefined && { ownershipPercentage: data.ownershipPercentage }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth || null }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.nationality !== undefined && { nationality: data.nationality }),
      ...(data.idNumber !== undefined && { idNumber: data.idNumber }),
      ...(data.occupation !== undefined && { occupation: data.occupation }),
      ...(data.sex !== undefined && { sex: data.sex }),
      ...(data.isEgyptian !== undefined && { isEgyptian: data.isEgyptian }),
    },
  });
};

export const UPDATE_BROKER_DEVELOPER = async (id, data) => {
  return await REQUEST({
    method: "PUT",
    url: `reservation/${id}/broker-developer`,
    data,
  });
};

export const GET_CONTRACT_HTML = async (id) => {
  return await REQUEST({ method: "GET", url: `reservation/${id}/contract-html` });
};

export const SAVE_CONTRACT_HTML = async (id, htmlContent) => {
  return await REQUEST({ method: "PUT", url: `reservation/${id}/contract-html`, data: { htmlContent } });
};

export const CLEAR_CONTRACT_HTML = async (id) => {
  return await REQUEST({ method: "DELETE", url: `reservation/${id}/contract-html` });
};

export const REGENERATE_CONTRACT = async (id) => {
  return await REQUEST({ method: "POST", url: `reservation/${id}/regenerate-contract` });
};

export const RESEND_CONTRACT_EMAIL = async (id) => {
  return await REQUEST({ method: "GET", url: `Test/test-reservation-email/${id}` });
};

// Helper function to convert status number to string
const getStatusString = (status) => {
  switch (status) {
    case 0: return "Pending";
    case 1: return "Confirmed";
    case 2: return "Purchased";
    case 3: return "Cancelled";
    default: return "Pending";
  }
};
