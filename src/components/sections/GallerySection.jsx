export default function GallerySection({
  title = 'Our Gallery',
  images = [
    { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', alt: 'Image 1' },
    { src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600', alt: 'Image 2' },
    { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', alt: 'Image 3' },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl aspect-square">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
