import { Users, Target, Award, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';
import dorisImg from '@/assets/doris .jpg';
import olivierImg from '@/assets/olivie.jpeg';
import missionImg from '@/assets/mission.jpg';
import { GCV_USD } from '../lib/pi';

const CORE_VALUES = [
  {
    Icon: Users,
    gradient: 'from-brand-purple to-brand-purple-light',
    title: 'Community First',
    desc: 'We prioritize the needs and voices of our member community in everything we do.',
  },
  {
    Icon: Target,
    gradient: 'from-brand-gold to-yellow-400',
    title: 'Fair Value',
    desc: 'We advocate for a transparent, fixed conversion rate that protects every trading partner.',
  },
  {
    Icon: Award,
    gradient: 'from-brand-purple-light to-purple-400',
    title: 'Education',
    desc: 'We empower members and merchants through comprehensive educational resources and support.',
  },
  {
    Icon: Globe,
    gradient: 'from-brand-green to-emerald-400',
    title: 'Global Unity',
    desc: 'We build bridges across Africa, Europe, Asia, and the USA to create a unified trade network.',
  },
];

const ALLIANCE_REGIONS = [
  { region: 'Africa', color: '#5b21b6' },
  { region: 'Europe', color: '#7c3aed' },
  { region: 'Asia', color: '#fbbf24' },
  { region: 'USA', color: '#10b981' },
];

export function About() {
  return (
    <div>
      <SEO
        title="About Us"
        description="Learn about Pi Global GCV Alliance — our mission, core values, leadership, and our global vision for trade, innovation, and shared prosperity across Africa, Europe, Asia, and the USA."
        url="/about"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-light text-white py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
            About Us
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-5 tracking-tight max-w-2xl leading-tight">
            About Pi Global GCV Alliance
          </h1>
          <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
            Building a fair and inclusive global trade economy across Africa, Europe, Asia,
            and the USA through Global Consensus Value.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── MISSION ──────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
                Our Purpose
              </p>
              <h2 className="text-3xl font-heading font-bold mb-5 tracking-tight">Our Mission</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Pi Global GCV Alliance is dedicated to empowering merchants, service
                providers, and institutions with the tools and community support needed to
                trade fairly across a growing global marketplace.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We believe that Global Consensus Value represents a paradigm shift in how
                trade is priced — a single, transparent, fixed conversion rate that every
                member can rely on, instead of volatile speculative pricing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Through education, advocacy, and community building, we're helping to create
                a more equitable trading future connecting four continents.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-brand-purple/15 to-brand-gold/15 rounded-3xl blur-xl pointer-events-none" />
              <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border">
                <img
                  src={missionImg}
                  alt="Alliance community"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE VALUES ──────────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map(({ Icon, gradient, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── GCV EXPLANATION ──────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-brand-surface rounded-2xl p-8 md:p-10">
            <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">
              What is Global Consensus Value?
            </h2>
            <p className="text-3xl font-bold text-brand-purple mb-4">
              1 π ≈ ${GCV_USD.toLocaleString('en-US')}
            </p>
            <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground">GCV is a community-proposed price target, not an official
                Pi Network rate.</strong> It is not endorsed by the Pi Core Team or verified on any exchange.
                Pi's actual open-market trading price is far lower — a matter of cents per coin, not
                hundreds of thousands of dollars.
              </p>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                Global Consensus Value (GCV) is the Alliance's community-agreed target rate,
                proposing{' '}
                <strong className="text-foreground">1 π ≈ ${GCV_USD.toLocaleString('en-US')}</strong>{' '}
                — a figure derived from the mathematical constant π (3.14159) with the decimal
                point moved four places to the right. Products and services in the GCV Market
                are priced in USD and shown converted to Pi at this community target.
              </p>
              <p className="leading-relaxed">
                Unlike exchange-traded pricing, GCV is a symbolic, aspirational reference rate
                set by Alliance-wide agreement among pioneers — not a market valuation. It
                reflects what participating merchants and members have agreed to honour among
                themselves, not what Pi trades for on any exchange.
              </p>
              <p className="font-medium text-foreground">Key principles of GCV include:</p>
              <ul className="space-y-2 ml-4">
                {[
                  'A single, community-agreed target applied consistently across the Market',
                  'Transparency in pricing and transaction processes',
                  'Protection against market manipulation and unofficial trading',
                  'Merchant adoption as proof of real-world utility',
                  'One standard, shared across every alliance region',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="leading-relaxed">
                For members across Africa, Europe, Asia, and the USA, GCV represents a shared
                aspiration to trade on fair, predictable terms — with one target rate, applied
                consistently, everywhere in the Alliance.
              </p>
            </div>
          </div>
        </section>

        {/* ── LEADERSHIP ───────────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              Our Team
            </p>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Our Leadership</h2>
          </div>

          {/* Doris Yin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-14">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-gold/20 to-brand-purple-light/15 rounded-2xl blur-lg pointer-events-none" />
              <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-border">
                <img src={dorisImg} alt="Doris Yin" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-2xl font-heading font-bold mb-1 tracking-tight">Doris Yin</h3>
              <p className="text-brand-gold font-semibold text-sm mb-5">
                Grand Global Ambassador · Founder, Global GCV Movement
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Doris Yin is the founder of the Global GCV Movement, providing strategic vision
                and direction to the worldwide network of GCV Ambassadors. She has led and
                addressed major global gatherings advancing GCV as the standard for fair,
                transparent trade.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Her guiding message — "Building a Strong Foundation, A Pillar for a Bright
                Future" — is the cornerstone of the Alliance's educational and
                community-building philosophy across every region.
              </p>
            </div>
          </div>

          {/* Olivier Ndatimana */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-brand-purple/20 to-brand-purple-light/15 rounded-2xl blur-lg pointer-events-none" />
              <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-border">
                <img src={olivierImg} alt="Olivier Ndatimana" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-2xl font-heading font-bold mb-1 tracking-tight">Olivier Ndatimana</h3>
              <p className="text-brand-gold font-semibold text-sm mb-5">
                Founding Director, Pi Global GCV Alliance
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Olivier Ndatimana is the Founding Director of the Pi Global GCV Alliance,
                bringing expertise in shipping, logistics, and market development as CEO of
                Kigali Hot Market Ltd.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Under his leadership, the Alliance has grown its merchant network and regional
                coordination across Africa, Europe, Asia, and the USA — building a shared
                trade standard from the ground up.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Olivier's mission is to give every member fair, direct access to the global
                economy — with GCV providing a stable foundation for trade across the
                Alliance.
              </p>
            </div>
          </div>
        </section>

        {/* ── ALLIANCE REGIONS ─────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-brand-surface rounded-2xl p-8 md:p-10">
            <p className="text-xs font-semibold text-brand-purple uppercase tracking-widest mb-3">
              Global Structure
            </p>
            <h2 className="text-3xl font-heading font-bold mb-4 tracking-tight">
              Four Continents, One Alliance
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              The Pi Global GCV Alliance is structured around regional Ambassadors and
              Founders across Africa, Europe, Asia, and the USA, each leading the movement
              within their region.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ALLIANCE_REGIONS.map(({ region, color }) => (
                <div
                  key={region}
                  className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {region[0]}
                  </div>
                  <p className="font-semibold text-xs leading-tight">{region}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ALLIANCE IMPACT ──────────────────────────────────────── */}
        <section className="py-16 border-t border-border">
          <div className="bg-gradient-to-br from-brand-purple to-brand-purple-light text-white rounded-2xl p-8 md:p-10 mb-16">
            <h2 className="text-3xl font-heading font-bold text-center mb-10 tracking-tight">
              Alliance Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '4', label: 'Continents' },
                { value: '12,500+', label: 'Members Worldwide' },
                { value: '3,200+', label: 'Active Merchants' },
                { value: 'Jan 2025', label: 'First General Conference' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-4xl font-bold mb-2">{value}</div>
                  <div className="text-white/80 text-sm font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
