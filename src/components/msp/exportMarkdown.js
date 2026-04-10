import { meganQuestions } from '../../data/megan-questions';

/**
 * Generate a markdown file from Megan's responses and trigger download.
 * @param {Object} responses — { [questionId]: { value: string, answered: boolean } }
 */
export default function exportMarkdown(responses) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const answeredCount = Object.values(responses).filter((r) => r?.answered).length;
  const totalCount = meganQuestions.reduce((s, c) => s + c.questions.length, 0);

  let md = `# MSP Follow-Up Responses — Sui Generis → HTT Brands
**From:** Megan Myrand (IT Systems Engineer, Sui Generis Inc)
**To:** Tyler Granlund (IT Director, HTT Brands)
**Date:** ${dateStr} at ${timeStr}
**Progress:** ${answeredCount} of ${totalCount} questions answered

---

*These responses follow up on our April 10, 2026 call. Questions are from the CTU (Cross-Tenant Utility) identity governance project.*

`;

  for (const category of meganQuestions) {
    const catAnswered = category.questions.filter((q) => responses[q.id]?.answered).length;
    md += `## ${category.icon} ${category.category} (${catAnswered}/${category.questions.length})\n\n`;

    for (const q of category.questions) {
      const r = responses[q.id];
      const status = r?.answered ? '✅' : '⬜';
      const priorityTag = q.priority === 'critical' ? '🔴' : q.priority === 'high' ? '🟠' : '🟡';
      const answer = r?.value?.trim() || '_No response yet_';

      md += `### ${status} ${priorityTag} ${q.question}\n\n`;
      md += `> **Context:** ${q.context}\n\n`;
      md += `**Answer:** ${answer}\n\n`;
      md += `---\n\n`;
    }
  }

  md += `## 📋 Notes\n\n`;
  md += `_Add any additional context or questions here:_\n\n`;
  md += `\n\n`;
  md += `---\n\n`;
  md += `*Generated from CTU Dashboard · ${dateStr}*\n`;

  // Trigger download
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `msp-responses-megan-${dateStr}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
