export default function CtaSection({
  headline = 'Ready to Get Started?',
  subheadline = 'Join thousands of satisfied customers building amazing websites',
  buttonText = 'Get Started Free',
  buttonLink = '#',
  styles = {},
}) {
  return (
    <section style={styles} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{headline}</h2>
        <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">{subheadline}</p>
        <a
          href={buttonLink}
          className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
        >
          {buttonText}
        </a>
      </div>
    </section>
  )
}
