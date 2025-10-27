import jsPDF from 'jspdf';

interface PDFData {
  businessName: string;
  businessType: string;
  entityType: string;
  location: string;
  industry: string;
  ideaTuningOutput?: string;
  directors: any[];
  capitalInvestment?: string;
  expectedTurnover?: string;
}

export const generateRegistrationPDF = (data: PDFData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color matching the theme
  doc.text('Company Registration Guide', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 30;

  // Business Description Section
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Business Description:', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Business Name: ${data.businessName}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Business Type: ${data.businessType}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Industry: ${data.industry}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Location: ${data.location}`, margin, yPosition);
  yPosition += 15;

  if (data.ideaTuningOutput) {
    doc.text('Business Concept:', margin, yPosition);
    yPosition += 8;
    const conceptLines = doc.splitTextToSize(data.ideaTuningOutput.substring(0, 300) + '...', pageWidth - 2 * margin);
    doc.text(conceptLines, margin, yPosition);
    yPosition += conceptLines.length * 5 + 10;
  }

  // Company Name Registration Section
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Company Name Registration:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Recommended Company Name: ' + data.businessName + ' Private Limited', margin, yPosition);
  yPosition += 10;
  
  doc.text('Name Availability Check Links:', margin, yPosition);
  yPosition += 8;
  doc.setTextColor(59, 130, 246);
  doc.text('• MCA Portal: https://www.mca.gov.in/mcafoportal/companyLLPNameAvailability.do', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• Trademark Search: https://ipindiaservices.gov.in/publicsearch', margin + 5, yPosition);
  yPosition += 15;

  // Entity Recommendation Section
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Entity Recommendation:', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Recommended Entity Type: ${data.entityType}`, margin, yPosition);
  yPosition += 15;

  // Company Registration Links
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Company Registration Links:', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(59, 130, 246);
  doc.text('• MCA Portal: https://www.mca.gov.in/mcafoportal/', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• SPICe+ Form: https://www.mca.gov.in/mcafoportal/login.do', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• Digital Signature: https://www.mca.gov.in/MinistryV2/digitalsignature.html', margin + 5, yPosition);
  yPosition += 15;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }

  // Required Documents Checklist
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Required Documents Checklist:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const documents = [
    'PAN Card of all Directors/Partners',
    'Aadhaar Card of all Directors/Partners',
    'Passport size photographs',
    'Address proof of registered office',
    'Rent agreement/NOC from property owner',
    'Utility bills (electricity/water) of registered office',
    'Bank statement of proposed company bank account',
    'Digital Signature Certificate (DSC) of Directors',
    'Director Identification Number (DIN) for Directors'
  ];

  documents.forEach(doc_item => {
    doc.text(`• ${doc_item}`, margin + 5, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Step by Step Registration Process
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Step-by-Step Registration Process:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const steps = [
    'Step 1: Obtain Digital Signature Certificate (DSC) - 1-2 days',
    'Step 2: Apply for Director Identification Number (DIN) - 1 day',
    'Step 3: Reserve Company Name through RUN (Reserve Unique Name) - 1 day',
    'Step 4: File SPICe+ form with required documents - 7-10 days',
    'Step 5: Receive Certificate of Incorporation - Same day as approval',
    'Step 6: Apply for PAN and TAN - 7-15 days',
    'Step 7: Open Company Bank Account - 1-3 days',
    'Step 8: GST Registration (if applicable) - 3-7 days'
  ];

  steps.forEach(step => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(step, margin + 5, yPosition);
    yPosition += 8;
  });

  yPosition += 15;

  // Timeline and Cost Estimates
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Estimated Timeline & Costs:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Timeline: 15-30 days (depending on document readiness)', margin, yPosition);
  yPosition += 10;
  doc.text('Government Fees: ₹4,000 - ₹8,000 (varies by authorized capital)', margin, yPosition);
  yPosition += 8;
  doc.text('Professional Fees: ₹5,000 - ₹15,000 (if using CA/CS services)', margin, yPosition);
  yPosition += 8;
  doc.text('Other Costs: ₹2,000 - ₹5,000 (DSC, stamps, etc.)', margin, yPosition);
  yPosition += 15;

  // Post Registration Compliances
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Post Registration Compliances:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const compliances = [
    'File Annual Returns (Form AOC-4 & MGT-7) - Annually',
    'Conduct Board Meetings - Quarterly',
    'Maintain Statutory Registers and Books',
    'File Income Tax Returns - Annually',
    'GST Returns Filing - Monthly/Quarterly',
    'TDS Returns (if applicable) - Quarterly',
    'Provident Fund Registration (if employees > 20)',
    'ESI Registration (if employees > 10)'
  ];

  compliances.forEach(compliance => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(`• ${compliance}`, margin + 5, yPosition);
    yPosition += 8;
  });

  yPosition += 15;

  // Brand Protection
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Brand Protection Recommendations:', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('• Register Trademark: https://ipindiaonline.gov.in/tmrpublicsearch/', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• Domain Registration: Book relevant domain names', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• Copyright Registration: For creative works/content', margin + 5, yPosition);
  yPosition += 8;
  doc.text('• Design Registration: For unique product designs', margin + 5, yPosition);
  yPosition += 15;

  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  const disclaimer = 'Disclaimer: This information is extracted through AI from various government websites and sources. Please verify all details with official government portals and consult with qualified professionals for specific legal advice.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, yPosition);

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};