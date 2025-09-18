const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

// Create HTTP agent
const httpAgent = new http.Agent({
  keepAlive: true
});

// Create enhanced HTTPS agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  minVersion: 'TLSv1.2',
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  ciphers: 'HIGH:MEDIUM:!aNULL:!MD5:!SHA1',
  keepAlive: true
});

// Configure RSS parser with both HTTP and HTTPS support
const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded']
  }
});

// Parse URL with appropriate agent based on protocol
async function parseFeedWithProtocolSupport(url) {
  try {
    const protocol = url.startsWith('https') ? 'https' : 'http';
    const agent = protocol === 'https' ? httpsAgent : httpAgent;
    
    // Create custom fetch function with the right agent
    const customParser = new Parser({
      customFields: {
        item: ['description', 'content:encoded']
      },
      requestOptions: {
        agent: agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    });
    
    return await customParser.parseURL(url);
  } catch (error) {
    console.error(`Error parsing feed ${url}:`, error.message);
    throw error;
  }
}


// RSS feeds to fetch news from
const RSS_FEEDS = [
  'https://rss.cnn.com/rss/cnn_topstories.rss',  // Updated to HTTPS
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://feeds.reuters.com/reuters/topNews',    // Updated to HTTPS
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://www.theguardian.com/world/rss',
  'https://www.aljazeera.com/xml/rss/all.xml'
];

// Default articles to use if fetching fails
const DEFAULT_ARTICLES = [
  {
    title: "Sample Technology News",
    link: "https://example.com/tech-news",
    pubDate: new Date().toISOString(),
    content: "This is a sample technology news article. It discusses the latest advancements in AI and machine learning technologies.",
    source: "Sample News"
  },
  {
    title: "Sample World News",
    link: "https://example.com/world-news",
    pubDate: new Date().toISOString(),
    content: "This is a sample world news article. It covers important global events and international relations.",
    source: "Sample News"
  }
];

// Fetch news articles from RSS feeds
exports.fetchNewsArticles = async () => {
  try {
    const articles = [];
    console.log('📰 Fetching latest news from RSS feeds...');

    // Process each RSS feed
    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parseFeedWithProtocolSupport(feedUrl);
        console.log(`✓ Retrieved ${feed.items.length} articles from ${feed.title}`);

        // Get the first ~15-20 articles from each feed
        const feedArticles = await Promise.all(
          feed.items.slice(0, 20).map(async item => {
            try {
              // Extract full content if available
              let content = item.content || item.contentSnippet || '';

              // If content is too short, try to scrape the full article
              if (content.length < 500 && item.link) {
                content = await scrapeArticleContent(item.link);
              }

              // Parse the publication date
              let pubDate = new Date();
              try {
                if (item.pubDate) {
                  pubDate = new Date(item.pubDate);
                } else if (item.isoDate) {
                  pubDate = new Date(item.isoDate);
                }
              } catch (dateError) {
                console.error(`Error parsing date for article ${item.title}:`, dateError);
              }

              return {
                title: item.title,
                link: item.link,
                pubDate: pubDate.toISOString(),
                content: content,
                source: feed.title,
                timestamp: pubDate.getTime() // Add timestamp for sorting
              };
            } catch (error) {
              console.error(`Error processing article ${item.title}:`, error);
              return null;
            }
          })
        );

        // Filter out null articles and add to collection
        articles.push(...feedArticles.filter(article => article !== null));
      } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
      }
    }

    // If no articles were fetched, use default articles
    if (articles.length === 0) {
      console.log('⚠️ No articles fetched, using default articles');
      return DEFAULT_ARTICLES;
    }

    // Sort articles by publication date (newest first)
    articles.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`✅ Successfully fetched ${articles.length} articles, newest from ${new Date(articles[0].pubDate).toLocaleString()}`);
    
    // Limit to ~50 articles
    return articles.slice(0, 50);
  } catch (error) {
    console.error('❌ Error fetching news articles:', error);
    return DEFAULT_ARTICLES;
  }
};

// Scrape article content from URL
async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      httpsAgent: httpsAgent,
      timeout: 10000, // Add a timeout to avoid hanging requests
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Accept only successful responses
      }
    });

    const $ = cheerio.load(response.data);

    // Remove scripts, styles, and other non-content elements
    $('script, style, nav, header, footer, iframe, .ad, .advertisement').remove();

    // Extract article content (this is a simple approach, might need customization per site)
    let content = '';
    $('article, .article, .content, .article-content, .story-content, main').each((_, element) => {
      content += $(element).text();
    });

    // If no specific content container found, try paragraphs
    if (!content) {
      $('p').each((_, element) => {
        content += $(element).text() + ' ';
      });
    }

    return content.trim();
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error);
    return '';
  }
}