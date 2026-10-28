/**
 * Step 4: Schema.org Validator
 * Checks structured data compliance, missing properties, and local business markup
 */
async function validateSchemaOrg(crawlData) {
  const jsonLdList = crawlData?.schema?.jsonLd || [];
  const findings = [];
  let score = 100;
  let schemaTypesFound = [];

  if (!jsonLdList || jsonLdList.length === 0) {
    return {
      score: 30,
      hasSchema: false,
      typesFound: [],
      issues: ['No Schema.org JSON-LD structured data found on the page.'],
      recommendations: [
        'Add LocalBusiness or MedicalBusiness schema with complete address, telephone, and geo coordinates for local map pack dominance.'
      ],
      details: []
    };
  }

  jsonLdList.forEach((item, index) => {
    if (item.error) {
      findings.push(`JSON-LD #${index + 1} has syntax error: ${item.error}`);
      score -= 25;
      return;
    }

    const type = item['@type'] || item.type;
    if (type) {
      schemaTypesFound.push(type);
    }

    // Check LocalBusiness / Dentist / Healthcare required properties
    const localTypes = ['LocalBusiness', 'Dentist', 'Physician', 'MedicalClinic', 'MedicalBusiness', 'RealEstateAgent'];
    const isLocalBusiness = localTypes.some((t) => (Array.isArray(type) ? type.includes(t) : type === t));

    if (isLocalBusiness) {
      if (!item.name) {
        findings.push('Schema missing required "name" property.');
        score -= 10;
      }
      if (!item.address) {
        findings.push('Schema missing "address" object (critical for Indian local search).');
        score -= 20;
      } else {
        const addr = item.address;
        if (!addr.streetAddress || !addr.addressLocality || !addr.addressRegion) {
          findings.push('Address in Schema is incomplete. Missing streetAddress or locality.');
          score -= 10;
        }
      }
      if (!item.telephone) {
        findings.push('Schema missing "telephone" contact.');
        score -= 10;
      }
      if (!item.geo) {
        findings.push('Schema missing "geo" (latitude/longitude coordinates) for Google Maps linking.');
        score -= 10;
      }
      if (!item.openingHours && !item.openingHoursSpecification) {
        findings.push('Schema missing "openingHoursSpecification".');
        score -= 5;
      }
    }
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    hasSchema: true,
    typesFound: schemaTypesFound,
    issues: findings,
    rawSchemaCount: jsonLdList.length,
    schemas: jsonLdList
  };
}

module.exports = { validateSchemaOrg };
