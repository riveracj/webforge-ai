export default function FooterSection({
  text = '© 2025 WebForge AI. All rights reserved.',
  links = [
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms of Service', url: '#' },
  ],
  styles = {},
}) {
  return (
    <footer style={styles} className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">{text}</p>
          <div className="flex gap-6">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
