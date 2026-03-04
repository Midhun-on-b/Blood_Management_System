const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());


// =========================
// Existing Routes
// =========================

const donorRoutes = require("./routes/donorRoutes");
app.use("/donors", donorRoutes);

const donationRoutes = require("./routes/donationRoutes");
app.use("/donations", donationRoutes);

const healthCheckRoutes = require("./routes/healthCheckRoutes");
app.use("/health-checks", healthCheckRoutes);


// ✅ Blood Bank Routes
const bloodBankRoutes = require("./routes/bloodBankRoutes");
app.use("/blood-banks", bloodBankRoutes);   // FIXED HERE


// =========================
// Blood Request Routes
// =========================

const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
app.use("/blood-requests", bloodRequestRoutes);


// =========================
// Patient Routes
// =========================

const patientRoutes = require("./routes/patientRoutes");
app.use("/patients", patientRoutes);

const hospitalRoutes = require("./routes/hospitalRoutes");
app.use("/hospitals", hospitalRoutes);

const hospitalDashboardRoutes = require("./routes/hospitalDashboardRoutes");
app.use("/hospital-dashboard", hospitalDashboardRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/", paymentRoutes);


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