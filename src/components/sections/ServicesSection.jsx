import { Zap, Shield, Smartphone, Star, Briefcase, Heart } from 'lucide-react'

const ICON_MAP = { Zap, Shield, Smartphone, Star, Briefcase, Heart }

export default function ServicesSection({
  title = 'Our Services',
  subtitle = 'What we offer',
  services = [
    { icon: 'Zap', title: 'Lightning Fast', description: 'Optimized for speed' },
    { icon: 'Shield', title: 'Secure', description: 'Enterprise-grade security' },
    { icon: 'Smartphone', title: 'Responsive', description: 'Looks great on all devices' },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const Icon = ICON_MAP[service.icon] || Briefcase
            return (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Icon className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
