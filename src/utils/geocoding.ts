export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address) return null;

  // Common address cleanup (remove floor, apartment details which often confuse Nominatim)
  const cleanAddress = address
    .replace(/kat\s*:?\s*\d+/gi, '')
    .replace(/daire\s*:?\s*\d+/gi, '')
    .replace(/no\s*:?\s*\d+/gi, '')
    .replace(/zil\s*:?\s*\d+/gi, '')
    .trim();
    
  const searchQueries = [
    address, // Try full address first
    cleanAddress, // Try cleaned address
    // Try just the last two parts (usually district, city)
    address.split(',').slice(-2).join(','),
    // Try just the last three words if no commas exist
    address.split(' ').slice(-3).join(' ') 
  ];

  for (let query of searchQueries) {
    if (!query || query.trim().length < 3) continue;
    
    // Add Turkey context if no country is specified and if the user is testing local Turkish addresses
    // For this app, we will let Nominatim figure it out globally based on standard query
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`, {
        headers: {
          'Accept-Language': 'tr,en',
          // A custom User-Agent is requested by Nominatim policy
          // Note: In a real browser, this header might be blocked by Fetch API CORS,
          // but we can pass an email parameter instead for identification.
        }
      });
      
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error('Geocoding error for query:', query, error);
    }
    
    // Respect Nominatim rate limit (1 req/sec)
    await new Promise(r => setTimeout(r, 1100));
  }
  
  return null;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};
