import REQUEST from "../../services/Request";

export const GET_TEMPLATES = async () => {
  return await REQUEST({ method: "GET", url: "templates" });
};

export const GET_TEMPLATE = async (key) => {
  return await REQUEST({ method: "GET", url: `templates/${key}` });
};

export const SAVE_TEMPLATE = async (key, htmlContent) => {
  return await REQUEST({ method: "PUT", url: `templates/${key}`, data: { htmlContent } });
};

export const RESET_TEMPLATE = async (key) => {
  return await REQUEST({ method: "POST", url: `templates/${key}/reset` });
};

export const SEED_TEMPLATES = async () => {
  return await REQUEST({ method: "POST", url: "templates/seed" });
};

export const PREVIEW_TEMPLATE = async (key, htmlContent) => {
  // Returns a blob (PDF) — must use REQUEST to include the auth token
  return await REQUEST({
    method: "POST",
    url: `templates/${key}/preview`,
    data: { htmlContent },
    responseType: "blob",
  });
};
