// Single source of facts and copy. Rendered into the HTML at build time by
// src/render.js (Vite plugin in vite.config.js); runtime JS only adds what
// depends on the visitor (filters, "open now", recently viewed).
//
// Sources: kit copy (06-roteiros/CONTEUDO-EN.md) for the opening and the four
// photo scenes; rumicafedublin.netlify.app (Rumi's online ordering site) for
// menu, prices, hours, locations, reviews, story, gallery and Coffee Club.
// Facts still to confirm with the owner are listed in README > Content
// checklist and marked TODO(rumi).

// Live URL (canonical / og:url). TODO(rumi): switch to the final domain.
export const SITE_URL = 'https://rumi-cafe-francis-street.vercel.app';

// Adding to the bag, checkout, payment and Coffee Club sign-up live on the
// online ordering site; every "Add", "Order now", bag and "Join" button
// sends the visitor there. TODO(rumi): that site keeps the bag in memory
// only, so "Add" cannot pre-fill an item; an ?add=<id> parameter there would
// let each button drop its item straight into the bag (ids below match).
const ORDER_BASE = 'https://rumicafedublin.netlify.app';
export const order = {
  base: ORDER_BASE,
  menu: `${ORDER_BASE}/menu`,
  checkout: `${ORDER_BASE}/checkout`,
  club: `${ORDER_BASE}/events`,
  name: 'Rumi online ordering',
};

export const brand = {
  name: 'Rumi Cafe',
  fullName: 'Rumi Café Bar',
  tagline: 'Your perfect little pause.',
  description: 'Your perfect little pause. Speciality coffee, Turkish treats and a warm welcome at Rumi Cafe, 28 Francis Street, Dublin 8.',
  footerLine: "Dublin's Mediterranean oasis. Authentic flavours, artisan coffee and a sanctuary for all.",
};

export const contact = {
  street: '28 Francis Street',
  area: 'The Liberties, Dublin 8',
  eircode: 'D08 PF61',
  city: 'Dublin',
  country: 'Ireland',
  // TODO(rumi): phone and e-mail come from the ordering site; confirm both are monitored.
  phone: '+353 87 222 7111',
  phoneHref: 'tel:+353872227111',
  email: 'hello@rumicafedublin.com',
  instagram: 'https://www.instagram.com/rumicafedublin/',
  instagramHandle: '@rumicafedublin',
  facebook: 'https://www.facebook.com/rumicafedublin/',
  tripadvisor: 'https://www.tripadvisor.com/Restaurant_Review-g186605-d27136762-Reviews-Rumi_Cafe-Dublin_County_Dublin.html',
  // Google place of the café (place id ChIJLUld51sNZ0gRFGcmHxtD_fk), not an address search.
  place: 'https://maps.google.com/?cid=18013627868317640468',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=Rumi%20Cafe%2C%2028%20Francis%20Street%2C%20Dublin&destination_place_id=ChIJLUld51sNZ0gRFGcmHxtD_fk',
  reviews: 'https://maps.google.com/?cid=18013627868317640468',
  coffeeRoaster: { name: 'Imbibe Coffee', handle: '@imbibe_coffee' },
};

// Francis Street hours (ordering site, location card; matches the Instagram
// profile for Mon-Sat). TODO(rumi): the ordering site also says "open daily
// 7am-7pm" in two places; confirm Sunday.
export const hours = [
  { days: 'Monday – Saturday', short: 'Mon–Sat', dayIdx: [1, 2, 3, 4, 5, 6], open: '07:00', close: '19:00' },
  { days: 'Sunday', short: 'Sun', dayIdx: [0], open: '08:00', close: '18:00' },
];

// TODO(rumi): 4.9 from 955 Google reviews, as on the ordering site; refresh before launch.
export const rating = { score: '4.9', count: 955, source: 'Google' };

export const nav = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'story', label: 'Story', href: '/story/' },
  { id: 'menu', label: 'Menu', href: '/menu/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery/' },
  { id: 'club', label: 'Coffee Club', href: '/coffee-club/' },
];

// ---------------------------------------------------------------- menu ----

export const menuCategories = [
  { id: 'all', label: 'All items' },
  { id: 'specials', label: 'Specials' },
  { id: 'Coffee', label: 'Coffee' },
  { id: 'Specialty', label: 'Drinks' },
  { id: 'Pastry', label: 'Pastry' },
  { id: 'Cookies', label: 'Cookies' },
  { id: 'Panini', label: 'Food' },
];

export const dietFilters = [
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Gluten-Free', label: 'Gluten-free' },
  { id: 'Sugar-Free', label: 'No sugar' },
  { id: 'Dairy-Free', label: 'Dairy-free' },
  { id: 'Nuts', label: 'Nuts' },
];

export const menuGroups = [
  { id: 'drinks', title: 'Coffee & drinks', note: 'Speciality coffee from Imbibe, pulled to order.', categories: ['Coffee', 'Specialty', 'Tea'] },
  { id: 'bakery', title: 'Bakery', note: "From the counter: whatever's fresh today.", categories: ['Pastry', 'Cookies', 'Gluten-Free'] },
  { id: 'kitchen', title: 'Kitchen', note: 'Toasted to order.', categories: ['Panini', 'Meals'] },
];

const milk = (...names) => names.map((n) => ({ name: n, delta: n === 'Full fat' ? 0 : 0.5 }));

// ids match the ordering site's catalogue. image = key in photos.json;
// focus = object-position for the square thumbnail.
// TODO(rumi): confirm prices, allergens and the two gluten-free brownies.
export const menuItems = [
  { id: 'c1', slug: 'espresso', name: 'Espresso', description: 'Strong and pure espresso shot.', price: 2.8, category: 'Coffee', image: 'espresso', focus: '62% 78%', tags: ['Sugar-Free'], prep: '2–3 mins',
    sizes: [{ name: 'Single', delta: 0 }, { name: 'Double', delta: 0.6 }] },
  { id: 'c5', slug: 'latte', name: 'Latte', description: 'Smooth espresso with plenty of steamed milk.', price: 3.2, category: 'Coffee', image: 'latte', focus: '68% 30%', tags: ['Dairy'], bestseller: true, prep: '4–5 mins', pairings: ['p1', 'ck4'],
    sizes: [{ name: 'Small', delta: 0 }, { name: 'Medium', delta: 0.3 }, { name: 'Large', delta: 0.6 }], milk: milk('Full fat', 'Oat', 'Almond', 'Coconut') },
  { id: 'c7', slug: 'flat-white', name: 'Flat White', description: 'Espresso with a thin layer of velvety microfoam.', price: 3.2, category: 'Coffee', image: 'flat-white', focus: '45% 62%', tags: ['Dairy'], bestseller: true, prep: '3–4 mins', pairings: ['p1'],
    milk: milk('Full fat', 'Oat', 'Almond') },
  { id: 's1', slug: 'mocha', name: 'Mocha', description: 'Espresso with chocolate and steamed milk.', price: 3.7, category: 'Specialty', image: 'baklava', focus: '50% 42%', tags: ['Dairy', 'Gluten'], bestseller: true, prep: '5–6 mins', pairings: ['ck4'],
    sizes: [{ name: 'Standard', delta: 0 }, { name: 'Large', delta: 0.5 }], milk: milk('Full fat', 'Oat') },
  { id: 'ck4', slug: 'nutella-cookie', name: 'Nutella Cookie', description: 'Fudgy cookie with a Nutella heart.', price: 4.5, category: 'Cookies', image: 'cookie-case', focus: '40% 40%', tags: ['Dairy', 'Gluten', 'Nuts'], bestseller: true, sistersChoice: true, prep: 'Ready', pairings: ['c5', 'tea1'] },
  { id: 'p1', slug: 'butter-croissant', name: 'Butter Croissant', description: 'Golden, flaky and buttery.', price: 2.5, category: 'Pastry', image: 'croissant', focus: '70% 50%', tags: ['Dairy', 'Gluten'], bestseller: true, prep: 'Ready', pairings: ['c7', 'c1'] },
  { id: 'c2', slug: 'double-espresso', name: 'Double Espresso', description: 'A double shot of our premium roast.', price: 3.4, category: 'Coffee', image: 'espresso', focus: '80% 40%', prep: '2–3 mins' },
  { id: 'c3', slug: 'macchiato', name: 'Macchiato', description: 'Espresso marked with a dash of frothy milk.', price: 3.0, category: 'Coffee', image: 'macchiato', focus: '40% 70%', tags: ['Dairy'], prep: '3–4 mins' },
  { id: 'c4', slug: 'americano', name: 'Americano', description: 'Espresso with hot water for a classic black coffee.', price: 3.0, category: 'Coffee', image: 'to-go', focus: '35% 50%', prep: '2–3 mins' },
  { id: 'c6', slug: 'cappuccino', name: 'Cappuccino', description: 'Equal parts espresso, steamed milk and foam.', price: 3.2, category: 'Coffee', image: 'cappuccino', focus: '62% 70%', tags: ['Dairy'], prep: '4–5 mins' },
  { id: 's2', slug: 'hot-chocolate', name: 'Hot Chocolate', description: 'Rich, creamy chocolate drink.', price: 3.8, category: 'Specialty', image: 'croissant', focus: '12% 40%', tags: ['Dairy'], prep: '5–6 mins' },
  { id: 's3', slug: 'chai-latte', name: 'Chai Latte', description: 'Spiced aromatic tea with steamed milk.', price: 3.8, category: 'Specialty', image: 'chai', focus: '50% 55%', tags: ['Dairy'], prep: '5–6 mins' },
  { id: 'tea1', slug: 'breakfast-tea', name: 'Breakfast Tea', description: 'Classic and comforting black tea.', price: 2.0, category: 'Tea', image: 'tea-set', focus: '50% 78%', tags: ['Vegan', 'Gluten-Free', 'Dairy-Free'], prep: '3–4 mins' },
  { id: 'p2', slug: 'chocolate-croissant', name: 'Chocolate Croissant', description: 'Filled with rich dark chocolate.', price: 3.0, category: 'Pastry', image: 'window-seat', focus: '60% 78%', tags: ['Dairy', 'Gluten'], prep: 'Ready' },
  { id: 'ck1', slug: 'chocolate-chip-cookie', name: 'Classic Chocolate Chip', description: 'The timeless favourite cookie.', price: 3.5, category: 'Cookies', image: 'cookies', focus: '30% 50%', tags: ['Dairy', 'Gluten'], prep: 'Ready', pairings: ['c1'] },
  { id: 'br1', slug: 'chocolate-brownie', name: 'Chocolate Brownie', description: 'Fudgy and decadent chocolate brownie.', price: 3.7, category: 'Gluten-Free', image: 'brownie', focus: '50% 80%', tags: ['Dairy', 'Gluten-Free'], prep: 'Ready', pairings: ['c5'] },
  { id: 'gf1', slug: 'gf-brownie', name: 'GF Brownie', description: 'Rich chocolate brownie, gluten-free.', price: 3.7, category: 'Gluten-Free', image: 'table', focus: '48% 20%', tags: ['Dairy', 'Gluten-Free'], prep: 'Ready', pairings: ['c5'] },
  { id: 'pan1', slug: 'chicken-panini', name: 'Chicken Panini', description: 'Toasted with chicken and fresh ingredients.', price: 6.8, category: 'Panini', image: 'lunch', focus: '55% 75%', tags: ['Gluten'], prep: '8–10 mins' },
];

// ------------------------------------------------------------- reviews ----

export const reviews = [
  { name: 'Yulia L', date: 'Jan 2026', text: "The coffee with coconut milk is amazing. The staff is very friendly. I'd like to come back!" },
  { name: 'Natalie W', date: 'Jan 2026', text: 'Vibes are 10/10! This place is so cute and cosy inside. Lovely place to start sightseeing.' },
  { name: 'Cristie B', date: 'Jan 2026', text: 'The BEST!!! Chocolate croissants, cookies, iced latte — all so good. Will definitely come back!' },
  { name: 'Katy R', date: 'Dec 2025', text: 'Beautiful people, beautiful coffee. Complimentary Turkish delight was a treat. Such a vibe!' },
  { name: 'Sajedeh N', date: 'Dec 2025', text: 'Fast service & nice staff. White mocha was delicious with cheese borek. Will go back!' },
  { name: 'Nicholas S', date: 'Nov 2025', text: 'Great coffee and pastries! The interior has a cosy setup. Also has outdoor seating.' },
];

// ----------------------------------------------------------- locations ----

// TODO(rumi): the Instagram profile lists "1 Scarlet Row, Essex Street D8" as
// the second address; the ordering site says Temple Bar Square, Dublin 2.
export const locations = [
  { id: 'francis', name: 'Francis Street', badge: 'Flagship', type: 'Full café', address: '28 Francis Street, The Liberties, Dublin 8, D08 PF61',
    hoursText: 'Mon–Sat 7:00–19:00 · Sun 8:00–18:00', image: 'storefront', directions: contact.directions, primary: true,
    coords: [53.34186, -6.27499] },
  { id: 'templebar', name: 'Temple Bar', badge: 'Pop-up', type: 'Treat counter', address: 'Temple Bar Square, Dublin 2',
    hoursText: 'Thu–Sun 10:00–18:00', image: 'takeaway',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=Temple%20Bar%20Square%2C%20Dublin%202',
    coords: [53.34549, -6.26312] },
];

// -------------------------------------------------------------- home ----

export const home = {
  hero: {
    eyebrow: 'A little corner of Dublin.',
    titleA: 'Your perfect',
    titleB: 'little pause.',
    note: 'Coffee, company &<br>a little sweetness.',
    lead: 'A Turkish-Irish café on Francis Street, Dublin 8.',
    sideNote: 'Proper<br>coffee',
  },
  place: {
    eyebrow: 'Good coffee.<br>Familiar faces.',
    title: 'Stay <br>a little.',
    body: 'A neighbourhood café on Francis Street. Speciality coffee, something sweet and a warm welcome in Dublin 8.',
    link: 'Take a look around',
    note: 'Good moments<br>happen here.',
  },
  favourites: {
    eyebrow: 'Customer favourites',
    title: 'The treats our guests<br><em>can’t stop raving about.</em>',
    quote: { text: 'The BEST!!! Chocolate croissants, cookies, iced latte — all so good.', name: 'Cristie B' },
    ids: ['c5', 'c7', 's1', 'ck4', 'p1'],
  },
  sweet: {
    eyebrow: 'Coffee, then a little something.',
    title: '<em>A moment</em><br>worth keeping.',
    body: "Take your time. Find your favourite coffee and see what's on the counter today.",
    ribbon: 'Good things, together.',
  },
  why: {
    eyebrow: 'Our philosophy',
    title: 'Why choose <em>Rumi?</em>',
    body: "Dublin's Turkish-Irish café, where every cup tells a story of heritage and heart.",
    features: [
      { title: 'Free Turkish delight', body: 'A traditional sweet welcome on every visit.', image: 'tea-set', focus: '50% 70%' },
      { title: 'Premium coffee', body: 'Artisan blends with silky oat and almond options.', image: 'latte', focus: '70% 30%' },
      { title: 'Fresh pastries', body: 'Handcrafted daily using authentic Turkish recipes.', image: 'baklava', focus: '50% 85%' },
      { title: 'A warm welcome', body: 'The heart of Mediterranean hospitality, on Francis Street.', image: 'interior-3', focus: '50% 50%' },
    ],
  },
  reviews: { eyebrow: 'Customer reviews', title: 'What our guests <em>are saying.</em>' },
  gifts: {
    eyebrow: 'Share the joy',
    title: 'Gifts & <em>loyalty.</em>',
    quote: '“Small acts of kindness are like seeds; they grow into gardens of love.” Gift a piece of Rumi to those you cherish.',
    cards: [
      { title: 'Coffee Club', body: 'Join for exclusive rewards, free birthday treats and seasonal surprises.' },
      { title: 'Gift cards', body: 'Gift cards for the perfect Mediterranean escape, any time.' },
    ],
  },
  visit: {
    eyebrow: 'Our little corner of Dublin',
    title: '<em>Same great</em><br>coffee, right<br>here.',
    findTitle: 'Find us <em>in Dublin.</em>',
    findBody: 'Two spots for the perfect Turkish-Irish blend: the café on Francis Street and a treat counter in Temple Bar.',
  },
  closing: {
    eyebrow: 'From Francis Street, with warmth.',
    title: '<em>Take a little</em><br>Rumi with you.',
    body: "For Francis Street moments, coffee and whatever's on the counter, follow @rumicafedublin.",
    caption: 'A little Rumi, on the go.',
    note: 'See you here.',
  },
};

// -------------------------------------------------------------- story ----

export const story = {
  eyebrow: 'The Rumi story',
  title: 'A sanctuary in <em>The Liberties.</em>',
  paragraphs: [
    'Rumi Café Bar is a family-owned haven born from a passion for authentic Mediterranean flavours and Irish community spirit. Founded by the Balkir sisters, we bring the soul of Turkish hospitality to the heart of Dublin.',
    'Our flagship on Francis Street blends contemporary design with the timeless warmth of Turkish hospitality. We serve premium Imbibe coffee alongside traditional delicacies, creating a bridge between cultures.',
  ],
  facts: [
    { icon: 'cup', text: 'Early risers (7am) get the freshest brew.' },
    { icon: 'leaf', text: 'Authentic borek & milk-soaked baklava.' },
    { icon: 'people', text: 'Group bookings available.' },
    { icon: 'sun', text: 'Pet-friendly outdoor seating.' },
  ],
  photoTag: 'The Balkir sisters',
  pick: {
    ribbon: "Sister's weekly pick",
    eyebrow: 'Recommendation of the week',
    titleA: 'The magic of',
    titleB: 'espresso.',
    lead: 'Strong and pure espresso shot.',
    body: 'Hand-picked by the Balkir sisters this week. This delicate blend captures the essence of our Aegean roots, reimagined for the heart of Dublin. Perfect for quiet contemplation or a warm conversation.',
    itemId: 'c1',
  },
};

// ------------------------------------------------------------ gallery ----

export const gallery = {
  eyebrow: 'The boutique archive',
  title: 'Our <em>legacy</em> in Dublin.',
  body: 'From a shared dream in 2020 to a Francis Street favourite. Witness the evolution of a Turkish oasis.',
  tabs: [
    { id: 'evolution', label: 'Evolution' },
    { id: 'interiors', label: 'Interiors' },
    { id: 'community', label: 'Community' },
    { id: 'sisterhood', label: 'Sisterhood' },
    { id: 'all', label: 'All' },
  ],
  // TODO(rumi): years and milestones come from the ordering site; confirm.
  timeline: [
    { year: '2020', title: 'The sisters’ vision', body: 'Three sisters mapping the dream of a Turkish oasis in the heart of Dublin 8.', quote: 'Family is the rhythm of our heart.', image: 'sisters', focus: '50% 40%' },
    { year: '2021', title: 'Breathing life', body: 'The iconic teal facade emerges on Francis Street, bringing warmth to the Liberties.', quote: 'A beacon of vibrant Dublin spirit.', image: 'storefront', focus: '50% 50%' },
    { year: '2022', title: 'The first pour', body: 'The moment we first shared our coffee with our neighbours.', quote: 'Where every drop tells a story.', image: 'interior', focus: '50% 50%' },
    { year: '2023', title: 'Culture & connection', body: 'Poetry nights and late lattes make Rumi a Liberties staple.', quote: 'When the city slows, our oasis shines.', image: 'night', focus: '50% 50%' },
  ],
  photos: [
    { image: 'storefront', title: 'The iconic teal front', cat: 'interiors', focus: '50% 50%' },
    { image: 'interior', title: 'Behind the counter', cat: 'interiors', focus: '50% 50%' },
    { image: 'night', title: 'Evening glow', cat: 'interiors', focus: '50% 50%' },
    { image: 'interior-1', title: 'The espresso bar', cat: 'interiors', focus: '50% 50%' },
    { image: 'interior-3', title: 'Cosy corner', cat: 'interiors', focus: '50% 50%' },
    { image: 'counter', title: 'Pastries in the case', cat: 'interiors', focus: '55% 45%' },
    { image: 'inside', title: 'Warm ambiance', cat: 'interiors', focus: '50% 40%' },
    { image: 'parrot', title: 'Our feathered friend', cat: 'community', quote: 'Every visitor is welcome.', focus: '50% 50%' },
    { image: 'interior-2', title: 'Francis Street, to go', cat: 'community', focus: '50% 50%' },
    { image: 'cup', title: 'A little Rumi, on the go', cat: 'community', focus: '50% 50%' },
    { image: 'cappuccino', title: 'Window seat', cat: 'community', focus: '50% 50%' },
    { image: 'iced', title: 'Iced latte weather', cat: 'community', focus: '50% 50%' },
    { image: 'iced-matcha', title: 'Something green', cat: 'community', focus: '50% 50%' },
    { image: 'sisters', title: 'The Balkir sisters', cat: 'sisterhood', quote: 'Family is the rhythm of our heart.', focus: '50% 35%' },
  ],
};

// -------------------------------------------------------- coffee club ----

export const club = {
  eyebrow: 'Member exclusive',
  title: 'Coffee Club',
  tagline: '“Sip, share & save — your coffee moments, rewarded.”',
  body: 'The Coffee Club is more than a loyalty programme. It’s our way of celebrating the community that makes every cup special. Whether you’re treating yourself, surprising a friend or simply enjoying your daily ritual, it adds extra joy to every sip.',
  gifts: {
    title: 'Share the love',
    body: 'Give the gift of great coffee to the people you care about. Our gift cards are flexible, thoughtful and perfect for any occasion.',
    cards: [
      { title: 'Physical gift cards', body: 'Beautifully designed and ready to gift, available in store.', value: '€25', tone: 'paper' },
      { title: 'E-gift cards', body: 'Delivered instantly by e-mail, ideal for last-minute surprises.', value: '€50', tone: 'teal' },
      { title: 'Custom value', body: 'Choose your amount, from €10 to €150. Perfect for any budget.', value: '€10–150', tone: 'coffee' },
      { title: 'Corporate gifting', body: 'The perfect reward for teams, clients or employee excellence.', value: '€100', tone: 'gold' },
    ],
    note: 'Gift cards can be redeemed in store or linked to your Coffee Club account.',
  },
  perksTitle: 'Sip, save, celebrate.',
  perksBody: 'Joining the Coffee Club unlocks perks designed to make every visit more rewarding.',
  // TODO(rumi): confirm the perks (they come from the ordering site).
  perks: [
    'Free welcome coffee after your first purchase',
    'Every 10th coffee free of charge',
    'A free birthday drink to celebrate your day',
    'Seasonal member-only treats and previews',
    '€0.30 credit for using a reusable cup',
    '50% off all dairy-free milk alternatives',
    'Personalised offers and local event invites',
    'Exclusive access to poetry reading reservations',
  ],
  why: {
    title: 'Why join?',
    quote: '“Because coffee tastes even better when it comes with rewards. The Coffee Club is simple, flexible and designed to give back to the people who love our coffee most.”',
  },
};

// -------------------------------------------------------------- legal ----

export const legalUpdated = '13 October 2026';
