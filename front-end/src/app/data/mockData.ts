

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

// ─── NEW DATA TYPES ──────────────────────────────────────────────────────────

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

export interface PressRelease {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  source?: string;
}

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
