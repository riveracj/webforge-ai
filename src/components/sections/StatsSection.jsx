export default function StatsSection({
  title = 'Our Impact',
  stats = [
    { value: '10K+', label: 'Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' },
    { value: '1M+', label: 'Websites Created' },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-indigo-200 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
