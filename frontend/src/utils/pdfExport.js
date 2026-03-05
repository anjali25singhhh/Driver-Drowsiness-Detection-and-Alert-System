import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportSessionReport = async (sessionData) => {
  const { driverName, startTime, endTime, earHistory, alertData, statistics } = sessionData;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Drowsiness Detection Report', pageWidth / 2, 20, { align: 'center' });
  
  // Horizontal line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  pdf.line(20, 25, pageWidth - 20, 25);
  
  // Driver Information
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  let yPos = 35;
  
  pdf.text(`Driver: ${driverName || 'Unknown'}`, 20, yPos);
  yPos += 8;
  pdf.text(`Session Start: ${startTime || new Date().toLocaleString()}`, 20, yPos);
  yPos += 8;
  pdf.text(`Session End: ${endTime || new Date().toLocaleString()}`, 20, yPos);
  yPos += 8;
  
  // Calculate session duration
  if (startTime && endTime) {
    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000); // minutes
    pdf.text(`Duration: ${duration} minutes`, 20, yPos);
    yPos += 8;
  }
  
  // Statistics Section
  yPos += 5;
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Session Statistics', 20, yPos);
  yPos += 8;
  
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  
  if (statistics) {
    pdf.text(`Total Alerts: ${alertData?.length || 0}`, 25, yPos);
    yPos += 6;
    
    const severeCount = alertData?.filter(a => a.level === 'Severe Fatigue').length || 0;
    const moderateCount = alertData?.filter(a => a.level === 'Moderate Fatigue').length || 0;
    const mildCount = alertData?.filter(a => a.level === 'Mild Fatigue').length || 0;
    
    pdf.text(`  - Severe Fatigue: ${severeCount}`, 25, yPos);
    yPos += 6;
    pdf.text(`  - Moderate Fatigue: ${moderateCount}`, 25, yPos);
    yPos += 6;
    pdf.text(`  - Mild Fatigue: ${mildCount}`, 25, yPos);
    yPos += 8;
    
    if (earHistory && earHistory.length > 0) {
      const avgEAR = earHistory.reduce((sum, item) => sum + item.ear, 0) / earHistory.length;
      const minEAR = Math.min(...earHistory.map(item => item.ear));
      const maxEAR = Math.max(...earHistory.map(item => item.ear));
      
      pdf.text(`Average EAR: ${avgEAR.toFixed(3)}`, 25, yPos);
      yPos += 6;
      pdf.text(`Minimum EAR: ${minEAR.toFixed(3)}`, 25, yPos);
      yPos += 6;
      pdf.text(`Maximum EAR: ${maxEAR.toFixed(3)}`, 25, yPos);
      yPos += 8;
    }
  }
  
  // Alert History Table
  if (alertData && alertData.length > 0) {
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Alert History', 20, yPos);
    yPos += 8;
    
    // Table headers
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Time', 20, yPos);
    pdf.text('Severity', 60, yPos);
    pdf.text('EAR', 110, yPos);
    pdf.text('Status', 140, yPos);
    yPos += 2;
    
    // Table line
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 5;
    
    // Table rows
    pdf.setFont(undefined, 'normal');
    alertData.slice(0, 15).forEach((alert, index) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(alert.time || '', 20, yPos);
      pdf.text(alert.level || '', 60, yPos);
      pdf.text(alert.ear?.toFixed(3) || '', 110, yPos);
      pdf.text(alert.ear < 0.2 ? 'Critical' : 'Warning', 140, yPos);
      yPos += 6;
    });
    
    if (alertData.length > 15) {
      yPos += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`... and ${alertData.length - 15} more alerts`, 20, yPos);
    }
  }
  
  // Recommendations Section
  yPos += 15;
  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }
  
  pdf.setFontSize(14);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Recommendations', 20, yPos);
  yPos += 8;
  
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  
  const severeCount = alertData?.filter(a => a.level === 'Severe Fatigue').length || 0;
  const recommendations = [];
  
  if (severeCount > 3) {
    recommendations.push('⚠️ High number of severe fatigue alerts detected. Take immediate rest.');
  }
  if (earHistory && earHistory.length > 0) {
    const avgEAR = earHistory.reduce((sum, item) => sum + item.ear, 0) / earHistory.length;
    if (avgEAR < 0.25) {
      recommendations.push('📊 Your average EAR is below normal. Consider more frequent breaks.');
    }
  }
  if (alertData && alertData.length === 0) {
    recommendations.push('✅ Excellent! No drowsiness alerts during this session.');
  }
  
  recommendations.push('💤 Ensure 7-8 hours of sleep before long drives.');
  recommendations.push('☕ Take a 15-minute break every 2 hours.');
  
  recommendations.forEach((rec, index) => {
    if (yPos > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
    }
    const lines = pdf.splitTextToSize(rec, pageWidth - 50);
    pdf.text(lines, 25, yPos);
    yPos += 6 * lines.length + 2;
  });
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated on ${new Date().toLocaleString()} | Drowsiness Detection System`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Save PDF
  const filename = `drowsiness-report-${new Date().getTime()}.pdf`;
  pdf.save(filename);
  
  return filename;
};

export const exportChartAsImage = async (chartElementId) => {
  const element = document.getElementById(chartElementId);
  if (!element) {
    console.error('Chart element not found');
    return null;
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  
  return canvas.toDataURL('image/png');
};

export const exportSessionCSV = (earHistory, alertData) => {
  let csv = 'Time,EAR,Alert Type,Fatigue Level\n';
  
  earHistory.forEach((item, index) => {
    const alert = alertData.find(a => a.time === item.time);
    csv += `${item.time},${item.ear},${alert ? 'Yes' : 'No'},${alert?.level || 'None'}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-data-${new Date().getTime()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
