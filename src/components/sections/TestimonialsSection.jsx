import { Star } from 'lucide-react'

export default function TestimonialsSection({
  title = 'What Our Clients Say',
  testimonials = [
    { name: 'John Doe', role: 'CEO, TechCo', content: 'This platform transformed our business!', avatar: null, rating: 5 },
    { name: 'Jane Smith', role: 'Designer', content: 'Incredibly easy to use. Highly recommend!', avatar: null, rating: 5 },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
