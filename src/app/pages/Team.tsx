import { teamMembers } from '../data/mockData';
import { SEO } from '../components/SEO';
import { Users, Globe } from 'lucide-react';

const DEPARTMENTS = ['All', 'Leadership', 'Ambassadors', 'Education', 'Ecosystem', 'Finance', 'Communications', 'Events'];

export function Team() {
  return (
    <div>
      <SEO
        title="GCV Core Team"
        description="Meet the global leadership team and department heads driving the Pi Global GCV Alliance across Africa and the world."
        url="/team"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Users className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-medium">Our People</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">GCV Core Team</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            The dedicated leaders, ambassadors, and specialists building the GCV movement across Africa and the world.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Global Leadership */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-purple-light rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest">Top Leadership</p>
              <h2 className="text-2xl font-bold tracking-tight">Global Leadership</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.filter(m => m.department === 'Leadership').map(member => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-6 flex gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg leading-tight">{member.name}</h3>
                    <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {member.country}
                    </span>
                  </div>
                  <p className="text-sm text-brand-purple font-medium mb-3">{member.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Structure */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest">Structure</p>
              <h2 className="text-2xl font-bold tracking-tight">Department Teams</h2>
            </div>
          </div>

          {/* Department filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {DEPARTMENTS.filter(d => d !== 'All' && d !== 'Leadership').map(dept => (
              <span
                key={dept}
                className="px-3 py-1.5 bg-accent rounded-lg text-sm font-medium text-muted-foreground"
              >
                {dept}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.filter(m => m.department !== 'Leadership').map(member => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{member.name}</h3>
                    <p className="text-xs text-brand-purple font-medium mt-0.5">{member.department}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground mb-2 leading-snug">{member.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{member.bio}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{member.country}</span>
                  <span className="text-xs bg-accent px-2 py-0.5 rounded-full">{member.department}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
