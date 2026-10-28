const { USE_MOCKS } = require('../mocks');

/**
 * Step 6: robots.txt + sitemap.xml check
 * Verifies crawlability, robots directive permissions, and XML sitemap discoverability
 */
async function checkRobotsAndSitemap(baseUrl) {
  if (USE_MOCKS && (baseUrl.includes('example-dental-clinic.com') || baseUrl.includes('mock'))) {
    return {
      score: 85,
      robotsTxt: {
        exists: true,
        statusCode: 200,
        url: `${baseUrl}/robots.txt`,
        hasSitemapDirective: true,
        disallowCount: 1,
        content: "User-agent: *\nDisallow: /admin/\nSitemap: https://example-dental-clinic.com/sitemap.xml",
        issues: []
      },
      sitemapXml: {
        exists: true,
        statusCode: 200,
        url: `${baseUrl}/sitemap.xml`,
        urlCount: 38,
        issues: []
      },
      technicalHealth: 'Good'
    };
  }

  try {
    const origin = new URL(baseUrl).origin;
    const robotsUrl = `${origin}/robots.txt`;
    const sitemapUrl = `${origin}/sitemap.xml`;

    // 1. Check robots.txt
    let robotsExists = false;
    let robotsStatusCode = 0;
    let robotsContent = '';
    let hasSitemapDirective = false;
    const robotsIssues = [];

    try {
      const robotsRes = await fetch(robotsUrl, { signal: AbortSignal.timeout(6000) });
      robotsStatusCode = robotsRes.status;
      if (robotsRes.ok) {
        robotsExists = true;
        robotsContent = await robotsRes.text();
        hasSitemapDirective = /sitemap:\s*https?:\/\//i.test(robotsContent);
        if (!hasSitemapDirective) {
          robotsIssues.push('robots.txt does not declare a Sitemap location directive.');
        }
        if (/disallow:\s*\/\s*$/m.test(robotsContent)) {
          robotsIssues.push('CRITICAL: robots.txt appears to block entire site (Disallow: /).');
        }
      } else {
        robotsIssues.push(`robots.txt returned HTTP ${robotsStatusCode}.`);
      }
    } catch (e) {
      robotsIssues.push(`Could not reach robots.txt: ${e.message}`);
    }

    // 2. Check sitemap.xml
    let sitemapExists = false;
    let sitemapStatusCode = 0;
    let sitemapUrlCount = 0;
    const sitemapIssues = [];

    try {
      const sitemapRes = await fetch(sitemapUrl, { signal: AbortSignal.timeout(6000) });
      sitemapStatusCode = sitemapRes.status;
      if (sitemapRes.ok) {
        sitemapExists = true;
        const text = await sitemapRes.text();
        const matches = text.match(/<loc>/g);
        sitemapUrlCount = matches ? matches.length : 0;
        if (sitemapUrlCount === 0) {
          sitemapIssues.push('sitemap.xml found but contains zero <loc> URLs.');
        }
      } else {
        sitemapIssues.push(`sitemap.xml returned HTTP ${sitemapStatusCode}.`);
      }
    } catch (e) {
      sitemapIssues.push(`Could not fetch sitemap.xml: ${e.message}`);
    }

    let score = 100;
    if (!robotsExists) score -= 30;
    if (!hasSitemapDirective) score -= 15;
    if (!sitemapExists) score -= 30;
    if (robotsIssues.some((i) => i.includes('CRITICAL'))) score -= 50;

    return {
      score: Math.max(0, Math.min(100, score)),
      robotsTxt: {
        exists: robotsExists,
        statusCode: robotsStatusCode,
        url: robotsUrl,
        hasSitemapDirective,
        issues: robotsIssues
      },
      sitemapXml: {
        exists: sitemapExists,
        statusCode: sitemapStatusCode,
        url: sitemapUrl,
        urlCount: sitemapUrlCount,
        issues: sitemapIssues
      },
      technicalHealth: score >= 80 ? 'Optimal' : score >= 50 ? 'Needs Attention' : 'Critical'
    };
  } catch (error) {
    return {
      score: 70,
      robotsTxt: { exists: false, error: error.message },
      sitemapXml: { exists: false, error: error.message },
      technicalHealth: 'Unverified'
    };
  }
}

module.exports = { checkRobotsAndSitemap };
