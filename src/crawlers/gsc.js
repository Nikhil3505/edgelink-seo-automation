const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/gsc.mock');

/**
 * Google Search Console integration (Step 3)
 * MOCKED per Section 2.1 & 3.2
 */
async function getSearchConsoleData(url) {
  if (USE_MOCKS) {
    return mockData;
  }

  // Real GSC OAuth2 integration stub
  try {
    const gscToken = process.env.GOOGLE_SEARCH_CONSOLE_TOKEN;
    if (!gscToken) {
      return mockData;
    }
    // Production GSC API call here
    return mockData;
  } catch (error) {
    console.error('[GSC Error]:', error.message);
    return mockData;
  }
}

module.exports = { getSearchConsoleData };
