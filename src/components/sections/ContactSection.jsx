import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactSection({
  title = 'Get In Touch',
  subtitle = "We'd love to hear from you",
  email = 'hello@example.com',
  phone = '+1 (555) 123-4567',
  address = '123 Main Street, City',
  styles = {},
}) {
  return (
    <section style={styles} className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: email },
              { icon: Phone, label: 'Phone', value: phone },
              { icon: MapPin, label: 'Address', value: address },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-indigo-600" size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
