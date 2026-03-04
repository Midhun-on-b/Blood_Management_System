import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone } from 'lucide-react';
import HospitalLayout from '../../components/hospital/HospitalLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const DISTRICTS = ['All Districts', 'Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kannur'];

export default function HospitalBloodBanks() {

  const navigate = useNavigate();

  const [banks, setBanks] = useState([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [bloodType, setBloodType] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  // FETCH BANKS FROM BACKEND
  useEffect(() => {

    fetch("http://localhost:5000/blood-banks")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map(bank => ({
          bank_id: bank.bank_id,
          bank_name: bank.bank_name,
          city: bank.city,
          contact_number: bank.contact_no,
          open: true,
          distance_km: Math.floor(Math.random() * 20) + 1,

          stock: {
            "A+": 10,
            "A-": 4,
            "B+": 8,
            "B-": 3,
            "O+": 12,
            "O-": 5,
            "AB+": 2,
            "AB-": 1
          }
        }))

        setBanks(formatted)

      })
      .catch(err => console.error("Fetch error:", err))

  }, [])

  const filtered = banks.filter(b => {

    const mq =
      b.bank_name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase())

    const md = district === 'All Districts' || b.city === district

    const mo = !openOnly || b.open

    const mt = !bloodType || (b.stock[bloodType] > 0)

    return mq && md && mo && mt

  })

  const stockColor = (units, max) => {

    const pct = units / max

    return pct > 0.6
      ? '#22c55e'
      : pct > 0.3
        ? '#f59e0b'
        : '#D90025'

  }

  return (
    <HospitalLayout title="Blood Banks" page="BLOOD-BANKS">

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >

          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>

            <Search size={16} color="var(--text3)"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blood banks..."
              style={{
                width: '100%',
                background: '#0F0F17',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '11px 14px 11px 42px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

          </div>

          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            style={{
              width: 200,
              background: '#0F0F17',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '11px 14px',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: '#fff'
            }}
          >
            {DISTRICTS.map(d =>
              <option key={d}>{d}</option>
            )}
          </select>

        </motion.div>

        {/* BANK LIST */}
        <div>

          <div
            style={{
              fontFamily: 'var(--font-sub)',
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              marginBottom: 16
            }}
          >
            {filtered.length} Blood Bank{filtered.length !== 1 ? 's' : ''} Found
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20
            }}
          >

            {filtered.map((bank, i) => {

              const maxStock = Math.max(...Object.values(bank.stock))

              return (

                <motion.div
                  key={bank.bank_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}

                  style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: 28
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 16
                    }}
                  >

                    <div
                      style={{
                        fontFamily: 'var(--font-sub)',
                        fontWeight: 700,
                        fontSize: 18,
                        color: '#fff'
                      }}
                    >
                      {bank.bank_name}
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text3)'
                      }}
                    >
                      {bank.distance_km} km away
                    </span>

                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      marginBottom: 20
                    }}
                  >

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                      <MapPin size={13} />
                      {bank.city}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                      <Phone size={13} />
                      {bank.contact_number}
                    </div>

                  </div>

                  {/* STOCK */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>

                    {BLOOD_TYPES.map(t => (

                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                        <BloodGroupBadge group={t} small />

                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)' }}>

                          <div
                            style={{
                              height: '100%',
                              width: `${(bank.stock[t] / maxStock) * 100}%`,
                              background: stockColor(bank.stock[t], maxStock)
                            }}
                          />

                        </div>

                        <span style={{ fontSize: 9, color: 'var(--text3)' }}>
                          {bank.stock[t]}
                        </span>

                      </div>

                    ))}

                  </div>

                  {/* UPDATED BUTTON */}
                  <button
                    onClick={() =>
                      navigate('/hospital/requests', {
                        state: { bank_id: bank.bank_id }
                      })
                    }
                    style={{
                      width: '100%',
                      background: 'var(--red)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '11px 0',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#fff'
                    }}
                  >
                    Request Blood
                  </button>

                </motion.div>

              )

            })}

          </div>

        </div>

      </div>

    </HospitalLayout>
  )
}