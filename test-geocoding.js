const fetch = require('node-fetch');

const geocodeAddress = async (address) => {
  const cleanAddress = address
    .replace(/kat\s*:?\s*\d+/gi, '')
    .replace(/daire\s*:?\s*\d+/gi, '')
    .replace(/no\s*:?\s*\d+/gi, '')
    .trim();
    
  const searchQueries = [
    address,
    cleanAddress,
    address.split(',').slice(-2).join(','),
    address.split(' ').slice(-3).join(' ')
  ];

  for (const query of searchQueries) {
    if (!query || query.trim().length < 3) continue;
    console.log("Trying:", query);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`, {
        headers: { 'Accept-Language': 'tr,en', 'User-Agent': 'MobilyaServisApp/1.0' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error('Geocoding error for query:', query, error);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
  return null;
};

geocodeAddress('Mannerheimintie 10, 00100 Helsinki').then(console.log);
