function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <h3>{value}</h3>
      {hint && <span>{hint}</span>}
    </div>
  )
}

export default StatCard
