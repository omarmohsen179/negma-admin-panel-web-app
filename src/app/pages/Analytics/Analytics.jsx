import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Icon,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactEcharts from "echarts-for-react";
import {
  GET_DASHBOARD_OVERVIEW,
  GET_RESERVATIONS_SUMMARY,
  GET_SESSION_FEEDBACK_ANALYTICS,
} from "./Api";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
}));

const KpiCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  borderRadius: 12,
  border: "1px solid",
  borderColor: theme.palette.divider,
  boxShadow: "none",
  height: "100%",
  minHeight: 96,
}));

const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(Number(n || 0));

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const STATUS_COLORS = {
  Pending: "#fbc02d",
  Confirmed: "#1e88e5",
  Purchased: "#2e7d32",
  Cancelled: "#c62828",
};

const STATUS_NAME_BY_INDEX = ["Pending", "Confirmed", "Purchased", "Cancelled"];
const statusName = (s) =>
  typeof s === "string" ? s : STATUS_NAME_BY_INDEX[s] || "Unknown";

const UNIT_STATUS_COLORS = {
  Available: "#2e7d32",
  Reserved: "#fbc02d",
  Sold: "#1e88e5",
  Blocked: "#c62828",
};

const PAYMENT_COLORS = {
  Cash: "#00897b",
  Installment: "#ef6c00",
};

const Kpi = ({ label, value, icon, color = "#1565c0" }) => (
  <KpiCard>
    <Avatar sx={{ bgcolor: color, width: 48, height: 48, flexShrink: 0 }}>
      <Icon>{icon}</Icon>
    </Avatar>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        title={label}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </Typography>
    </Box>
  </KpiCard>
);

const Panel = ({ title, subtitle, children, height }) => (
  <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none", height: "100%" }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ height: height || "auto" }}>{children}</Box>
    </CardContent>
  </Card>
);

const doughnutOption = (data, paletteMap) => ({
  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
  legend: { bottom: 0, icon: "circle", textStyle: { fontSize: 12 } },
  xAxis: { show: false },
  yAxis: { show: false },
  grid: { show: false },
  series: [
    {
      type: "pie",
      radius: ["50%", "72%"],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: data.map((d) => ({
        value: d.value,
        name: d.name,
        itemStyle: paletteMap?.[d.name] ? { color: paletteMap[d.name] } : undefined,
      })),
    },
  ],
});

const areaOption = (trend) => ({
  tooltip: { trigger: "axis" },
  legend: { data: ["Confirmed Revenue", "Purchased Revenue"], bottom: 0 },
  grid: { top: 20, left: 60, right: 20, bottom: 50 },
  xAxis: {
    type: "category",
    data: trend.map((t) => t.Label),
    boundaryGap: false,
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "Confirmed Revenue",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.25 },
      stack: "rev",
      itemStyle: { color: "#1e88e5" },
      data: trend.map((t) => Number(t.ConfirmedRevenue || 0)),
    },
    {
      name: "Purchased Revenue",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.35 },
      stack: "rev",
      itemStyle: { color: "#2e7d32" },
      data: trend.map((t) => Number(t.PurchasedRevenue || 0)),
    },
  ],
});

const sessionsOption = (sa) => ({
  tooltip: { trigger: "axis" },
  legend: { bottom: 0 },
  grid: { top: 20, left: 40, right: 20, bottom: 50 },
  xAxis: { type: "category", data: ["Orientation", "Meeting"] },
  yAxis: { type: "value" },
  series: [
    {
      name: "Completed",
      type: "bar",
      itemStyle: { color: "#2e7d32" },
      data: [sa.CompletedOrientationSessions || 0, sa.CompletedMeetingSessions || 0],
    },
    {
      name: "Active",
      type: "bar",
      itemStyle: { color: "#fbc02d" },
      data: [sa.ActiveOrientationSessions || 0, sa.ActiveMeetingSessions || 0],
    },
  ],
});

const funnelOption = (sfa, unitsSold) => {
  const totalSessions = sfa?.OverallCorrelation?.TotalSessions || 0;
  const totalFeedback = sfa?.OverallCorrelation?.TotalFeedbacks || 0;
  const withFeedback = sfa?.OverallCorrelation?.TotalSessionsWithFeedback || 0;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    series: [
      {
        type: "funnel",
        left: "10%",
        width: "80%",
        sort: "descending",
        gap: 3,
        label: { show: true, position: "inside" },
        data: [
          { value: totalSessions, name: "Sessions" },
          { value: withFeedback, name: "Sessions with Feedback" },
          { value: totalFeedback, name: "Feedback Submitted" },
          { value: unitsSold || 0, name: "Units Sold" },
        ],
      },
    ],
  };
};

const RANGE_PRESETS = [
  { label: "Last 30 days", months: 1 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
];

const computeRange = (months) => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - months);
  return {
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
  };
};

const Analytics = () => {
  const [rangeMonths, setRangeMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sfa, setSfa] = useState(null);
  const [errors, setErrors] = useState({});

  const range = useMemo(() => computeRange(rangeMonths), [rangeMonths]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrors({});
    const results = await Promise.allSettled([
      GET_DASHBOARD_OVERVIEW(range),
      GET_RESERVATIONS_SUMMARY(range),
      GET_SESSION_FEEDBACK_ANALYTICS(range),
    ]);
    const [oRes, sRes, fRes] = results;
    const nextErrors = {};

    if (oRes.status === "fulfilled") setOverview(oRes.value);
    else {
      setOverview(null);
      nextErrors.overview = oRes.reason?.message || "Failed to load overview";
    }
    if (sRes.status === "fulfilled") setSummary(sRes.value);
    else {
      setSummary(null);
      nextErrors.summary = sRes.reason?.message || "Failed to load reservations summary";
    }
    if (fRes.status === "fulfilled") setSfa(fRes.value);
    else {
      setSfa(null);
      nextErrors.sfa = fRes.reason?.message || "Failed to load session analytics";
    }
    setErrors(nextErrors);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview && !summary && !sfa) {
    return (
      <ContentBox>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
        </Stack>
      </ContentBox>
    );
  }

  const units = overview?.UnitsOverview || {};
  const sa = overview?.SessionAnalytics || {};
  const revenue = summary?.Revenue || {};
  const statusData =
    summary?.StatusBreakdown?.map((s) => ({ name: s.Status, value: s.Count })) || [];
  const paymentData =
    summary?.PaymentBreakdown?.map((p) => ({ name: p.PaymentMethod, value: p.Count })) || [];
  const unitStatusData = [
    { name: "Available", value: units.AvailableUnits || 0 },
    { name: "Reserved", value: units.ReservedUnits || 0 },
    { name: "Sold", value: units.SoldUnits || 0 },
    { name: "Blocked", value: units.BlockedUnits || 0 },
  ];
  const trend = summary?.MonthlyTrend || [];
  const recentReservations = overview?.RecentActivity?.RecentReservations || [];

  return (
    <ContentBox>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full business overview — units, reservations, revenue, and sales activity.
          </Typography>
        </Box>
        <Select
          size="small"
          value={rangeMonths}
          onChange={(e) => setRangeMonths(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {RANGE_PRESETS.map((p) => (
            <MenuItem key={p.months} value={p.months}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {Object.keys(errors).length > 0 && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {errors.overview && (
            <Alert severity="warning">Units & session widgets unavailable: {errors.overview}</Alert>
          )}
          {errors.summary && (
            <Alert severity="warning">Reservation summary unavailable: {errors.summary}</Alert>
          )}
          {errors.sfa && (
            <Alert severity="warning">Funnel unavailable: {errors.sfa}</Alert>
          )}
        </Stack>
      )}

      {/* Row 1 — Inventory KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        <Grid item xs={6} sm={6} md={3}>
          <Kpi label="Total Units" value={formatNumber(units.TotalUnits)} icon="apartment" color="#1565c0" />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Kpi label="Available" value={formatNumber(units.AvailableUnits)} icon="check_circle" color="#2e7d32" />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Kpi label="Reserved" value={formatNumber(units.ReservedUnits)} icon="event_available" color="#fbc02d" />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Kpi label="Sold" value={formatNumber(units.SoldUnits)} icon="monetization_on" color="#00897b" />
        </Grid>
      </Grid>

      {/* Row 2 — Business KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Kpi
            label="Reservations"
            value={formatNumber(summary?.Totals?.ReservationsInRange)}
            icon="assignment"
            color="#6a1b9a"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Kpi
            label="Revenue"
            value={formatCurrency(revenue.Total)}
            icon="attach_money"
            color="#e65100"
          />
        </Grid>
      </Grid>

      {/* Row 2 — Doughnuts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Panel title="Reservation Status" subtitle="Pending / Confirmed / Purchased / Cancelled" height={300}>
            {statusData.length ? (
              <ReactEcharts notMerge lazyUpdate style={{ height: 260 }} option={doughnutOption(statusData, STATUS_COLORS)} />
            ) : (
              <Typography variant="body2" color="text.secondary">No reservations in range.</Typography>
            )}
          </Panel>
        </Grid>
        <Grid item xs={12} md={4}>
          <Panel title="Payment Method" subtitle="Cash vs Installment" height={300}>
            {paymentData.length ? (
              <ReactEcharts notMerge lazyUpdate style={{ height: 260 }} option={doughnutOption(paymentData, PAYMENT_COLORS)} />
            ) : (
              <Typography variant="body2" color="text.secondary">No payment data in range.</Typography>
            )}
          </Panel>
        </Grid>
        <Grid item xs={12} md={4}>
          <Panel title="Unit Status" subtitle="Current inventory split" height={300}>
            <ReactEcharts notMerge lazyUpdate style={{ height: 260 }} option={doughnutOption(unitStatusData, UNIT_STATUS_COLORS)} />
          </Panel>
        </Grid>
      </Grid>

      {/* Row 3 — Trends */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Panel title="Revenue Trend" subtitle="Confirmed + Purchased revenue per month" height={340}>
            {trend.length ? (
              <ReactEcharts notMerge lazyUpdate style={{ height: 300 }} option={areaOption(trend)} />
            ) : (
              <Typography variant="body2" color="text.secondary">No trend data in range.</Typography>
            )}
          </Panel>
        </Grid>
        <Grid item xs={12} md={4}>
          <Panel title="Sessions" subtitle="Orientation vs Meeting" height={340}>
            <ReactEcharts notMerge lazyUpdate style={{ height: 300 }} option={sessionsOption(sa)} />
          </Panel>
        </Grid>
      </Grid>

      {/* Row 4 — Funnel + queue */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Panel title="Sales Funnel" subtitle="Sessions → Feedback → Units Sold" height={340}>
            <ReactEcharts
              notMerge
              lazyUpdate
              style={{ height: 300 }}
              option={funnelOption(sfa, units.SoldUnits)}
            />
          </Panel>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Kpi
                label="Pending Approval"
                value={formatNumber(summary?.Totals?.PendingApproval)}
                icon="pending_actions"
                color="#c62828"
              />
            </Grid>
            <Grid item xs={12}>
              <Kpi
                label="Feedback Rate"
                value={`${sfa?.OverallCorrelation?.OverallFeedbackRate ?? 0}%`}
                icon="rate_review"
                color="#1565c0"
              />
            </Grid>
            <Grid item xs={12}>
              <Kpi
                label="Confirmed Revenue"
                value={formatCurrency(revenue.Confirmed)}
                icon="trending_up"
                color="#1e88e5"
              />
            </Grid>
            <Grid item xs={12}>
              <Kpi
                label="Purchased Revenue"
                value={formatCurrency(revenue.Purchased)}
                icon="savings"
                color="#2e7d32"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Row 5 — Recent Reservations */}
      <Panel title="Recent Reservations" subtitle="Latest activity in the selected period">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentReservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No reservations in range.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {recentReservations.map((r) => (
              <TableRow key={r.Id}>
                <TableCell>{r.UnitNumber || r.Unit?.UnitNumber || "—"}</TableCell>
                <TableCell>
                  {r.ClientName || r.ReservationClients?.[0]?.Client?.Name || "—"}
                </TableCell>
                <TableCell>
                  {(() => {
                    const name = statusName(r.Status);
                    const color = STATUS_COLORS[name] || "#757575";
                    return (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 1,
                          bgcolor: `${color}22`,
                          color,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {name}
                      </Box>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </ContentBox>
  );
};

export default Analytics;
