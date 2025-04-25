export const brands = {
  luxury: [
    { id: 'gucci', name: 'Gucci' },
    { id: 'louis-vuitton', name: 'Louis Vuitton' },
    { id: 'chanel', name: 'Chanel' },
    { id: 'hermes', name: 'Hermès' },
    { id: 'prada', name: 'Prada' },
    { id: 'dior', name: 'Dior' },
    { id: 'versace', name: 'Versace' },
    { id: 'fendi', name: 'Fendi' },
    { id: 'balenciaga', name: 'Balenciaga' },
    { id: 'burberry', name: 'Burberry' }
  ],
  premium: [
    { id: 'coach', name: 'Coach' },
    { id: 'michael-kors', name: 'Michael Kors' },
    { id: 'kate-spade', name: 'Kate Spade' },
    { id: 'tommy-hilfiger', name: 'Tommy Hilfiger' },
    { id: 'calvin-klein', name: 'Calvin Klein' },
    { id: 'ralph-lauren', name: 'Ralph Lauren' },
    { id: 'ted-baker', name: 'Ted Baker' },
    { id: 'tory-burch', name: 'Tory Burch' }
  ],
  highStreet: [
    { id: 'zara', name: 'Zara' },
    { id: 'h-and-m', name: 'H&M' },
    { id: 'uniqlo', name: 'Uniqlo' },
    { id: 'mango', name: 'Mango' },
    { id: 'topshop', name: 'Topshop' },
    { id: 'forever21', name: 'Forever 21' },
    { id: 'urban-outfitters', name: 'Urban Outfitters' },
    { id: 'asos', name: 'ASOS' },
    { id: 'pull-and-bear', name: 'Pull&Bear' },
    { id: 'bershka', name: 'Bershka' }
  ],
  athletic: [
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
    { id: 'puma', name: 'Puma' },
    { id: 'under-armour', name: 'Under Armour' },
    { id: 'lululemon', name: 'Lululemon' },
    { id: 'reebok', name: 'Reebok' },
    { id: 'new-balance', name: 'New Balance' },
    { id: 'fila', name: 'Fila' }
  ],
  designer: [
    { id: 'alexander-mcqueen', name: 'Alexander McQueen' },
    { id: 'valentino', name: 'Valentino' },
    { id: 'yves-saint-laurent', name: 'Yves Saint Laurent' },
    { id: 'givenchy', name: 'Givenchy' },
    { id: 'balmain', name: 'Balmain' },
    { id: 'bottega-veneta', name: 'Bottega Veneta' },
    { id: 'off-white', name: 'Off-White' },
    { id: 'jacquemus', name: 'Jacquemus' }
  ]
};

// Flat array of all brands
export const allBrands = Object.values(brands).flat();

// Get brand category
export const getBrandCategory = (brandId) => {
  for (const [category, brandList] of Object.entries(brands)) {
    if (brandList.some(brand => brand.id === brandId)) {
      return category;
    }
  }
  return null;
};

// Get brand by ID
export const getBrandById = (brandId) => {
  return allBrands.find(brand => brand.id === brandId);
};

// Get brands by category
export const getBrandsByCategory = (category) => {
  return brands[category] || [];
};
