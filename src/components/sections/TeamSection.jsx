export default function TeamSection({
  title = 'Our Team',
  members = [
    { name: 'Alice Johnson', role: 'CEO & Founder', bio: 'Visionary leader with 15+ years experience', avatar: null },
    { name: 'Bob Smith', role: 'CTO', bio: 'Tech genius and infrastructure expert', avatar: null },
    { name: 'Carol Williams', role: 'Design Lead', bio: 'Creative mind behind our best designs', avatar: null },
  ],
  styles = {},
}) {
  return (
    <section style={styles} className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">{title}</h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Meet the people behind our success
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {members.map((member, i) => (
            <div key={i} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {member.name[0]}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-indigo-600 font-medium mb-2">{member.role}</p>
              <p className="text-sm text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
