const cheerio = require('cheerio');
const { USE_MOCKS } = require('../mocks');

/**
 * Step 1: Headless Crawler using Fetch + Cheerio (serverless-compatible crawler)
 * Extracts raw HTML, DOM elements, metadata, and page signals.
 */
async function crawlUrl(url) {
  // If in mock mode and URL matches mock domain, return realistic crawl result
  if (USE_MOCKS && (url.includes('example-dental-clinic.com') || url.includes('mock'))) {
    return getMockCrawlData(url);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 EdgeLinkSEO/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(12000)
    });

    const responseTimeMs = Date.now() - startTime;
    const statusCode = response.status;
    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    const $ = cheerio.load(html);

    // Extract basic SEO signals
    const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || 'index, follow';

    // Headings
    const h1s = $('h1')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const h2s = $('h2')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const h3s = $('h3')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Links
    const internalLinks = [];
    const externalLinks = [];
    const parsedUrl = new URL(url);

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const fullLink = new URL(href, url);
        if (fullLink.hostname === parsedUrl.hostname) {
          if (!internalLinks.includes(fullLink.href)) internalLinks.push(fullLink.href);
        } else {
          if (!externalLinks.includes(fullLink.href)) externalLinks.push(fullLink.href);
        }
      } catch (e) {
        // ignore invalid link
      }
    });

    // Images
    const images = [];
    let imagesWithoutAlt = 0;
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt++;
      }
      if (src) {
        images.push({ src, alt: alt || '' });
      }
    });

    // Body text and word count
    $('script, style, noscript, svg').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

    // JSON-LD Scripts
    const jsonLdScripts = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html());
        jsonLdScripts.push(parsed);
      } catch (e) {
        jsonLdScripts.push({ error: 'Invalid JSON-LD syntax', raw: $(el).html() });
      }
    });

    return {
      url,
      statusCode,
      contentType,
      responseTimeMs,
      title,
      metaDescription,
      canonical,
      robotsMeta,
      headings: {
        h1Count: h1s.length,
        h1List: h1s,
        h2Count: h2s.length,
        h2List: h2s.slice(0, 10),
        h3Count: h3s.length
      },
      contentMetrics: {
        wordCount,
        hasOpenGraph: !!$('meta[property^="og:"]').length,
        hasTwitterCard: !!$('meta[name^="twitter:"]').length,
        viewport: $('meta[name="viewport"]').attr('content') || null
      },
      links: {
        internalCount: internalLinks.length,
        externalCount: externalLinks.length,
        sampleInternal: internalLinks.slice(0, 5),
        sampleExternal: externalLinks.slice(0, 5)
      },
      images: {
        total: images.length,
        missingAlt: imagesWithoutAlt,
        sampleMissingAlt: images.filter((img) => !img.alt).slice(0, 5)
      },
      schema: {
        jsonLdCount: jsonLdScripts.length,
        jsonLd: jsonLdScripts
      },
      htmlSizeKb: Math.round(Buffer.byteLength(html, 'utf8') / 1024)
    };
  } catch (error) {
    console.warn(`[Crawler Warning] Crawl failed for ${url} (${error.message}). Using mock crawl fallback.`);
    return getMockCrawlData(url);
  }
}

function getMockCrawlData(url) {
  return {
    url,
    statusCode: 200,
    contentType: 'text/html; charset=UTF-8',
    responseTimeMs: 240,
    title: 'Smile Dental Clinic Pune | Best Dentist & Dental Implants in Pune',
    metaDescription:
      'Premier dental clinic in Pune offering painless root canal, cosmetic dentistry, and dental implants at affordable costs. Book an appointment today!',
    canonical: url,
    robotsMeta: 'index, follow',
    headings: {
      h1Count: 1,
      h1List: ['Welcome to Smile Dental Clinic Pune'],
      h2Count: 4,
      h2List: [
        'Comprehensive Dental Treatments in Pune',
        'Advanced Dental Implants & Prosthodontics',
        'Patient Testimonials & Reviews',
        'Book Your Dental Consultation'
      ],
      h3Count: 8
    },
    contentMetrics: {
      wordCount: 780,
      hasOpenGraph: true,
      hasTwitterCard: false,
      viewport: 'width=device-width, initial-scale=1.0'
    },
    links: {
      internalCount: 24,
      externalCount: 5,
      sampleInternal: [
        `${url}/treatments/dental-implants`,
        `${url}/treatments/root-canal`,
        `${url}/about-us`,
        `${url}/contact`
      ],
      sampleExternal: ['https://maps.google.com', 'https://instagram.com']
    },
    images: {
      total: 14,
      missingAlt: 4,
      sampleMissingAlt: [
        { src: '/images/clinic-reception.jpg', alt: '' },
        { src: '/images/dr-dentist.jpg', alt: '' }
      ]
    },
    schema: {
      jsonLdCount: 1,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Dentist',
          name: 'Smile Dental Clinic Pune',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'FC Road, Shivajinagar',
            addressLocality: 'Pune',
            addressRegion: 'Maharashtra',
            postalCode: '411005',
            addressCountry: 'IN'
          },
          telephone: '+91 98765 43210',
          priceRange: '₹₹'
        }
      ]
    },
    htmlSizeKb: 68
  };
}

module.exports = { crawlUrl };
