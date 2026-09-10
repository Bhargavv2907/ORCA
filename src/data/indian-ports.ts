export interface IndianPort {
  id: string;
  name: string;
  code?: string;
  lat: number;
  lon: number;
  type: 'major' | 'private' | 'minor' | 'deepwater';
  state: string;
  coast: 'West Coast' | 'East Coast' | 'Island Territory';
  cargoType?: string;
  description?: string;
}

export const ALL_INDIAN_PORTS: IndianPort[] = [
  // ==========================================
  // 13 MAJOR PORTS OF INDIA (GOVT OF INDIA)
  // ==========================================
  {
    id: 'jnpt',
    name: 'Jawaharlal Nehru Port (JNPT / Nhava Sheva)',
    code: 'INNSA',
    lat: 18.9486,
    lon: 72.9525,
    type: 'major',
    state: 'Maharashtra',
    coast: 'West Coast',
    cargoType: 'Container & Liquid Cargo',
    description: 'India\'s largest container port handling over 50% of containerized cargo.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai Port Trust',
    code: 'BOM',
    lat: 18.9500,
    lon: 72.8350,
    type: 'major',
    state: 'Maharashtra',
    coast: 'West Coast',
    cargoType: 'Breakbulk, Liquid & Cruise',
    description: 'Historic natural deepwater harbour serving western India.'
  },
  {
    id: 'deendayal',
    name: 'Deendayal Port (Kandla)',
    code: 'IXY',
    lat: 23.0100,
    lon: 70.2100,
    type: 'major',
    state: 'Gujarat',
    coast: 'West Coast',
    cargoType: 'Crude Oil, Chemicals & Dry Bulk',
    description: 'Largest port in India by volume, hub for crude and dry bulk cargo.'
  },
  {
    id: 'chennai',
    name: 'Chennai Port',
    code: 'MAA',
    lat: 13.0900,
    lon: 80.2900,
    type: 'major',
    state: 'Tamil Nadu',
    coast: 'East Coast',
    cargoType: 'Containers, Automobiles & Bulk',
    description: 'Third oldest major port in India, major gateway for Coromandel Coast.'
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam Port',
    code: 'VTZ',
    lat: 17.6940,
    lon: 83.2860,
    type: 'major',
    state: 'Andhra Pradesh',
    coast: 'East Coast',
    cargoType: 'Iron Ore, Coal, Petroleum & Containers',
    description: 'Deepest landlocked inner harbour on the East Coast of India.'
  },
  {
    id: 'cochin',
    name: 'Cochin Port (Vallarpadam)',
    code: 'COK',
    lat: 9.9680,
    lon: 76.2670,
    type: 'major',
    state: 'Kerala',
    coast: 'West Coast',
    cargoType: 'Transshipment Container & Crude Oil',
    description: 'Key maritime port on the international sea route in the Arabian Sea.'
  },
  {
    id: 'kolkata_haldia',
    name: 'Syama Prasad Mookerjee Port (Kolkata & Haldia)',
    code: 'CCU',
    lat: 22.5411,
    lon: 88.3283,
    type: 'major',
    state: 'West Bengal',
    coast: 'East Coast',
    cargoType: 'Riverine Cargo, Containers & Bulk',
    description: 'India\'s only riverine major port, serving North-East and hinterland.'
  },
  {
    id: 'paradip',
    name: 'Paradip Port',
    code: 'PPR',
    lat: 20.2660,
    lon: 86.6700,
    type: 'major',
    state: 'Odisha',
    coast: 'East Coast',
    cargoType: 'Thermal Coal, Iron Ore & Crude',
    description: 'Deepwater artificial port handling heavy mineral exports.'
  },
  {
    id: 'new_mangalore',
    name: 'New Mangalore Port',
    code: 'IXE',
    lat: 12.9180,
    lon: 74.8090,
    type: 'major',
    state: 'Karnataka',
    coast: 'West Coast',
    cargoType: 'POL, LPG, Coffee & Iron Ore Pellets',
    description: 'Only major port of Karnataka, gateway to Canara region.'
  },
  {
    id: 'tuticorin',
    name: 'V.O. Chidambaranar Port (Tuticorin)',
    code: 'TCR',
    lat: 8.7640,
    lon: 78.1850,
    type: 'major',
    state: 'Tamil Nadu',
    coast: 'East Coast',
    cargoType: 'Coal, Thermal Power & Containers',
    description: 'All-weather port located strategically near the Gulf of Mannar.'
  },
  {
    id: 'mormugao',
    name: 'Mormugao Port',
    code: 'GOI',
    lat: 15.4070,
    lon: 73.8000,
    type: 'major',
    state: 'Goa',
    coast: 'West Coast',
    cargoType: 'Iron Ore Export & Cruise Ships',
    description: 'Premier iron ore exporting port situated at Zuari river mouth.'
  },
  {
    id: 'ennore',
    name: 'Kamarajar Port (Ennore)',
    code: 'ENR',
    lat: 13.2200,
    lon: 80.3300,
    type: 'major',
    state: 'Tamil Nadu',
    coast: 'East Coast',
    cargoType: 'Coal for TNEB, LNG & Automobiles',
    description: 'India\'s first corporatised major port, eco-friendly energy port.'
  },
  {
    id: 'port_blair',
    name: 'Port Blair Port',
    code: 'IXZ',
    lat: 11.6800,
    lon: 92.7460,
    type: 'major',
    state: 'Andaman & Nicobar Islands',
    coast: 'Island Territory',
    cargoType: 'Inter-Island Passenger, Timber & Strategic',
    description: '13th Major Port of India, strategic naval & commercial hub.'
  },

  // ==========================================
  // DEEPWATER & PRIVATE PORTS
  // ==========================================
  {
    id: 'mundra',
    name: 'Mundra Port',
    code: 'MUN',
    lat: 22.8390,
    lon: 69.7050,
    type: 'private',
    state: 'Gujarat',
    coast: 'West Coast',
    cargoType: 'Mega Container, Coal & Crude',
    description: 'India\'s largest commercial private port operated by Adani.'
  },
  {
    id: 'pipavav',
    name: 'Pipavav Port (APM Terminals)',
    code: 'PIP',
    lat: 20.9050,
    lon: 71.5050,
    type: 'private',
    state: 'Gujarat',
    coast: 'West Coast',
    cargoType: 'Containers, LPG & Ro-Ro',
    description: 'First private sector port in India, operated by APM Terminals.'
  },
  {
    id: 'hazira',
    name: 'Hazira Port',
    code: 'HAZ',
    lat: 21.1000,
    lon: 72.6500,
    type: 'private',
    state: 'Gujarat',
    coast: 'West Coast',
    cargoType: 'LNG, Steel & Multipurpose Bulk',
    description: 'Deepwater port near Surat handling LNG and industrial steel cargo.'
  },
  {
    id: 'krishnapatnam',
    name: 'Krishnapatnam Port',
    code: 'KRI',
    lat: 14.2560,
    lon: 80.1160,
    type: 'private',
    state: 'Andhra Pradesh',
    coast: 'East Coast',
    cargoType: 'Capesize Bulk, Containers & Edible Oil',
    description: 'Deepwater all-weather port in Nellore district.'
  },
  {
    id: 'gangavaram',
    name: 'Gangavaram Port',
    code: 'GGV',
    lat: 17.6200,
    lon: 83.2400,
    type: 'private',
    state: 'Andhra Pradesh',
    coast: 'East Coast',
    cargoType: 'Deep-draft Coal, Coking Coal & Minerals',
    description: 'Deepest port in India capable of handling Super Capesize vessels.'
  },
  {
    id: 'dhamra',
    name: 'Dhamra Port',
    code: 'DHM',
    lat: 20.7900,
    lon: 86.9500,
    type: 'private',
    state: 'Odisha',
    coast: 'East Coast',
    cargoType: 'Capesize Coal, Iron Ore & LNG Terminal',
    description: 'High draft port situated between Paradip and Kolkata.'
  },
  {
    id: 'vizhinjam',
    name: 'Vizhinjam International Transshipment Port',
    code: 'VZH',
    lat: 8.3800,
    lon: 76.9700,
    type: 'deepwater',
    state: 'Kerala',
    coast: 'West Coast',
    cargoType: 'Ultra Large Container Ships (ULCS) Transshipment',
    description: 'India\'s first deepwater transshipment port with 20m natural draft.'
  },
  {
    id: 'kattupalli',
    name: 'Kattupalli Port',
    code: 'KAT',
    lat: 13.3100,
    lon: 80.3400,
    type: 'private',
    state: 'Tamil Nadu',
    coast: 'East Coast',
    cargoType: 'Container, Ship Repair & Heavy Lift',
    description: 'Modern private container terminal north of Ennore.'
  },
  {
    id: 'karaikal',
    name: 'Karaikal Port',
    code: 'KRK',
    lat: 10.9200,
    lon: 79.8400,
    type: 'private',
    state: 'Puducherry',
    coast: 'East Coast',
    cargoType: 'Coal, Fertilizer, Cement & Liquid',
    description: 'All-weather deepwater port serving central Tamil Nadu hinterland.'
  },
  {
    id: 'gopalpur',
    name: 'Gopalpur Port',
    code: 'GPR',
    lat: 19.2600,
    lon: 84.9200,
    type: 'private',
    state: 'Odisha',
    coast: 'East Coast',
    cargoType: 'Ilmenite, Sand & Dry Bulk',
    description: 'Deepwater port handling mineral sand and dry bulk cargo.'
  },

  // ==========================================
  // MINOR, INTERMEDIATE & REGIONAL PORTS
  // ==========================================
  // Gujarat
  { id: 'dahej', name: 'Dahej Port', lat: 21.7100, lon: 72.5800, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Chemicals & LNG' },
  { id: 'porbandar', name: 'Porbandar Port', lat: 21.6300, lon: 69.6100, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Fishing & Commercial' },
  { id: 'veraval', name: 'Veraval Port', lat: 20.9000, lon: 70.3600, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Fishing Hub & Seafood Export' },
  { id: 'okha', name: 'Okha Port', lat: 22.4700, lon: 69.0800, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Bauxite & Chemicals' },
  { id: 'jamnagar', name: 'Jamnagar Port (Bedi/Rozi)', lat: 22.4500, lon: 70.0700, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Fertilizers & Minerals' },
  { id: 'bhavnagar', name: 'Bhavnagar Port', lat: 21.7600, lon: 72.1500, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Lock Gate & Dry Bulk' },
  { id: 'navlakhi', name: 'Navlakhi Port', lat: 22.9680, lon: 70.4480, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Coal Lighterage' },
  { id: 'mandvi', name: 'Mandvi Port', lat: 22.8300, lon: 69.3400, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Wooden Dhows & Fishing' },
  { id: 'magdalla', name: 'Magdalla Port (Surat)', lat: 21.1200, lon: 72.7300, type: 'minor', state: 'Gujarat', coast: 'West Coast', cargoType: 'Industrial Lighterage' },

  // Maharashtra
  { id: 'jaigad', name: 'Jaigad Port (JSW)', lat: 17.3000, lon: 73.2200, type: 'private', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Coal & Iron Ore' },
  { id: 'ratnagiri', name: 'Ratnagiri Port (Mirya Bay)', lat: 16.9830, lon: 73.2960, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Molasses & Fishing' },
  { id: 'dighi', name: 'Dighi Port', lat: 18.2300, lon: 72.8900, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Multipurpose Bulk' },
  { id: 'dabhol', name: 'Dabhol Port', lat: 17.5900, lon: 73.1800, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'LNG Terminal' },
  { id: 'redi', name: 'Redi Port', lat: 15.7500, lon: 73.6600, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Iron Ore Export' },
  { id: 'dharamtar', name: 'Dharamtar Port', lat: 18.8400, lon: 73.0200, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Barge & Steel Cargo' },
  { id: 'revdanda', name: 'Revdanda Port', lat: 18.5500, lon: 72.9300, type: 'minor', state: 'Maharashtra', coast: 'West Coast', cargoType: 'Clinker & Coal' },

  // Goa
  { id: 'panaji', name: 'Panaji Port', lat: 15.5000, lon: 73.8300, type: 'minor', state: 'Goa', coast: 'West Coast', cargoType: 'Passenger Ferries & Casino Barges' },
  { id: 'betul', name: 'Betul Port', lat: 15.1400, lon: 73.9400, type: 'minor', state: 'Goa', coast: 'West Coast', cargoType: 'Fishing Jetty' },

  // Karnataka
  { id: 'karwar', name: 'Karwar Port', lat: 14.8010, lon: 74.1290, type: 'minor', state: 'Karnataka', coast: 'West Coast', cargoType: 'Petroleum & Bitumen' },
  { id: 'old_mangalore', name: 'Old Mangalore Port', lat: 12.8560, lon: 74.8180, type: 'minor', state: 'Karnataka', coast: 'West Coast', cargoType: 'Fishing & Tile Export' },
  { id: 'malpe', name: 'Malpe Port', lat: 13.3500, lon: 74.6900, type: 'minor', state: 'Karnataka', coast: 'West Coast', cargoType: 'Major Fishing Harbour & Boat Building' },
  { id: 'honnavar', name: 'Honnavar Port', lat: 14.2800, lon: 74.4400, type: 'minor', state: 'Karnataka', coast: 'West Coast', cargoType: 'Fishing & Silica Sand' },
  { id: 'belekere', name: 'Belekeri Port', lat: 14.6900, lon: 74.1700, type: 'minor', state: 'Karnataka', coast: 'West Coast', cargoType: 'Iron Ore Bunkering' },

  // Kerala
  { id: 'beypore', name: 'Beypore Port', lat: 11.1700, lon: 75.8100, type: 'minor', state: 'Kerala', coast: 'West Coast', cargoType: 'Kozhikode Coastal Trade & Uru Building' },
  { id: 'azhikkal', name: 'Azhikkal Port', lat: 11.9200, lon: 75.3300, type: 'minor', state: 'Kerala', coast: 'West Coast', cargoType: 'Plywood & Plywood Sand' },
  { id: 'kollam_minor', name: 'Kollam Port', lat: 8.8900, lon: 76.5800, type: 'minor', state: 'Kerala', coast: 'West Coast', cargoType: 'Cashew Imports & Coastal Cargo' },
  { id: 'ponnani', name: 'Ponnani Port', lat: 10.7700, lon: 75.9100, type: 'minor', state: 'Kerala', coast: 'West Coast', cargoType: 'Fishing Terminal' },
  { id: 'neendakara', name: 'Neendakara Fishing Port', lat: 8.9400, lon: 76.5400, type: 'minor', state: 'Kerala', coast: 'West Coast', cargoType: 'Deep Sea Fishing Trawlers' },

  // Tamil Nadu & Puducherry
  { id: 'cuddalore', name: 'Cuddalore Port', lat: 11.7500, lon: 79.7700, type: 'minor', state: 'Tamil Nadu', coast: 'East Coast', cargoType: 'Chemicals & Fishing' },
  { id: 'nagapattinam', name: 'Nagapattinam Port', lat: 10.7700, lon: 79.8500, type: 'minor', state: 'Tamil Nadu', coast: 'East Coast', cargoType: 'Passenger Ferry to Sri Lanka & Edible Oil' },
  { id: 'puducherry_port', name: 'Puducherry Port', lat: 11.9300, lon: 79.8300, type: 'minor', state: 'Puducherry', coast: 'East Coast', cargoType: 'Coastal Cargo & Tourism' },
  { id: 'rameswaram', name: 'Rameswaram Port', lat: 9.2880, lon: 79.3130, type: 'minor', state: 'Tamil Nadu', coast: 'East Coast', cargoType: 'Fishing & Pamban Ferry' },

  // Andhra Pradesh
  { id: 'kakinada_deep', name: 'Kakinada Deep Water Port', lat: 16.9440, lon: 82.2530, type: 'minor', state: 'Andhra Pradesh', coast: 'East Coast', cargoType: 'Offshore OSV, Rice & Fertilizers' },
  { id: 'machilipatnam', name: 'Machilipatnam Port', lat: 16.1800, lon: 81.1400, type: 'minor', state: 'Andhra Pradesh', coast: 'East Coast', cargoType: 'General Cargo' },
  { id: 'ramayapatnam', name: 'Ramayapatnam Port', lat: 15.0200, lon: 80.0500, type: 'minor', state: 'Andhra Pradesh', coast: 'East Coast', cargoType: 'Greenfield Bulk' },
  { id: 'bhavanapadu', name: 'Mulapeta (Bhavanapadu) Port', lat: 18.5700, lon: 84.3200, type: 'minor', state: 'Andhra Pradesh', coast: 'East Coast', cargoType: 'Srikakulam Hinterland Cargo' },

  // West Bengal
  { id: 'diamond_harbour', name: 'Diamond Harbour Port', lat: 22.1900, lon: 88.1900, type: 'minor', state: 'West Bengal', coast: 'East Coast', cargoType: 'River Bunkering & Anchorage' },
  { id: 'tajpur', name: 'Tajpur Deep Sea Port', lat: 21.6400, lon: 87.6200, type: 'deepwater', state: 'West Bengal', coast: 'East Coast', cargoType: 'Proposed Greenfield Deep Sea' },

  // Andaman & Nicobar Islands (UT)
  { id: 'car_nicobar', name: 'Car Nicobar Port', lat: 9.1500, lon: 92.7700, type: 'minor', state: 'Andaman & Nicobar Islands', coast: 'Island Territory', cargoType: 'Island Supply Jetty' },
  { id: 'mayabunder', name: 'Mayabunder Port', lat: 12.9200, lon: 92.9000, type: 'minor', state: 'Andaman & Nicobar Islands', coast: 'Island Territory', cargoType: 'North Andaman Inter-island' },
  { id: 'campbell_bay', name: 'Campbell Bay Port (Great Nicobar)', lat: 6.9900, lon: 93.9300, type: 'minor', state: 'Andaman & Nicobar Islands', coast: 'Island Territory', cargoType: 'Southernmost Strategic Port' },

  // Lakshadweep Islands (UT)
  { id: 'kavaratti', name: 'Kavaratti Island Port', lat: 10.5600, lon: 72.6400, type: 'minor', state: 'Lakshadweep', coast: 'Island Territory', cargoType: 'UT Headquarters Jetty' },
  { id: 'agatti', name: 'Agatti Island Port', lat: 10.8500, lon: 72.1800, type: 'minor', state: 'Lakshadweep', coast: 'Island Territory', cargoType: 'Air & Marine Hub' },
  { id: 'minicoy', name: 'Minicoy Island Port', lat: 8.2800, lon: 73.0500, type: 'minor', state: 'Lakshadweep', coast: 'Island Territory', cargoType: 'Nine Degree Channel Patrol & Cargo' },
];
