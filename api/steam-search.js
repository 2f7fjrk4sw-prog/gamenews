export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { term = 'co-op' } = req.query;

  try {
    const steamApiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
    
    const response = await fetch(steamApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Steam API responded with ${response.status}`,
        items: [],
      });
    }

    const data = await response.json();
    const rawItems = data.items || [];

    const items = rawItems.map((item) => {
      const priceText = item.price
        ? `$${(item.price.final / 100).toFixed(2)}`
        : 'Ücretsiz / Fiyat Yok';

      return {
        id: `steam-${item.id}`,
        appId: item.id,
        title: item.name,
        steamUrl: `https://store.steampowered.com/app/${item.id}/`,
        headerImage: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
        tinyImage: item.tiny_image || `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.id}/capsule_231x87.jpg`,
        price: priceText,
        platforms: item.platforms || {},
      };
    });

    // Cache on Vercel CDN for 1 hour, stale-while-revalidate 1 day
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      success: true,
      total: data.total || items.length,
      term,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      items: [],
    });
  }
}
