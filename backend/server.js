const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { requireAuth, requireRoles } = require("./middleware/authMiddleware");
const { cookieParser } = require("./middleware/cookieParserMiddleware");

const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const donationRoutes = require("./routes/donationRoutes");
const healthCheckRoutes = require("./routes/healthCheckRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const patientRoutes = require("./routes/patientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const hospitalDashboardRoutes = require("./routes/hospitalDashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bloodIssueRoutes = require("./routes/bloodIssueRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notifications");
const { ensureSeedAdminUser, ensureAuthSchema } = require("./services/authService");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser);

app.use("/auth", authRoutes);

app.use("/donors", requireAuth, donorRoutes);
app.use("/donations", requireAuth, donationRoutes);
app.use("/health-checks", requireAuth, healthCheckRoutes);
app.use("/blood-banks", bloodBankRoutes);
app.use("/blood-requests", requireAuth, bloodRequestRoutes);
app.use("/patients", requireAuth, patientRoutes);
app.use("/hospitals", requireAuth, hospitalRoutes);
app.use("/hospital-dashboard", requireAuth, hospitalDashboardRoutes);
app.use("/payments", requireAuth, paymentRoutes);
app.use("/inventory", requireAuth, inventoryRoutes);

app.use("/blood-issues", requireAuth, bloodIssueRoutes);
app.use("/admin/payments", requireAuth, requireRoles("admin"), adminPaymentRoutes);
app.use("/api/users", requireAuth, requireRoles("admin"), userRoutes);
app.use("/api/notifications", requireAuth, requireRoles("admin"), notificationRoutes);

app.use("/admin", requireAuth, requireRoles("admin"), adminRoutes);
app.use("/api/admin", requireAuth, requireRoles("admin"), adminRoutes);

app.get("/", (_req, res) => {
  res.send("HEMA Backend Running");
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, async () => {
  try {
    await ensureAuthSchema();
    const seeded = await ensureSeedAdminUser();
    if (seeded.created) {
      console.log("Seeded initial admin account from env");
    }
  } catch (error) {
    console.error("Admin seed check failed:", error.message);
  }

  console.log(`Server running on port ${PORT}`);
});
