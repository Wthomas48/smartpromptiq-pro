import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFExportProps {
  content: {
    title: string;
    content: string;
    category?: string;
    metadata?: {
      generatedAt?: string;
      templateType?: string;
      userEmail?: string;
    };
  };
  fileName?: string;
  variant?: 'button' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

export const PDFExport: React.FC<PDFExportProps> = ({
  content,
  fileName,
  variant = 'button',
  size = 'md'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333333';
      tempDiv.style.backgroundColor = '#ffffff';

      // Professional PDF template
      tempDiv.innerHTML = `
        <div style="max-width: 170mm; margin: 0 auto;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="margin: 0; color: #8b5cf6; font-size: 24px; font-weight: bold;">
                  SmartPromptIQ
                </h1>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                  AI-Powered Content Generation Platform
                </p>
              </div>
              <div style="text-align: right;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  ${content.category ? content.category.toUpperCase() : 'STRATEGY'}
                </div>
              </div>
            </div>
          </div>

          <!-- Title Section -->
          <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px; font-weight: bold;">
              ${content.title}
            </h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
              <span style="background: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 12px; font-size: 11px;">
                Generated: ${content.metadata?.generatedAt ? new Date(content.metadata.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
              ${content.metadata?.templateType ? `
                <span style="background: #ede9fe; color: #8b5cf6; padding: 4px 12px; border-radius: 12px; font-size: 11px;">
                  Template: ${content.metadata.templateType}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Content Section -->
          <div style="margin-bottom: 40px;">
            <div style="background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #8b5cf6; font-size: 16px; font-weight: bold;">
                Generated Content
              </h3>
              <div style="white-space: pre-wrap; line-height: 1.8;">
                ${content.content}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                  Generated with SmartPromptIQ • <strong>smartpromptiq.com</strong>
                </p>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 10px;">
                  Transform Ideas into AI-Powered Blueprints
                </p>
              </div>
              <div style="text-align: right;">
                <div style="background: linear-gradient(135deg, #f59e0b, #8b5cf6); color: white; padding: 6px 12px; border-radius: 16px; font-size: 10px; font-weight: bold;">
                  ✨ AI-POWERED
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = content.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const pdfFileName = fileName || `smartpromptiq-${sanitizedTitle}-${timestamp}.pdf`;

      // Save PDF
      pdf.save(pdfFileName);

      // Trigger Zapier webhook
      await triggerZapierWebhook('pdf_generated', {
        title: content.title,
        category: content.category,
        fileName: pdfFileName,
        userEmail: content.metadata?.userEmail,
        generatedAt: new Date().toISOString()
      });

      toast({
        title: "PDF Generated Successfully! 🎉",
        description: `Your professional document "${content.title}" has been downloaded.`,
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Zapier webhook trigger
  const triggerZapierWebhook = async (eventType: string, data: any) => {
    try {
      await fetch('/api/webhooks/zapier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventType,
          data,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.log('Zapier webhook failed (non-critical):', error);
    }
  };

  if (variant === 'card') {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>Export as PDF</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Professional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-700">
            Generate a professional PDF document with SmartPromptIQ branding, perfect for sharing with clients and stakeholders.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Professional Layout</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Company Branding</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Print Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Shareable Format</span>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const buttonSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white ${buttonSizes[size]}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="animate-spin mr-2 w-4 h-4" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};