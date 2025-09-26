export interface VideoEmbedInfo {
  type: 'youtube' | 'sharepoint' | 'stream' | 'unknown';
  embedUrl?: string;
  videoId?: string;
  originalUrl: string;
}

export function getVideoEmbedInfo(url: string): VideoEmbedInfo {
  if (!url) {
    return { type: 'unknown', originalUrl: url };
  }

  // YouTube URL patterns
  const youtubeRegexes = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ];

  // Check for YouTube
  for (const regex of youtubeRegexes) {
    const match = url.match(regex);
    if (match) {
      const videoId = match[1];
      return {
        type: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        originalUrl: url
      };
    }
  }

  // Microsoft Stream patterns (new Stream)
  const streamRegexes = [
    // New Microsoft Stream URLs
    /https:\/\/[^\/]+\.sharepoint\.com\/.*\/_layouts\/15\/stream\.aspx\?id=([^&]+)/i,
    // Stream embed URLs
    /https:\/\/[^\/]+\.sharepoint\.com\/.*\/_layouts\/15\/embed\.aspx\?UniqueId=([^&]+)/i,
    // Stream portal URLs
    /https:\/\/web\.microsoftstream\.com\/video\/([^?]+)/i,
    /https:\/\/.*\.microsoftstream\.com\/video\/([^?]+)/i
  ];

  // Check for Microsoft Stream
  for (const regex of streamRegexes) {
    const match = url.match(regex);
    if (match) {
      let embedUrl = url;
      
      // Handle SharePoint Stream URLs
      if (url.includes('/_layouts/15/stream.aspx')) {
        // Convert to embed format
        embedUrl = url.replace('/stream.aspx?', '/embed.aspx?');
        if (!embedUrl.includes('&embed=')) {
          embedUrl += '&embed=1';
        }
      } else if (url.includes('microsoftstream.com')) {
        // For classic Stream, try to convert to embed
        const videoId = match[1];
        embedUrl = url.replace('/video/', '/embed/video/');
      }

      return {
        type: 'stream',
        embedUrl,
        originalUrl: url
      };
    }
  }

  // SharePoint/OneDrive patterns (non-Stream)
  const sharePointRegexes = [
    // SharePoint short links (sharing format)
    /https:\/\/[^\/]+\.sharepoint\.com\/:v:\/[^\/]+\/([^?]+)/i,
    // General SharePoint video files
    /https:\/\/[^\/]+\.sharepoint\.com\/.*\/([^\/]+\.(mp4|avi|mov|wmv|mkv))/i,
    // SharePoint embed URLs
    /https:\/\/[^\/]+\.sharepoint\.com\/.*embed.*[?&]file=([^&]+)/i,
    // OneDrive embed URLs
    /https:\/\/onedrive\.live\.com\/embed.*[?&]cid=([^&]+).*[?&]resid=([^&]+)/i
  ];

  // Check for SharePoint/OneDrive
  for (const regex of sharePointRegexes) {
    const match = url.match(regex);
    if (match) {
      let embedUrl = url;
      
      // Handle non-Stream SharePoint URLs
      if (url.includes('.sharepoint.com') && !url.includes('/embed')) {
        // Handle SharePoint short links (:v: format)
        if (url.includes(':v:')) {
          // For SharePoint short video links, convert to embed format
          // Replace :v: with appropriate embed path
          embedUrl = url.replace(':v:', ':e:') + '&e=2';
        } else if (url.includes('/_layouts/15/')) {
          embedUrl = url.replace('/_layouts/15/', '/_layouts/15/embed.aspx?');
        } else {
          // For other SharePoint URLs, add embed parameter
          embedUrl = url + (url.includes('?') ? '&' : '?') + 'embed=1';
        }
      }

      return {
        type: 'sharepoint',
        embedUrl,
        originalUrl: url
      };
    }
  }

  return { type: 'unknown', originalUrl: url };
}

export function isEmbeddableVideo(url: string): boolean {
  const info = getVideoEmbedInfo(url);
  return info.type !== 'unknown';
}