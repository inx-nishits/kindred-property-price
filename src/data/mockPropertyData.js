// Mock property data for Australian properties
export const mockProperties = [
  // === VICTORIA ===
  {
    id: '1',
    address: '123 Collins Street, Melbourne VIC 3000',
    shortAddress: '123 Collins Street',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 450,
    buildingSize: 180,
    propertyType: 'House',
    priceEstimate: { low: 850000, mid: 950000, high: 1050000 },
    rentalEstimate: { weekly: 650, yield: 3.6 },
    suburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    coordinates: { lat: -37.8136, lng: 144.9631 },
  },
  {
    id: '6',
    address: '42 Chapel Street, South Yarra VIC 3141',
    shortAddress: '42 Chapel Street',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 75,
    propertyType: 'Apartment',
    priceEstimate: { low: 620000, mid: 680000, high: 740000 },
    rentalEstimate: { weekly: 520, yield: 4.0 },
    suburb: 'South Yarra',
    state: 'VIC',
    postcode: '3141',
    coordinates: { lat: -37.8387, lng: 144.9920 },
  },
  {
    id: '7',
    address: '88 Bridge Road, Richmond VIC 3121',
    shortAddress: '88 Bridge Road',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 320,
    buildingSize: 150,
    propertyType: 'Townhouse',
    priceEstimate: { low: 980000, mid: 1080000, high: 1180000 },
    rentalEstimate: { weekly: 720, yield: 3.5 },
    suburb: 'Richmond',
    state: 'VIC',
    postcode: '3121',
    coordinates: { lat: -37.8183, lng: 145.0000 },
  },
  {
    id: '8',
    address: '15 Acland Street, St Kilda VIC 3182',
    shortAddress: '15 Acland Street',
    beds: 1,
    baths: 1,
    parking: 0,
    landSize: 0,
    buildingSize: 55,
    propertyType: 'Apartment',
    priceEstimate: { low: 420000, mid: 470000, high: 520000 },
    rentalEstimate: { weekly: 380, yield: 4.2 },
    suburb: 'St Kilda',
    state: 'VIC',
    postcode: '3182',
    coordinates: { lat: -37.8679, lng: 144.9808 },
  },
  {
    id: '9',
    address: '201 Lygon Street, Carlton VIC 3053',
    shortAddress: '201 Lygon Street',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 80,
    propertyType: 'Apartment',
    priceEstimate: { low: 550000, mid: 610000, high: 670000 },
    rentalEstimate: { weekly: 480, yield: 4.1 },
    suburb: 'Carlton',
    state: 'VIC',
    postcode: '3053',
    coordinates: { lat: -37.8003, lng: 144.9669 },
  },
  {
    id: '10',
    address: '34 High Street, Armadale VIC 3143',
    shortAddress: '34 High Street',
    beds: 4,
    baths: 3,
    parking: 2,
    landSize: 650,
    buildingSize: 280,
    propertyType: 'House',
    priceEstimate: { low: 2100000, mid: 2350000, high: 2600000 },
    rentalEstimate: { weekly: 1200, yield: 2.7 },
    suburb: 'Armadale',
    state: 'VIC',
    postcode: '3143',
    coordinates: { lat: -37.8556, lng: 145.0194 },
  },
  {
    id: '11',
    address: '67 Glenferrie Road, Hawthorn VIC 3122',
    shortAddress: '67 Glenferrie Road',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 420,
    buildingSize: 170,
    propertyType: 'House',
    priceEstimate: { low: 1450000, mid: 1600000, high: 1750000 },
    rentalEstimate: { weekly: 850, yield: 2.8 },
    suburb: 'Hawthorn',
    state: 'VIC',
    postcode: '3122',
    coordinates: { lat: -37.8226, lng: 145.0356 },
  },

  // === NEW SOUTH WALES ===
  {
    id: '2',
    address: '45 Harbour Drive, Sydney NSW 2000',
    shortAddress: '45 Harbour Drive',
    beds: 2,
    baths: 1,
    parking: 0,
    landSize: 0,
    buildingSize: 85,
    propertyType: 'Apartment',
    priceEstimate: { low: 720000, mid: 780000, high: 840000 },
    rentalEstimate: { weekly: 580, yield: 3.9 },
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    coordinates: { lat: -33.8688, lng: 151.2093 },
  },
  {
    id: '12',
    address: '156 Campbell Parade, Bondi Beach NSW 2026',
    shortAddress: '156 Campbell Parade',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 120,
    propertyType: 'Apartment',
    priceEstimate: { low: 1850000, mid: 2050000, high: 2250000 },
    rentalEstimate: { weekly: 1100, yield: 2.8 },
    suburb: 'Bondi Beach',
    state: 'NSW',
    postcode: '2026',
    coordinates: { lat: -33.8915, lng: 151.2767 },
  },
  {
    id: '13',
    address: '22 Church Street, Parramatta NSW 2150',
    shortAddress: '22 Church Street',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 95,
    propertyType: 'Apartment',
    priceEstimate: { low: 580000, mid: 640000, high: 700000 },
    rentalEstimate: { weekly: 520, yield: 4.2 },
    suburb: 'Parramatta',
    state: 'NSW',
    postcode: '2150',
    coordinates: { lat: -33.8151, lng: 151.0011 },
  },
  {
    id: '14',
    address: '89 The Corso, Manly NSW 2095',
    shortAddress: '89 The Corso',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 80,
    propertyType: 'Apartment',
    priceEstimate: { low: 1250000, mid: 1380000, high: 1510000 },
    rentalEstimate: { weekly: 780, yield: 2.9 },
    suburb: 'Manly',
    state: 'NSW',
    postcode: '2095',
    coordinates: { lat: -33.7969, lng: 151.2875 },
  },
  {
    id: '15',
    address: '33 King Street, Newtown NSW 2042',
    shortAddress: '33 King Street',
    beds: 3,
    baths: 1,
    parking: 0,
    landSize: 180,
    buildingSize: 110,
    propertyType: 'Terrace',
    priceEstimate: { low: 1350000, mid: 1480000, high: 1610000 },
    rentalEstimate: { weekly: 850, yield: 3.0 },
    suburb: 'Newtown',
    state: 'NSW',
    postcode: '2042',
    coordinates: { lat: -33.8971, lng: 151.1793 },
  },
  {
    id: '16',
    address: '412 Pacific Highway, Crows Nest NSW 2065',
    shortAddress: '412 Pacific Highway',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 72,
    propertyType: 'Apartment',
    priceEstimate: { low: 780000, mid: 850000, high: 920000 },
    rentalEstimate: { weekly: 600, yield: 3.7 },
    suburb: 'Crows Nest',
    state: 'NSW',
    postcode: '2065',
    coordinates: { lat: -33.8265, lng: 151.2052 },
  },
  {
    id: '17',
    address: '78 Hunter Street, Newcastle NSW 2300',
    shortAddress: '78 Hunter Street',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 450,
    buildingSize: 165,
    propertyType: 'House',
    priceEstimate: { low: 820000, mid: 900000, high: 980000 },
    rentalEstimate: { weekly: 620, yield: 3.6 },
    suburb: 'Newcastle',
    state: 'NSW',
    postcode: '2300',
    coordinates: { lat: -32.9283, lng: 151.7817 },
  },
  {
    id: '18',
    address: '25 Crown Street, Wollongong NSW 2500',
    shortAddress: '25 Crown Street',
    beds: 4,
    baths: 2,
    parking: 2,
    landSize: 550,
    buildingSize: 200,
    propertyType: 'House',
    priceEstimate: { low: 920000, mid: 1020000, high: 1120000 },
    rentalEstimate: { weekly: 680, yield: 3.5 },
    suburb: 'Wollongong',
    state: 'NSW',
    postcode: '2500',
    coordinates: { lat: -34.4278, lng: 150.8931 },
  },

  // === QUEENSLAND ===
  {
    id: '3',
    address: '78 Queen Street, Brisbane QLD 4000',
    shortAddress: '78 Queen Street',
    beds: 4,
    baths: 2,
    parking: 2,
    landSize: 600,
    buildingSize: 220,
    propertyType: 'House',
    priceEstimate: { low: 680000, mid: 750000, high: 820000 },
    rentalEstimate: { weekly: 550, yield: 3.8 },
    suburb: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    coordinates: { lat: -27.4698, lng: 153.0251 },
  },
  {
    id: '19',
    address: '55 Grey Street, South Brisbane QLD 4101',
    shortAddress: '55 Grey Street',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 85,
    propertyType: 'Apartment',
    priceEstimate: { low: 520000, mid: 580000, high: 640000 },
    rentalEstimate: { weekly: 480, yield: 4.3 },
    suburb: 'South Brisbane',
    state: 'QLD',
    postcode: '4101',
    coordinates: { lat: -27.4810, lng: 153.0182 },
  },
  {
    id: '20',
    address: '112 Brunswick Street, Fortitude Valley QLD 4006',
    shortAddress: '112 Brunswick Street',
    beds: 1,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 55,
    propertyType: 'Apartment',
    priceEstimate: { low: 380000, mid: 420000, high: 460000 },
    rentalEstimate: { weekly: 380, yield: 4.7 },
    suburb: 'Fortitude Valley',
    state: 'QLD',
    postcode: '4006',
    coordinates: { lat: -27.4575, lng: 153.0327 },
  },
  {
    id: '21',
    address: '234 Cavill Avenue, Surfers Paradise QLD 4217',
    shortAddress: '234 Cavill Avenue',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 0,
    buildingSize: 130,
    propertyType: 'Apartment',
    priceEstimate: { low: 850000, mid: 950000, high: 1050000 },
    rentalEstimate: { weekly: 750, yield: 4.1 },
    suburb: 'Surfers Paradise',
    state: 'QLD',
    postcode: '4217',
    coordinates: { lat: -28.0027, lng: 153.4300 },
  },
  {
    id: '22',
    address: '67 Hastings Street, Noosa Heads QLD 4567',
    shortAddress: '67 Hastings Street',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 95,
    propertyType: 'Apartment',
    priceEstimate: { low: 1100000, mid: 1250000, high: 1400000 },
    rentalEstimate: { weekly: 850, yield: 3.5 },
    suburb: 'Noosa Heads',
    state: 'QLD',
    postcode: '4567',
    coordinates: { lat: -26.3920, lng: 153.0864 },
  },
  {
    id: '23',
    address: '45 Ocean Street, Broadbeach QLD 4218',
    shortAddress: '45 Ocean Street',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 90,
    propertyType: 'Apartment',
    priceEstimate: { low: 680000, mid: 750000, high: 820000 },
    rentalEstimate: { weekly: 580, yield: 4.0 },
    suburb: 'Broadbeach',
    state: 'QLD',
    postcode: '4218',
    coordinates: { lat: -28.0312, lng: 153.4311 },
  },
  {
    id: '24',
    address: '189 Shute Harbour Road, Airlie Beach QLD 4802',
    shortAddress: '189 Shute Harbour Road',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 520,
    buildingSize: 160,
    propertyType: 'House',
    priceEstimate: { low: 580000, mid: 650000, high: 720000 },
    rentalEstimate: { weekly: 550, yield: 4.4 },
    suburb: 'Airlie Beach',
    state: 'QLD',
    postcode: '4802',
    coordinates: { lat: -20.2697, lng: 148.7186 },
  },
  {
    id: '25',
    address: '88 Sheridan Street, Cairns QLD 4870',
    shortAddress: '88 Sheridan Street',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 400,
    buildingSize: 145,
    propertyType: 'House',
    priceEstimate: { low: 420000, mid: 480000, high: 540000 },
    rentalEstimate: { weekly: 420, yield: 4.6 },
    suburb: 'Cairns',
    state: 'QLD',
    postcode: '4870',
    coordinates: { lat: -16.9186, lng: 145.7781 },
  },
  {
    id: '26',
    address: '156 Victoria Street, Townsville QLD 4810',
    shortAddress: '156 Victoria Street',
    beds: 4,
    baths: 2,
    parking: 2,
    landSize: 650,
    buildingSize: 210,
    propertyType: 'House',
    priceEstimate: { low: 380000, mid: 430000, high: 480000 },
    rentalEstimate: { weekly: 400, yield: 4.8 },
    suburb: 'Townsville',
    state: 'QLD',
    postcode: '4810',
    coordinates: { lat: -19.2590, lng: 146.8169 },
  },

  // === SOUTH AUSTRALIA ===
  {
    id: '4',
    address: '12 King William Street, Adelaide SA 5000',
    shortAddress: '12 King William Street',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 500,
    buildingSize: 195,
    propertyType: 'House',
    priceEstimate: { low: 520000, mid: 580000, high: 640000 },
    rentalEstimate: { weekly: 420, yield: 3.8 },
    suburb: 'Adelaide',
    state: 'SA',
    postcode: '5000',
    coordinates: { lat: -34.9285, lng: 138.6007 },
  },
  {
    id: '27',
    address: '78 Jetty Road, Glenelg SA 5045',
    shortAddress: '78 Jetty Road',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 75,
    propertyType: 'Apartment',
    priceEstimate: { low: 480000, mid: 530000, high: 580000 },
    rentalEstimate: { weekly: 420, yield: 4.1 },
    suburb: 'Glenelg',
    state: 'SA',
    postcode: '5045',
    coordinates: { lat: -34.9804, lng: 138.5155 },
  },
  {
    id: '28',
    address: '45 The Parade, Norwood SA 5067',
    shortAddress: '45 The Parade',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 380,
    buildingSize: 165,
    propertyType: 'Townhouse',
    priceEstimate: { low: 720000, mid: 800000, high: 880000 },
    rentalEstimate: { weekly: 550, yield: 3.6 },
    suburb: 'Norwood',
    state: 'SA',
    postcode: '5067',
    coordinates: { lat: -34.9210, lng: 138.6341 },
  },

  // === WESTERN AUSTRALIA ===
  {
    id: '5',
    address: '56 St Georges Terrace, Perth WA 6000',
    shortAddress: '56 St Georges Terrace',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 90,
    propertyType: 'Apartment',
    priceEstimate: { low: 480000, mid: 520000, high: 560000 },
    rentalEstimate: { weekly: 400, yield: 4.0 },
    suburb: 'Perth',
    state: 'WA',
    postcode: '6000',
    coordinates: { lat: -31.9505, lng: 115.8605 },
  },
  {
    id: '29',
    address: '123 Marine Terrace, Fremantle WA 6160',
    shortAddress: '123 Marine Terrace',
    beds: 3,
    baths: 2,
    parking: 1,
    landSize: 280,
    buildingSize: 140,
    propertyType: 'Townhouse',
    priceEstimate: { low: 720000, mid: 800000, high: 880000 },
    rentalEstimate: { weekly: 580, yield: 3.8 },
    suburb: 'Fremantle',
    state: 'WA',
    postcode: '6160',
    coordinates: { lat: -32.0569, lng: 115.7485 },
  },
  {
    id: '30',
    address: '88 Scarborough Beach Road, Scarborough WA 6019',
    shortAddress: '88 Scarborough Beach Road',
    beds: 2,
    baths: 2,
    parking: 2,
    landSize: 0,
    buildingSize: 95,
    propertyType: 'Apartment',
    priceEstimate: { low: 580000, mid: 650000, high: 720000 },
    rentalEstimate: { weekly: 520, yield: 4.2 },
    suburb: 'Scarborough',
    state: 'WA',
    postcode: '6019',
    coordinates: { lat: -31.8947, lng: 115.7585 },
  },

  // === AUSTRALIAN CAPITAL TERRITORY ===
  {
    id: '31',
    address: '67 London Circuit, Canberra ACT 2601',
    shortAddress: '67 London Circuit',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 88,
    propertyType: 'Apartment',
    priceEstimate: { low: 620000, mid: 680000, high: 740000 },
    rentalEstimate: { weekly: 550, yield: 4.2 },
    suburb: 'Canberra',
    state: 'ACT',
    postcode: '2601',
    coordinates: { lat: -35.2809, lng: 149.1300 },
  },
  {
    id: '32',
    address: '234 Northbourne Avenue, Braddon ACT 2612',
    shortAddress: '234 Northbourne Avenue',
    beds: 1,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 52,
    propertyType: 'Apartment',
    priceEstimate: { low: 420000, mid: 460000, high: 500000 },
    rentalEstimate: { weekly: 400, yield: 4.5 },
    suburb: 'Braddon',
    state: 'ACT',
    postcode: '2612',
    coordinates: { lat: -35.2745, lng: 149.1345 },
  },

  // === TASMANIA ===
  {
    id: '33',
    address: '45 Salamanca Place, Hobart TAS 7000',
    shortAddress: '45 Salamanca Place',
    beds: 2,
    baths: 1,
    parking: 1,
    landSize: 0,
    buildingSize: 85,
    propertyType: 'Apartment',
    priceEstimate: { low: 580000, mid: 650000, high: 720000 },
    rentalEstimate: { weekly: 480, yield: 3.8 },
    suburb: 'Hobart',
    state: 'TAS',
    postcode: '7000',
    coordinates: { lat: -42.8821, lng: 147.3272 },
  },
  {
    id: '34',
    address: '78 Charles Street, Launceston TAS 7250',
    shortAddress: '78 Charles Street',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 550,
    buildingSize: 170,
    propertyType: 'House',
    priceEstimate: { low: 480000, mid: 540000, high: 600000 },
    rentalEstimate: { weekly: 420, yield: 4.0 },
    suburb: 'Launceston',
    state: 'TAS',
    postcode: '7250',
    coordinates: { lat: -41.4332, lng: 147.1441 },
  },

  // === NORTHERN TERRITORY ===
  {
    id: '35',
    address: '33 Mitchell Street, Darwin NT 0800',
    shortAddress: '33 Mitchell Street',
    beds: 2,
    baths: 2,
    parking: 1,
    landSize: 0,
    buildingSize: 85,
    propertyType: 'Apartment',
    priceEstimate: { low: 380000, mid: 420000, high: 460000 },
    rentalEstimate: { weekly: 450, yield: 5.6 },
    suburb: 'Darwin',
    state: 'NT',
    postcode: '0800',
    coordinates: { lat: -12.4634, lng: 130.8456 },
  },
  {
    id: '36',
    address: '156 Stuart Highway, Alice Springs NT 0870',
    shortAddress: '156 Stuart Highway',
    beds: 3,
    baths: 2,
    parking: 2,
    landSize: 800,
    buildingSize: 160,
    propertyType: 'House',
    priceEstimate: { low: 350000, mid: 400000, high: 450000 },
    rentalEstimate: { weekly: 420, yield: 5.5 },
    suburb: 'Alice Springs',
    state: 'NT',
    postcode: '0870',
    coordinates: { lat: -23.6980, lng: 133.8807 },
  },
]

// Generate default data for new properties
const generateDefaultComparables = (property) => {
  const basePrice = property.priceEstimate.mid
  return [
    {
      address: `${Math.floor(Math.random() * 200)} ${property.suburb} Street, ${property.suburb} ${property.state} ${property.postcode}`,
      salePrice: Math.round(basePrice * (0.9 + Math.random() * 0.2)),
      saleDate: '2023-10-15',
      beds: property.beds,
      baths: property.baths,
      landSize: property.landSize || 0,
      distance: (Math.random() * 2).toFixed(1),
    },
    {
      address: `${Math.floor(Math.random() * 200)} ${property.suburb} Avenue, ${property.suburb} ${property.state} ${property.postcode}`,
      salePrice: Math.round(basePrice * (0.85 + Math.random() * 0.3)),
      saleDate: '2023-08-22',
      beds: property.beds,
      baths: property.baths,
      landSize: property.landSize || 0,
      distance: (Math.random() * 3).toFixed(1),
    },
  ]
}

const generateDefaultSchools = (property) => {
  return [
    {
      name: `${property.suburb} Grammar School`,
      type: 'Private',
      rating: 85 + Math.floor(Math.random() * 10),
      distance: (0.5 + Math.random() * 2).toFixed(1),
      yearRange: 'Prep-12',
    },
    {
      name: `${property.suburb} State High School`,
      type: 'Public',
      rating: 80 + Math.floor(Math.random() * 15),
      distance: (1 + Math.random() * 3).toFixed(1),
      yearRange: '7-12',
    },
    {
      name: `${property.suburb} Primary School`,
      type: 'Public',
      rating: 78 + Math.floor(Math.random() * 12),
      distance: (0.3 + Math.random() * 1.5).toFixed(1),
      yearRange: 'Prep-6',
    },
  ]
}

const generateDefaultSalesHistory = (property) => {
  const basePrice = property.priceEstimate.mid
  return [
    {
      salePrice: Math.round(basePrice * 0.75),
      saleDate: '2019-06-15',
      saleType: 'Private Sale',
    },
    {
      salePrice: Math.round(basePrice * 0.55),
      saleDate: '2014-03-22',
      saleType: 'Auction',
    },
  ]
}

// Mock comparable sales
export const getComparableSales = (propertyId) => {
  const comparables = {
    '1': [
      { address: '115 Collins Street, Melbourne VIC 3000', salePrice: 920000, saleDate: '2023-11-15', beds: 3, baths: 2, landSize: 420, distance: 0.2 },
      { address: '130 Collins Street, Melbourne VIC 3000', salePrice: 980000, saleDate: '2023-09-22', beds: 3, baths: 2, landSize: 480, distance: 0.3 },
      { address: '98 Collins Street, Melbourne VIC 3000', salePrice: 890000, saleDate: '2023-08-10', beds: 3, baths: 1, landSize: 400, distance: 0.4 },
    ],
    '2': [
      { address: '38 Harbour Drive, Sydney NSW 2000', salePrice: 750000, saleDate: '2023-12-01', beds: 2, baths: 1, landSize: 0, distance: 0.15 },
      { address: '52 Harbour Drive, Sydney NSW 2000', salePrice: 810000, saleDate: '2023-10-18', beds: 2, baths: 2, landSize: 0, distance: 0.25 },
    ],
    '3': [
      { address: '65 Queen Street, Brisbane QLD 4000', salePrice: 720000, saleDate: '2023-11-05', beds: 4, baths: 2, landSize: 580, distance: 0.3 },
      { address: '90 Queen Street, Brisbane QLD 4000', salePrice: 680000, saleDate: '2023-09-12', beds: 4, baths: 2, landSize: 550, distance: 0.5 },
    ],
    '4': [
      { address: '8 King William Street, Adelaide SA 5000', salePrice: 560000, saleDate: '2023-10-20', beds: 3, baths: 2, landSize: 480, distance: 0.2 },
    ],
    '5': [
      { address: '48 St Georges Terrace, Perth WA 6000', salePrice: 510000, saleDate: '2023-11-28', beds: 2, baths: 1, landSize: 0, distance: 0.18 },
    ],
  }
  
  // Return existing data or generate default for new properties
  if (comparables[propertyId]) {
    return comparables[propertyId]
  }
  
  const property = mockProperties.find(p => p.id === propertyId)
  return property ? generateDefaultComparables(property) : []
}

// Mock suburb insights
export const getSuburbInsights = (suburb, state) => {
  const insights = {
    'Melbourne VIC': { medianPrice: 950000, growthPercent: 5.2, demand: 'High', population: 150000, averageDaysOnMarket: 28, auctionClearanceRate: 72 },
    'South Yarra VIC': { medianPrice: 1100000, growthPercent: 4.8, demand: 'Very High', population: 25000, averageDaysOnMarket: 25, auctionClearanceRate: 75 },
    'Richmond VIC': { medianPrice: 1200000, growthPercent: 5.5, demand: 'High', population: 30000, averageDaysOnMarket: 22, auctionClearanceRate: 78 },
    'St Kilda VIC': { medianPrice: 850000, growthPercent: 4.2, demand: 'High', population: 22000, averageDaysOnMarket: 30, auctionClearanceRate: 70 },
    'Carlton VIC': { medianPrice: 780000, growthPercent: 3.8, demand: 'Medium', population: 18000, averageDaysOnMarket: 32, auctionClearanceRate: 68 },
    'Armadale VIC': { medianPrice: 2500000, growthPercent: 3.2, demand: 'Very High', population: 12000, averageDaysOnMarket: 35, auctionClearanceRate: 65 },
    'Hawthorn VIC': { medianPrice: 1800000, growthPercent: 3.5, demand: 'High', population: 28000, averageDaysOnMarket: 28, auctionClearanceRate: 72 },
    'Sydney NSW': { medianPrice: 1200000, growthPercent: 3.8, demand: 'Very High', population: 200000, averageDaysOnMarket: 35, auctionClearanceRate: 68 },
    'Bondi Beach NSW': { medianPrice: 2200000, growthPercent: 4.5, demand: 'Very High', population: 12000, averageDaysOnMarket: 28, auctionClearanceRate: 75 },
    'Parramatta NSW': { medianPrice: 720000, growthPercent: 5.8, demand: 'High', population: 45000, averageDaysOnMarket: 30, auctionClearanceRate: 70 },
    'Manly NSW': { medianPrice: 1650000, growthPercent: 4.0, demand: 'Very High', population: 18000, averageDaysOnMarket: 25, auctionClearanceRate: 78 },
    'Newtown NSW': { medianPrice: 1500000, growthPercent: 4.2, demand: 'High', population: 15000, averageDaysOnMarket: 22, auctionClearanceRate: 80 },
    'Crows Nest NSW': { medianPrice: 980000, growthPercent: 3.9, demand: 'High', population: 10000, averageDaysOnMarket: 28, auctionClearanceRate: 72 },
    'Newcastle NSW': { medianPrice: 850000, growthPercent: 6.2, demand: 'High', population: 165000, averageDaysOnMarket: 32, auctionClearanceRate: 65 },
    'Wollongong NSW': { medianPrice: 920000, growthPercent: 5.8, demand: 'High', population: 95000, averageDaysOnMarket: 35, auctionClearanceRate: 62 },
    'Brisbane QLD': { medianPrice: 750000, growthPercent: 6.5, demand: 'High', population: 120000, averageDaysOnMarket: 32, auctionClearanceRate: 65 },
    'South Brisbane QLD': { medianPrice: 680000, growthPercent: 7.2, demand: 'High', population: 8000, averageDaysOnMarket: 28, auctionClearanceRate: 70 },
    'Fortitude Valley QLD': { medianPrice: 520000, growthPercent: 6.8, demand: 'Medium', population: 5000, averageDaysOnMarket: 35, auctionClearanceRate: 62 },
    'Surfers Paradise QLD': { medianPrice: 850000, growthPercent: 8.5, demand: 'Very High', population: 25000, averageDaysOnMarket: 30, auctionClearanceRate: 68 },
    'Noosa Heads QLD': { medianPrice: 1350000, growthPercent: 9.2, demand: 'Very High', population: 5000, averageDaysOnMarket: 25, auctionClearanceRate: 75 },
    'Broadbeach QLD': { medianPrice: 780000, growthPercent: 7.8, demand: 'High', population: 12000, averageDaysOnMarket: 28, auctionClearanceRate: 70 },
    'Airlie Beach QLD': { medianPrice: 620000, growthPercent: 5.5, demand: 'Medium', population: 3000, averageDaysOnMarket: 45, auctionClearanceRate: 55 },
    'Cairns QLD': { medianPrice: 480000, growthPercent: 4.8, demand: 'Medium', population: 150000, averageDaysOnMarket: 42, auctionClearanceRate: 52 },
    'Townsville QLD': { medianPrice: 420000, growthPercent: 3.2, demand: 'Low', population: 180000, averageDaysOnMarket: 55, auctionClearanceRate: 45 },
    'Adelaide SA': { medianPrice: 580000, growthPercent: 4.1, demand: 'Medium', population: 80000, averageDaysOnMarket: 38, auctionClearanceRate: 58 },
    'Glenelg SA': { medianPrice: 620000, growthPercent: 4.5, demand: 'High', population: 15000, averageDaysOnMarket: 32, auctionClearanceRate: 65 },
    'Norwood SA': { medianPrice: 850000, growthPercent: 3.8, demand: 'High', population: 8000, averageDaysOnMarket: 28, auctionClearanceRate: 70 },
    'Perth WA': { medianPrice: 520000, growthPercent: 2.9, demand: 'Medium', population: 90000, averageDaysOnMarket: 42, auctionClearanceRate: 55 },
    'Fremantle WA': { medianPrice: 780000, growthPercent: 3.5, demand: 'High', population: 30000, averageDaysOnMarket: 35, auctionClearanceRate: 62 },
    'Scarborough WA': { medianPrice: 680000, growthPercent: 4.2, demand: 'High', population: 15000, averageDaysOnMarket: 32, auctionClearanceRate: 65 },
    'Canberra ACT': { medianPrice: 750000, growthPercent: 3.5, demand: 'High', population: 430000, averageDaysOnMarket: 30, auctionClearanceRate: 68 },
    'Braddon ACT': { medianPrice: 580000, growthPercent: 4.2, demand: 'High', population: 5000, averageDaysOnMarket: 28, auctionClearanceRate: 72 },
    'Hobart TAS': { medianPrice: 680000, growthPercent: 5.8, demand: 'High', population: 55000, averageDaysOnMarket: 28, auctionClearanceRate: 70 },
    'Launceston TAS': { medianPrice: 520000, growthPercent: 4.5, demand: 'Medium', population: 90000, averageDaysOnMarket: 35, auctionClearanceRate: 58 },
    'Darwin NT': { medianPrice: 480000, growthPercent: 2.2, demand: 'Low', population: 80000, averageDaysOnMarket: 55, auctionClearanceRate: 42 },
    'Alice Springs NT': { medianPrice: 400000, growthPercent: 1.8, demand: 'Low', population: 25000, averageDaysOnMarket: 65, auctionClearanceRate: 38 },
  }
  
  return insights[`${suburb} ${state}`] || {
    medianPrice: 650000,
    growthPercent: 4.0,
    demand: 'Medium',
    population: 100000,
    averageDaysOnMarket: 35,
    auctionClearanceRate: 60,
  }
}

// Mock nearby schools
export const getNearbySchools = (propertyId) => {
  const schools = {
    '1': [
      { name: 'Melbourne Grammar School', type: 'Private', rating: 95, distance: 0.8, yearRange: 'Prep-12' },
      { name: 'Melbourne High School', type: 'Public', rating: 92, distance: 1.2, yearRange: '7-12' },
      { name: 'St Kilda Primary School', type: 'Public', rating: 88, distance: 2.1, yearRange: 'Prep-6' },
    ],
    '2': [
      { name: 'Sydney Grammar School', type: 'Private', rating: 96, distance: 0.5, yearRange: 'Prep-12' },
      { name: 'Fort Street High School', type: 'Public', rating: 94, distance: 1.0, yearRange: '7-12' },
    ],
    '3': [
      { name: 'Brisbane Grammar School', type: 'Private', rating: 93, distance: 0.7, yearRange: 'Prep-12' },
      { name: 'Brisbane State High School', type: 'Public', rating: 91, distance: 1.5, yearRange: '7-12' },
    ],
    '4': [
      { name: 'Prince Alfred College', type: 'Private', rating: 89, distance: 1.8, yearRange: 'Prep-12' },
      { name: 'Adelaide High School', type: 'Public', rating: 87, distance: 2.2, yearRange: '7-12' },
    ],
    '5': [
      { name: 'Hale School', type: 'Private', rating: 90, distance: 3.5, yearRange: 'Prep-12' },
      { name: 'Perth Modern School', type: 'Public', rating: 92, distance: 4.2, yearRange: '7-12' },
    ],
  }
  
  // Return existing data or generate default for new properties
  if (schools[propertyId]) {
    return schools[propertyId]
  }
  
  const property = mockProperties.find(p => p.id === propertyId)
  return property ? generateDefaultSchools(property) : []
}

// Mock past sales history
export const getPastSalesHistory = (propertyId) => {
  const history = {
    '1': [
      { salePrice: 820000, saleDate: '2018-06-15', saleType: 'Private Sale' },
      { salePrice: 650000, saleDate: '2012-03-22', saleType: 'Auction' },
      { salePrice: 480000, saleDate: '2005-11-10', saleType: 'Private Sale' },
    ],
    '2': [
      { salePrice: 680000, saleDate: '2019-09-12', saleType: 'Private Sale' },
      { salePrice: 520000, saleDate: '2014-07-08', saleType: 'Auction' },
    ],
    '3': [
      { salePrice: 620000, saleDate: '2020-02-20', saleType: 'Auction' },
      { salePrice: 480000, saleDate: '2015-05-15', saleType: 'Private Sale' },
    ],
    '4': [
      { salePrice: 450000, saleDate: '2017-08-30', saleType: 'Private Sale' },
    ],
    '5': [
      { salePrice: 420000, saleDate: '2018-11-18', saleType: 'Auction' },
      { salePrice: 350000, saleDate: '2013-04-25', saleType: 'Private Sale' },
    ],
  }
  
  // Return existing data or generate default for new properties
  if (history[propertyId]) {
    return history[propertyId]
  }
  
  const property = mockProperties.find(p => p.id === propertyId)
  return property ? generateDefaultSalesHistory(property) : []
}

// Search properties by address (mock autocomplete) - improved for better matching
export const searchProperties = (query) => {
  if (!query || query.trim().length < 1) {
    return []
  }
  const lowerQuery = query.toLowerCase().trim()
  
  return mockProperties.filter((property) => {
    // Match against various fields
    const matchAddress = property.address.toLowerCase().includes(lowerQuery)
    const matchShortAddress = property.shortAddress.toLowerCase().includes(lowerQuery)
    const matchSuburb = property.suburb.toLowerCase().includes(lowerQuery)
    const matchState = property.state.toLowerCase().includes(lowerQuery)
    const matchPostcode = property.postcode.includes(query.trim())
    const matchPropertyType = property.propertyType.toLowerCase().includes(lowerQuery)
    
    // Match common city name variations
    const cityAliases = {
      'sydney': ['sydney', 'syd'],
      'melbourne': ['melbourne', 'melb'],
      'brisbane': ['brisbane', 'bris', 'bne'],
      'perth': ['perth'],
      'adelaide': ['adelaide'],
      'hobart': ['hobart'],
      'darwin': ['darwin'],
      'canberra': ['canberra', 'cbr'],
      'gold coast': ['gold coast', 'goldcoast', 'gc', 'surfers', 'broadbeach'],
      'sunshine coast': ['sunshine coast', 'noosa'],
    }
    
    let matchCityAlias = false
    for (const [city, aliases] of Object.entries(cityAliases)) {
      if (aliases.some(alias => lowerQuery.includes(alias))) {
        if (property.suburb.toLowerCase().includes(city) || 
            property.address.toLowerCase().includes(city)) {
          matchCityAlias = true
          break
        }
      }
    }
    
    return matchAddress || matchShortAddress || matchSuburb || matchState || 
           matchPostcode || matchPropertyType || matchCityAlias
  })
}

// Get property by ID
export const getPropertyById = (id) => {
  return mockProperties.find((p) => p.id === id)
}

// Get property by address (fuzzy match)
export const getPropertyByAddress = (address) => {
  const lowerAddress = address.toLowerCase()
  return (
    mockProperties.find(
      (p) =>
        p.address.toLowerCase() === lowerAddress ||
        p.shortAddress.toLowerCase() === lowerAddress
    ) || mockProperties[0]
  )
}
