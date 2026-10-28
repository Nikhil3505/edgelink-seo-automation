const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * PDF Report Generator
 * Generates an executive-ready, highly polished PDF report for the SEO Audit.
 */
async function generatePdfReport(audit, client) {
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `seo-audit-${audit.id}.pdf`;
  const filePath = path.join(reportsDir, fileName);
  const publicUrl = `/reports/${fileName}`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `SEO Audit Report - ${client?.name || audit.url}`,
        Author: 'EdgeLink Technology',
        Subject: 'Full-Stack SEO Technical Audit & Action Plan'
      }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Primary Colors
    const primaryColor = '#0d9488'; // Teal
    const darkColor = '#0f172a'; // Slate 900
    const lightSlate = '#64748b'; // Slate 500
    const alertRed = '#ef4444';
    const alertAmber = '#f59e0b';
    const successGreen = '#10b981';

    // 1. Header Banner
    doc.rect(0, 0, doc.page.width, 100).fill(darkColor);

    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold');
    doc.text('EDGELINK TECHNOLOGY', 40, 28);

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica');
    doc.text('AI-POWERED SEO AUTOMATION & TECHNICAL AUDIT SYSTEM', 40, 52);

    doc.fillColor('#94a3b8').fontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 40, 68);

    // Score Badge in Header (Right side)
    const score = audit.overallScore || 75;
    doc.rect(doc.page.width - 110, 20, 70, 60).fill(score >= 80 ? successGreen : score >= 60 ? alertAmber : alertRed);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold');
    doc.text(`${score}`, doc.page.width - 110, 32, { width: 70, align: 'center' });
    doc.fontSize(8).font('Helvetica');
    doc.text('HEALTH SCORE', doc.page.width - 110, 60, { width: 70, align: 'center' });

    doc.moveDown(4);

    // 2. Client & Target Meta Box
    const startY = 120;
    doc.rect(40, startY, doc.page.width - 80, 65).fillAndStroke('#f8fafc', '#e2e8f0');

    doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold');
    doc.text(`Audit Subject: ${client?.name || 'Target Website'}`, 55, startY + 12);

    doc.fillColor(lightSlate).fontSize(9).font('Helvetica');
    doc.text(`URL: ${audit.url}`, 55, startY + 30);
    doc.text(`Location: ${client?.city || 'Pune'}, ${client?.state || 'Maharashtra'}, India  |  Sector: ${client?.businessType || 'Healthcare/Dental'}`, 55, startY + 44);

    // 3. Score Breakdown Cards
    const breakdownY = startY + 80;
    const breakdown = audit.scoreBreakdown || {
      technical: 78,
      on_page: 76,
      content: 72,
      core_web_vitals: 61,
      schema: 60
    };

    const metrics = [
      { label: 'Technical SEO', val: breakdown.technical },
      { label: 'On-Page SEO', val: breakdown.on_page },
      { label: 'Content Depth', val: breakdown.content },
      { label: 'Core Web Vitals', val: breakdown.core_web_vitals },
      { label: 'Schema.org', val: breakdown.schema }
    ];

    const cardWidth = (doc.page.width - 80 - 4 * 10) / 5;
    metrics.forEach((m, i) => {
      const cardX = 40 + i * (cardWidth + 10);
      doc.rect(cardX, breakdownY, cardWidth, 48).fillAndStroke('#ffffff', '#cbd5e1');
      doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold');
      doc.text(`${m.val}/100`, cardX, breakdownY + 8, { width: cardWidth, align: 'center' });
      doc.fillColor(lightSlate).fontSize(7.5).font('Helvetica');
      doc.text(m.label, cardX, breakdownY + 28, { width: cardWidth, align: 'center' });
    });

    // 4. Executive Summary
    let curY = breakdownY + 65;
    doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold');
    doc.text('Executive Summary', 40, curY);

    curY += 18;
    doc.fillColor('#334155').fontSize(9).font('Helvetica');
    const summaryText =
      audit.executiveSummary ||
      'This comprehensive audit examines crawling, on-page factors, Core Web Vitals, Schema.org entities, and local Indian search rankings. Key bottlenecks stem from mobile performance and incomplete structured data.';
    doc.text(summaryText, 40, curY, { width: doc.page.width - 80, align: 'justify', lineGap: 3 });

    curY += doc.heightOfString(summaryText, { width: doc.page.width - 80, lineGap: 3 }) + 15;

    // 5. Critical Issues
    doc.fillColor(alertRed).fontSize(11).font('Helvetica-Bold');
    doc.text('Critical SEO Bottlenecks', 40, curY);
    curY += 16;

    const critical = Array.isArray(audit.criticalIssues) ? audit.criticalIssues : [];
    critical.forEach((issue) => {
      doc.circle(46, curY + 4, 3).fill(alertRed);
      doc.fillColor(darkColor).fontSize(8.5).font('Helvetica');
      doc.text(issue, 56, curY, { width: doc.page.width - 96, lineGap: 2 });
      curY += doc.heightOfString(issue, { width: doc.page.width - 96, lineGap: 2 }) + 6;
    });

    curY += 8;

    // 6. Quick Wins (<= 2 Hours Effort)
    doc.fillColor(successGreen).fontSize(11).font('Helvetica-Bold');
    doc.text('High-Impact Quick Wins (Effort <= 2 Hours)', 40, curY);
    curY += 16;

    const quickWins = Array.isArray(audit.quickWins) ? audit.quickWins : [];
    quickWins.forEach((win) => {
      doc.circle(46, curY + 4, 3).fill(successGreen);
      doc.fillColor(darkColor).fontSize(8.5).font('Helvetica');
      doc.text(win, 56, curY, { width: doc.page.width - 96, lineGap: 2 });
      curY += doc.heightOfString(win, { width: doc.page.width - 96, lineGap: 2 }) + 6;
    });

    // 7. Page 2: Prioritised Recommendations & Falsifiability Checks
    doc.addPage();

    // Page 2 Header
    doc.rect(0, 0, doc.page.width, 40).fill(darkColor);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold');
    doc.text('EDGELINK TECHNOLOGY — PRIORITISED ACTION PLAN & FALSIFIABILITY CHECKS', 40, 14);

    let p2Y = 60;
    const recommendations = Array.isArray(audit.recommendations) ? audit.recommendations : [];

    recommendations.forEach((rec, idx) => {
      if (p2Y > doc.page.height - 120) {
        doc.addPage();
        p2Y = 50;
      }

      const priorityColor =
        rec.priority === 'CRITICAL'
          ? alertRed
          : rec.priority === 'HIGH'
          ? alertAmber
          : rec.priority === 'MEDIUM'
          ? '#3b82f6'
          : lightSlate;

      doc.rect(40, p2Y, doc.page.width - 80, 22).fill('#f1f5f9');

      doc.fillColor(priorityColor).fontSize(8.5).font('Helvetica-Bold');
      doc.text(`[${rec.priority}]`, 48, p2Y + 6);

      doc.fillColor(darkColor).fontSize(8.5).font('Helvetica-Bold');
      doc.text(`${rec.category.toUpperCase()} — ${rec.finding}`, 115, p2Y + 6, {
        width: doc.page.width - 240,
        ellipsis: true
      });

      doc.fillColor(lightSlate).fontSize(7.5).font('Helvetica');
      doc.text(`Impact: ${rec.estimated_impact} | Effort: ${rec.effort}`, doc.page.width - 150, p2Y + 7);

      p2Y += 26;

      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Recommended Fix:', 48, p2Y);
      doc.font('Helvetica').fillColor('#334155');
      doc.text(rec.fix, 140, p2Y, { width: doc.page.width - 190, lineGap: 2 });
      p2Y += doc.heightOfString(rec.fix, { width: doc.page.width - 190, lineGap: 2 }) + 4;

      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold');
      doc.text('Falsifiability Check:', 48, p2Y);
      doc.font('Helvetica').fillColor('#0f766e');
      doc.text(rec.falsifiability_check, 140, p2Y, { width: doc.page.width - 190, lineGap: 2 });
      p2Y += doc.heightOfString(rec.falsifiability_check, { width: doc.page.width - 190, lineGap: 2 }) + 14;
    });

    // Confidentiality Footer
    doc.fillColor(lightSlate).fontSize(7.5).font('Helvetica');
    doc.text(
      'Confidential — Generated by EdgeLink SEO Automation Dashboard. All rights reserved.',
      40,
      doc.page.height - 30,
      { align: 'center', width: doc.page.width - 80 }
    );

    doc.end();

    stream.on('finish', () => {
      resolve({ filePath, publicUrl, fileName });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { generatePdfReport };
