export const COLLEGES = [
  { name: 'IIT Bombay', lat: 19.1334, lng: 72.9133, aliases: ['Indian Institute of Technology Bombay', 'IIT Mumbai'] },
  { name: 'IIT Madras', lat: 12.9916, lng: 80.2336, aliases: ['Indian Institute of Technology Madras', 'IIT Chennai'] },
  { name: 'IIIT Hyderabad', lat: 17.4455, lng: 78.3489, aliases: ['International Institute of Information Technology Hyderabad', 'IIIT-H'] },
  { name: 'NIT Trichy', lat: 10.7634, lng: 78.8150, aliases: ['National Institute of Technology Tiruchirappalli', 'NIT Tiruchirappalli'] },
  { name: 'BITS Pilani', lat: 28.3639, lng: 75.5870, aliases: ['Birla Institute of Technology and Science Pilani'] },
  { name: 'NIT Calicut', lat: 11.3215, lng: 75.9345, aliases: ['National Institute of Technology Calicut'] },
  { name: 'VIT Vellore', lat: 12.9697, lng: 79.1607, aliases: ['Vellore Institute of Technology'] },
  { name: 'NIT Surathkal', lat: 13.0112, lng: 74.7961, aliases: ['NIT Karnataka', 'NITK', 'National Institute of Technology Karnataka', 'National Institute of Technology Surathkal'] },
  { name: 'IIIT Delhi', lat: 28.5459, lng: 77.2732, aliases: ['Indraprastha Institute of Information Technology Delhi'] },
  { name: 'Delhi Technological University', lat: 28.7500, lng: 77.1170, aliases: ['DTU', 'Delhi College of Engineering'] },
  { name: 'Jadavpur University', lat: 22.4991, lng: 88.3714 },
  { name: 'COEP Pune', lat: 18.5293, lng: 73.8568, aliases: ['College of Engineering Pune', 'COEP Technological University'] },
  { name: 'LPU', lat: 31.2560, lng: 75.7051, aliases: ['Lovely Professional University'] },
  // Campus centers verified through OpenStreetMap's Nominatim service.
  // Newton uses Rishihood University, Sonipat; Vedam uses Sushant University, Gurugram.
  {
    name: 'Newton School of Technology', lat: 28.9831937, lng: 77.0907966,
    aliases: ['Newton School of Tech', 'Newton School of Technology Sonipat', 'Newton School of Technology Rishihood University'],
    osmUrl: 'https://www.openstreetmap.org/way/1418186593',
  },
  {
    name: 'Vedam School of Tech', lat: 28.4300830, lng: 77.1116129,
    aliases: ['Vedam School of Technology', 'Vedam School of Technology Gurugram', 'Vedam School of Technology Sushant University'],
    osmUrl: 'https://www.openstreetmap.org/way/272846921',
  },
  {
    name: 'Symbiosis Pune', lat: 18.5414316, lng: 73.7282252,
    aliases: ['Symbiosis Institute of Technology', 'Symbiosis Institute of Technology Pune', 'SIT Pune'],
    osmUrl: 'https://www.openstreetmap.org/way/315264405',
  },
  {
    name: 'IIT Delhi', lat: 28.5449971, lng: 77.1891506,
    aliases: ['Indian Institute of Technology Delhi'],
    osmUrl: 'https://www.openstreetmap.org/way/283148869',
  },
  {
    name: 'IIT Kanpur', lat: 26.5131880, lng: 80.2364843,
    aliases: ['Indian Institute of Technology Kanpur'],
    osmUrl: 'https://www.openstreetmap.org/way/52434888',
  },
  {
    name: 'IIT Kharagpur', lat: 22.3146519, lng: 87.3099912,
    aliases: ['Indian Institute of Technology Kharagpur', 'IIT KGP'],
    osmUrl: 'https://www.openstreetmap.org/way/52435606',
  },
  {
    name: 'BITS Goa', lat: 15.3910473, lng: 73.8779498,
    aliases: ['BITS Pilani Goa', 'BITS Pilani K K Birla Goa Campus', 'Birla Institute of Technology and Science Goa'],
    osmUrl: 'https://www.openstreetmap.org/way/124552890',
  },
  {
    name: 'Manipal Institute of Technology', lat: 13.3467383, lng: 74.7943357,
    aliases: ['MIT Manipal'],
    osmUrl: 'https://www.openstreetmap.org/way/171870089',
  },
  {
    name: 'Thapar University', lat: 30.3545336, lng: 76.3657969,
    aliases: ['Thapar Institute of Engineering and Technology', 'TIET'],
    osmUrl: 'https://www.openstreetmap.org/way/395256540',
  },
  {
    name: 'SRM University', lat: 12.8234361, lng: 80.0450412,
    aliases: ['SRM Institute of Science and Technology', 'SRMIST', 'SRM Kattankulathur'],
    osmUrl: 'https://www.openstreetmap.org/way/35460706',
  },
  {
    name: 'Ashoka University', lat: 28.9469007, lng: 77.1014386,
    osmUrl: 'https://www.openstreetmap.org/way/591433893',
  },
  {
    name: 'Plaksha University', lat: 30.6316513, lng: 76.7260704,
    osmUrl: 'https://www.openstreetmap.org/node/12752164667',
  },
];

export const DEFAULT_COLLEGE = COLLEGES[0];

export function getCollegeByName(name) {
  const normalize = value => typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const query = normalize(name);
  if (!query) return undefined;
  return COLLEGES.find(college => [college.name, ...(college.aliases || [])].some(alias => normalize(alias) === query));
}
