import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqSection({
  title = 'Frequently Asked Questions',
  items = [
    { question: 'How does the AI generator work?', answer: 'Simply describe your website and our AI will generate it for you.' },
    { question: 'Can I edit my website after publishing?', answer: 'Yes, you can edit and republish anytime.' },
    { question: 'Is there a free plan?', answer: 'Yes, we have a free plan with basic features.' },
  ],
  styles = {},
}) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section style={styles} className="bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">{title}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
