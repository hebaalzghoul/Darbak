const PLACES = [
  {
    id: 'petra',
    name: 'The Rose City of Petra',
    nameAr: 'مدينة البتراء الوردية',
    category: 'history',
    subCategory: 'Wonder',
    rating: 5.0,
    reviews: 3840,
    desc: 'Carved into sandstone canyons, Jordan’s crowning jewel awaits your discovery.',
    descAr: 'منحوتة في صخور جبلية وردية، درة تاج الأردن تنتظر استكشافك.',
    longDesc: 'Petra is a world wonder archaeological site dating to around 300 B.C. Carved into pink sandstone cliffs by the Nabataean Kingdom, it features the Treasury, the Monastery, and spectacular mountain trails.',
    image: 'assets/petra 2.jpg',
    location: 'Ma’an Governorate, South Jordan',
    locationAr: 'محافظة معان، جنوب الأردن',
    coordinates: { x: 57, y: 72 },
    type: 'ancient',
    season: 'Spring (March–May) & Autumn (Sept–Nov)',
    advice: [
      'Buy water in advance before entering the Siq',
      'Wear sturdy walking boots (12–18 km walking)',
      'Wear a sun cap and high-SPF sunscreen',
      'Start early (6:30 AM) to experience the Treasury without crowds'
    ],
    duration: 'Full Day (6-8 hours)'
  },
  {
    id: 'wadi-rum',
    name: 'Wadi Rum Valley',
    nameAr: 'وادي رم - وادي القمر',
    category: 'adventure',
    subCategory: 'Desert',
    rating: 4.9,
    reviews: 2950,
    desc: 'A Martian wilderness of dramatic monolithic rock formations and star-filled skies.',
    descAr: 'صحراء مهيبة بتكوينات صخرية فريدة وواحدة من أصفى سماء النجوم في العالم.',
    longDesc: 'The Valley of the Moon is a protected desert wilderness featuring massive sandstone mountains, ancient petroglyphs, red dunes, and traditional Bedouin hospitality.',
    image: 'assets/wadi_rum.jpg',
    location: 'Southern Jordan Desert',
    locationAr: 'صحراء جنوب الأردن',
    coordinates: { x: 54, y: 84 },
    type: 'adventure',
    season: 'Autumn (October–November) & Spring',
    advice: [
      'Bring warm layered fleece for cold desert nights',
      'Wear polarized sunglasses and Bedouin Shmagh',
      'Carry portable battery packs (limited camp electricity)',
      'Reserve a 4x4 sunset desert safari'
    ],
    duration: 'Overnight / 2 Days'
  },
  {
    id: 'dead-sea',
    name: 'The Dead Sea',
    nameAr: 'البحر الميت',
    category: 'relaxation',
    subCategory: 'Wellness',
    rating: 4.9,
    reviews: 2210,
    desc: 'Floating effortlessly at the lowest point on earth. Absolute peace and wellness.',
    descAr: 'طفو خالي من الجهد في أخفض بقعة على وجه الأرض ومياه علاجية غنية بالمعادن.',
    longDesc: 'At over 430 meters below sea level, the hypersaline waters allow effortless flotation. Its mineral-rich black mud is world-renowned for therapeutic skin wellness.',
    image: 'assets/dead sea 2.jpg',
    location: 'Jordan Rift Valley',
    locationAr: 'غور الأردن',
    coordinates: { x: 44, y: 46 },
    type: 'nature',
    season: 'Spring (Feb–May) & Autumn (Oct–Dec)',
    advice: [
      'Do NOT shave within 24 hours prior to swimming',
      'Do not splash water into eyes; carry fresh rinse water',
      'Limit soaking to 15-20 minutes intervals',
      'Apply natural black mineral mud before swimming'
    ],
    duration: 'Half Day to Full Day'
  },
  {
    id: 'jerash',
    name: 'Jerash Roman Ruins',
    nameAr: 'آثار جرش الرومانية',
    category: 'history',
    subCategory: 'Decapolis',
    rating: 4.8,
    reviews: 1820,
    desc: 'Walk through the exceptionally preserved ancient colonnaded streets and grand theaters.',
    descAr: 'تجوّل في شوارع الأعمدة الرومانية والمسارح الأثرية المحفوظة بعناية فائقة.',
    longDesc: 'Considered one of the largest and best-preserved Roman architectural sites outside Italy. Highlights include Hadrian’s Arch, the Oval Forum, and the Temple of Artemis.',
    image: 'assets/Jerash Roman Ruins.jpg',
    location: 'Jerash Governorate',
    locationAr: 'محافظة جرش',
    coordinates: { x: 53, y: 25 },
    type: 'ancient',
    season: 'Spring (March–May) with wildflower blooms',
    advice: [
      'Wear shoes with good traction on paved stone roads',
      'Wear a sun hat as there is little shade inside forum',
      'Hire a licensed local guide for historical storytelling'
    ],
    duration: '3-4 hours'
  },
  {
    id: 'amman-citadel',
    name: 'Amman Citadel & Souqs',
    nameAr: 'جبل القلعة ووسط البلد',
    category: 'history',
    subCategory: 'Capital',
    rating: 4.8,
    reviews: 3100,
    desc: 'Ancient citadel pillars overlooking seven golden hills, vibrant souqs, and Hashem food.',
    descAr: 'أعمدة هرقل التاريخية المطلة على تلال عمان، وأسواق وسط البلد ومطاعمها العريقة.',
    longDesc: 'Perched on Jabal al-Qal’a, the Citadel features the Roman Temple of Hercules and the Umayyad Palace with 360-degree panoramic views of Amman.',
    image: 'assets/amman_citadel.jpg',
    location: 'Downtown Amman',
    locationAr: 'وسط البلد، عمّان',
    coordinates: { x: 55, y: 32 },
    type: 'popular',
    season: 'Year-round, especially sunset hours',
    advice: [
      'Visit at 5:00 PM for sunset golden hour over amphitheater',
      'Walk down to Hashem Restaurant for stuffed falafel',
      'Taste hot Knafeh at Habibah Sweets in the alley'
    ],
    duration: 'Half Day (3-5 hours)'
  },
  {
    id: 'dana-biosphere',
    name: 'Dana Biosphere Reserve',
    nameAr: 'محمية ضانا للمحيط الحيوي',
    category: 'nature',
    subCategory: 'Reserve',
    rating: 4.9,
    reviews: 1420,
    desc: 'Walk through four distinct biogeographical zones, hosting hundreds of rare desert species.',
    descAr: 'محمية طبيعية فريدة تجمع أربع مناطق مناخية جغرافية مع تنوع بيئي نادر.',
    longDesc: 'Jordan’s largest nature reserve covers 320 sq km from Mediterranean oak down to desert dunes, featuring the legendary Feynan Ecolodge.',
    image: 'assets/Dana Biosphere Reserve.jpg',
    location: 'Tafilah Governorate',
    locationAr: 'محافظة الطفيلة',
    coordinates: { x: 50, y: 61 },
    type: 'nature',
    season: 'March to May & Sept to Nov',
    advice: [
      'Hire a local community Bedouin ranger guide',
      'Bring a reusable 2-liter water pack',
      'Stay overnight at Feynan for candlelit dinner'
    ],
    duration: 'Full Day or Overnight'
  }
];

const PLACE_DETAILS = [
  { id: 'ajloun-castle', name: 'Ajloun Castle', category: 'history', hiddenGem: true, desc: 'A 12th-century Ayyubid fortress overlooking the wooded hills of northern Jordan.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ajloun_Castle_1.jpg?width=1000', fallbackImage: 'assets/jerash.jpg', imageSource: 'https://commons.wikimedia.org/wiki/File:Ajloun_Castle_1.jpg', location: 'Ajloun', coordinates: { x: 49, y: 21 }, geo: [32.327, 35.751], season: 'Spring and autumn', advice: ['Allow time for the steep stairways and hilltop views', 'Combine with Ajloun Forest Reserve'], duration: '2-3 hours', travelFromAmman: 75 },
  { id: 'umm-qais', name: 'Umm Qais (Gadara)', category: 'history', hiddenGem: true, desc: 'Black-basalt Roman streets and a sweeping view over the Sea of Galilee and Yarmouk gorge.', image: 'assets/umm qais.jpg', location: 'Irbid Governorate', coordinates: { x: 33, y: 13 }, geo: [32.653, 35.684], season: 'Spring and autumn', advice: ['Wear sturdy shoes on uneven basalt', 'Check opening hours before the long drive north'], duration: '2-3 hours', travelFromAmman: 115 },
  { id: 'pella', name: 'Pella (Tabaqat Fahl)', category: 'history', hiddenGem: true, desc: 'A layered archaeological landscape with remains from several ancient civilizations.', image: 'assets/Pella (Tabaqat Fahl).jpg', location: 'Jordan Valley, Irbid', coordinates: { x: 38, y: 23 }, geo: [32.455, 35.618], season: 'Spring and autumn', advice: ['Bring water and sun protection', 'The site is spread across sloping ground'], duration: '2-3 hours', travelFromAmman: 95 },
  { id: 'qasr-mshatta', name: 'Qasr al-Mshatta', category: 'history', hiddenGem: true, desc: 'An unfinished Umayyad desert palace known for its monumental carved stone facade.', image: 'assets/Qasr al-Mshatta.jpg', location: 'South of Amman', coordinates: { x: 59, y: 40 }, geo: [31.803, 36.323], season: 'October to April', advice: ['Arrange transport in advance', 'Confirm access and opening times before visiting'], duration: '1-2 hours', travelFromAmman: 40 },
  { id: 'umm-ar-rasas', name: 'Umm ar-Rasas', category: 'history', hiddenGem: true, desc: 'A UNESCO-listed archaeological site with the mosaic floor of St Stephen’s Church.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Umm_Rasas_Fisherman.JPG?width=1000', fallbackImage: 'assets/jerash.jpg', imageSource: 'https://commons.wikimedia.org/wiki/File:Umm_Rasas_Fisherman.JPG', location: 'Madaba Governorate', coordinates: { x: 57, y: 50 }, geo: [31.500, 35.920], season: 'October to April', advice: ['Check site access before setting out', 'Bring sun protection; shade is limited'], duration: '1-2 hours', travelFromAmman: 75 },
  { id: 'qasr-amra', name: "Qusayr 'Amra", category: 'history', hiddenGem: true, desc: 'A UNESCO-listed Umayyad desert retreat celebrated for its early wall paintings.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Qasr_Amra.jpg?width=1000', fallbackImage: 'assets/amman_citadel.jpg', imageSource: 'https://commons.wikimedia.org/wiki/File:Qasr_Amra.jpg', location: 'Azraq area', coordinates: { x: 75, y: 39 }, geo: [31.801, 36.586], season: 'October to April', advice: ['Pair with other eastern desert castles', 'Carry water and confirm opening hours'], duration: '1-2 hours', travelFromAmman: 85 },
  { id: 'ajloun-reserve', name: 'Ajloun Forest Reserve', category: 'nature', hiddenGem: true, desc: 'Oak and pistachio woodland trails in Jordan’s northern highlands.', image: 'assets/Ajloun Forest Reserve.jpg', location: 'Ajloun', coordinates: { x: 46, y: 19 }, geo: [32.380, 35.752], season: 'March to May', advice: ['Reserve guided trails and cabins ahead', 'Wear layers and trail shoes'], duration: 'Half day', travelFromAmman: 80 },
  { id: 'wadi-mujib', name: 'Wadi Mujib Biosphere Reserve', category: 'adventure', hiddenGem: true, desc: 'A dramatic canyon reserve descending toward the Dead Sea, with seasonal guided water trails.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Mujib2.jpeg?width=1000', fallbackImage: 'assets/dead_sea.jpg', imageSource: 'https://commons.wikimedia.org/wiki/File:Wadi_Mujib2.jpeg', location: 'Dead Sea Highway', coordinates: { x: 49, y: 53 }, geo: [31.467, 35.573], season: 'April to October for water trails', advice: ['Book the trail and guide in advance', 'Water trails have seasonal access and fitness requirements'], duration: '3-4 hours', travelFromAmman: 90 },
  { id: 'wadi-bin-hammad', name: 'Wadi Bin Hammad', category: 'adventure', hiddenGem: true, desc: 'A palm-lined canyon near Karak with a guided route through flowing water and rock walls.', image: 'assets/Wadi Bin Hammad.jpg', location: 'Karak Governorate', coordinates: { x: 43, y: 62 }, geo: [31.271, 35.626], season: 'Spring and autumn', advice: ['Use a local guide and check water conditions', 'Bring water shoes and a dry change of clothes'], duration: '3-4 hours', travelFromAmman: 135 },
  { id: 'wadi-hidan', name: 'Wadi Hidan', category: 'adventure', hiddenGem: true, desc: 'A guided canyoning route through pools and waterfalls in the Madaba highlands.', image: 'assets/Wadi Hidan.jpg', location: 'Madaba Governorate', coordinates: { x: 51, y: 44 }, geo: [31.585, 35.756], season: 'Spring to early autumn', advice: ['Go with an authorized local guide', 'Confirm water levels and seasonal access'], duration: '4-5 hours', travelFromAmman: 75 },
  { id: 'ma-in-hot-springs', name: "Ma'in Hot Springs", category: 'relaxation', medical: true, desc: 'Mineral-rich thermal waterfalls and spa facilities in a deep valley near the Dead Sea.', image: 'assets/Main Hot Springs.jpg', fallbackImage: 'assets/dead_sea.jpg', imageSource: 'https://commons.wikimedia.org/wiki/File:Ma%27in_Hot_Springs_01.jpg', location: 'Madaba Governorate', coordinates: { x: 50, y: 48 }, geo: [31.603, 35.609], season: 'October to May', advice: ['Check resort day-use availability before travel', 'Use marked bathing areas and follow on-site safety advice'], duration: 'Half day', travelFromAmman: 70 },
  { id: 'jordan-valley', name: 'Jordan Valley (Al-Ghor)', category: 'nature', hiddenGem: true, desc: 'A fertile rift valley of farms, river landscapes, and small communities between the highlands and the Dead Sea.', image: 'assets/Jordan Valley (Al-Ghor).jpg', location: 'Jordan Valley', coordinates: { x: 35, y: 39 }, geo: [32.100, 35.570], season: 'October to April', advice: ['Plan stops with local hosts and farms', 'Summer temperatures can be very high'], duration: 'Half day', travelFromAmman: 75 },
  { id: 'aqaba', name: 'Aqaba Marine Park', category: 'nature', adventure: true, desc: 'Red Sea coral reefs and protected shore sites for snorkeling and diving with licensed operators.', image: 'assets/aqaba 2.jpg', location: 'Aqaba', coordinates: { x: 53, y: 91 }, geo: [29.526, 35.007], season: 'March to May and September to November', advice: ['Use licensed operators and reef-safe practices', 'Book diving trips and equipment ahead'], duration: 'Half day', travelFromAmman: 240 },
].map(place => ({
  nameAr: place.name,
  descAr: place.desc,
  longDesc: place.desc,
  subCategory: place.category.replace('-', ' '),
  rating: 4.7,
  reviews: 0,
  type: place.category,
  coordinates: place.coordinates,
  geo: place.geo,
  season: place.season || 'Spring and autumn',
  advice: place.advice || ['Check local opening times before visiting', 'Bring water and sun protection'],
  duration: place.duration || '2-3 hours',
  categories: [place.category, ...(place.hiddenGem ? ['hidden-gems'] : []), ...(place.medical ? ['medical'] : []), ...(place.adventure ? ['adventure'] : []), ...(place.food ? ['food'] : [])],
  ...place
}));

PLACES.push(...PLACE_DETAILS);

PLACES.forEach(place => {
  place.geo ||= ({
    petra: [30.328, 35.444],
    'wadi-rum': [29.576, 35.420],
    'dead-sea': [31.559, 35.473],
    jerash: [32.280, 35.899],
    'amman-citadel': [31.954, 35.934],
    'dana-biosphere': [30.676, 35.610]
  })[place.id];
  place.categories ||= [place.category, ...(place.id === 'amman-citadel' ? ['food'] : [])];
  place.hiddenGem ||= false;
  place.travelFromAmman ||= Math.round(20 + Math.hypot(place.geo[0] - 31.953, (place.geo[1] - 35.930) * 0.85) * 65);
  place.mapLabel ||= ({
    petra: 'Petra', 'wadi-rum': 'Wadi Rum', 'dead-sea': 'Dead Sea', jerash: 'Jerash',
    'amman-citadel': 'Amman', 'dana-biosphere': 'Dana'
  })[place.id] || place.location.split(',')[0].replace('Governorate', '').trim();
});

const JORDAN_CITIES = [
  { id: 'amman', name: 'Amman', nameAr: 'عمّان', governorate: 'Amman', desc: 'Jordan’s capital is a city of hills, Roman ruins, busy souqs, galleries, and contemporary cafés.', info: 'Visit the Citadel and Roman Theater, then explore the downtown markets and the distinct neighborhoods spread across the city’s hills.', highlight: 'Amman Citadel and Roman Theater', image: 'assets/amman.jpg', geo: [31.953, 35.930], map: { x: 55, y: 32 } },
  { id: 'zarqa', name: 'Zarqa', nameAr: 'الزرقاء', governorate: 'Zarqa', desc: 'A major industrial and commercial city northeast of Amman, close to the historic desert-castle route.', info: 'Zarqa is one of Jordan’s largest urban centers. Its location makes it a useful base for exploring the eastern desert and its Umayyad sites.', highlight: 'Azraq and the eastern desert castles', image: 'assets/zarqa.jpg', geo: [32.072, 36.088], map: { x: 61, y: 29 } },
  { id: 'irbid', name: 'Irbid', nameAr: 'إربد', governorate: 'Irbid', desc: 'Northern Jordan’s university city, surrounded by fertile farmland and archaeological sites.', info: 'Irbid is a lively northern hub for cafés, markets, and universities. Nearby Umm Qais and Pella reveal the region’s long history and broad landscapes.', highlight: 'Umm Qais and the northern hills', image: 'assets/irbid.jpg', geo: [32.556, 35.846], map: { x: 49, y: 16 } },
  { id: 'mafraq', name: 'Al-Mafraq', nameAr: 'المفرق', governorate: 'Mafraq', desc: 'A crossroads in northeastern Jordan connecting the capital with the north and eastern desert.', info: 'Al-Mafraq is an important transport and service center. From here, travelers can reach Azraq, the desert reserves, and the historic castles to the east.', highlight: 'Eastern desert and Azraq', image: 'assets/mafraq.jpg', geo: [32.342, 36.208], map: { x: 66, y: 22 } },
  { id: 'jerash', name: 'Jerash', nameAr: 'جرش', governorate: 'Jerash', desc: 'A northern city best known for one of the world’s best-preserved Roman provincial cities.', info: 'The archaeological site of ancient Gerasa features colonnaded streets, plazas, temples, and theaters. The modern city sits right beside the ruins.', highlight: 'The ancient Roman city of Gerasa', image: 'assets/jerash 2.jpg', geo: [32.280, 35.899], map: { x: 53, y: 25 } },
  { id: 'ajloun', name: 'Ajloun', nameAr: 'عجلون', governorate: 'Ajloun', desc: 'A green highland city surrounded by oak forests, orchards, and rolling northern hills.', info: 'Ajloun is known for its hilltop castle and forest reserve. Spring brings wildflowers and comfortable weather for walking in the surrounding countryside.', highlight: 'Ajloun Castle and forest reserve', image: 'assets/ajloun.jpg', geo: [32.333, 35.752], map: { x: 49, y: 21 } },
  { id: 'salt', name: 'As-Salt', nameAr: 'السلط', governorate: 'Balqa', desc: 'A historic hill city celebrated for its honey-colored stone houses and generous hospitality.', info: 'As-Salt’s historic center preserves Ottoman-era architecture and lively market streets. Walking tours share stories of the city’s merchants and diverse communities.', highlight: 'Historic As-Salt and its heritage houses', image: 'assets/alsalt.jpg', geo: [32.039, 35.727], map: { x: 49, y: 34 } },
  { id: 'madaba', name: 'Madaba', nameAr: 'مادبا', governorate: 'Madaba', desc: 'A welcoming city famed for Byzantine mosaics, especially the ancient map in St George’s Church.', info: 'Madaba’s churches, archaeological park, and artisan workshops showcase a remarkable mosaic tradition. Mount Nebo is a short drive away.', highlight: 'The Madaba Map at St George’s Church', image: 'assets/madaba.jpg', geo: [31.719, 35.794], map: { x: 55, y: 43 } },
  { id: 'karak', name: 'Karak', nameAr: 'الكرك', governorate: 'Karak', desc: 'A hilltop city in southern Jordan known for its vast medieval Crusader castle.', info: 'Karak Castle’s tunnels, halls, and ramparts overlook the surrounding plateau. The city is also a gateway to southern villages and traditional Jordanian food.', highlight: 'Karak Castle', image: 'assets/karak.jpg', geo: [31.181, 35.704], map: { x: 46, y: 58 } },
  { id: 'tafilah', name: 'At-Tafilah', nameAr: 'الطفيلة', governorate: 'Tafilah', desc: 'A quiet southern highland city near Dana Biosphere Reserve and historic copper-mining areas.', info: 'At-Tafilah is surrounded by rugged landscapes and traditional villages. It provides access to Dana’s hiking trails and the southern highlands.', highlight: 'Dana Biosphere Reserve', image: 'assets/tafila.jpg', geo: [30.837, 35.604], map: { x: 49, y: 66 } },
  { id: 'ghor-safi', name: 'Ghor as-Safi', nameAr: 'غور الصافي', governorate: 'Karak', desc: 'A fertile community at the southern end of the Dead Sea, where farms meet desert landscapes.', info: 'Ghor as-Safi has a warm climate and productive agricultural lands. Nearby sites include the Museum at the Lowest Place on Earth and the historic sanctuary of Lot.', highlight: 'Dead Sea southern shore and Lot’s Cave', image: 'assets/ghor-safi.jpg', geo: [31.036, 35.465], map: { x: 45, y: 75 } },
  { id: 'maan', name: 'Ma’an', nameAr: 'معان', governorate: 'Ma’an', desc: 'A southern desert city and transport hub on the route toward Petra and Aqaba.', info: 'Ma’an has long served travelers crossing southern Jordan. Its location connects desert landscapes, historic trade routes, and the nearby archaeological region of Petra.', highlight: 'Southern trade routes and Petra region', image: 'assets/maan.jpg', geo: [30.192, 35.735], map: { x: 57, y: 79 } },
  { id: 'shobak', name: 'Shobak', nameAr: 'الشوبك', governorate: 'Ma’an', desc: 'A cool southern highland town whose Crusader castle rises above orchards and valleys.', info: 'Shobak Castle, also known as Montreal, sits above the King’s Highway. The area is known for apple orchards, mountain air, and dramatic views.', highlight: 'Shobak Castle', image: 'assets/shobak.jpg', geo: [30.522, 35.568], map: { x: 53, y: 65 } },
  { id: 'aqaba', name: 'Aqaba', nameAr: 'العقبة', governorate: 'Aqaba', desc: 'Jordan’s Red Sea port city, with coral reefs, beaches, and a relaxed waterfront.', info: 'Aqaba is the country’s coastal escape. Licensed operators offer snorkeling and diving among Red Sea reefs, while the old town and fort make easy city stops.', highlight: 'Aqaba Marine Park and the Red Sea', image: 'assets/aqaba.jpg', geo: [29.526, 35.007], map: { x: 53, y: 91 } },
];

const CITY_MAP_PLACES = JORDAN_CITIES.map(city => ({
  id: `city-${city.id}`, name: city.name, nameAr: city.nameAr, category: 'history',
  subCategory: `${city.governorate} Governorate`, rating: 4.6, reviews: 1,
  desc: city.desc, longDesc: city.info, image: city.image,
  location: `${city.governorate} Governorate`, geo: city.geo, coordinates: city.map,
  type: 'city', season: 'Year-round',
  advice: ['Check opening hours for nearby attractions before visiting.', 'Ask permission before photographing residents.'],
  duration: 'Half day', categories: ['history'], mapLabel: city.name
}));

const LOCAL_EXPERIENCES = [
  {
    id: 'mansaf',
    title: 'Cook Mansaf with a Local Family',
    titleAr: 'طهي المنسف الأصلي مع عائلة أردنية',
    location: 'Amman Downtown',
    duration: '4 hours',
    price: 45,
    rating: 4.9,
    image: 'assets/mansaf.jpg',
    host: 'Um Ahmad Al-Zoubi (Heritage Chef)',
    desc: 'Learn how to crush real Karak Jameed stone into rich broth, simmer tender lamb, and master the hospitable etiquette of eating Mansaf.'
  },
  {
    id: 'tatreez',
    title: 'Learn Tatreez Embroidery',
    titleAr: 'ورشة فن التطريز التراثي',
    location: 'Madaba Workshops',
    duration: '3 hours',
    price: 35,
    rating: 4.8,
    image: 'assets/tatreez.jpg',
    host: 'Lina Hijazi (Master Artisan)',
    desc: 'Learn ancient cross-stitch geometric patterns with dyed silk threads on linen fabric and create your own handmade keepsake.'
  },
  {
    id: 'shmagh',
    title: 'Tahdeeb Shmagh Workshop',
    titleAr: 'ورشة تهديب الشماغ الأردني الأصيل',
    location: 'As-Salt Heritage',
    duration: '2 hours',
    price: 30,
    rating: 4.9,
    image: 'assets/tahdeeb shmagh.jpg',
    host: 'Khadija Al-Khatib (Salt Crafts)',
    desc: 'Learn the intricate traditional hand-knotting art of Tahdeeb (white cotton tassels on red Jordanian keffiyeh) with Salti craftswomen.'
  },
  {
    id: 'coffee',
    title: 'Jordanian Bedouin Coffee Ceremony',
    titleAr: 'طقوس القهوة السادة عند البدو',
    location: 'Wadi Rum Tents',
    duration: '1.5 hours',
    price: 25,
    rating: 5.0,
    image: 'assets/bedouin_tea.jpg',
    host: 'Sheikh Suleiman (Bedouin Elder)',
    desc: 'Roast green coffee beans over hot desert embers, grind them in a musical brass Mihbash, and learn the codes of Bedouin coffee cups.'
  }
];

LOCAL_EXPERIENCES.push(
  { id: 'olive-picking', title: 'Olive Picking in Ajloun', titleAr: 'قطاف الزيتون في عجلون', location: 'Ajloun', duration: '3 hours', price: 28, rating: 4.8, image: 'assets/Olive Picking.jpg', host: 'Local olive-growing family', desc: 'Join a seasonal harvest, learn how olives are sorted, and share a simple meal with a farming family.' },
  { id: 'desert-camp', title: 'Desert Camp Bonding', titleAr: 'تجربة مخيم بدوي', location: 'Wadi Rum', duration: 'Overnight', price: 85, rating: 4.9, image: 'assets/wadi_rum.jpg', host: 'Wadi Rum community camp', desc: 'Spend an evening around the fire with Bedouin hosts, a traditional zarb dinner, and stories beneath the desert sky.' },
  { id: 'spice-market', title: 'Spice Market & Downtown', titleAr: 'سوق التوابل ووسط البلد', location: 'Downtown Amman', duration: '2 hours', price: 22, rating: 4.8, image: 'assets/Downtown.jpg', host: 'Amman food host', desc: 'Explore spice stalls and bakeries, learn familiar Jordanian blends, and taste a few neighborhood favorites.' },
  { id: 'guided-hike', title: 'Hike with a Local Trail Guide', titleAr: 'مسير مع دليل محلي', location: 'Dana Biosphere Reserve', duration: '4 hours', price: 38, rating: 4.9, image: 'assets/Hike.jpg', host: 'Community trail guide', desc: 'Follow a marked reserve trail with a local guide who shares the area’s plants, wildlife, and village history.' }
);


const DEFAULT_TRAVELER_STORIES = [
  { id: 'sample-petra', author: 'Lina Haddad', country: 'United Kingdom', location: 'Petra, Jordan', title: 'Petra before the crowds', content: 'We arrived early and walked through the Siq while the morning was still cool. The Treasury appeared slowly between the rock walls, and we took our time before exploring the quieter paths beyond it. Comfortable shoes, water, and an unhurried start made the day much better.', image: 'assets/petra.jpg', likes: 18, sample: true },
  { id: 'sample-wadi-rum', author: 'Maya Chen', country: 'Singapore', location: 'Wadi Rum, Jordan', title: 'A night under desert skies', content: 'Our hosts shared tea and stories around the fire before dinner. The night sky was clear, but what stayed with us most was learning about daily life in the desert from the people who call it home. Bring a warm layer after sunset and confirm what is included with your camp before you travel.', image: 'assets/wadi_rum.jpg', likes: 24, sample: true },
  { id: 'sample-amman', author: 'Daniel Ruiz', country: 'Spain', location: 'Amman, Jordan', title: 'Getting happily lost downtown', content: 'We followed the smell of fresh bread through the market lanes and stopped for falafel, tea, and a long conversation with a shopkeeper. Downtown is easier to enjoy when you leave space in the afternoon and ask before photographing people. We finished the day walking back toward the Roman Theater as the light softened.', image: 'assets/amman_citadel.jpg', likes: 11, sample: true }
];


const TRIP_BUDGETS = {
  budget: { label: 'Budget', minPerDay: 45, maxPerDay: 85 },
  balanced: { label: 'Balanced', minPerDay: 90, maxPerDay: 160 },
  comfort: { label: 'Comfort', minPerDay: 180, maxPerDay: 320 }
};

const MAP_CATEGORY_INFO = {
  history: { icon: '🏛️', label: 'History' },
  nature: { icon: '🌿', label: 'Nature' },
  food: { icon: '🍽️', label: 'Food' },
  relaxation: { icon: '♨️', label: 'Wellness' },
  adventure: { icon: '🥾', label: 'Adventure' },
  medical: { icon: '⚕️', label: 'Wellness' },
  events: { icon: '🎭', label: 'Events' },
  popular: { icon: '📍', label: 'Popular place' }
};

const SUPPORTED_LANGUAGES = [
  ['en', 'English'],
  ['ar', 'العربية']
];
