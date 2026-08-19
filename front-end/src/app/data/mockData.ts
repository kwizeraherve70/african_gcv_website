export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: 'Pi Network' | 'GCV Movement' | 'Events' | 'Community';
  author: string;
  publishedAt: string;
  readTime: string;
  viewCount: number;
  /** Country this story is about, for the News & Media country hub. Omitted for pan-African/global stories. */
  country?: string;
}

export interface GCVCountry {
  name: string;
  slug: string;
  flag: string;
}

/** Countries with an active GCV Africa ambassador, merchant, or alliance presence — the News & Media country hub. */
export const GCV_AFRICA_COUNTRIES: GCVCountry[] = [
  { name: 'Nigeria', slug: 'nigeria', flag: '🇳🇬' },
  { name: 'Kenya', slug: 'kenya', flag: '🇰🇪' },
  { name: 'South Africa', slug: 'south-africa', flag: '🇿🇦' },
  { name: 'Rwanda', slug: 'rwanda', flag: '🇷🇼' },
  { name: 'Ghana', slug: 'ghana', flag: '🇬🇭' },
  { name: 'Egypt', slug: 'egypt', flag: '🇪🇬' },
  { name: 'Botswana', slug: 'botswana', flag: '🇧🇼' },
  { name: 'Senegal', slug: 'senegal', flag: '🇸🇳' },
  { name: 'Cameroon', slug: 'cameroon', flag: '🇨🇲' },
  { name: 'Morocco', slug: 'morocco', flag: '🇲🇦' },
  { name: 'Uganda', slug: 'uganda', flag: '🇺🇬' },
  { name: "Côte d'Ivoire", slug: 'cote-divoire', flag: '🇨🇮' },
];

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: 'Sedans' | 'SUVs' | 'Sports Cars' | 'Luxury';
  images: string[];
  inventory: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  /** Selling merchant, shown as "By {merchantName}" on market cards. */
  merchantName?: string;
}

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'United GCV of Africa General Conference — Greetings from Kigali, Rwanda',
    slug: 'united-gcv-africa-general-conference-kigali-2025',
    excerpt: 'On January 12, 2025, the United GCV of Africa held its General Conference, uniting GCV Ambassadors, merchants, and Global Core Team leaders across the continent.',
    content: `<p>On January 12th, 2025, the United GCV of Africa convened its historic General Conference, bringing together GCV Ambassadors from across Africa, GCV Merchants of Africa, and Global GCV Core Team Ambassadors for a defining moment in the continent's Pi Network journey.</p>

<p>Grand GCV Global Ambassador Doris Yin sent greetings from Kigali, Rwanda, opening the conference with New Year wishes and a renewed call to unity for the movement.</p>

<h3>Africa's Five Regional Pillars</h3>
<p>The United GCV of Africa is structured around five GCV International Commissioner Ambassadors, each representing a major region of the continent:</p>
<ul>
<li>Southern African Countries</li>
<li>Northern African Countries</li>
<li>Western African Countries</li>
<li>Eastern African Countries</li>
<li>Central African Countries</li>
</ul>

<h3>Leadership</h3>
<p>The conference is led by Olivier Ndatimana, Founder of the United GCV of Africa and Vice-Director of Ecological Development for GCV International. Under his leadership, the movement continues to grow its merchant network, ambassador corps, and educational programmes across all regions.</p>

<h3>What's Next</h3>
<p>Following the conference, regional ambassadors have been tasked with accelerating GCV merchant onboarding and education workshops in their respective countries. The movement's goal is a fully unified African voice in the global Pi Network ecosystem.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    category: 'Events',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-01-12',
    readTime: '5 min',
    viewCount: 3200,
    country: 'Rwanda'
  },
  {
    id: '2',
    title: 'Global PiGCV X International Summit Unites Leaders from 26 Countries',
    slug: 'global-pigcv-x-international-summit-2025',
    excerpt: 'On April 20, 2025, the Global PiGCV X International Summit gathered 26 GCV Ambassadors from Asia, Europe, Africa, the Americas, and the Middle East to advance the GCV payment vision.',
    content: `<p>On April 20, 2025, the Global PiGCV X International Summit marked a major milestone for the GCV movement, uniting 26 GCV Ambassadors and Pi Community Leaders from across the world under a single goal: advancing GCV as the standard for Pi Network payments.</p>

<h3>Summit Objectives</h3>
<ul>
<li>Unite global GCV community forces around a shared payment vision</li>
<li>Support GCV pricing as the reference for all Pi transactions</li>
<li>Promote Pi scarcity awareness to protect long-term value</li>
<li>Strengthen cross-regional ambassador coordination</li>
</ul>

<h3>African Representation</h3>
<p>Africa was strongly represented at the summit, with ambassadors from multiple regions joining delegates from Asia, Europe, the Americas, and the Middle East. The summit reinforced Africa's role as a key pillar in the global GCV ecosystem.</p>

<h3>The GCV Standard</h3>
<p>The Global Consensus Value is set at $314,159 per Pi coin — a figure derived from the mathematical constant π (3.14159) and championed by pioneers worldwide as the fair, community-determined value for Pi in real-world transactions.</p>

<p>In countries across Africa, Asia, and Latin America, merchants are already accepting Pi at GCV, covering everything from food and clothing to education services and professional fees.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    category: 'Events',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-04-20',
    readTime: '6 min',
    viewCount: 2870
  },
  {
    id: '3',
    title: 'Understanding Global Consensus Value: $314,159 and What It Means for Africa',
    slug: 'understanding-gcv-314159-africa',
    excerpt: 'GCV represents a paradigm shift in how we determine cryptocurrency value — prioritising community consensus over speculation. Here is what it means for African pioneers.',
    content: `<p>The Global Consensus Value (GCV) movement is built on a simple but powerful idea: the value of Pi should be determined by the community, not by speculators on exchanges.</p>

<p>The GCV target is $314,159 per Pi coin — a figure derived by moving the decimal point in the mathematical constant π (3.14159) four places to the right. It is a bold, community-driven standard that pioneers around the world are committing to in their daily transactions.</p>

<h3>Core Principles of GCV</h3>
<ul>
<li>Community-driven value determination</li>
<li>Transparency in valuation processes</li>
<li>Protection against market manipulation and black-market trading</li>
<li>Sustainable, long-term economic growth</li>
<li>Pi scarcity as a foundation for lasting value</li>
</ul>

<h3>Why It Matters for Africa</h3>
<p>Traditional financial systems have historically excluded large portions of Africa's population. GCV offers African pioneers the chance to enter the global digital economy on fair terms — with value set by consensus, not by external market forces.</p>

<p>From Nigeria to Kenya, Botswana to Burkina Faso, merchants and pioneers are adopting GCV as their standard for Pi transactions, building a grassroots economic ecosystem from the ground up.</p>

<h3>The Ambassador Network</h3>
<p>The GCV movement operates through appointed regional ambassadors who organise events, share educational resources, and lead unified advocacy in their countries. Africa's five regional Commissioner Ambassadors coordinate this work across Southern, Northern, Western, Eastern, and Central Africa.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    category: 'GCV Movement',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-03-05',
    readTime: '7 min',
    viewCount: 1940
  },
  {
    id: '4',
    title: 'Botswana GCV Education Workshop: Building a Strong Foundation',
    slug: 'botswana-gcv-education-workshop-2025',
    excerpt: 'Doris Yin and the Botswana GCV team convened a landmark education workshop, bringing together ambassadors and pioneers to strengthen the digital economy foundation across Southern Africa.',
    content: `<p>The Botswana GCV Education Workshop brought together pioneers, ambassadors, and community leaders in a focused programme of learning and empowerment, reinforcing the foundations of the GCV movement in Southern Africa.</p>

<h3>Workshop Leadership</h3>
<ul>
<li><strong>Doris Yin</strong> — Grand GCV Global Ambassador & Founder, Global GCV Movement (Keynote)</li>
<li><strong>Daniel Nkala</strong> — Head of GCV Ambassadors, Botswana</li>
<li><strong>Baikoketsi Modongo</strong> — Education GCV Ambassador, Botswana</li>
<li><strong>Rakgadi Gontse</strong> — Ecosystem Development GCV Ambassador, Botswana</li>
</ul>

<h3>Keynote: "Building a Strong Foundation"</h3>
<p>Doris Yin's keynote message — "Building a Strong Foundation, A Pillar for a Bright Future" — emphasised community leadership, education, and unity as the pillars of a sustainable, inclusive digital economy.</p>

<p>She highlighted that the GCV movement's strength lies not in its price target alone, but in the depth of understanding and commitment among pioneers at every level — from grassroots community members to global ambassadors.</p>

<h3>Workshop Outcomes</h3>
<p>Participants left equipped with practical knowledge of GCV principles, strategies for onboarding merchants in their communities, and a clearer vision of how Southern Africa fits into the global Pi Network ecosystem.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
    category: 'Events',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-11-10',
    readTime: '5 min',
    viewCount: 1580,
    country: 'Botswana'
  },
  {
    id: '5',
    title: 'Nigeria Joins the Pi Network Revolution: GCV Powers a People-Driven Economy',
    slug: 'nigeria-pi-network-gcv-revolution-2026',
    excerpt: 'Nigeria, long recognised as Africa\'s tech innovation hub, is becoming a leading force in the GCV merchant adoption movement across the continent.',
    content: `<p>Nigeria has long been recognised as a hub for technological adoption and innovation in Africa, and now the country is emerging as a frontrunner in the Global Consensus Value merchant ecosystem.</p>

<p>Across Lagos, Abuja, and other major cities, Pi Network pioneers are establishing GCV-priced businesses — from food vendors and tailors to tutors and logistics providers — all transacting in Pi at the $314,159 GCV standard.</p>

<h3>A People-Powered Economy</h3>
<p>What makes Nigeria's GCV adoption remarkable is its grassroots nature. Rather than waiting for institutional adoption, Nigerian pioneers have built a merchant network from the ground up, driven by community trust and shared vision.</p>

<h3>Merchant Categories Growing in Nigeria</h3>
<ul>
<li>Food and beverage vendors</li>
<li>Fashion and clothing merchants</li>
<li>Education and tutoring services</li>
<li>Transportation and logistics</li>
<li>Digital and professional services</li>
</ul>

<h3>A Continental Signal</h3>
<p>Nigeria's momentum is sending a powerful signal across Africa. As the continent's most populous nation embraces GCV, it strengthens the case for Pi Network as a viable everyday currency — and positions Africa as a global leader in decentralised digital commerce.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category: 'Community',
    author: 'Olivier Ndatimana',
    publishedAt: '2026-02-14',
    readTime: '6 min',
    viewCount: 2340,
    country: 'Nigeria'
  },
  {
    id: '7',
    title: 'Pi Network Open Network Goes Live — February 20, 2025',
    slug: 'pi-network-open-network-launch-february-2025',
    excerpt: 'Pi Network officially launched its Open Network on February 20, 2025, marking the most significant milestone in the network\'s history and opening Pi to the broader blockchain world.',
    content: `<p>At 8:00 AM UTC on February 20, 2025, Pi Network launched its Open Network — the most transformative milestone in the project's history. This upgrade unlocked external connectivity on the Mainnet blockchain, allowing Pi to interface with other compliant networks and real-world systems.</p>

<h3>What Open Network Means</h3>
<ul>
<li>Pi Mainnet can now connect with external blockchain systems and applications</li>
<li>Pioneers can use Pi in real-world transactions beyond the Pi app ecosystem</li>
<li>Over 10.14 million Mainnet migrations were completed ahead of launch — exceeding the original 10 million goal</li>
<li>19 million identity-verified Pioneers gained access to a live, utility-backed cryptocurrency</li>
</ul>

<h3>The Ecosystem at Launch</h3>
<p>Over 100 applications were live on Mainnet or ready for launch at the time of Open Network, with the number since growing to 253+ live Mainnet apps and 24,400+ apps under development through Pi App Studio.</p>

<h3>Africa and the Open Network</h3>
<p>For African pioneers, the Open Network represents a turning point. With Pi now externally connected, GCV merchants across Nigeria, Kenya, Rwanda, Botswana, and beyond can engage in genuine cross-border Pi transactions — building the decentralised African digital economy that the United GCV of Africa has been working toward.</p>

<h3>What's Next</h3>
<p>Pi Network Ventures has committed a $100 million fund to support utility-driven apps, including Africa-focused developer programmes. The Africa Developer Program will invest 5 million Pi to incentivise decentralised app development in Nigeria, focusing on agricultural supply chain and medical payments.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    category: 'Pi Network',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-02-20',
    readTime: '6 min',
    viewCount: 4820
  },
  {
    id: '6',
    title: 'The 3rd Global GCV Conference: Pioneers Rise Across the World',
    slug: '3rd-global-gcv-conference-2025',
    excerpt: 'The 3rd Global GCV Conference sent a powerful signal: pioneers worldwide are united, ready for full Open Mainnet, and committed to the GCV movement\'s vision.',
    content: `<p>The 3rd Global GCV Conference was more than an event — it was a declaration. Under the rallying cry "Rise! Rise! Rise!", pioneers from across the world gathered to demonstrate their unity and readiness for the next chapter of the Pi Network journey.</p>

<p>Grand GCV Global Ambassador Doris Yin addressed the global pioneer community: "We are here not just to hold another event, but to ignite a movement, to send a signal across the world, and to prove that pioneers are ready for the full Open Mainnet of Pi."</p>

<h3>Key Themes</h3>
<ul>
<li>Global unity among GCV ambassadors and army warriors</li>
<li>Readiness for Pi Network's full Open Mainnet</li>
<li>Merchant adoption as the foundation of Pi's real-world utility</li>
<li>Building the 1,000 GCV Ambassadors and 1,000 GCV Army Warriors</li>
</ul>

<h3>The GCV Army</h3>
<p>The GCV Core Team is forming two crucial groups to advance the movement: 1,000 GCV Ambassadors to lead with clarity and 1,000 GCV Army Warriors to protect the mission with boldness. African pioneers are encouraged to step forward and join both corps.</p>

<h3>Africa's Role</h3>
<p>Africa's five regional Commissioner Ambassadors, led by Olivier Ndatimana and coordinated with the Global Core Team, represent the continent's growing voice in shaping the future of Pi Network.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1551818255-e6e10579a0ab?w=800&q=80',
    category: 'Events',
    author: 'Olivier Ndatimana',
    publishedAt: '2025-10-05',
    readTime: '5 min',
    viewCount: 3050
  },
  {
    id: '8',
    title: 'Pi Day 2026: AI-Powered KYC, Token Launchpad & Validator Rewards',
    slug: 'pi-day-2026-ai-kyc-token-launchpad',
    excerpt: 'Pi Network\'s Pi Day 2026 announcements mark a leap forward: AI-driven KYC clearing millions of Tentative cases, a Token Launchpad in testnet, and 26.5M Pi distributed to KYC validators.',
    content: `<p>Pi Day 2026 (March 14, 2026) delivered some of the most significant feature announcements in Pi Network's history, reinforcing the ecosystem's commitment to utility, access, and decentralisation.</p>

<h3>AI-Powered KYC</h3>
<p>Pi Network integrated large-scale AI improvements into its KYC (Know Your Customer) system to handle verification across its 60+ million monthly active Pioneers. Key outcomes:</p>
<ul>
<li>Millions of "Tentative" KYC cases successfully cleared and moved to eligibility</li>
<li>50% reduction in human review backlogs</li>
<li>Enhanced fraud detection against bot-driven "farm" accounts</li>
<li>Mainnet migrations surpassed 16.7 million users</li>
</ul>

<h3>KYC Validator Rewards</h3>
<p>Pi Network completed its first KYC validator reward distribution — paying out more than <strong>26.5 million Pi</strong> to over one million validators worldwide who processed more than 526 million identity verification tasks. African validators who participated in the process are among those receiving rewards.</p>

<h3>Pi Token Launchpad (Testnet)</h3>
<p>Pi Day 2026 introduced the Pi Launchpad MVP on Testnet — a platform enabling developers to launch their own tokens within the Pi ecosystem. This opens a new chapter for African developers building on Pi's blockchain infrastructure.</p>

<h3>What It Means for African Pioneers</h3>
<p>For GCV pioneers across Africa, Pi Day 2026 signals that the path to full Mainnet access is getting clearer and faster. With AI removing KYC bottlenecks, more African pioneers can migrate to Mainnet and begin transacting at the GCV standard — $314,159 per Pi — in their communities.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80',
    category: 'Pi Network',
    author: 'Olivier Ndatimana',
    publishedAt: '2026-03-14',
    readTime: '7 min',
    viewCount: 5100
  }
];

// ─── NEW DATA TYPES ──────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: string;
  photo: string;
  bio: string;
  country: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  region: 'Africa' | 'Europe' | 'Asia' | 'USA';
  photo: string;
  bio: string;
  country: string;
}

export interface Ambassador {
  id: string;
  name: string;
  title: string;
  region: 'Africa' | 'Europe' | 'Asia' | 'USA';
  photo: string;
  country: string;
  contact?: string;
}

export interface AllianceMember {
  id: string;
  company: string;
  logo: string;
  sector: string;
  region: 'Africa' | 'Europe' | 'Asia' | 'USA';
  country: string;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  description: string;
  contact?: string;
  website?: string;
}

export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  priority: 'high' | 'normal';
}

export interface PressRelease {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  source?: string;
}

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Olivier Ndatimana',
    title: 'Founder & Vice-Director of Ecological Development',
    department: 'Leadership',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Olivier Ndatimana is the Founder of the United GCV of Africa and Vice-Director of Ecological Development for GCV International. Based in Rwanda, he has led the African GCV movement since its inception, uniting ambassadors across 54 nations.',
    country: 'Rwanda',
  },
  {
    id: '2',
    name: 'Doris Yin',
    title: 'Grand GCV Global Ambassador & Co-Founder',
    department: 'Leadership',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Doris Yin is the Grand GCV Global Ambassador and Founder of the Global GCV Movement. Her keynote at the Botswana Education Workshop — "Building a Strong Foundation, A Pillar for a Bright Future" — has inspired thousands of pioneers across Africa.',
    country: 'Global',
  },
  {
    id: '3',
    name: 'Daniel Nkala',
    title: 'Head of GCV Ambassadors — Botswana',
    department: 'Ambassadors',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bio: 'Daniel Nkala leads the GCV Ambassador corps in Botswana, coordinating education workshops, merchant onboarding, and community events across Southern Africa.',
    country: 'Botswana',
  },
  {
    id: '4',
    name: 'Baikoketsi Modongo',
    title: 'Education GCV Ambassador',
    department: 'Education',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    bio: 'Baikoketsi Modongo leads GCV education programmes in Botswana, empowering pioneers with knowledge of the GCV framework and Pi Network fundamentals.',
    country: 'Botswana',
  },
  {
    id: '5',
    name: 'Rakgadi Gontse',
    title: 'Ecosystem Development GCV Ambassador',
    department: 'Ecosystem',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Rakgadi Gontse drives ecosystem growth and merchant adoption across Botswana, building bridges between local businesses and the global Pi Network economy.',
    country: 'Botswana',
  },
  {
    id: '6',
    name: 'Amara Diallo',
    title: 'Head of Finance & Operations',
    department: 'Finance',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    bio: 'Amara Diallo oversees financial operations and resource allocation for the United GCV of Africa, ensuring the movement operates sustainably and transparently.',
    country: 'Senegal',
  },
  {
    id: '7',
    name: 'Chioma Okafor',
    title: 'Head of Communications',
    department: 'Communications',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    bio: 'Chioma Okafor leads communications and media strategy for the United GCV of Africa, managing outreach across social media, press, and community channels.',
    country: 'Nigeria',
  },
  {
    id: '8',
    name: 'Kwame Asante',
    title: 'Head of Events & Conferences',
    department: 'Events',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    bio: "Kwame Asante organises GCV conferences, workshops, and community events across the continent, building the infrastructure for the movement's growing calendar.",
    country: 'Ghana',
  },
];

// ─── FOUNDERS ─────────────────────────────────────────────────────────────────

export const founders: Founder[] = [
  {
    id: '1',
    name: 'Olivier Ndatimana',
    role: 'Founding Director — United GCV of Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Visionary behind the United GCV of Africa. Established the five-region continental structure and led Africa\'s unification under a single GCV voice.',
    country: 'Rwanda',
  },
  {
    id: '2',
    name: 'Doris Yin',
    role: 'Grand GCV Global Ambassador & Global Founding Member',
    region: 'Asia',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    bio: 'Founder of the Global GCV Movement and originator of the $314,159 GCV standard. Doris has inspired millions of pioneers worldwide through education and leadership.',
    country: 'China',
  },
  {
    id: '3',
    name: 'Emmanuel Traoré',
    role: 'Co-Founder — Western Africa GCV Chapter',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
    bio: 'Helped establish the Western Africa GCV Chapter, connecting pioneers across Senegal, Mali, Côte d\'Ivoire, and Nigeria under a unified GCV framework.',
    country: 'Côte d\'Ivoire',
  },
  {
    id: '4',
    name: 'Grace Mwangi',
    role: 'Co-Founder — Eastern Africa GCV Chapter',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    bio: 'Led the founding of the Eastern Africa GCV Chapter, with Kenya as the hub. Established GCV education programmes across Tanzania, Uganda, and Ethiopia.',
    country: 'Kenya',
  },
  {
    id: '5',
    name: 'Pierre Mbeki',
    role: 'Co-Founder — Southern Africa GCV Chapter',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bio: 'Established the Southern Africa GCV network, spanning Botswana, Zimbabwe, Zambia, and South Africa. Champion of GCV merchant adoption in the region.',
    country: 'South Africa',
  },
  {
    id: '6',
    name: 'Marie Lefebvre',
    role: 'Co-Founder — Europe GCV Alliance',
    region: 'Europe',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    bio: 'Founded the Europe GCV Alliance to connect the African diaspora in Europe with the continental GCV movement, creating a bridge for cross-border Pi transactions.',
    country: 'France',
  },
  {
    id: '7',
    name: 'James Osei',
    role: 'Co-Founder — USA GCV Network',
    region: 'USA',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Established the USA GCV Network for the African diaspora across America, advocating for GCV in international Pi Network policy discussions.',
    country: 'United States',
  },
  {
    id: '8',
    name: 'Fatima Al-Hassan',
    role: 'Co-Founder — Northern Africa GCV Chapter',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    bio: 'Founded the Northern Africa chapter spanning Egypt, Morocco, Tunisia, Algeria, and Libya, bringing Arab-African pioneers into the continental GCV network.',
    country: 'Egypt',
  },
];

// ─── AMBASSADORS ──────────────────────────────────────────────────────────────

export const ambassadors: Ambassador[] = [
  {
    id: '1',
    name: 'Chidi Okeke',
    title: 'GCV Commissioner Ambassador — Western Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    country: 'Nigeria',
    contact: 'western@africagcv.com',
  },
  {
    id: '2',
    name: 'Aisha Kamara',
    title: 'GCV Commissioner Ambassador — Central Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    country: 'Cameroon',
    contact: 'central@africagcv.com',
  },
  {
    id: '3',
    name: 'Tunde Adeyemi',
    title: 'GCV Commissioner Ambassador — Eastern Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    country: 'Kenya',
    contact: 'eastern@africagcv.com',
  },
  {
    id: '4',
    name: 'Nomvula Dlamini',
    title: 'GCV Commissioner Ambassador — Southern Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    country: 'South Africa',
    contact: 'southern@africagcv.com',
  },
  {
    id: '5',
    name: 'Hassan El-Amin',
    title: 'GCV Commissioner Ambassador — Northern Africa',
    region: 'Africa',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    country: 'Morocco',
    contact: 'northern@africagcv.com',
  },
  {
    id: '6',
    name: 'Sophie Bernard',
    title: 'GCV Ambassador — Europe',
    region: 'Europe',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    country: 'Belgium',
    contact: 'europe@africagcv.com',
  },
  {
    id: '7',
    name: 'Marcus Johnson',
    title: 'GCV Ambassador — USA East Coast',
    region: 'USA',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    country: 'United States',
    contact: 'usa@africagcv.com',
  },
  {
    id: '8',
    name: 'Yuki Tanaka',
    title: 'GCV Ambassador — Asia Pacific',
    region: 'Asia',
    photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
    country: 'Japan',
    contact: 'asia@africagcv.com',
  },
];

// ─── INDUSTRY ALLIANCE ────────────────────────────────────────────────────────

export const allianceMembers: AllianceMember[] = [
  {
    id: '1',
    company: 'AgriPi Solutions',
    logo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80',
    sector: 'Agriculture',
    region: 'Africa',
    country: 'Kenya',
    description: 'Agricultural technology company connecting African farmers to Pi-based supply chains and payment systems.',
  },
  {
    id: '2',
    company: 'EduChain Africa',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80',
    sector: 'Education',
    region: 'Africa',
    country: 'Nigeria',
    description: 'Online learning platform offering GCV-priced courses across Africa, with over 50,000 enrolled pioneers.',
  },
  {
    id: '3',
    company: 'Pi Health Clinic Network',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&q=80',
    sector: 'Healthcare',
    region: 'Africa',
    country: 'Rwanda',
    description: 'Network of 12 clinics across Rwanda accepting Pi at GCV for medical consultations and services.',
  },
  {
    id: '4',
    company: 'LogiPi Transport',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
    sector: 'Logistics',
    region: 'Africa',
    country: 'South Africa',
    description: 'Cross-border logistics and delivery service operating across Southern Africa with Pi payment integration.',
  },
  {
    id: '5',
    company: 'TechHub Dakar',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80',
    sector: 'Technology',
    region: 'Africa',
    country: 'Senegal',
    description: 'Technology innovation hub in Dakar, supporting African developers building Pi-powered decentralised apps.',
  },
  {
    id: '6',
    company: 'Euro Pi Trade',
    logo: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=200&q=80',
    sector: 'Trade & Commerce',
    region: 'Europe',
    country: 'Germany',
    description: 'European trade company facilitating Pi-denominated commerce between African exporters and European buyers.',
  },
  {
    id: '7',
    company: 'Asia GCV Ventures',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=80',
    sector: 'Venture Capital',
    region: 'Asia',
    country: 'Singapore',
    description: 'Venture fund investing in Pi Network ecosystem projects with a focus on African and Asian market opportunities.',
  },
  {
    id: '8',
    company: 'AmeriPi Foundation',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&q=80',
    sector: 'Non-Profit',
    region: 'USA',
    country: 'United States',
    description: 'Non-profit organisation advocating for Pi Network adoption in underserved communities across the Americas and Africa.',
  },
];

// ─── MERCHANTS ────────────────────────────────────────────────────────────────

export const merchants: Merchant[] = [
  {
    id: '1',
    name: 'Mama Africa Kitchen',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
    category: 'Food & Beverage',
    country: 'Nigeria',
    description: 'Authentic West African restaurant in Lagos accepting Pi at GCV for all meals and catering services.',
    contact: 'mamaafrica@email.com',
  },
  {
    id: '2',
    name: 'Kigali Tech Store',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80',
    category: 'Technology',
    country: 'Rwanda',
    description: 'Electronics and tech accessories store in Kigali, Rwanda. Full GCV pricing on all products.',
    contact: 'kigalitech@email.com',
    website: 'https://kigalitech.rw',
  },
  {
    id: '3',
    name: 'Ubuntu Tailors',
    logo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80',
    category: 'Fashion & Clothing',
    country: 'South Africa',
    description: 'Custom African fashion and traditional clothing studio in Johannesburg accepting Pi at GCV.',
    contact: 'ubuntu@email.com',
  },
  {
    id: '4',
    name: 'Nairobi Pi Academy',
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80',
    category: 'Education',
    country: 'Kenya',
    description: 'Coding bootcamp and digital skills training centre. All courses payable in Pi at GCV standard.',
    contact: 'academy@email.com',
    website: 'https://nairobipiacademy.ke',
  },
  {
    id: '5',
    name: 'PiRide Ghana',
    logo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&q=80',
    category: 'Transport',
    country: 'Ghana',
    description: 'Ride-hailing service in Accra accepting Pi payments at the GCV rate for all journeys.',
    contact: 'piride@email.com',
  },
  {
    id: '6',
    name: 'SahelFarm Produce',
    logo: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=200&q=80',
    category: 'Agriculture',
    country: 'Senegal',
    description: 'Fresh organic produce farm in the Sahel region delivering to Dakar and accepting Pi for all orders.',
    contact: 'sahelfarm@email.com',
  },
  {
    id: '7',
    name: 'Cairo Pi Consulting',
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&q=80',
    category: 'Professional Services',
    country: 'Egypt',
    description: 'Business and legal consulting firm in Cairo accepting Pi at GCV for all professional services.',
    contact: 'consulting@email.com',
  },
  {
    id: '8',
    name: 'Kampala Pi Health',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&q=80',
    category: 'Healthcare',
    country: 'Uganda',
    description: 'Private health clinic in Kampala offering consultations, lab tests, and pharmacy — all at GCV pricing.',
    contact: 'health@email.com',
  },
];

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Pi Network Open Network is Now Live',
    excerpt: 'As of February 20, 2025, Pi Network\'s Open Network is officially live. All KYC-verified pioneers on Mainnet can now transact externally.',
    content: '<p>Pi Network\'s Open Network launched on February 20, 2025, opening the blockchain to external connectivity. All KYC-verified, Mainnet-migrated pioneers can now transact in Pi outside the Pi app ecosystem.</p><p>This milestone is the result of years of community work, and Africa\'s GCV movement stands at the forefront of real-world Pi adoption.</p>',
    publishedAt: '2025-02-20',
    priority: 'high',
  },
  {
    id: '2',
    title: '4th Global GCV Conference — Registration Now Open',
    excerpt: 'Registration for the 4th Global GCV Conference in Kigali, Rwanda (October 15, 2026) is now open. All GCV ambassadors and pioneers are invited.',
    content: '<p>The 4th Global GCV Conference will be held in Kigali, Rwanda on October 15, 2026. This is the most important annual gathering of the GCV movement and all registered ambassadors are expected to attend.</p><p>Register via the Events page. Accommodation guidance and agenda will be shared by August 2026.</p>',
    publishedAt: '2026-07-01',
    priority: 'high',
  },
  {
    id: '3',
    title: 'New GCV Ambassador Training Programme Launched',
    excerpt: 'The United GCV of Africa has launched a structured training programme for all new and existing ambassadors. Enrolment is open now.',
    content: '<p>The new GCV Ambassador Training Programme provides structured education on GCV principles, merchant onboarding, community leadership, and communication. All new ambassadors must complete this programme before receiving official certification.</p>',
    publishedAt: '2026-03-15',
    priority: 'normal',
  },
];

// ─── PRESS RELEASES ───────────────────────────────────────────────────────────

export const pressReleases: PressRelease[] = [
  {
    id: '1',
    title: 'United GCV of Africa Establishes Continental Alliance Covering All 54 African Nations',
    excerpt: 'The United GCV of Africa today announced the completion of its five-region continental framework, with Commissioner Ambassadors now representing all 54 African nations in the GCV movement.',
    content: '<p><strong>Kigali, Rwanda — January 12, 2025</strong> — The United GCV of Africa today announced the successful establishment of its five-region continental framework, appointing Commissioner Ambassadors for Southern, Northern, Western, Eastern, and Central Africa. This milestone means that all 54 African nations are now represented within the GCV movement.</p><p>Founding Director Olivier Ndatimana stated: "This is a historic moment for Africa\'s role in the global Pi Network ecosystem. With all regions represented, we speak as one voice."</p>',
    publishedAt: '2025-01-12',
    source: 'United GCV of Africa',
  },
  {
    id: '2',
    title: 'Africa GCV Alliance Announces 500+ Active GCV Merchants Across the Continent',
    excerpt: 'The Africa GCV Alliance today reported that over 500 merchants across Africa are now registered and actively transacting in Pi at the GCV standard of $314,159 per Pi.',
    content: '<p><strong>Kigali, Rwanda — April 2026</strong> — The Africa GCV Alliance today announced that more than 500 merchants across 22 African countries are now officially registered GCV merchants, accepting Pi at the $314,159 GCV standard in everyday transactions.</p><p>Categories represented include food and beverage, fashion, education, healthcare, transport, and professional services.</p>',
    publishedAt: '2026-04-01',
    source: 'Africa GCV Alliance',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Tesla Model S',
    slug: 'tesla-model-s',
    description: `<p>The Tesla Model S delivers exhilarating all-electric performance, industry-leading range, and cutting-edge autopilot technology in a premium sedan body.</p>

<h3>Key Specifications</h3>
<ul>
<li>0–100 km/h in 3.1 seconds</li>
<li>Up to 650 km range on a single charge</li>
<li>Full self-driving capability (hardware included)</li>
<li>17-inch cinematic center touchscreen</li>
<li>Premium interior with heated and ventilated seats</li>
</ul>

<p>Sold and delivered by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: 'All-electric luxury sedan with industry-leading range and autopilot.',
    price: 89999,
    compareAtPrice: 94999,
    category: 'Sedans',
    images: [
      'https://images.unsplash.com/photo-1676856577533-1e8099932f7b?w=800&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80'
    ],
    inventory: 3,
    featured: true,
    rating: 4.9,
    reviewCount: 58,
    merchantName: 'Kigali Motors'
  },
  {
    id: '2',
    name: 'Porsche 911',
    slug: 'porsche-911',
    description: `<p>The Porsche 911 is the definitive sports car — a perfect blend of everyday usability and track-ready performance, refined over six decades.</p>

<h3>Key Specifications</h3>
<ul>
<li>3.0L twin-turbo flat-six engine</li>
<li>0–100 km/h in 3.5 seconds</li>
<li>8-speed PDK dual-clutch transmission</li>
<li>Rear-wheel or all-wheel drive available</li>
<li>Iconic silhouette, timeless design</li>
</ul>

<p>Available through our certified GCV Merchant network. Financing and Pi payment plans available.</p>`,
    shortDescription: 'Iconic rear-engine sports car with track-ready performance.',
    price: 121999,
    category: 'Sports Cars',
    images: [
      'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
      'https://images.unsplash.com/photo-1621285853634-713b8dd6b5fd?w=800&q=80'
    ],
    inventory: 2,
    featured: true,
    rating: 4.9,
    reviewCount: 41,
    merchantName: 'Prestige Auto Africa'
  },
  {
    id: '3',
    name: 'Range Rover Sport',
    slug: 'range-rover-sport',
    description: `<p>The Range Rover Sport combines commanding presence with dynamic performance, built for both city driving and serious off-road capability.</p>

<h3>Key Specifications</h3>
<ul>
<li>Terrain Response 2 all-terrain system</li>
<li>Air suspension with adjustable ride height</li>
<li>Luxurious leather interior with panoramic sunroof</li>
<li>Advanced driver assistance suite</li>
<li>Towing capacity up to 3,500 kg</li>
</ul>

<p>Sold by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: 'Commanding luxury SUV with serious off-road capability.',
    price: 84999,
    category: 'SUVs',
    images: [
      'https://images.unsplash.com/photo-1602013871952-8379f19a15f1?w=800&q=80',
      'https://images.unsplash.com/photo-1638686302275-0e87df720aca?w=800&q=80'
    ],
    inventory: 4,
    featured: true,
    rating: 4.7,
    reviewCount: 63,
    merchantName: 'Kigali Motors'
  },
  {
    id: '4',
    name: 'Ford Mustang GT',
    slug: 'ford-mustang-gt',
    description: `<p>The Ford Mustang GT is a true American muscle car — a 5.0L V8 roar, aggressive styling, and thrilling performance at an accessible price.</p>

<h3>Key Specifications</h3>
<ul>
<li>5.0L Coyote V8 engine, 480 hp</li>
<li>0–100 km/h in 4.3 seconds</li>
<li>6-speed manual or 10-speed automatic</li>
<li>Selectable drive modes including Track</li>
<li>Available as coupe or convertible</li>
</ul>

<p>Available through our certified GCV Merchant network. Pi payment plans available.</p>`,
    shortDescription: 'American muscle car with a thunderous 5.0L V8.',
    price: 54999,
    compareAtPrice: 59999,
    category: 'Sports Cars',
    images: [
      'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80',
      'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&q=80'
    ],
    inventory: 5,
    featured: false,
    rating: 4.6,
    reviewCount: 37,
    merchantName: 'Alliance Auto Dealers'
  },
  {
    id: '5',
    name: 'Mercedes-Benz G-Wagon',
    slug: 'mercedes-benz-g-wagon',
    description: `<p>The Mercedes-Benz G-Wagon is a legendary luxury off-roader, combining boxy iconic design with a plush, tech-forward cabin and serious 4x4 credentials.</p>

<h3>Key Specifications</h3>
<ul>
<li>AMG-tuned V8 biturbo engine</li>
<li>Three locking differentials for extreme off-road capability</li>
<li>MBUX infotainment with dual widescreen displays</li>
<li>Nappa leather interior with ambient lighting</li>
<li>Iconic boxy silhouette, unchanged since 1979</li>
</ul>

<p>Sold by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: 'Legendary luxury off-roader with unmistakable presence.',
    price: 179999,
    category: 'Luxury',
    images: [
      'https://images.unsplash.com/photo-1648413653877-ade5eefd2f1b?w=800&q=80',
      'https://images.unsplash.com/photo-1634636208509-63bcd2a1b13f?w=800&q=80'
    ],
    inventory: 2,
    featured: true,
    rating: 5.0,
    reviewCount: 29,
    merchantName: 'Prestige Auto Africa'
  },
  {
    id: '6',
    name: 'BMW X5',
    slug: 'bmw-x5',
    description: `<p>The BMW X5 delivers the perfect balance of sporty driving dynamics and everyday practicality in a mid-size luxury SUV.</p>

<h3>Key Specifications</h3>
<ul>
<li>3.0L inline-6 turbocharged engine</li>
<li>xDrive all-wheel drive</li>
<li>Adaptive M suspension</li>
<li>Panoramic sky lounge roof</li>
<li>Seating for up to seven</li>
</ul>

<p>Available through our certified GCV Merchant network. Financing and Pi payment plans available.</p>`,
    shortDescription: 'Sporty mid-size luxury SUV with xDrive all-wheel drive.',
    price: 68999,
    category: 'SUVs',
    images: [
      'https://images.unsplash.com/photo-1696294586764-6baffd088b71?w=800&q=80',
      'https://images.unsplash.com/photo-1674996047492-6b5cdc2dcf0a?w=800&q=80'
    ],
    inventory: 4,
    featured: false,
    rating: 4.7,
    reviewCount: 44,
    merchantName: 'Alliance Auto Dealers'
  },
  {
    id: '7',
    name: 'Toyota Land Cruiser',
    slug: 'toyota-land-cruiser',
    description: `<p>The Toyota Land Cruiser is the gold standard of rugged reliability across Africa — built to handle any terrain while carrying the whole family in comfort.</p>

<h3>Key Specifications</h3>
<ul>
<li>Full-time four-wheel drive with locking center differential</li>
<li>Renowned reliability and low maintenance costs</li>
<li>Spacious 7–8 seat configuration</li>
<li>High ground clearance for rough terrain</li>
<li>Trusted by GCV merchants and NGOs across the continent</li>
</ul>

<p>Sold by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: "Africa's most trusted rugged 4x4, built for any terrain.",
    price: 74999,
    category: 'SUVs',
    images: [
      'https://images.unsplash.com/photo-1554841649-de947c4b954a?w=800&q=80',
      'https://images.unsplash.com/photo-1650530579355-7ad9d4766043?w=800&q=80'
    ],
    inventory: 6,
    featured: false,
    rating: 4.9,
    reviewCount: 91,
    merchantName: 'Kigali Motors'
  },
  {
    id: '8',
    name: 'Jeep Wrangler',
    slug: 'jeep-wrangler',
    description: `<p>The Jeep Wrangler is the ultimate off-road icon — removable doors and roof, solid axles, and unstoppable trail capability wrapped in unmistakable style.</p>

<h3>Key Specifications</h3>
<ul>
<li>Solid front and rear axles for maximum articulation</li>
<li>Removable doors, roof, and fold-down windshield</li>
<li>Available 4xe plug-in hybrid powertrain</li>
<li>Rock-Trac 4WD system with locking differentials</li>
<li>Legendary trail-rated capability</li>
</ul>

<p>Available through our certified GCV Merchant network. Pi payment plans available.</p>`,
    shortDescription: 'Legendary trail-rated 4x4 with removable doors and roof.',
    price: 42999,
    category: 'SUVs',
    images: [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&q=80',
      'https://images.unsplash.com/photo-1595392004747-3d9b64a4b013?w=800&q=80'
    ],
    inventory: 5,
    featured: false,
    rating: 4.6,
    reviewCount: 38,
    merchantName: 'Alliance Auto Dealers'
  },
  {
    id: '9',
    name: 'Lamborghini Aventador',
    slug: 'lamborghini-aventador',
    description: `<p>The Lamborghini Aventador is a naturally-aspirated V12 supercar — a scissor-door masterpiece that delivers pure, uncompromising Italian performance.</p>

<h3>Key Specifications</h3>
<ul>
<li>6.5L naturally-aspirated V12, 730 hp</li>
<li>0–100 km/h in 2.9 seconds</li>
<li>Top speed of 350 km/h</li>
<li>Signature scissor doors</li>
<li>Carbon-fiber monocoque chassis</li>
</ul>

<p>Sold by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: 'Naturally-aspirated V12 supercar with scissor doors.',
    price: 398999,
    category: 'Sports Cars',
    images: [
      'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80'
    ],
    inventory: 1,
    featured: false,
    rating: 5.0,
    reviewCount: 12,
    merchantName: 'Prestige Auto Africa'
  },
  {
    id: '10',
    name: 'Rolls-Royce Phantom',
    slug: 'rolls-royce-phantom',
    description: `<p>The Rolls-Royce Phantom is the pinnacle of automotive luxury — handcrafted, whisper-quiet, and engineered to the highest standard on earth.</p>

<h3>Key Specifications</h3>
<ul>
<li>6.75L twin-turbo V12 engine</li>
<li>Handcrafted starlight headliner</li>
<li>Bespoke coach-built interior options</li>
<li>Self-leveling air suspension for a "magic carpet ride"</li>
<li>Iconic Spirit of Ecstasy hood ornament</li>
</ul>

<p>Available through our certified GCV Merchant network. Reserved for select GCV pioneers.</p>`,
    shortDescription: 'The pinnacle of handcrafted automotive luxury.',
    price: 460999,
    category: 'Luxury',
    images: [
      'https://images.unsplash.com/photo-1696233016084-30c8345d85ff?w=800&q=80',
      'https://images.unsplash.com/photo-1740098160485-d098fbf42814?w=800&q=80'
    ],
    inventory: 1,
    featured: true,
    rating: 5.0,
    reviewCount: 9,
    merchantName: 'Prestige Auto Africa'
  },
  {
    id: '11',
    name: 'Audi Q7',
    slug: 'audi-q7',
    description: `<p>The Audi Q7 is a refined three-row luxury SUV, offering quattro all-wheel drive, a serene cabin, and cutting-edge Audi virtual cockpit technology.</p>

<h3>Key Specifications</h3>
<ul>
<li>quattro permanent all-wheel drive</li>
<li>Three-row seating for up to seven</li>
<li>Audi virtual cockpit digital instrument display</li>
<li>Adaptive air suspension</li>
<li>Premium Bang & Olufsen sound system available</li>
</ul>

<p>Sold by a certified GCV Merchant dealership. Priced in Pi at the community GCV target.</p>`,
    shortDescription: 'Refined three-row luxury SUV with quattro all-wheel drive.',
    price: 63999,
    category: 'SUVs',
    images: [
      'https://images.unsplash.com/photo-1532974143451-8162d38a1257?w=800&q=80'
    ],
    inventory: 3,
    featured: false,
    rating: 4.5,
    reviewCount: 26,
    merchantName: 'Kigali Motors'
  },
  {
    id: '12',
    name: 'Chevrolet Camaro',
    slug: 'chevrolet-camaro',
    description: `<p>The Chevrolet Camaro delivers bold muscle-car styling with sharp handling, offering serious performance at a more attainable price point.</p>

<h3>Key Specifications</h3>
<ul>
<li>V6 or V8 engine options</li>
<li>Available 10-speed automatic or 6-speed manual</li>
<li>Magnetic Ride Control suspension (SS trim)</li>
<li>Aggressive, low-slung muscle-car styling</li>
<li>Coupe and convertible body styles</li>
</ul>

<p>Available through our certified GCV Merchant network. Pi payment plans available.</p>`,
    shortDescription: 'Bold muscle car styling with sharp, attainable performance.',
    price: 45999,
    category: 'Sports Cars',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=800&q=80'
    ],
    inventory: 4,
    featured: false,
    rating: 4.5,
    reviewCount: 33,
    merchantName: 'Alliance Auto Dealers'
  }
];
