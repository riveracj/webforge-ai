import { Check } from 'lucide-react'

export default function PricingSection({
  title = 'Pricing Plans',
  subtitle = 'Choose the right plan for you',
  plans = [
    { name: 'Free', price: '$0', features: ['1 Project', 'Basic components'], cta: 'Get Started' },
    { name: 'Pro', price: '$19', features: ['10 Projects', 'All components', 'Custom domain'], cta: 'Start Trial', highlighted: true },
    { name: 'Enterprise', price: '$49', features: ['Unlimited', 'Everything', 'Priority support'], cta: 'Contact' },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-105'
                  : 'bg-white text-gray-900'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check size={16} className={plan.highlighted ? 'text-indigo-200' : 'text-emerald-500'} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
