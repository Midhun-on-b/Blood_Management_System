// src/api/bloodBankApi.js
// ─────────────────────────────────────────────────────────
// All blood bank API calls in one place.
// Bank identity comes from authenticated session (user.entity_id).
// ─────────────────────────────────────────────────────────
 
import { getAuthUser } from "../auth/session";
import { apiFetch } from "../services/http";
 
function getBankId() {
  const user = getAuthUser();
  if (!user || user.role !== "blood_bank" || !user.entity_id) {
    throw new Error("Blood bank session not found");
  }
  return user.entity_id;
}

async function api(path, options = {}) {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "API error");
  }
  return res.json();
}
 
// ── Blood Bank Profile ────────────────────────────────────
export const getBloodBank = () => api(`/blood-banks/${getBankId()}`);
export const updateBloodBank = (data) =>
  api(`/blood-banks/${getBankId()}`, { method: "PUT", body: JSON.stringify(data) });
 
// ── Dashboard ─────────────────────────────────────────────
export const getDashboard = () => api(`/blood-banks/${getBankId()}/dashboard`);
export const getStockTrend = () => api(`/blood-banks/${getBankId()}/stock-trend`);
 
// ── Inventory / Stock ─────────────────────────────────────
export const getStock = () => api(`/blood-banks/${getBankId()}/stock`);
export const updateStock = (bloodGroup, units, action) =>
  api(`/blood-banks/${getBankId()}/stock/${encodeURIComponent(bloodGroup)}`, {
    method: "PUT",
    body: JSON.stringify({ available_units: units, action }),
  });
 
// ── Donors ────────────────────────────────────────────────
export const getDonors = () => api(`/blood-banks/${getBankId()}/donors`);
export const registerDonor = (data) =>
  api(`/blood-banks/${getBankId()}/donors`, { method: "POST", body: JSON.stringify(data) });
 
// ── Health Checks ─────────────────────────────────────────
export const getHealthChecks = () => api(`/blood-banks/${getBankId()}/health-checks`);
export const createHealthCheck = (data) =>
  api(`/blood-banks/${getBankId()}/health-checks`, { method: "POST", body: JSON.stringify(data) });
 
// ── Donations ─────────────────────────────────────────────
export const getDonations = () => api(`/blood-banks/${getBankId()}/donations`);
export const recordDonation = (data) =>
  api(`/blood-banks/${getBankId()}/donations`, { method: "POST", body: JSON.stringify(data) });
 
// ── Blood Requests ────────────────────────────────────────
export const getRequests = () => api(`/blood-banks/${getBankId()}/requests`);
export const updateRequestStatus = (reqId, status) =>
  api(`/blood-banks/${getBankId()}/requests/${reqId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
export const approveRequest = (reqId) =>
  api(`/blood-requests/approve/${reqId}`, { method: "PUT" });
export const rejectRequest = (reqId) =>
  api(`/blood-requests/reject/${reqId}`, { method: "PUT" });
 
// ── Blood Issues ──────────────────────────────────────────
export const getIssues = () => api(`/blood-banks/${getBankId()}/issues`);
export const issueBlood = (data) =>
  api(`/blood-banks/${getBankId()}/issues`, { method: "POST", body: JSON.stringify(data) });
 
// ── Payments ──────────────────────────────────────────────
export const getPayments = () => api(`/blood-banks/${getBankId()}/payments`);
export const getPaymentTrend = () => api(`/blood-banks/${getBankId()}/payment-trend`);
export const markPaymentPaid = (payId) =>
  api(`/blood-banks/${getBankId()}/payments/${payId}`, {
    method: "PUT",
    body: JSON.stringify({ payment_status: "Paid" }),
  });
 
















































