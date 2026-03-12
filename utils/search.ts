// EXPANDED: Massive list of public instances to rotate through
const SEARCH_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://pipedapi.tokhmi.xyz",
  "https://api.piped.privacy.com.de",
  "https://pipedapi.adminforge.de",
  "https://api.piped.drgns.space",
  "https://pipedapi.r4fo.com",
  "https://piped-api.lunar.icu",
  "https://pipedapi.smnz.de",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.mha.fi",
  "https://api.piped.yt.im",
  "https://pipedapi.ducks.party",
  "https://inv.tux.pizza/api/v1",
  "https://vid.puffyan.us/api/v1",
  "https://invidious.projectsegfau.lt/api/v1",
  "https://invidious.nerdvpn.de/api/v1",
  "https://invidious.tiekoetter.com/api/v1"
];

export const findVideoId = async (query: string): Promise<{ id: string, title: string } | null> => {
    // 🧠 Root Fix: Try search with "lyrics" appended for better embed compatibility
    const queries = [query, `${query} lyrics`];
    
    for (const q of queries) {
        for (const instance of SEARCH_INSTANCES) {
            try {
                const isInvidious = instance.includes('/api/v1');
                const searchUrl = isInvidious 
                    ? `${instance}/search?q=${encodeURIComponent(q)}` 
                    : `${instance}/search?q=${encodeURIComponent(q)}&filter=videos`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // Faster timeout
                
                const res = await fetch(searchUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) continue;
                
                const data = await res.json();
                
                if (isInvidious) {
                    const item = Array.isArray(data) ? data.find((i: any) => i.type === 'video') : null;
                    if (item?.videoId) return { id: item.videoId, title: item.title };
                } else {
                    const item = data.items?.find((i: any) => i.type === 'stream');
                    if (item?.url) return { id: item.url.split('v=')[1], title: item.title };
                }
            } catch (e) {
                // Silently fail and try next
            }
        }
    }
    return null;
}