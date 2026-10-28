/**
 * Step 5: On-page SEO Analysis
 * Evaluates title, meta descriptions, headings hierarchy, image alt attributes, word counts, and internal linking
 */
async function analyzeOnPage(crawlData) {
  const issues = [];
  const passes = [];
  let score = 100;

  const title = crawlData?.title || '';
  const metaDescription = crawlData?.metaDescription || '';
  const headings = crawlData?.headings || { h1Count: 0, h2Count: 0 };
  const images = crawlData?.images || { total: 0, missingAlt: 0 };
  const content = crawlData?.contentMetrics || { wordCount: 0 };
  const canonical = crawlData?.canonical || '';

  // Title check
  if (!title) {
    issues.push('Missing <title> tag on page');
    score -= 20;
  } else if (title.length < 30) {
    issues.push(`Title tag is too short (${title.length} characters). Optimal is 50-60 characters.`);
    score -= 8;
  } else if (title.length > 65) {
    issues.push(`Title tag exceeds recommended length (${title.length} characters) and may be truncated in SERPs.`);
    score -= 5;
  } else {
    passes.push(`Title length is optimal (${title.length} chars).`);
  }

  // Meta description check
  if (!metaDescription) {
    issues.push('Missing meta description tag.');
    score -= 15;
  } else if (metaDescription.length < 100) {
    issues.push(`Meta description is too short (${metaDescription.length} characters). Optimal is 140-160 characters.`);
    score -= 8;
  } else if (metaDescription.length > 165) {
    issues.push(`Meta description exceeds 160 characters (${metaDescription.length} chars) and may be cut off.`);
    score -= 4;
  } else {
    passes.push('Meta description length is well optimized.');
  }

  // H1 checks
  if (headings.h1Count === 0) {
    issues.push('Missing primary <h1> heading tag.');
    score -= 15;
  } else if (headings.h1Count > 1) {
    issues.push(`Multiple <h1> tags found (${headings.h1Count}). Should have exactly 1 <h1>.`);
    score -= 8;
  } else {
    passes.push('Single <h1> heading properly configured.');
  }

  if (headings.h2Count === 0) {
    issues.push('No <h2> subheadings found to structure content.');
    score -= 8;
  } else {
    passes.push(`Found ${headings.h2Count} <h2> section subheadings.`);
  }

  // Images Alt check
  if (images.total > 0 && images.missingAlt > 0) {
    const missingPercent = Math.round((images.missingAlt / images.total) * 100);
    issues.push(`${images.missingAlt} of ${images.total} images (${missingPercent}%) are missing alt text.`);
    score -= Math.min(15, Math.ceil(images.missingAlt * 3));
  } else if (images.total > 0) {
    passes.push('All images contain descriptive alt text.');
  }

  // Word count check
  if (content.wordCount < 300) {
    issues.push(`Thin content detected (${content.wordCount} words). Minimum recommended is 500+ words.`);
    score -= 15;
  } else if (content.wordCount < 600) {
    issues.push(`Moderate content length (${content.wordCount} words). Expand high-value commercial keywords.`);
    score -= 5;
  } else {
    passes.push(`Substantial content volume (${content.wordCount} words).`);
  }

  // Canonical check
  if (!canonical) {
    issues.push('Missing rel="canonical" tag to prevent duplicate content indexing.');
    score -= 10;
  } else {
    passes.push('Canonical URL is defined.');
  }

  // Social tags
  if (!content.hasOpenGraph) {
    issues.push('Missing OpenGraph meta tags (og:title, og:description, og:image) for social previews.');
    score -= 5;
  }

  const finalScore = Math.max(10, Math.min(100, score));

  return {
    score: finalScore,
    title,
    metaDescription,
    h1Count: headings.h1Count,
    h2Count: headings.h2Count,
    wordCount: content.wordCount,
    imagesTotal: images.total,
    imagesMissingAlt: images.missingAlt,
    canonical,
    issues,
    passes
  };
}

module.exports = { analyzeOnPage };
