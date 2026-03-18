const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// Import Routes
// =========================

const donorRoutes = require("./routes/donorRoutes");
const donationRoutes = require("./routes/donationRoutes");
const healthCheckRoutes = require("./routes/healthCheckRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const patientRoutes = require("./routes/patientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const hospitalDashboardRoutes = require("./routes/hospitalDashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");


// =========================
// Register Routes
// =========================

app.use("/donors", donorRoutes);

app.use("/donations", donationRoutes);

app.use("/health-checks", healthCheckRoutes);

app.use("/blood-banks", bloodBankRoutes);

app.use("/blood-requests", bloodRequestRoutes);

app.use("/patients", patientRoutes);

app.use("/hospitals", hospitalRoutes);

app.use("/hospital-dashboard", hospitalDashboardRoutes);

// FIXED: Payment routes should NOT use "/"
app.use("/payments", paymentRoutes);

app.use("/admin", adminRoutes);


// =========================
// Root Test Route
// =========================

app.get("/", (req, res) => {
  res.send("HEMA Backend Running 🚀");
});


// =========================
// Start Server
// =========================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});