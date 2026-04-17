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
            label="Najma Properties (PROD)"
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
            label="Najma Hotel Properties (NPM)"
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
                    Najma Properties
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
                    Najma Hotel Properties
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
                    admin.najma.khalidelewa.com
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
                    najma.khalidelewa.com
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
      "Add real estate projects and individual units — Clinic, Shop, Office, or Hotel Apartment",
      "Upload multiple photos per unit so sales agents can present them to clients",
      "Set unit price, area, floor, and other details",
      "Block a unit temporarily to prevent it from being reserved",
      "Track each unit's status: Available, Reserved, or Sold",
      "Search and filter units by type, status, or project at any time",
    ],
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    title: "Handle Reservations",
    color: "#2e7d32",
    bg: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    iconBg: "#2e7d32",
    bullets: [
      "Create a reservation for any available unit in seconds",
      "Add multiple buyers to share ownership, each with their own percentage",
      "Choose whether the client pays in full (Cash) or in installments",
      "Upload the signed reservation form and any required payment documents",
      "Send the reservation through the admin approval steps",
      "Mark the reservation as Confirmed and later as Sold once complete",
    ],
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
    title: "Generate Contracts",
    color: "#e65100",
    bg: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    iconBg: "#e65100",
    bullets: [
      "Automatically generate a ready-to-send Arabic contract PDF for every reservation",
      "Client name, unit details, price, and payment terms are filled in automatically",
      "The right contract layout is chosen automatically based on unit type and payment method",
      "Edit the contract text visually before generating the PDF — no technical skills needed",
      "Customizing a contract for one client does not affect any other contracts",
      "The contract is emailed to the client automatically when the reservation is approved",
    ],
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: "Manage Clients",
    color: "#6a1b9a",
    bg: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    iconBg: "#6a1b9a",
    bullets: [
      "Create client profiles with their personal and contact details",
      "Import hundreds of clients at once from an Excel file",
      "The system automatically skips duplicate entries during import",
      "Add any client as a buyer or co-owner on a reservation",
      "Link clients to brokers for tracking who introduced them",
      "Egyptian and non-Egyptian clients are handled with the correct contract type",
    ],
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    title: "Track Sales Activity",
    color: "#00695c",
    bg: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
    iconBg: "#00695c",
    bullets: [
      "See all client meetings and orientation sessions logged by your sales team",
      "View notes, outcome, and location for every session",
      "Monitor how many leads each agent has generated",
      "Filter activity by agent name, date, or meeting result",
      "Track today's sessions and this week's total at a glance",
      "Know which leads are still being followed up and which have converted",
    ],
  },
  {
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
    title: "Admin & Access Control",
    color: "#b71c1c",
    bg: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
    iconBg: "#b71c1c",
    bullets: [
      "Create team member accounts and assign each one a specific role",
      "Each role only sees and can do what they are allowed — nothing more",
      "Finance staff handle payment schedules and have their own approval step",
      "Reservations go through multiple admin approvals before being confirmed",
      "Assign brokers to supervisors so the team hierarchy is always clear",
      "Every action on a reservation is recorded so nothing is lost",
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
        description: "Go to Users → Search for the client by name or phone. If they do not exist yet, click \"New User\" and fill in their details.",
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
        label: "Finance Admin Uploads Payment Documents",
        description: "The Finance Admin opens the Documents tab and uploads the payment schedule and maintenance plan files. These are required before any approval can be given.",
        chip: "Finance Role Required",
        chipColor: "error",
      },
      {
        label: "Admin 1 Approves",
        description: "Operation Admin reviews unit, client, and ownership details and approves.",
      },
      {
        label: "Finance Admin Approves → Email Sent",
        description: "The Finance Admin does the final approval. The system checks that the payment documents are in place, then automatically emails the client with the contract and payment schedule attached.",
        chip: "Two Documents Sent",
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
        description: "You can freely update each buyer's percentage at any point before the reservation is approved. No restrictions while you are still setting it up.",
        chip: "Checked at Approval",
        chipColor: "warning",
      },
      {
        label: "System Checks on Approval",
        description: "When an admin clicks Approve, the system verifies that all buyer percentages add up to 100%. If they do not, the approval is blocked and you are shown a message to fix it first.",
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
        label: "Everything Is Already Filled In",
        description: "The client's name, unit details, price, dates, and ownership percentages are all pre-filled. You are reading the final contract, not a blank form — just find what you want to change.",
      },
      {
        label: "Make Your Edits",
        description: "Click anywhere in the contract to start editing. Change any sentence, add a paragraph, or correct a detail. It works like editing a Word document.",
      },
      {
        label: "Save — Only This Client Is Affected",
        description: 'Click "Save". Your changes apply only to this reservation. Every other client continues to receive the standard contract without any change.',
        chip: "This Client Only",
        chipColor: "warning",
      },
      {
        label: "Generate the Updated PDF",
        description: 'Click "Regenerate Contract PDF". A fresh PDF is created with your edits applied. The previous version is replaced and the contract is ready to send.',
        chip: "PDF Updated",
        chipColor: "success",
      },
      {
        label: "Revert Any Time",
        description: "If you change your mind, you can reset this reservation back to the standard contract at any time. No permanent changes are ever made to the standard layout.",
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
        description: "Set whether the client pays in full (Cash) or in installments, and select whether the client is Egyptian or Non-Egyptian. Combined with the package, these choices determine which contract is used.",
        chip: "Automatic Contract Selection",
        chipColor: "warning",
      },
      {
        label: "System Picks the Right Contract",
        description: "Based on the package, payment method, and nationality, the correct contract is automatically selected and filled in. Nothing needs to be chosen manually.",
        chip: "Auto-Selected",
        chipColor: "success",
      },
      {
        label: "Add Client(s) with Ownership %",
        description: "Add one or more clients with ownership percentages. Egyptian and Non-Egyptian clients can co-own but the primary buyer's nationality drives the template selection.",
      },
      {
        label: "Upload Bank Account Details",
        description: "In the Documents tab, upload the client's bank account information. This is required so the client can receive their share of the hotel's returns.",
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
        description: "On final approval, the client automatically receives an email with the signed contract, profit projections, and maintenance plan all attached.",
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
        description: "Prepare a standard Excel file with your clients' names, emails, and phone numbers. Each row is one client. A password column is optional.",
        chip: "Name · Email · Phone",
      },
      {
        label: "Upload the File",
        description: "Select your file and upload it. The system reads all rows instantly.",
      },
      {
        label: "Duplicates Are Caught Automatically",
        description: "The system compares every row against existing clients. Any client that already exists is automatically skipped — you will see a clear report of who was added and who was skipped.",
        chip: "No Manual Checking",
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
  const prodTemplates = [
    { type: "Clinic", cash: "Clinic — Cash Payment", installment: "Clinic — Installment Payment" },
    { type: "Shop", cash: "Shop — Cash Payment", installment: "Shop — Installment Payment" },
    { type: "Office", cash: "Office — Cash Payment", installment: "Office — Installment Payment" },
  ];

  const npmTemplates = [
    { package: "Gold", payment: "Cash", nationality: "Egyptian", label: "Gold Package · Cash · Egyptian" },
    { package: "Gold", payment: "Cash", nationality: "Non-Egyptian", label: "Gold Package · Cash · Non-Egyptian" },
    { package: "Gold", payment: "Installment", nationality: "Egyptian", label: "Gold Package · Installment · Egyptian" },
    { package: "Gold", payment: "Installment", nationality: "Non-Egyptian", label: "Gold Package · Installment · Non-Egyptian" },
    { package: "Silver", payment: "Cash", nationality: "Egyptian", label: "Silver Package · Cash · Egyptian" },
    { package: "Silver", payment: "Cash", nationality: "Non-Egyptian", label: "Silver Package · Cash · Non-Egyptian" },
    { package: "Silver", payment: "Installment", nationality: "Egyptian", label: "Silver Package · Installment · Egyptian" },
    { package: "Silver", payment: "Installment", nationality: "Non-Egyptian", label: "Silver Package · Installment · Non-Egyptian" },
  ];

  return (
    <Fragment>
      <SectionLabel variant="h4">How Contracts Are Generated</SectionLabel>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* PROD */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ bgcolor: "#f57f17", width: 40, height: 40 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#f57f17" }}>
                  Najma Properties (PROD)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  6 contract layouts — one per unit type and payment method
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The system picks the right contract automatically based on the <strong>unit type</strong> and <strong>payment method</strong> you chose when creating the reservation.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Unit Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Cash Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#fff3e0" }}>Installments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prodTemplates.map((row) => (
                  <TableRow key={row.type}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.type}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", color: "#33691e" }}>✓ Ready</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", color: "#33691e" }}>✓ Ready</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* NPM */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ bgcolor: "#00695c", width: 40, height: 40 }}>
                <HotelIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#00695c" }}>
                  Najma Hotel Properties (NPM)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  8 contract layouts — one per package, payment, and nationality
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The system picks the right contract automatically based on the <strong>package</strong> (Gold or Silver), <strong>payment method</strong>, and the <strong>client's nationality</strong>.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#b2dfdb" }}>Nationality</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {npmTemplates.map((row) => (
                  <TableRow key={row.label}>
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
                          border: "1px solid",
                          borderColor: row.package === "Gold" ? "#f9a825" : "#90a4ae",
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
                  Editing the Standard Contract
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Changes made in the <strong>Template Manager</strong> apply to <strong>all future reservations</strong> of that type. Use this when you want to update standard clauses, terms, or legal language for everyone going forward.
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
                  Editing One Client's Contract
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Editing the contract inside a <strong>specific reservation</strong> only affects that one client. All other reservations continue to use the standard contract. You can revert back to the standard at any time.
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
  { task: "Add a new unit or project", where: "Units → New Unit or New Project", who: "Operation Admin" },
  { task: "Create a new reservation", where: "Reservations → New Reservation", who: "Operation Admin" },
  { task: "Approve a reservation", where: "Open the reservation → click Approve", who: "Assigned Admin" },
  { task: "Upload payment documents", where: "Open the reservation → Documents tab", who: "Operation / Finance Admin" },
  { task: "Edit the standard contract for all clients", where: "Template Manager → select a template → Edit", who: "Operation Admin" },
  { task: "Edit a contract for one specific client", where: "Open the reservation → Documents → Edit Contract", who: "Operation Admin" },
  { task: "Add a new client", where: "Users → New User", who: "Any Admin" },
  { task: "Import many clients from Excel", where: "Users → Upload Excel", who: "Any Admin" },
  { task: "Assign a broker to a supervisor", where: "Admins → select admin → Brokers tab", who: "Super Admin" },
  { task: "View sales team activity", where: "Activity / Sessions section", who: "Operation / Customer Support" },
  { task: "Mark a reservation as Sold", where: "Open the reservation → Mark as Sold", who: "Finance Admin" },
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

export default function Home() {
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
          Najma Real Estate Sales Management Platform · Admin Panel Reference Guide
        </Typography>
      </Box>
    </ContentBox>
  );
}
