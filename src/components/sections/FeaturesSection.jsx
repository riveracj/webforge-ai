import { Check, Star, Shield, Zap } from 'lucide-react'

const ICON_MAP = { Check, Star, Shield, Zap }

export default function FeaturesSection({
  title = 'Features',
  subtitle = 'Why choose us',
  features = [
    { title: 'Easy to Use', description: 'Simple drag and drop interface', icon: 'Check' },
    { title: 'Powerful', description: 'Advanced features for pros', icon: 'Zap' },
    { title: 'Secure', description: 'Your data is protected', icon: 'Shield' },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Check
            return (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icon className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
