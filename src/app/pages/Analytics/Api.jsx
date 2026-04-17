import REQUEST from "../../services/Request";

const parseIfString = (res) => {
  if (typeof res === "string") {
    try {
      return JSON.parse(res);
    } catch {
      return res;
    }
  }
  return res;
};

const buildRange = ({ fromDate, toDate } = {}) => {
  const qs = [];
  if (fromDate) qs.push(`fromDate=${encodeURIComponent(fromDate)}`);
  if (toDate) qs.push(`toDate=${encodeURIComponent(toDate)}`);
  return qs.length ? `?${qs.join("&")}` : "";
};

export const GET_DASHBOARD_OVERVIEW = async (range) => {
  const res = await REQUEST({
    method: "GET",
    url: `dashboard/overview${buildRange(range)}`,
  });
  return parseIfString(res);
};

export const GET_RESERVATIONS_SUMMARY = async (range) => {
  const res = await REQUEST({
    method: "GET",
    url: `dashboard/reservations-summary${buildRange(range)}`,
  });
  return parseIfString(res);
};

export const GET_SESSION_FEEDBACK_ANALYTICS = async (range) => {
  const res = await REQUEST({
    method: "GET",
    url: `dashboard/session-feedback-analytics${buildRange(range)}`,
  });
  return parseIfString(res);
};
