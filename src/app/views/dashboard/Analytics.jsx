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

// ─── Styled Helpers ────────────────────────────────────────────────────────────

const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
  color: theme.palette.primary.main,
  borderBottom: `3px solid ${theme.palette.primary.main}`,
  paddingBottom: theme.spacing(1),
}));

const ConstraintItem = ({ text }) => (
  <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
    <ListItemIcon sx={{ minWidth: 32, mt: 0.3 }}>
      <WarningAmberIcon color="warning" fontSize="small" />
    </ListItemIcon>
    <ListItemText primary={<Typography variant="body2">{text}</Typography>} />
  </ListItem>
);

const BulletItem = ({ text, icon }) => (
  <ListItem alignItems="flex-start" sx={{ py: 0.3 }}>
    <ListItemIcon sx={{ minWidth: 30, mt: 0.3 }}>
      {icon ?? <CheckCircleIcon color="success" fontSize="small" />}
    </ListItemIcon>
    <ListItemText primary={<Typography variant="body2">{text}</Typography>} />
  </ListItem>
);

const InfoBox = ({ children, color = "info" }) => {
  const theme = useTheme();
  const bg = {
    info: theme.palette.info.light + "22",
    warning: theme.palette.warning.light + "22",
    success: theme.palette.success.light + "22",
  }[color];
  const border = {
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  }[color];
  return (
    <Box
      sx={{
        borderLeft: `4px solid ${border}`,
        background: bg,
        px: 2,
        py: 1.5,
        borderRadius: 1,
        mb: 1.5,
      }}
    >
      {children}
    </Box>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Analytics = () => {
  const theme = useTheme();

  return (
    <Fragment>
      <ContentBox>
        {/* ── HERO ── */}
        <Paper
          elevation={3}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
            color: "#fff",
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            نظام إدارة المبيعات العقارية
          </Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9 }}>
            Real Estate Sales Management System — Admin Guide
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label="Negma Properties (PROD)" icon={<ApartmentIcon />} sx={{ background: "#fff3", color: "#fff" }} />
            <Chip label="Negma Hotel Properties (NPM)" icon={<HotelIcon />} sx={{ background: "#fff3", color: "#fff" }} />
            <Chip label="Admin Panel" sx={{ background: "#fff3", color: "#fff" }} />
          </Box>
        </Paper>

        {/* ── WHAT IS THIS SYSTEM ── */}
        <SectionTitle variant="h5">What Is This System?</SectionTitle>
        <Typography variant="body1" paragraph>
          This is the <strong>central operations platform</strong> for managing real estate sales across two companies.
          It covers the entire sales lifecycle — from listing properties and capturing leads, all the way through reservations,
          legal contract generation, payment tracking, and final purchase completion.
          All three components (admin panel, backend API, and client app) work together as one integrated system.
        </Typography>
        <Typography variant="body1" paragraph>
          The system is designed so that <strong>non-technical staff</strong> can run day-to-day operations entirely through
          this interface without needing any developer involvement.
        </Typography>

        {/* ── TWO COMPANIES ── */}
        <SectionTitle variant="h5">The Two Companies</SectionTitle>
        <Grid container spacing={3} sx={{ mb: 3 }}>

          {/* Negma Properties */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: "100%", borderTop: `4px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}><ApartmentIcon /></Avatar>
                  <Typography variant="h6" fontWeight={700}>Negma Properties</Typography>
                  <Chip label="PROD" color="primary" size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Environment key: <code>negma</code> · API: <code>clinic-api.khalidelewa.com</code>
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" paragraph>
                  Manages commercial and medical real estate units including:
                </Typography>
                <List dense disablePadding>
                  <BulletItem text="Clinics — Medical clinic units for doctors and healthcare providers" />
                  <BulletItem text="Shops — Retail commercial spaces" />
                  <BulletItem text="Offices — Corporate office units" />
                </List>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={600}>Approval Workflow</Typography>
                <Typography variant="body2">
                  Each reservation requires <strong>2 admin approvals</strong> before it is confirmed.
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={600}>Contract Templates (5)</Typography>
                <List dense disablePadding>
                  <BulletItem text="contract_clinic — Medical clinic contract" />
                  <BulletItem text="contract_shop — Retail shop contract" />
                  <BulletItem text="contract_office — Office unit contract" />
                  <BulletItem text="reservation_form — Reservation acknowledgement form" />
                  <BulletItem text="payment_schedule — Payment installment schedule" />
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Negma Hotel Properties */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: "100%", borderTop: `4px solid ${theme.palette.secondary.main}` }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}><HotelIcon /></Avatar>
                  <Typography variant="h6" fontWeight={700}>Negma Hotel Properties</Typography>
                  <Chip label="NPM" color="secondary" size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Environment key: <code>npm</code> · API: <code>npm-api.khalidelewa.com</code>
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" paragraph>
                  Manages hotel apartment investments. Each unit is sold to investors who earn returns
                  from hotel operations. This environment adds:
                </Typography>
                <List dense disablePadding>
                  <BulletItem text="Hotel Apartments — Investment units in a hotel property" />
                  <BulletItem text="Package Types — Golden (premium) or Silver (standard)" />
                  <BulletItem text="Payment Methods — Cash or Installment" />
                  <BulletItem text="Bank Details — Bank account, branch, SWIFT code per reservation" />
                  <BulletItem text="Profit/ROI Tables — JSON-formatted return-on-investment projections" />
                  <BulletItem text="Maintenance Plan — Attached to each reservation" />
                </List>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={600}>Approval Workflow</Typography>
                <Typography variant="body2">
                  Each reservation requires <strong>3 admin approvals</strong> (4 if a special feedback note is attached).
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={600}>Contract Templates (8)</Typography>
                <Typography variant="body2">
                  One template per combination of: <em>Package (Gold/Silver) × Payment (Cash/Installment) × Nationality (Egyptian/Foreign)</em>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── THREE APPS ── */}
        <SectionTitle variant="h5">The Three Application Components</SectionTitle>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, height: "100%" }}>
              <Box display="flex" gap={1} alignItems="center" mb={1}>
                <AdminPanelSettingsIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Admin Panel</Typography>
              </Box>
              <Typography variant="body2">
                This application. Used by internal staff to manage all operations: units, projects, reservations,
                users, brokers, contracts, and templates. Accessible only with an admin account.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, height: "100%" }}>
              <Box display="flex" gap={1} alignItems="center" mb={1}>
                <BusinessIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Backend API</Typography>
              </Box>
              <Typography variant="body2">
                The engine behind both the admin panel and the client app. Handles all data storage,
                business logic, PDF generation, approval workflows, and document management. Runs
                separately as a server — staff do not interact with it directly.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2.5, height: "100%" }}>
              <Box display="flex" gap={1} alignItems="center" mb={1}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Client App</Typography>
              </Box>
              <Typography variant="body2">
                A separate web or mobile app used by sales agents in the field to run orientation
                sessions, log meetings, capture leads, track session locations, and collect feedback
                from potential buyers in real time.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ── USER ROLES ── */}
        <SectionTitle variant="h5">User Roles &amp; Permissions</SectionTitle>
        <Typography variant="body2" paragraph>
          There are three main roles in the system. Each user is assigned exactly one role at creation time.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>

          {/* Admin */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderTop: `4px solid ${theme.palette.error.main}`, height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AdminPanelSettingsIcon color="error" />
                  <Typography variant="h6" fontWeight={700}>Admin</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Full system access
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense disablePadding>
                  <BulletItem text="Manage all users, admins, sales staff" />
                  <BulletItem text="Create and manage projects and units" />
                  <BulletItem text="View and action all reservations" />
                  <BulletItem text="Approve reservations through the approval chain" />
                  <BulletItem text="Upload and manage contract templates" />
                  <BulletItem text="Edit contract HTML per template or per reservation" />
                  <BulletItem text="View session logs and feedback analytics" />
                  <BulletItem text="Export reservations to Excel" />
                  <BulletItem text="Bulk import users from Excel files" />
                  <BulletItem text="Manage brokers" />
                </List>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Admin Sub-Types</Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  <Chip size="small" icon={<BusinessIcon />} label="Operation" color="default" />
                  <Chip size="small" icon={<AccountBalanceIcon />} label="Finance" color="default" />
                  <Chip size="small" icon={<SupportAgentIcon />} label="Customer Support" color="default" />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
                  Sub-types are informational labels used internally. All admins share the same system permissions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderTop: `4px solid ${theme.palette.warning.main}`, height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <GroupsIcon color="warning" />
                  <Typography variant="h6" fontWeight={700}>Sales</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Field sales agent
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense disablePadding>
                  <BulletItem text="Use the client mobile/web app for sessions" />
                  <BulletItem text="Run orientation sessions with QR code scanning" />
                  <BulletItem text="Log meetings and capture leads" />
                  <BulletItem text="Record session location and outcome" />
                  <BulletItem text="Collect feedback from potential buyers" />
                  <BulletItem text="Assigned leads (users) by admin" />
                </List>
                <Divider sx={{ my: 1 }} />
                <InfoBox color="warning">
                  <Typography variant="caption">
                    Sales users primarily operate through the <strong>client app</strong>, not this admin panel.
                    Admin staff can view and manage their assigned leads here.
                  </Typography>
                </InfoBox>
              </CardContent>
            </Card>
          </Grid>

          {/* User */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderTop: `4px solid ${theme.palette.success.main}`, height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PersonIcon color="success" />
                  <Typography variant="h6" fontWeight={700}>User</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Potential buyer / client / lead
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense disablePadding>
                  <BulletItem text="Registered when they express interest (lead capture)" />
                  <BulletItem text="Can be assigned to a sales agent as a lead" />
                  <BulletItem text="Linked as the owner/co-owner on a reservation" />
                  <BulletItem text="Receives contract PDFs and reservation forms" />
                  <BulletItem text="Personal data stored: name, ID, nationality, DOB, address, occupation" />
                </List>
                <Divider sx={{ my: 1 }} />
                <InfoBox color="success">
                  <Typography variant="caption">
                    Users can be created manually one-by-one or bulk-imported from an Excel sheet.
                  </Typography>
                </InfoBox>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── HOW TO USE EACH SECTION ── */}
        <SectionTitle variant="h5">How to Use Each Section</SectionTitle>

        {/* PROJECTS */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <ApartmentIcon color="primary" />
              <Typography fontWeight={600}>Projects</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              A <strong>Project</strong> is a real estate development (a building or complex). All units belong to a project.
              You must create a project before you can add units to it.
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>Fields</Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Field</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Required</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Project Name", "Official name of the real estate development", "Yes"],
                  ["Description", "Brief description of the project", "No"],
                  ["Address", "Full physical address", "Yes"],
                  ["Latitude / Longitude", "GPS coordinates for map display", "Yes"],
                  ["Total Units", "Total number of units in the development", "Yes"],
                ].map(([f, d, r]) => (
                  <TableRow key={f}>
                    <TableCell>{f}</TableCell>
                    <TableCell>{d}</TableCell>
                    <TableCell><Chip label={r} color={r === "Yes" ? "error" : "default"} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <List dense disablePadding>
              <ConstraintItem text="You cannot delete a project that has units attached to it." />
            </List>
          </AccordionDetails>
        </Accordion>

        {/* UNITS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon color="primary" />
              <Typography fontWeight={600}>Units</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              A <strong>Unit</strong> is an individual property available for reservation or purchase.
              Each unit belongs to one project and has a type that determines which contract template is used.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Unit Types</Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  <Chip label="Clinic" color="primary" size="small" />
                  <Chip label="Shop" color="secondary" size="small" />
                  <Chip label="Office" size="small" />
                  <Chip label="Hotel Apartment (NPM only)" color="warning" size="small" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Unit Statuses</Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  <Chip label="Available" color="success" size="small" />
                  <Chip label="Reserved" color="warning" size="small" />
                  <Chip label="Sold" color="error" size="small" />
                  <Chip label="Blocked" size="small" />
                </Box>
              </Grid>
            </Grid>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Key Actions</Typography>
            <List dense disablePadding>
              <BulletItem text="Upload multiple images per unit to showcase the property" />
              <BulletItem text="Block a unit until a specific date — it becomes unavailable for reservation during that period" />
              <BulletItem text="Set pricing including discounts and cash-payment discounts separately" />
              <BulletItem text="Record physical dimensions: area, bedrooms, bathrooms, floor, view, furnishing" />
            </List>
            <Box mt={1}>
              <List dense disablePadding>
                <ConstraintItem text="A unit that is Reserved or Sold cannot be reserved again until it is manually freed." />
                <ConstraintItem text="The unit type (Clinic / Shop / Office / Hotel Apartment) determines which contract template is generated automatically — make sure the type is set correctly before creating a reservation." />
                <ConstraintItem text="Hotel Apartment units are only available in the NPM environment." />
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* RESERVATIONS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon color="primary" />
              <Typography fontWeight={600}>Reservations</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              A <strong>Reservation</strong> is the core record linking a client to a unit. It tracks the full
              lifecycle from initial booking through contract signing, payments, and final purchase completion.
            </Typography>

            {/* Status flow */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Reservation Status Flow</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                mb: 2,
                p: 2,
                background: theme.palette.action.hover,
                borderRadius: 2,
              }}
            >
              {["Pending", "→", "Confirmed", "→", "Purchased"].map((s, i) => (
                s === "→"
                  ? <Typography key={i} variant="h6" color="textSecondary">→</Typography>
                  : <Chip
                      key={s}
                      label={s}
                      color={s === "Pending" ? "warning" : s === "Confirmed" ? "primary" : "success"}
                      sx={{ fontWeight: 600 }}
                    />
              ))}
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>or</Typography>
              <Chip label="Cancelled" color="error" />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <InfoBox color="info">
                  <Typography variant="subtitle2" fontWeight={600}><TimelineIcon sx={{ fontSize: 14, mr: 0.5 }} />Pending</Typography>
                  <Typography variant="body2">
                    Reservation just created. Awaiting admin approvals. The unit is held during this stage.
                  </Typography>
                </InfoBox>
                <InfoBox color="info">
                  <Typography variant="subtitle2" fontWeight={600}><HowToRegIcon sx={{ fontSize: 14, mr: 0.5 }} />Confirmed</Typography>
                  <Typography variant="body2">
                    All required approvals have been given. Down payment and contracts can now be processed.
                    The unit is officially reserved.
                  </Typography>
                </InfoBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoBox color="success">
                  <Typography variant="subtitle2" fontWeight={600}><CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} />Purchased</Typography>
                  <Typography variant="body2">
                    Full sale complete. Documents submitted, payment finalised, unit marked as Sold.
                    A final signed contract PDF is generated.
                  </Typography>
                </InfoBox>
                <InfoBox color="warning">
                  <Typography variant="subtitle2" fontWeight={600}><WarningAmberIcon sx={{ fontSize: 14, mr: 0.5 }} />Cancelled</Typography>
                  <Typography variant="body2">
                    Reservation cancelled (with a required reason). The unit returns to Available status.
                  </Typography>
                </InfoBox>
              </Grid>
            </Grid>

            {/* Approval */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Approval Chain</Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Environment</strong></TableCell>
                  <TableCell><strong>Approvals Required</strong></TableCell>
                  <TableCell><strong>Note</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="PROD — Negma Properties" color="primary" size="small" /></TableCell>
                  <TableCell>2 admins</TableCell>
                  <TableCell>Fixed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="NPM — Negma Hotel Properties" color="secondary" size="small" /></TableCell>
                  <TableCell>3 admins</TableCell>
                  <TableCell>4 if a special feedback note is set on the reservation</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Key actions */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Key Actions on a Reservation</Typography>
            <List dense disablePadding>
              <BulletItem text="Approve — Click Approve to add your approval to the chain. Once the required count is reached, the reservation moves to Confirmed." />
              <BulletItem text="Upload Down Payment — Upload the cheque/payment images and enter the payment amount. Supports multiple cheque images." />
              <BulletItem text="Submit Documents & Mark Sold — Upload signed documents to complete the sale and move to Purchased status." />
              <BulletItem text="Add/Remove Clients — A reservation can have multiple co-owners. Each must have an ownership percentage; all percentages must total 100%." />
              <BulletItem text="Edit Contract HTML — Customise the legal contract text for this specific reservation only without affecting other reservations." />
              <BulletItem text="Regenerate Contract PDF — After editing the contract HTML, click Regenerate to produce a fresh PDF." />
              <BulletItem text="Update Broker/Developer Info — Record the selling broker, direct manager, developer company, and team leader." />
              <BulletItem text="Export to Excel — Download the full reservation list for reporting." />
              <BulletItem text="Import from Google Sheets — Paste a Google Sheet link to import reservation data directly." />
            </List>
            <Box mt={1}>
              <List dense disablePadding>
                <ConstraintItem text="You cannot reserve a unit that is already Reserved or Sold." />
                <ConstraintItem text="Ownership percentages across all co-owners on a reservation must add up to exactly 100%." />
                <ConstraintItem text="A cancellation reason is mandatory when cancelling a reservation." />
                <ConstraintItem text="Down payment images are stored permanently and cannot be deleted after upload." />
                <ConstraintItem text="Once a reservation is Purchased, its status cannot be changed back." />
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* CONTRACTS & TEMPLATES */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <DescriptionIcon color="primary" />
              <Typography fontWeight={600}>Contract Templates</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              The system auto-generates PDF contracts using HTML templates. There are <strong>13 templates</strong> total
              (5 for PROD, 8 for NPM). Admins can edit the Arabic text inside templates without touching code.
            </Typography>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>How Template Selection Works Automatically</Typography>
            <InfoBox color="info">
              <Typography variant="body2">
                When a contract PDF is generated, the system picks the correct template automatically based on:
                <br />• <strong>PROD</strong>: Unit type (Clinic / Shop / Office)
                <br />• <strong>NPM</strong>: Package (Gold/Silver) + Payment method (Cash/Installment) + Client nationality (Egyptian/Foreign)
              </Typography>
            </InfoBox>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Two Levels of Editing</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                    Global Template (affects all future contracts)
                  </Typography>
                  <Typography variant="body2">
                    Go to <strong>Templates</strong> in the left menu → click <strong>Edit</strong> on any template →
                    use the text editor to change wording → click <strong>Save</strong>.
                    All new contracts generated after saving will use the updated text.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="secondary" gutterBottom>
                    Per-Reservation Override (one specific contract only)
                  </Typography>
                  <Typography variant="body2">
                    Open a reservation → click <strong>Edit Contract HTML</strong> → edit the text →
                    click <strong>Save HTML</strong> → click <strong>Regenerate PDF</strong>.
                    Only this reservation's contract is changed; the global template is unaffected.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Using the Template Editor</Typography>
            <List dense disablePadding>
              <BulletItem icon={<PictureAsPdfIcon color="primary" fontSize="small" />} text="Preview PDF — See exactly how the contract will look as a PDF before saving. Placeholders are shown as '......' in the preview." />
              <BulletItem icon={<CheckCircleIcon color="success" fontSize="small" />} text="Save — Stores your changes in the database. Future contracts will use the new text." />
              <BulletItem icon={<WarningAmberIcon color="warning" fontSize="small" />} text="Reset to Original — Reverts the template back to the original file content. All custom edits are lost." />
            </List>
            <Box mt={1}>
              <List dense disablePadding>
                <ConstraintItem text="NEVER delete or modify text inside double curly braces like {{CLIENT_NAME}}, {{UNIT_PRICE}}, {{DATE}} etc. These are placeholders that get replaced with real data automatically. Deleting them will cause blank fields in the printed contract." />
                <ConstraintItem text="The editor only edits the visible text body. The page styling and layout (CSS/print formatting) are preserved automatically." />
                <ConstraintItem text="After resetting a template to original, you cannot undo. The reset is permanent." />
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* USERS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon color="primary" />
              <Typography fontWeight={600}>Users Management</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Manage all registered users (potential buyers / leads). Users are created here and then linked to reservations as owners.
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Creating Users</Typography>
            <List dense disablePadding>
              <BulletItem text="Single user — Fill in the form: name, email, phone, password. Role is set to 'User' automatically." />
              <BulletItem text="Bulk import from Excel — Upload an .xlsx file. The system detects and skips duplicates (by name, email, or phone). A summary shows how many were added, skipped, or failed." />
            </List>
            <Box mt={1}>
              <List dense disablePadding>
                <ConstraintItem text="Email and phone must be unique. Importing a duplicate will skip that row without error." />
                <ConstraintItem text="Users cannot log in to the admin panel — only Admin and Sales roles can." />
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* BROKERS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon color="primary" />
              <Typography fontWeight={600}>Brokers</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Brokers are external agents or companies who refer clients. They are recorded on reservations for commission tracking.
            </Typography>
            <List dense disablePadding>
              <BulletItem text="Create brokers with: Name, Phone, Email" />
              <BulletItem text="Assign brokers to admin users (for access control — an admin only sees reservations from their assigned brokers)" />
              <BulletItem text="On each reservation: record the broker, direct manager, developer company, developer sales, and team leader" />
            </List>
          </AccordionDetails>
        </Accordion>

        {/* SALES & LEADS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <GroupsIcon color="primary" />
              <Typography fontWeight={600}>Sales Agents &amp; Leads</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Sales agents operate in the field using the client app. Admins manage their lead assignments here.
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Lead Statuses</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip label="Interested" color="success" size="small" />
              <Chip label="Not Interested" color="error" size="small" />
              <Chip label="Call Him Back" color="warning" size="small" />
            </Box>
            <List dense disablePadding>
              <BulletItem text="View Leads — See all users assigned to a specific sales agent" />
              <BulletItem text="Assign Leads — Select users from the full list and assign them to a sales agent" />
              <BulletItem text="Edit Lead — Update the status and add notes for a specific lead" />
            </List>
          </AccordionDetails>
        </Accordion>

        {/* ADMINS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AdminPanelSettingsIcon color="primary" />
              <Typography fontWeight={600}>Admin Accounts</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Manage all staff who have access to this admin panel. Only existing admins can create new admins.
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Roles Available When Creating an Admin</Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Admin", "Full access to all sections of the admin panel"],
                  ["Sales", "Field agent — primarily uses the client app, limited admin panel access"],
                  ["User", "End client — no admin panel access"],
                ].map(([r, d]) => (
                  <TableRow key={r}>
                    <TableCell><Chip label={r} size="small" /></TableCell>
                    <TableCell>{d}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Admin Sub-Types (for Admin role only)</Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Sub-Type</strong></TableCell>
                  <TableCell><strong>Typical Responsibilities</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Operation", "Day-to-day operations, units, reservations, approvals"],
                  ["Finance", "Payment tracking, down payments, installment schedules"],
                  ["Customer Support", "Handling client inquiries, lead follow-up"],
                ].map(([t, d]) => (
                  <TableRow key={t}>
                    <TableCell>{t}</TableCell>
                    <TableCell>{d}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <List dense disablePadding>
              <BulletItem text="Assign brokers to an admin so they only see reservations from those brokers." />
              <ConstraintItem text="An admin can only be deleted if they have no active reservations assigned to them." />
            </List>
          </AccordionDetails>
        </Accordion>

        {/* SESSION LOGS */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimelineIcon color="primary" />
              <Typography fontWeight={600}>Session Logs &amp; Analytics</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Session logs track all field activity by sales agents — both orientation events and one-on-one meetings.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Session Types</Typography>
                <List dense disablePadding>
                  <BulletItem text="Orientation — Group event where a sales agent presents to multiple potential buyers. Attendance is tracked via QR code scanning." />
                  <BulletItem text="Meeting — Individual one-on-one meeting with a specific client. Records outcome, amount discussed, and whether a reservation followed." />
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>What You Can See</Typography>
                <List dense disablePadding>
                  <BulletItem text="All sessions per agent with date, location, and duration" />
                  <BulletItem text="Feedback collected during each session" />
                  <BulletItem text="Overall analytics: total orientations, meetings, completion rate, average duration" />
                  <BulletItem text="Per-agent performance stats" />
                  <BulletItem text="Google Maps link to the exact session location" />
                </List>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* ── GLOBAL CONSTRAINTS ── */}
        <SectionTitle variant="h5">System-Wide Business Rules &amp; Constraints</SectionTitle>
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Important rules that apply across the entire system:
          </Typography>
          <List dense disablePadding>
            <ConstraintItem text="A unit can only have one active reservation at a time (status = Pending or Confirmed). Once it reaches Purchased or is Cancelled, a new reservation can be created." />
            <ConstraintItem text="Contract PDFs are generated automatically by the system — admins cannot upload a custom PDF directly. To change the content, edit the HTML template and regenerate." />
            <ConstraintItem text="All placeholders in contract templates (e.g., {{CLIENT_NAME}}, {{UNIT_PRICE}}) are filled in automatically from the reservation data. Never delete them." />
            <ConstraintItem text="Ownership percentages across all co-owners on a single reservation must sum exactly to 100%. The system will reject the save otherwise." />
            <ConstraintItem text="The environment (PROD or NPM) is set at deployment time and cannot be changed from within the admin panel. Each company has its own separate deployment." />
            <ConstraintItem text="Approvals are sequential and cannot be skipped. Each approval is attributed to a specific admin and timestamped." />
            <ConstraintItem text="Documents uploaded to reservations (IDs, cheques, contracts) are stored permanently and are not deletable." />
            <ConstraintItem text="Blocked units are automatically released after the 'blocked until' date passes — no manual action is needed." />
            <ConstraintItem text="Bulk Excel imports for users check for duplicates by Name, Email, and Phone — any row matching an existing record is silently skipped." />
            <ConstraintItem text="The system is bilingual (Arabic/English). Legal contract templates are in Arabic. The admin interface supports both languages." />
          </List>
        </Paper>

        {/* ── QUICK REFERENCE ── */}
        <SectionTitle variant="h5">Quick Reference — Who Does What</SectionTitle>
        <Table sx={{ mb: 4 }}>
          <TableHead>
            <TableRow sx={{ background: theme.palette.action.hover }}>
              <TableCell><strong>Task</strong></TableCell>
              <TableCell><strong>Where</strong></TableCell>
              <TableCell><strong>Who</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ["Add a new property to sell", "Units", "Admin"],
              ["Create a reservation for a client", "Reservations", "Admin"],
              ["Approve a reservation", "Reservations → Open → Approve", "Admin"],
              ["Record a client's down payment", "Reservations → Open → Upload Down Payment", "Admin"],
              ["Complete a sale", "Reservations → Open → Submit Documents & Mark Sold", "Admin"],
              ["Cancel a reservation", "Reservations → Open → Update Status → Cancelled", "Admin"],
              ["Edit a contract's Arabic text", "Templates → Edit", "Admin"],
              ["Customise one specific contract", "Reservations → Open → Edit Contract HTML", "Admin"],
              ["Add a new client/buyer to the system", "Users → Create", "Admin"],
              ["Bulk-import clients from Excel", "Users → Upload Excel", "Admin"],
              ["Assign leads to a sales agent", "Sales → Edit Leads", "Admin"],
              ["Add a broker", "Brokers → Create", "Admin"],
              ["View field agent activity", "Session Logs", "Admin"],
              ["Run an orientation/meeting session", "Client App", "Sales Agent"],
            ].map(([task, where, who]) => (
              <TableRow key={task}>
                <TableCell>{task}</TableCell>
                <TableCell><code>{where}</code></TableCell>
                <TableCell><Chip label={who} size="small" color={who === "Admin" ? "primary" : "warning"} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, background: theme.palette.action.hover, borderRadius: 2, mb: 2 }}>
          <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
            <InfoIcon fontSize="small" />
            This documentation page is embedded in the admin panel dashboard. It covers both Negma Properties (PROD) and Negma Hotel Properties (NPM) environments.
          </Typography>
        </Box>
      </ContentBox>
    </Fragment>
  );
};

export default Analytics;
