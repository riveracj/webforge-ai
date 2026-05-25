export default function HeroSection({
  headline = 'Build Your Dream Website',
  subheadline = 'Create stunning websites with AI in minutes',
  ctaText = 'Get Started',
  ctaLink = '#',
  backgroundStyle = 'gradient',
  alignment = 'center',
  styles = {},
}) {
  const bgStyles = {
    gradient: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white',
    solid: 'bg-indigo-600 text-white',
    image: 'bg-gray-900 text-white bg-cover bg-center',
  }

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }

  return (
    <section
      className={`relative overflow-hidden ${bgStyles[backgroundStyle] || bgStyles.gradient}`}
      style={styles}
    >
      <div className={`max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col ${alignClasses[alignment] || alignClasses.center}`}>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl">
          {headline}
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
          {subheadline}
        </p>
        <a
          href={ctaLink}
          className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {ctaText}
        </a>
      </div>
      {backgroundStyle === 'gradient' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
      )}
    </section>
  )
}
