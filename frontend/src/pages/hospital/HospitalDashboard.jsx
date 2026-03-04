import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    Users, Droplets, CreditCard, TrendingUp, AlertTriangle,
    ChevronRight,
} from 'lucide-react';

import HospitalLayout from '../../components/hospital/HospitalLayout';
import PriorityBadge from '../../components/hospital/PriorityBadge';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import BloodAvailabilityBar from '../../components/hospital/BloodAvailabilityBar';


/* ─── KPI StatCard ─────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, sub, valueColor, children }) {
    return (
        <div style={{
            background: '#0F0F17',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 24
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={20} color="var(--red)" />
                <span>{label}</span>
            </div>

            <div style={{
                fontSize: 48,
                color: valueColor || "#fff",
                marginTop: 10
            }}>
                {value}
            </div>

            <div style={{ fontSize: 12, color: "#aaa" }}>{sub}</div>

            {children}
        </div>
    );
}



export default function HospitalDashboard() {

    const navigate = useNavigate();


    /* ---------------- DASHBOARD STATS ---------------- */

    const [stats, setStats] = useState({
        patients: 0,
        requests: 0,
        payments: 0
    });


    /* ---------------- BACKEND DATA ---------------- */

    const [mockPatients, setMockPatients] = useState([]);
    const [mockBloodRequests, setMockBloodRequests] = useState([]);
    const [mockPayments, setMockPayments] = useState([]);
    const [mockHospitalBanks, setMockHospitalBanks] = useState([]);

    const [mockRequestChartData, setMockRequestChartData] = useState([]);
    const [mockBloodGroupDemand, setMockBloodGroupDemand] = useState([]);



    /* ---------------- FETCH DATA ---------------- */

    useEffect(() => {


        /* DASHBOARD STATS */
        fetch("http://localhost:5000/hospital-dashboard/1/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
            });



        /* PATIENTS */

        fetch("http://localhost:5000/patients")
            .then(res => res.json())
            .then(data => {

                const formatted = data.map(p => ({
                    patient_id: p.patient_id,
                    name: p.name,
                    age: p.age,
                    gender: p.gender || "N/A",
                    ward: p.ward || "General",
                    blood_group: p.blood_group,
                    status: "Stable"
                }));

                setMockPatients(formatted);
            });



        /* BLOOD REQUESTS */

        fetch("http://localhost:5000/blood-requests")
            .then(res => res.json())
            .then(data => {

                const formatted = data.map(r => ({
                    request_id: r.request_id,
                    request_date: r.request_date,
                    patient_name: r.patient_name || "Patient",
                    ward: r.ward || "Ward",
                    blood_group: r.blood_group,
                    units_required: r.units_required,
                    bank_name: r.bank_name || "Blood Bank",
                    priority: r.priority || "Normal",
                    status: r.status
                }));

                setMockBloodRequests(formatted);



                /* BLOOD GROUP DEMAND */

                const demand = {};

                formatted.forEach(r => {
                    demand[r.blood_group] =
                        (demand[r.blood_group] || 0) + r.units_required;
                });

                const demandArr = Object.keys(demand).map(g => ({
                    group: g,
                    units: demand[g]
                }));

                setMockBloodGroupDemand(demandArr);



                /* CHART DATA */

                const chart = {};

                formatted.forEach(r => {

                    const month = new Date(r.request_date)
                        .toLocaleString('default', { month: 'short' });

                    if (!chart[month]) {
                        chart[month] = {
                            month,
                            requests: 0,
                            fulfilled: 0
                        };
                    }

                    chart[month].requests++;

                    if (r.status === "Fulfilled")
                        chart[month].fulfilled++;
                });

                setMockRequestChartData(Object.values(chart));

            });



        /* PAYMENTS */

        fetch("http://localhost:5000/payments")
            .then(res => res.json())
            .then(data => {

                const formatted = data.map(p => ({
                    payment_id: p.payment_id,
                    payment_date: p.payment_date,
                    bank_name: p.bank_name,
                    amount: p.amount,
                    payment_status: p.payment_status
                }));

                setMockPayments(formatted);

            });



        /* BLOOD BANKS */

        fetch("http://localhost:5000/blood-banks")
            .then(res => res.json())
            .then(data => {

                const formatted = data.map(b => ({
                    bank_id: b.bank_id,
                    bank_name: b.bank_name,
                    distance_km: b.distance_km || 5,
                    open: true,
                    stock: {
                        "A+": 10,
                        "A-": 5,
                        "B+": 8,
                        "B-": 4,
                        "O+": 12,
                        "O-": 6,
                        "AB+": 3,
                        "AB-": 2
                    }
                }));

                setMockHospitalBanks(formatted);

            });

    }, []);



    /* ---------------- CALCULATIONS ---------------- */

    const emergencyRequests = mockBloodRequests.filter(r =>
        r.priority === "Emergency" && r.status === "Pending"
    );

    const pendingPayments = mockPayments.filter(p =>
        p.payment_status === "Pending"
    );

    const pendingPayAmt =
        pendingPayments.reduce((s, p) => s + p.amount, 0);


    const fulfilledReqs = mockBloodRequests.filter(r =>
        r.status === "Fulfilled"
    ).length;


    const fulfillmentRate =
        mockBloodRequests.length > 0
            ? Math.round((fulfilledReqs / mockBloodRequests.length) * 100)
            : 0;


    const maxDemand =
        mockBloodGroupDemand.length > 0
            ? Math.max(...mockBloodGroupDemand.map(d => d.units))
            : 1;



    /* ---------------- UI ---------------- */

    return (

        <HospitalLayout title="Dashboard">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>


                {/* KPI */}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 16
                }}>

                    <StatCard
                        icon={Users}
                        label="Active Patients"
                        value={stats.patients}
                        sub="Registered patients"
                    />

                    <StatCard
                        icon={Droplets}
                        label="Blood Requests"
                        value={stats.requests}
                        sub={`${fulfilledReqs} fulfilled`}
                    />

                    <StatCard
                        icon={CreditCard}
                        label="Pending Payments"
                        value={`₹${pendingPayAmt}`}
                        valueColor="var(--red)"
                        sub={`${pendingPayments.length} invoices`}
                    />

                    <StatCard
                        icon={TrendingUp}
                        label="Fulfillment Rate"
                        value={`${fulfillmentRate}%`}
                        sub="Last 30 days"
                    />

                </div>



                {/* BLOOD DEMAND */}

                <div style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: 28
                }}>

                    <div style={{ fontSize: 18, marginBottom: 20 }}>
                        Blood Group Demand
                    </div>

                    {mockBloodGroupDemand.map(({ group, units }) => (

                        <div key={group} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 14
                        }}>

                            <BloodGroupBadge group={group} small />

                            <div style={{ flex: 1 }}>
                                <BloodAvailabilityBar
                                    units={units}
                                    maxUnits={maxDemand}
                                    showLabel={false}
                                />
                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </HospitalLayout>

    );

}