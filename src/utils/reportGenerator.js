export function exportReportAsJSON(report) {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.type || report.audience || 'deliverable'}-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}
