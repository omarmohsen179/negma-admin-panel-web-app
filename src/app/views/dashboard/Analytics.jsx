import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { Fragment } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HotelIcon from "@mui/icons-material/Hotel";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GroupsIcon from "@mui/icons-material/Groups";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TimelineIcon from "@mui/icons-material/Timeline";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import GradingIcon from "@mui/icons-material/Grading";
import StarIcon from "@mui/icons-material/Star";
import PublicIcon from "@mui/icons-material/Public";
import TableChartIcon from "@mui/icons-material/TableChart";

// ─── Styled Helpers ─────────────────────────────────────────────────────────

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(6),
  fontSize: "1.5rem",
  letterSpacing: "-0.3px",
}));

const BulletItem = ({ text, icon }) => (
  <ListItem alignItems="flex-start" sx={{ py: 0.4, px: 0 }}>
    <ListItemIcon sx={{ minWidth: 30, mt: 0.3 }}>
      {icon ?? <CheckCircleIcon sx={{ fontSize: 16 }} />}
    </ListItemIcon>
    <ListItemText
      primary={
        <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
          {text}
        </Typography>
      }
    />
  </ListItem>
);

// ─── Section 1 · Hero Banner ─────────────────────────────────────────────────

const HeroBanner = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #1a237e 0%, #283593 40%, #0277bd 100%)",
        color: "#fff",
        p: { xs: 4, md: 7 },
        mb: 5,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(26,35,126,0.35)",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -80,
          right: -80,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          bottom: -60,
          left: 60,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
          <Chip
            icon={<BusinessIcon sx={{ color: "#fff !important" }} />}
            label="Negma Properties (PROD)"
            sx={{
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 700,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              fontSize: "0.82rem",
            }}
          />
          <Chip
            icon={<HotelIcon sx={{ color: "#fff !important" }} />}
            label="Negma Hotel Properties (NPM)"
            sx={{
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 700,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              fontSize: "0.82rem",
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{ fontWeight: 900, lineHeight: 1.15, mb: 2, fontSize: { xs: "2rem", md: "2.8rem" } }}
        >
          Real Estate Sales
          <br />
          Management Platform
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 400, opacity: 0.88, maxWidth: 640, lineHeight: 1.6, mb: 4 }}
        >
          Everything you need to manage real estate sales from listing to contract — units,
          clients, reservations, approvals, PDFs, and field activity in one place.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[
            { icon: <ApartmentIcon />, label: "Units & Projects" },
            { icon: <AssignmentIcon />, label: "Reservations" },
            { icon: <DescriptionIcon />, label: "Contracts & PDFs" },
            { icon: <PeopleIcon />, label: "Clients & Brokers" },
            { icon: <TimelineIcon />, label: "Field Activity" },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 2,
                px: 2,
                py: 0.8,
              }}
            >
              <Box sx={{ opacity: 0.85, display: "flex", fontSize: 18 }}>{item.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Section 2 · Environments & Access ──────────────────────────────────────

const EnvironmentsSection = () => (
  <Fragment>
    <SectionLabel variant="h4">Environments & Access</SectionLabel>
    <Grid container spacing={3} sx={{ mb: 2 }}>
      {/* PROD */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: "2px solid #1565c0",
            borderRadius: 3,
            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#1565c0", width: 48, height: 48 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1565c0" }}>
                    Negma Properties
                  </Typography>
                  <Chip label="PROD" size="small" sx={{ bgcolor: "#1565c0", color: "#fff", fontWeight: 700, fontSize: "0.72rem" }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Commercial & medical real estate — Clinics, Shops, Offices
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
              Access Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #bbdefb",
                }}
              >
                <Avatar sx={{ bgcolor: "#1565c0", width: 32, height: 32 }}>
                  <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                    Admin Panel
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1565c0", fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    clinic-admin.khalidelewa.com
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #bbdefb",
                }}
              >
                <Avatar sx={{ bgcolor: "#42a5f5", width: 32, height: 32 }}>
                  <SupportAgentIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                    Sales Portal
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1565c0", fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    clinic.khalidelewa.com
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              <strong>2 admin approvals</strong> required per reservation · 6 contract templates (Unit Type × Payment)
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* NPM */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: "2px solid #e65100",
            borderRadius: 3,
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#e65100", width: 48, height: 48 }}>
                <HotelIcon />
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#e65100" }}>
                    Negma Hotel Properties
                  </Typography>
                  <Chip label="NPM" size="small" sx={{ bgcolor: "#e65100", color: "#fff", fontWeight: 700, fontSize: "0.72rem" }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Hotel apartment investments — Gold &amp; Silver packages
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
              Access Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #ffe0b2",
                }}
              >
                <Avatar sx={{ bgcolor: "#e65100", width: 32, height: 32 }}>
                  <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                    Admin Panel
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#e65100", fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    admin.negma.khalidelewa.com
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #ffe0b2",
                }}
              >
                <Avatar sx={{ bgcolor: "#ff7043", width: 32, height: 32 }}>
                  <SupportAgentIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                    Sales Portal
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#e65100", fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    negma.khalidelewa.com
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              <strong>3–4 admin approvals</strong> required per reservation · 8 contract templates (Package × Payment × Nationality)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Fragment>
);

// ─── Section 2b · User Roles ─────────────────────────────────────────────────

const UserRolesSection = () => (
  <Fragment>
    <SectionLabel variant="h4">Who Uses This System</SectionLabel>
    <Grid container spacing={3} sx={{ mb: 2 }}>
      {/* Admin */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: "1.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#880e4f", width: 52, height: 52 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#880e4f" }}>
                  Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Operation · Finance · Customer Support · Super Admin
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <List dense disablePadding>
              {[
                "Log in at the admin panel URL for your environment",
                "Create and manage units, projects, and photos",
                "Create reservations and assign clients with ownership %",
                "Approve reservations through the multi-step approval chain",
                "Upload contract documents and generate PDFs",
                "Edit contract text visually before sending to the client",
                "Upload and manage installment schedules (Finance role)",
                "Bulk-import clients from Excel files",
                "Manage broker assignments and admin accounts",
                "Monitor field sales activity and session logs",
              ].map((item) => (
                <BulletItem
                  key={item}
                  text={item}
                  icon={<CheckCircleIcon sx={{ fontSize: 16, color: "#880e4f" }} />}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Sales */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            border: "1.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#1b5e20", width: 52, height: 52 }}>
                <SupportAgentIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1b5e20" }}>
                  Sales Agent (Broker)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Field sales agents and brokers
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <List dense disablePadding>
              {[
                "Log in at the sales portal URL for your environment",
                "Browse available units by project, type, floor, and price",
                "View unit photos, area details, and current availability",
                "Submit orientation session logs after client meetings",
                "Record meeting outcome and capture lead information",
                "Track your own sessions and activity history",
                "View assigned supervisor and team hierarchy",
                "Receive notifications on client reservation status",
              ].map((item) => (
                <BulletItem
                  key={item}
                  text={item}
                  icon={<CheckCircleIcon sx={{ fontSize: 16, color: "#1b5e20" }} />}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Fragment>
);

// ─── Section 3 · Capability Cards ───────────────────────────────────────────

const capabilities = [
  {
    icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
    title: "Manage Properties",
    color: "#1565c0",
    bg: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    iconBg: "#1565c0",
    bullets: [
      "Add real estate projects and individual units (Clinic, Shop, Office, Hotel Apartment)",
      "Upload multiple photos per unit with gallery management",
      "Set unit price, area, floor, and custom attributes",
      "Block or unblock units to prevent accidental reservations",
      "Track full status lifecycle: Available → Reserved → Sold",
      "Filter and search across all units by type, status, or project",
    ],
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    title: "Handle Reservations",
    color: "#2e7d32",
    bg: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    iconBg: "#2e7d32",
    bullets: [
      "Create a new reservation linked to a unit in seconds",
      "Add multiple co-owners per reservation with individual ownership %",
      "Choose payment method: Cash or Installment",
      "Upload signed reservation form and down payment images",
      "Push through a multi-admin approval chain",
      "Mark reservation as Confirmed, then Purchased when complete",
    ],
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
    title: "Generate Contracts",
    color: "#e65100",
    bg: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    iconBg: "#e65100",
    bullets: [
      "Auto-generate Arabic PDF contracts filled with real client and unit data",
      "Supports Cash and Installment contract types with full payment schedules",
      "8 contract templates for Hotel Apartments (Gold/Silver × Cash/Installment × Nationality)",
      "Edit any contract visually with CKEditor before generating the PDF",
      "Per-reservation overrides leave the global template untouched",
      "Automatic email delivery with contract PDF attached on approval",
    ],
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: "Manage Clients & Users",
    color: "#6a1b9a",
    bg: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    iconBg: "#6a1b9a",
    bullets: [
      "Create individual client profiles with ID, nationality, and address",
      "Bulk import hundreds of clients at once from a structured Excel file",
      "Automatic duplicate detection during import (Name + Email + Phone)",
      "Assign clients as buyers or co-owners on any reservation",
      "Link clients to brokers for commission tracking",
      "Track Egyptian vs Non-Egyptian nationality for contract template selection",
    ],
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    title: "Track Sales Activity",
    color: "#00695c",
    bg: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
    iconBg: "#00695c",
    bullets: [
      "View live session logs submitted by field sales agents",
      "Track orientation sessions with meeting outcomes and notes",
      "See lead statuses and conversion progress per agent",
      "Location data captured for each field session",
      "Filter activity by agent, date range, or outcome",
      "Monitor today vs this-week session counts at a glance",
    ],
  },
  {
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
    title: "Admin & Access Control",
    color: "#b71c1c",
    bg: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
    iconBg: "#b71c1c",
    bullets: [
      "Create admin accounts with specific roles: Operation, Finance, Customer Support",
      "Finance role required to upload installment schedules and approve finance steps",
      "Multi-step approval chains — up to 4 approvals for NPM reservations with feedback",
      "Assign brokers to admin supervisors for hierarchical management",
      "Each role sees only the actions and tabs they are authorized to perform",
      "Audit trail through reservation status history and document uploads",
    ],
  },
];

const CapabilityCards = () => (
  <Fragment>
    <SectionLabel variant="h4">What You Can Do</SectionLabel>
    <Grid container spacing={3}>
      {capabilities.map((cap) => (
        <Grid item xs={12} md={6} key={cap.title}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 3,
              background: cap.bg,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: cap.iconBg,
                    width: 56,
                    height: 56,
                    boxShadow: `0 4px 14px ${cap.iconBg}55`,
                  }}
                >
                  {cap.icon}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color: cap.color }}>
                  {cap.title}
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <List dense disablePadding>
                {cap.bullets.map((b) => (
                  <BulletItem
                    key={b}
                    text={b}
                    icon={<CheckCircleIcon sx={{ fontSize: 16, color: cap.iconBg }} />}
                  />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Fragment>
);

// ─── Section 3 · Insight Cards ───────────────────────────────────────────────

const insightCards = [
  {
    title: "Units Overview",
    icon: <ApartmentIcon />,
    color: "#1565c0",
    bg: "#e3f2fd",
    metrics: ["Available units ready to sell", "Reserved (active reservations)", "Sold (purchased)", "Blocked by admin"],
  },
  {
    title: "Reservations",
    icon: <AssignmentIcon />,
    color: "#2e7d32",
    bg: "#e8f5e9",
    metrics: ["Pending approval (awaiting review)", "Confirmed (fully approved)", "Purchased (payment complete)", "Cancelled"],
  },
  {
    title: "Revenue Signals",
    icon: <AttachMoneyIcon />,
    color: "#e65100",
    bg: "#fff3e0",
    metrics: ["Total value of confirmed reservations", "Revenue from purchased units", "Average unit price per project", "Installment vs cash split"],
  },
  {
    title: "Field Activity",
    icon: <TimelineIcon />,
    color: "#00695c",
    bg: "#e0f2f1",
    metrics: ["Sessions logged today", "Sessions this week", "Leads captured by agents", "Orientation sessions completed"],
  },
  {
    title: "Approval Progress",
    icon: <GradingIcon />,
    color: "#6a1b9a",
    bg: "#f3e5f5",
    metrics: ["Reservations awaiting your approval", "Fully approved this month", "Reservations with pending documents", "Finance approvals outstanding"],
  },
];

const InsightCards = () => (
  <Fragment>
    <SectionLabel variant="h4">What You Can Know at a Glance</SectionLabel>
    <Grid container spacing={2.5}>
      {insightCards.map((card) => (
        <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
          <Card
            elevation={0}
            sx={{
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 3,
              height: "100%",
              bgcolor: card.bg,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: card.color, width: 40, height: 40 }}>
                  {card.icon}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: card.color, lineHeight: 1.2 }}>
                  {card.title}
                </Typography>
              </Box>
              <List dense disablePadding>
                {card.metrics.map((m) => (
                  <ListItem key={m} sx={{ px: 0, py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 22 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: card.color,
                          mt: 0.4,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" sx={{ lineHeight: 1.45, display: "block" }}>
                          {m}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Fragment>
);

// ─── Section 4 · Workflow Steppers ──────────────────────────────────────────

const WorkflowStepper = ({ steps }) => (
  <Stepper orientation="vertical" sx={{ mt: 1 }}>
    {steps.map((step, i) => (
      <Step key={i} active>
        <StepLabel
          StepIconProps={{
            sx: {
              "&.MuiStepIcon-root": { color: "primary.main" },
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {step.label}
          </Typography>
        </StepLabel>
        <StepContent>
          <Typography variant="body2" color="text.secondary" sx={{ pb: 1, lineHeight: 1.6 }}>
            {step.description}
          </Typography>
          {step.chip && (
            <Chip
              label={step.chip}
              size="small"
              sx={{ mb: 1, fontWeight: 600, fontSize: "0.72rem" }}
              color={step.chipColor || "default"}
            />
          )}
        </StepContent>
      </Step>
    ))}
  </Stepper>
);

const workflows = [
  {
    id: "wf1",
    title: "Workflow 1: Complete a Cash Sale (PROD)",
    subtitle: "From available unit to purchased — cash payment, single buyer",
    icon: <AttachMoneyIcon />,
    color: "#1565c0",
    bg: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    steps: [
      {
        label: "Verify Unit Availability",
        description: 'Go to Units → Find or create the unit (Clinic / Shop / Office). Confirm status shows "Available" — if it is Blocked or Reserved, resolve that first.',
        chip: "Units Module",
        chipColor: "primary",
      },
      {
        label: "Find or Create the Client",
        description: "Go to Users → Search for the client by name or phone. If they do not exist yet, click \"New User\" and fill in their details. Note their User ID for the next step.",
        chip: "Users Module",
        chipColor: "secondary",
      },
      {
        label: "Create the Reservation",
        description: 'Go to Reservations → Click "New Reservation" → Select the unit from the list → Set Payment Method to Cash.',
        chip: "Cash",
        chipColor: "success",
      },
      {
        label: "Add Client as Owner",
        description: "Inside the Reservation Detail → open the Clients tab → Click \"Add Client\" → Search for the client → Set Ownership % to 100. Save.",
      },
      {
        label: "Upload Reservation Form",
        description: "In the Documents tab → upload a photo or scan of the signed reservation form. This is required before admins can approve.",
        chip: "Documents Tab",
      },
      {
        label: "Admin 1 Approves",
        description: "The first admin in the chain opens the reservation, reviews the details, and clicks \"Approve Reservation\". Status moves to Pending (Admin 2).",
      },
      {
        label: "Admin 2 Approves → Contract Email Sent",
        description: 'Admin 2 reviews and clicks "Approve Reservation". Status changes to Confirmed. An automatic email is sent to the client with the contract PDF attached.',
        chip: "Email Auto-Sent",
        chipColor: "success",
      },
      {
        label: "Upload Down Payment Cheque",
        description: "Scan and upload the down payment cheque image in the Documents tab for the finance record.",
      },
      {
        label: "Mark as Sold",
        description: 'Once all payments are received → click "Submit Documents & Mark as Sold" → Reservation status becomes Purchased. Unit status updates to Sold.',
        chip: "Purchased",
        chipColor: "success",
      },
    ],
  },
  {
    id: "wf2",
    title: "Workflow 2: Complete an Installment Sale (PROD)",
    subtitle: "Same flow as cash with extra Finance Admin steps for payment schedule",
    icon: <CalendarTodayIcon />,
    color: "#2e7d32",
    bg: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    steps: [
      {
        label: "Steps 1–4: Same as Cash Sale",
        description: "Verify unit, find/create client, create reservation, add client as owner — identical to the cash workflow. The only difference begins at payment method selection.",
        chip: "See Workflow 1",
      },
      {
        label: "Select Payment Method: Installment",
        description: "When creating the reservation set Payment Method to Installment. This triggers the requirement for the Finance Admin to upload payment schedule documents.",
        chip: "Installment",
        chipColor: "warning",
      },
      {
        label: "Finance Admin Uploads Schedules",
        description: "Finance Admin opens the Documents tab → uploads the Installment Schedule JSON and the Maintenance Plan JSON. These files are mandatory before any approval is granted.",
        chip: "Finance Role Required",
        chipColor: "error",
      },
      {
        label: "Admin 1 Approves",
        description: "Operation Admin reviews unit, client, and ownership details and approves.",
      },
      {
        label: "Finance Admin Approves → Email Sent",
        description: "Finance Admin must approve last. The system verifies schedule documents are present. On approval, email is sent with Contract PDF + Payment Schedule PDF attached.",
        chip: "Two PDFs Sent",
        chipColor: "success",
      },
      {
        label: "Upload Down Payment Cheque",
        description: "Upload the initial down payment cheque scan to the Documents tab.",
      },
      {
        label: "Mark as Sold on Final Payment",
        description: "After all installments are received and final payment is confirmed, click \"Mark as Sold\" to close the reservation as Purchased.",
        chip: "Purchased",
        chipColor: "success",
      },
    ],
  },
  {
    id: "wf3",
    title: "Workflow 3: Co-Ownership — Two Buyers Sharing a Unit",
    subtitle: "Split ownership between multiple clients with configurable percentages",
    icon: <GroupsIcon />,
    color: "#6a1b9a",
    bg: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
    steps: [
      {
        label: "Create the Reservation Normally",
        description: "Create a new reservation for the unit following the standard steps. You do not need to add any client yet.",
      },
      {
        label: "Add Buyer A with Ownership %",
        description: 'In Reservation Detail → Clients tab → Add Buyer A → Set Ownership % to 60 (or any portion).',
        chip: "Buyer A — 60%",
        chipColor: "primary",
      },
      {
        label: "Add Buyer B with Ownership %",
        description: 'Add Buyer B → Set Ownership % to 40.',
        chip: "Buyer B — 40%",
        chipColor: "secondary",
      },
      {
        label: "Adjust Percentages Any Time",
        description: "Ownership percentages can be edited freely at any point before approval. The validation check (total must equal 100%) only runs at approval time.",
        chip: "Validation at Approval",
        chipColor: "warning",
      },
      {
        label: "System Validates on Approval",
        description: "When any admin clicks Approve, the system checks that all ownership percentages sum to exactly 100%. If they do not, approval is blocked and an error is shown.",
      },
      {
        label: "Both Buyers Appear in Contract",
        description: "The generated PDF contract lists both Buyer A and Buyer B under the \"Second Party\" section, each with their name and ownership percentage.",
        chip: "PDF Auto-Generated",
        chipColor: "success",
      },
    ],
  },
  {
    id: "wf4",
    title: "Workflow 4: Customize a Contract for a Specific Client",
    subtitle: "Edit contract text for one reservation without changing the global template",
    icon: <EditIcon />,
    color: "#e65100",
    bg: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
    steps: [
      {
        label: "Open the Contract Editor",
        description: 'Open the reservation → Documents tab → Click "Edit Contract HTML". A visual text editor loads with the contract already filled in with real client data — no coding needed.',
        chip: "Visual Editor",
        chipColor: "primary",
      },
      {
        label: "Real Data Already Filled In",
        description: "Client name, unit number, price, dates, and ownership details are all pre-populated from the database. You are editing the rendered version, not a blank template.",
      },
      {
        label: "Make Your Edits",
        description: "Click anywhere in the text area to edit. You can change clauses, add custom paragraphs, adjust formatting, or correct any detail for this specific client.",
      },
      {
        label: "Save the Override",
        description: 'Click "Save". The system stores your edited HTML as a per-reservation override. The global template in the Template Manager is completely unchanged.',
        chip: "This Reservation Only",
        chipColor: "warning",
      },
      {
        label: "Regenerate the PDF",
        description: 'Click "Regenerate Contract PDF". A new PDF is generated from your edited HTML. The old PDF is replaced. The contract is now ready for sending.',
        chip: "PDF Updated",
        chipColor: "success",
      },
      {
        label: "Global Template Unaffected",
        description: "Any future reservations continue to use the global template. Only this specific reservation uses your custom version. You can reset the override at any time.",
      },
    ],
  },
  {
    id: "wf5",
    title: "Workflow 5: NPM Hotel Apartment Sale",
    subtitle: "Investment units with Gold/Silver packages, ROI projections, and 3-admin approval",
    icon: <HotelIcon />,
    color: "#00695c",
    bg: "linear-gradient(135deg, #e0f2f1, #b2dfdb)",
    steps: [
      {
        label: "Create Reservation for Hotel Apartment",
        description: 'Go to Reservations → New Reservation → Select the Hotel Apartment unit → Choose Package: Gold or Silver.',
        chip: "NPM Company",
        chipColor: "primary",
      },
      {
        label: "Select Payment Method & Nationality",
        description: "Set Payment Method (Cash or Installment) and select the client's Nationality (Egyptian or Non-Egyptian). These two fields, combined with the package, determine the contract template.",
        chip: "4 Variables Drive Template",
        chipColor: "warning",
      },
      {
        label: "System Selects the Contract Template",
        description: "Based on Package × Payment × Nationality, one of 8 templates is automatically selected (e.g. contract_hotel_gold_cash_egyptian). No manual selection needed.",
        chip: "Auto-Selected",
        chipColor: "success",
      },
      {
        label: "Add Client(s) with Ownership %",
        description: "Add one or more clients with ownership percentages. Egyptian and Non-Egyptian clients can co-own but the primary buyer's nationality drives the template selection.",
      },
      {
        label: "Upload Bank Account Details",
        description: "In Documents tab → upload the client's bank account information (required for investment returns / ROI distribution).",
        chip: "Investment Returns",
      },
      {
        label: "3 Admins Must Approve",
        description: "NPM reservations require approval from 3 admins sequentially. If any admin attaches a feedback note, a 4th approval is automatically required.",
        chip: "3–4 Approvals",
        chipColor: "error",
      },
      {
        label: "Email Sent with Full Investment Package",
        description: "On final approval, email is sent with the hotel contract PDF, ROI projections, and maintenance plan all attached.",
        chip: "Email Auto-Sent",
        chipColor: "success",
      },
    ],
  },
  {
    id: "wf6",
    title: "Workflow 6: Bulk Import Clients from Excel",
    subtitle: "Create hundreds of client accounts in one upload with duplicate detection",
    icon: <UploadFileIcon />,
    color: "#4527a0",
    bg: "linear-gradient(135deg, #ede7f6, #d1c4e9)",
    steps: [
      {
        label: "Go to Users → Upload Excel",
        description: "In the Users module, click \"Upload Excel\" to open the import dialog.",
        chip: "Users Module",
        chipColor: "primary",
      },
      {
        label: "Prepare Your Excel File",
        description: "Prepare an Excel (.xlsx) file with columns: Name, Email, Phone, Password (optional). Each row is one client. No specific template required — just those column headers.",
        chip: "Name / Email / Phone / Password",
      },
      {
        label: "Upload the File",
        description: "Select your file and upload it. The system reads all rows instantly.",
      },
      {
        label: "Duplicate Detection Runs Automatically",
        description: "The system checks every row against existing clients using Name + Email + Phone combined. Any row that matches an existing client is automatically skipped and flagged in the report.",
        chip: "Auto Deduplication",
        chipColor: "warning",
      },
      {
        label: "New Clients Created",
        description: "All non-duplicate rows are created as client accounts. You receive a summary showing how many were created and how many were skipped.",
        chip: "Summary Report",
        chipColor: "success",
      },
      {
        label: "Clients Ready to Use",
        description: "Newly imported clients appear immediately in the Users list and can be added to any reservation as buyers or co-owners.",
      },
    ],
  },
];

const WorkflowExamples = () => (
  <Fragment>
    <SectionLabel variant="h4">Workflow Examples</SectionLabel>
    <Grid container spacing={3}>
      {workflows.map((wf) => (
        <Grid item xs={12} md={6} key={wf.id}>
          <Accordion
            defaultExpanded={wf.id === "wf1"}
            elevation={0}
            sx={{
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: "12px !important",
              overflow: "hidden",
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
              sx={{
                background: wf.bg,
                borderRadius: 0,
                minHeight: 72,
                "& .MuiAccordionSummary-content": { my: 1.5 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: wf.color, width: 44, height: 44 }}>{wf.icon}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: wf.color, lineHeight: 1.25 }}>
                    {wf.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                    {wf.subtitle}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2.5 }}>
              <WorkflowStepper steps={wf.steps} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      ))}
    </Grid>
  </Fragment>
);

// ─── Section 5 · Contract Template System ───────────────────────────────────

const ContractTemplateSystem = () => {
  const theme = useTheme();
  const prodTemplates = [
    { type: "Clinic", cash: "contract_clinic_cash", installment: "contract_clinic_installment" },
    { type: "Shop", cash: "contract_shop_cash", installment: "contract_shop_installment" },
    { type: "Office", cash: "contract_office_cash", installment: "contract_office_installment" },
  ];

  const npmTemplates = [
    { package: "Gold", payment: "Cash", nationality: "Egyptian", key: "contract_hotel_gold_cash_egyptian" },
    { package: "Gold", payment: "Cash", nationality: "Non-Egyptian", key: "contract_hotel_gold_cash_nonegyptian" },
    { package: "Gold", payment: "Installment", nationality: "Egyptian", key: "contract_hotel_gold_installment_egyptian" },
    { package: "Gold", payment: "Installment", nationality: "Non-Egyptian", key: "contract_hotel_gold_installment_nonegyptian" },
    { package: "Silver", payment: "Cash", nationality: "Egyptian", key: "contract_hotel_silver_cash_egyptian" },
    { package: "Silver", payment: "Cash", nationality: "Non-Egyptian", key: "contract_hotel_silver_cash_nonegyptian" },
    { package: "Silver", payment: "Installment", nationality: "Egyptian", key: "contract_hotel_silver_installment_egyptian" },
    { package: "Silver", payment: "Installment", nationality: "Non-Egyptian", key: "contract_hotel_silver_installment_nonegyptian" },
  ];

  const cellSx = {
    fontFamily: "monospace",
    fontSize: "0.78rem",
    bgcolor: "#f1f8e9",
    color: "#33691e",
    fontWeight: 600,
    border: "1px solid #dcedc8",
  };

  return (
    <Fragment>
      <SectionLabel variant="h4">Contract Template System</SectionLabel>

      {/* How selection works */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: 3,
              bgcolor: "#fff8e1",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#f57f17", width: 40, height: 40 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#f57f17" }}>
                PROD — 6 Templates
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Template is selected by: <strong>Unit Type × Payment Method</strong>
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Unit Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Cash</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Installment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prodTemplates.map((row) => (
                  <TableRow key={row.type}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.type}</TableCell>
                    <TableCell sx={cellSx}>{row.cash}</TableCell>
                    <TableCell sx={cellSx}>{row.installment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: 3,
              bgcolor: "#e0f2f1",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Avatar sx={{ bgcolor: "#00695c", width: 40, height: 40 }}>
                <HotelIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#00695c" }}>
                NPM — 8 Templates
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Template is selected by: <strong>Package × Payment × Nationality</strong>
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Nationality</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Template Key</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {npmTemplates.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <Chip
                        label={row.package}
                        size="small"
                        icon={<StarIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          bgcolor: row.package === "Gold" ? "#fff8e1" : "#eceff1",
                          color: row.package === "Gold" ? "#f9a825" : "#607d8b",
                          borderColor: row.package === "Gold" ? "#f9a825" : "#90a4ae",
                          border: "1px solid",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.payment}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          bgcolor: row.payment === "Cash" ? "#e8f5e9" : "#fff3e0",
                          color: row.payment === "Cash" ? "#2e7d32" : "#e65100",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.78rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PublicIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        {row.nationality}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, bgcolor: "#e0f7fa", color: "#006064", borderColor: "#b2ebf2" }}>
                      {row.key}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Global vs per-reservation */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: "2px solid #1565c0",
              borderRadius: 3,
              bgcolor: "#e3f2fd",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: "#1565c0", width: 36, height: 36 }}>
                  <TableChartIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1565c0" }}>
                  Global Template Edit
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Editing a template in the <strong>Template Manager</strong> affects <strong>all future reservations</strong> that use that template. The change is stored in the database and becomes the new default for all contracts of that type. Use this to update standard clauses, pricing terms, or legal language globally.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: "2px solid #e65100",
              borderRadius: 3,
              bgcolor: "#fff3e0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: "#e65100", width: 36, height: 36 }}>
                  <EditIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#e65100" }}>
                  Per-Reservation Override
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Editing contract HTML inside a <strong>specific reservation</strong> creates an override stored only for that reservation. The global template is completely untouched. When regenerating the PDF, the system uses the override if it exists, otherwise falls back to the global template. Overrides can be cleared to revert.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

// ─── Section 6 · Quick Reference Table ──────────────────────────────────────

const quickRefRows = [
  { task: "Create a new unit / project", where: "Units Module → New Unit / New Project", who: "Operation Admin" },
  { task: "Create a new reservation", where: "Reservations → New Reservation", who: "Operation Admin" },
  { task: "Approve a reservation", where: "Reservations → Open Reservation → Approve", who: "Assigned Admin (per chain)" },
  { task: "Upload down payment cheque", where: "Reservation Detail → Documents Tab", who: "Operation / Finance Admin" },
  { task: "Edit the global contract template", where: "Template Manager → Select Template → Edit", who: "Operation Admin" },
  { task: "Customize contract for one client", where: "Reservation Detail → Documents → Edit Contract HTML", who: "Operation Admin" },
  { task: "Add a single client", where: "Users → New User", who: "Any Admin" },
  { task: "Bulk import clients from Excel", where: "Users → Upload Excel", who: "Any Admin" },
  { task: "Assign a broker to an admin", where: "Admins → Select Admin → Brokers Tab", who: "Super Admin" },
  { task: "View field session logs", where: "Activity / Sessions Module", who: "Operation / Customer Support" },
  { task: "Mark reservation as Sold", where: "Reservation Detail → Submit Documents & Mark as Sold", who: "Finance Admin" },
];

const QuickReference = () => (
  <Fragment>
    <SectionLabel variant="h4">Quick Reference</SectionLabel>
    <Paper
      elevation={0}
      sx={{
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#1a237e" }}>
            <TableCell sx={{ color: "#fff", fontWeight: 800, fontSize: "0.85rem", width: "32%" }}>
              Task
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 800, fontSize: "0.85rem", width: "38%" }}>
              Where to Go
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 800, fontSize: "0.85rem", width: "30%" }}>
              Who Can Do It
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quickRefRows.map((row, i) => (
            <TableRow
              key={row.task}
              sx={{
                bgcolor: i % 2 === 0 ? "#fff" : "#f8f9fa",
                "&:hover": { bgcolor: "#e8eaf6" },
                transition: "background-color 0.15s",
              }}
            >
              <TableCell sx={{ fontWeight: 600, fontSize: "0.82rem", py: 1.5 }}>
                {row.task}
              </TableCell>
              <TableCell sx={{ fontSize: "0.82rem", py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#1565c0",
                      flexShrink: 0,
                    }}
                  />
                  {row.where}
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Chip
                  label={row.who}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    bgcolor: "#e3f2fd",
                    color: "#1565c0",
                    border: "1px solid #bbdefb",
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </Fragment>
);

// ─── Root Export ─────────────────────────────────────────────────────────────

export default function Analytics() {
  return (
    <ContentBox>
      <HeroBanner />
      <EnvironmentsSection />
      <UserRolesSection />
      <CapabilityCards />
      <InsightCards />
      <WorkflowExamples />
      <ContractTemplateSystem />
      <QuickReference />
      <Box sx={{ mt: 6, mb: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.disabled">
          Negma Real Estate Sales Management Platform · Admin Panel Reference Guide
        </Typography>
      </Box>
    </ContentBox>
  );
}
