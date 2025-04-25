export const culturalClothing = {
  middleEastern: {
    name: 'Middle Eastern',
    cultures: [
      {
        id: 'afghan',
        name: 'Afghan',
        traditional: ['Perahan Tunban', 'Chapan', 'Firaq Partug', 'Gand-e-Afghani'],
        modern: ['Modern Chapan', 'Contemporary Afghan Dress']
      },
      {
        id: 'iranian',
        name: 'Iranian',
        traditional: ['Shalwar Kameez', 'Manteau', 'Chador'],
        modern: ['Modern Iranian Coat', 'Contemporary Persian Dress']
      },
      {
        id: 'arab',
        name: 'Arab',
        traditional: ['Thobe', 'Abaya', 'Jalabiya', 'Kandora'],
        modern: ['Modern Abaya', 'Contemporary Thobe']
      }
    ]
  },
  southAsian: {
    name: 'South Asian',
    cultures: [
      {
        id: 'indian',
        name: 'Indian',
        traditional: ['Saree', 'Lehenga', 'Sherwani', 'Kurta'],
        modern: ['Indo-Western', 'Fusion Wear']
      },
      {
        id: 'pakistani',
        name: 'Pakistani',
        traditional: ['Shalwar Kameez', 'Gharara', 'Sherwani'],
        modern: ['Pakistani Fusion', 'Modern Kurta']
      },
      {
        id: 'bangladeshi',
        name: 'Bangladeshi',
        traditional: ['Jamdani', 'Panjabi', 'Salwar Kameez'],
        modern: ['Bengali Modern', 'Contemporary Bangladeshi']
      }
    ]
  },
  eastAsian: {
    name: 'East Asian',
    cultures: [
      {
        id: 'chinese',
        name: 'Chinese',
        traditional: ['Hanfu', 'Qipao', 'Changshan'],
        modern: ['Modern Qipao', 'Contemporary Chinese']
      },
      {
        id: 'japanese',
        name: 'Japanese',
        traditional: ['Kimono', 'Yukata', 'Hakama'],
        modern: ['Modern Kimono', 'Japanese Contemporary']
      },
      {
        id: 'korean',
        name: 'Korean',
        traditional: ['Hanbok', 'Jeogori', 'Chima'],
        modern: ['Modern Hanbok', 'Korean Contemporary']
      }
    ]
  },
  african: {
    name: 'African',
    cultures: [
      {
        id: 'nigerian',
        name: 'Nigerian',
        traditional: ['Agbada', 'Iro and Buba', 'Kaftan'],
        modern: ['Modern Ankara', 'Contemporary Nigerian']
      },
      {
        id: 'moroccan',
        name: 'Moroccan',
        traditional: ['Kaftan', 'Jellaba', 'Takchita'],
        modern: ['Modern Moroccan', 'Contemporary Kaftan']
      },
      {
        id: 'libyan',
        name: 'Libyan',
        traditional: ['Jerd', 'Haoli', 'Libyan Thobe'],
        modern: ['Modern Libyan', 'Contemporary North African']
      }
    ]
  },
  european: {
    name: 'European',
    cultures: [
      {
        id: 'polish',
        name: 'Polish',
        traditional: ['Kontusz', 'Żupan', 'Gorset'],
        modern: ['Modern Polish', 'Contemporary Slavic']
      },
      {
        id: 'russian',
        name: 'Russian',
        traditional: ['Sarafan', 'Kokoshnik', 'Kaftan'],
        modern: ['Modern Russian', 'Contemporary Slavic']
      },
      {
        id: 'ukrainian',
        name: 'Ukrainian',
        traditional: ['Vyshyvanka', 'Plakhta', 'Ochipok'],
        modern: ['Modern Ukrainian', 'Contemporary Eastern European']
      }
    ]
  },
  latinAmerican: {
    name: 'Latin American',
    cultures: [
      {
        id: 'mexican',
        name: 'Mexican',
        traditional: ['Huipil', 'Rebozo', 'Charro'],
        modern: ['Modern Mexican', 'Contemporary Latin']
      },
      {
        id: 'peruvian',
        name: 'Peruvian',
        traditional: ['Poncho', 'Pollera', 'Chullo'],
        modern: ['Modern Andean', 'Contemporary Peruvian']
      }
    ]
  }
};

// Helper functions
export const getAllCultures = () => {
  return Object.values(culturalClothing)
    .flatMap(region => region.cultures);
};

export const getCultureById = (cultureId) => {
  return getAllCultures().find(culture => culture.id === cultureId);
};

export const getRegionByCultureId = (cultureId) => {
  return Object.values(culturalClothing)
    .find(region => 
      region.cultures.some(culture => culture.id === cultureId)
    );
};

export const getCulturalClothingTypes = (cultureId) => {
  const culture = getCultureById(cultureId);
  return culture ? [...culture.traditional, ...culture.modern] : [];
};
