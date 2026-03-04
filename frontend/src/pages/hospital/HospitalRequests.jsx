import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HospitalLayout from "../../components/hospital/HospitalLayout";

export default function HospitalRequests() {

  const location = useLocation();
  const selectedBank = location.state?.bank_id;

  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [bankId, setBankId] = useState("");
  const [units, setUnits] = useState(1);
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(false);

  // FETCH REQUESTS
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/blood-requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  // FETCH PATIENTS
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://localhost:5000/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchRequests();
    fetchPatients();
  }, []);

  // AUTO FILL BANK ID IF COMING FROM BLOOD BANK PAGE
  useEffect(() => {
    if (selectedBank) {
      setBankId(selectedBank);
      setShowModal(true);
    }
  }, [selectedBank]);

  // SUBMIT REQUEST
  const handleSubmit = async () => {

    if (!patientId || !bankId || !units) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      await fetch("http://localhost:5000/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hospital_id: 1,
          patient_id: parseInt(patientId),
          bank_id: parseInt(bankId),
          units_required: parseInt(units)
        })
      });

      setShowModal(false);
      setPatientId("");
      setBankId("");
      setUnits(1);
      setBloodGroup("");

      fetchRequests();

    } catch (err) {
      console.error(err);
    }

    setLoading(false);

  };

  // AUTO FILL BLOOD GROUP
  const handlePatientChange = (id) => {

    setPatientId(id);

    const patient = patients.find(p => p.patient_id == id);

    if (patient) {
      setBloodGroup(patient.blood_group);
    } else {
      setBloodGroup("");
    }

  };

  return (
    <HospitalLayout title="Blood Requests" page="REQUESTS">

      <div style={{ padding: 30 }}>

        <h2 style={{ color: "#fff" }}>Blood Requests</h2>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "red",
            color: "white",
            padding: "8px 15px",
            border: "none",
            marginBottom: 20,
            cursor: "pointer"
          }}
        >
          + New Request
        </button>

        {/* REQUEST TABLE */}
        <table
          style={{
            width: "100%",
            background: "#111",
            color: "white",
            borderCollapse: "collapse"
          }}
        >

          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hospital ID</th>
              <th>Patient ID</th>
              <th>Bank ID</th>
              <th>Units</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {requests.map(req => (
              <tr key={req.request_id}>
                <td>{req.request_id}</td>
                <td>{req.hospital_id}</td>
                <td>{req.patient_id}</td>
                <td>{req.bank_id}</td>
                <td>{req.units_required}</td>
                <td>{req.status}</td>
                <td>
                  {req.request_date
                    ? new Date(req.request_date).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        {/* MODAL */}
        {showModal && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >

            <div
              style={{
                background: "#1c1c1c",
                padding: 30,
                borderRadius: 12,
                width: 420
              }}
            >

              <h3 style={{ color: "white", marginBottom: 20 }}>
                Create Blood Request
              </h3>

              {/* PATIENT */}
              <label style={{ color: "#aaa", fontSize: 13 }}>
                Patient
              </label>

              <select
                value={patientId}
                onChange={e => handlePatientChange(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 15,
                  padding: 8,
                  background: "#333",
                  color: "white",
                  border: "1px solid #444",
                  borderRadius: 6
                }}
              >

                <option value="" style={{ color: "black" }}>
                  Select Patient
                </option>

                {patients.map(p => (
                  <option
                    key={p.patient_id}
                    value={p.patient_id}
                    style={{ color: "black" }}
                  >
                    {p.name} (ID {p.patient_id})
                  </option>
                ))}

              </select>

              {/* BLOOD GROUP */}
              <label style={{ color: "#aaa", fontSize: 13 }}>
                Blood Group
              </label>

              <input
                value={bloodGroup}
                readOnly
                style={{
                  width: "100%",
                  marginBottom: 15,
                  padding: 8,
                  background: "#333",
                  color: "white",
                  border: "1px solid #444",
                  borderRadius: 6
                }}
              />

              {/* BANK ID */}
              <label style={{ color: "#aaa", fontSize: 13 }}>
                Blood Bank ID
              </label>

              <input
                value={bankId}
                readOnly
                style={{
                  width: "100%",
                  marginBottom: 15,
                  padding: 8,
                  background: "#333",
                  color: "white",
                  border: "1px solid #444",
                  borderRadius: 6
                }}
              />

              {/* UNITS */}
              <label style={{ color: "#aaa", fontSize: 13 }}>
                Units Required
              </label>

              <input
                type="number"
                value={units}
                onChange={e => setUnits(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 20,
                  padding: 8,
                  background: "#333",
                  color: "white",
                  border: "1px solid #444",
                  borderRadius: 6
                }}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: "red",
                  color: "white",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "600"
                }}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: 8,
                  background: "#444",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </div>

    </HospitalLayout>
  );
}