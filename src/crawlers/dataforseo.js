const { USE_MOCKS } = require('../mocks');
const mockData = require('../mocks/dataforseo.mock');

/**
 * DataForSEO SERP and Keyword Rankings (Step 7)
 * MOCKED per Section 2.1 & 3.2
 */
async function getDataForSEORankings(url, keyword = 'dental clinic pune') {
  if (USE_MOCKS) {
    return mockData;
  }

  try {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) {
      return mockData;
    }

    // Real DataForSEO SERP API call goes here
    return mockData;
  } catch (error) {
    console.error('[DataForSEO Error]:', error.message);
    return mockData;
  }
}

module.exports = { getDataForSEORankings };
