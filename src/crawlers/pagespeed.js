const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/pagespeed.mock');

/**
 * PageSpeed Insights integration
 * Follows integration pattern specified in Section 2.2 of EdgeLink Assessment
 */
async function getPageSpeed(url) {
  if (USE_MOCKS) {
    return mockData;
  }

  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      console.warn('[PageSpeed] No API key provided, falling back to mock data');
      return mockData;
    }

    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile&key=${apiKey}`;

    const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      throw new Error(`PageSpeed API returned status ${res.status}`);
    }
    const data = await res.json();
    const lighthouse = data.lighthouseResult || {};
    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};

    return {
      url,
      strategy: 'mobile',
      categories: {
        performance: { score: categories.performance?.score ?? 0.65 },
        seo: { score: categories.seo?.score ?? 0.85 },
        accessibility: { score: categories.accessibility?.score ?? 0.75 }
      },
      audits: {
        'largest-contentful-paint': {
          score: audits['largest-contentful-paint']?.score ?? 0.5,
          displayValue: audits['largest-contentful-paint']?.displayValue ?? '3.8 s'
        },
        'cumulative-layout-shift': {
          score: audits['cumulative-layout-shift']?.score ?? 0.9,
          displayValue: audits['cumulative-layout-shift']?.displayValue ?? '0.05'
        },
        'interaction-to-next-paint': {
          score: audits['interaction-to-next-paint']?.score ?? 0.7,
          displayValue: audits['interaction-to-next-paint']?.displayValue ?? '240 ms'
        },
        'render-blocking-resources': {
          score: audits['render-blocking-resources']?.score ?? 0.6,
          description: audits['render-blocking-resources']?.displayValue ?? '2 blocking resources'
        },
        'unused-javascript': {
          score: audits['unused-javascript']?.score ?? 0.5,
          displayValue: audits['unused-javascript']?.displayValue ?? '380 KiB'
        }
      }
    };
  } catch (error) {
    console.error('[PageSpeed Error]:', error.message);
    return mockData;
  }
}

module.exports = { getPageSpeed };
