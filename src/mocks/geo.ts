export interface GeoNode {
  name: string;
  districts: {
    name: string;
    sectors: string[];
  }[];
}

// Representative subset of Rwanda's administrative hierarchy (not exhaustive).
export const RWANDA_GEO: GeoNode[] = [
  {
    name: 'Kigali City',
    districts: [
      { name: 'Gasabo', sectors: ['Kimironko', 'Remera', 'Kacyiru', 'Ndera'] },
      { name: 'Kicukiro', sectors: ['Niboye', 'Kagarama', 'Gatenga'] },
      { name: 'Nyarugenge', sectors: ['Nyamirambo', 'Muhima', 'Kimisagara'] },
    ],
  },
  {
    name: 'Southern Province',
    districts: [
      { name: 'Huye', sectors: ['Ngoma', 'Tumba', 'Mukura'] },
      { name: 'Muhanga', sectors: ['Nyamabuye', 'Kabgayi'] },
    ],
  },
  {
    name: 'Northern Province',
    districts: [
      { name: 'Musanze', sectors: ['Muhoza', 'Cyuve', 'Kimonyi'] },
      { name: 'Rulindo', sectors: ['Base', 'Buyoga'] },
    ],
  },
  {
    name: 'Western Province',
    districts: [
      { name: 'Rubavu', sectors: ['Gisenyi', 'Nyamyumba', 'Rugerero'] },
      { name: 'Karongi', sectors: ['Bwishyura', 'Murundi'] },
    ],
  },
  {
    name: 'Eastern Province',
    districts: [
      { name: 'Rwamagana', sectors: ['Kigabiro', 'Musha'] },
      { name: 'Nyagatare', sectors: ['Rukomo', 'Matimba'] },
    ],
  },
];
