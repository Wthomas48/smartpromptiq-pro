import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Share2,
  Download,
  Link2,
  Trophy,
  Sparkles,
  CheckCircle,
  Twitter,
  Facebook,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  courseId: string;
  certificateId?: string;
  completedLessons: number;
  totalLessons: number;
  score?: number;
}

export default function CertificateShareModal({
  isOpen,
  onClose,
  courseName,
  courseId,
  certificateId = 'CERT-' + Date.now(),
  completedLessons,
  totalLessons,
  score
}: CertificateShareModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSharing, setIsSharing] = useState(false);

  // Certificate URL for sharing
  const certificateUrl = `https://smartpromptiq.com/certificates/${certificateId}`;

  // Share messages
  const linkedInMessage = `I just earned my "${courseName}" certificate from SmartPromptIQ Academy! 🎓\n\nCompleted ${completedLessons} lessons and mastered prompt engineering.\n\n#AI #PromptEngineering #SmartPromptIQ`;

  const twitterMessage = `Just earned my "${courseName}" certificate from @SmartPromptIQ! 🎓 Master AI prompting with 57 expert courses. ${certificateUrl}`;

  const handleLinkedInShare = () => {
    setIsSharing(true);

    // LinkedIn share URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;

    // Open in new window
    window.open(linkedInUrl, '_blank', 'width=600,height=600');

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'certificate_share', {
        platform: 'linkedin',
        course: courseName,
        certificate_id: certificateId
      });
    }

    toast({
      title: 'Sharing on LinkedIn! 🎉',
      description: 'Add your thoughts and tag @SmartPromptIQ',
      duration: 4000,
    });

    setTimeout(() => setIsSharing(false), 1000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');

    toast({
      title: 'Sharing on Twitter/X! 🐦',
      description: 'Let the world know about your achievement!',
      duration: 3000,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      toast({
        title: 'Link Copied! 🔗',
        description: 'Certificate URL copied to clipboard',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast({
      title: 'Generating PDF... 📄',
      description: 'Your certificate will download shortly',
      duration: 3000,
    });

    // Placeholder - implement actual PDF generation
    console.log('Download PDF for:', certificateId);
  };

  const handleUpgrade = () => {
    onClose();
    setLocation('/pricing?recommended=pro&source=certificate');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            Congratulations! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  You've completed:
                </h3>
                <p className="text-2xl font-extrabold text-purple-600 mb-3">
                  "{courseName}"
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {completedLessons}/{totalLessons} Lessons
                  </Badge>
                  {score && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      <Trophy className="w-3 h-3 mr-1" />
                      Score: {score}%
                    </Badge>
                  )}
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    Certificate ID: {certificateId.substring(0, 12)}...
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Share Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              Share Your Achievement
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* LinkedIn Share - Primary CTA */}
              <Button
                onClick={handleLinkedInShare}
                disabled={isSharing}
                className="bg-[#0A66C2] hover:bg-[#004182] text-white h-auto py-4 flex flex-col items-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-semibold">Share on LinkedIn</span>
                <span className="text-xs opacity-90">Most impactful!</span>
              </Button>

              {/* Twitter Share */}
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-2"
              >
                <Twitter className="w-6 h-6 text-sky-500" />
                <span className="font-semibold">Share on X/Twitter</span>
                <span className="text-xs text-gray-500">Tell your followers</span>
              </Button>

              {/* Copy Link */}
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-2"
              >
                <Link2 className="w-6 h-6 text-purple-600" />
                <span className="font-semibold">Copy Link</span>
                <span className="text-xs text-gray-500">Share anywhere</span>
              </Button>

              {/* Download PDF */}
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-2"
              >
                <Download className="w-6 h-6 text-green-600" />
                <span className="font-semibold">Download PDF</span>
                <span className="text-xs text-gray-500">Print or save</span>
              </Button>
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-600 mb-2 text-center">
              📜 Your certificate is publicly verifiable at:
            </p>
            <code className="block bg-white px-4 py-2 rounded text-sm text-gray-800 text-center font-mono border">
              {certificateUrl}
            </code>
          </div>

          {/* Upsell for Free Users */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-5">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">
                  🎓 Want more certificates?
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Unlock all 57 courses and earn professional certificates for each one.
                  Perfect for building your portfolio and LinkedIn profile!
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpgrade}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Upgrade to Academy ($29/mo)
                  </Button>
                  <Button
                    onClick={onClose}
                    size="sm"
                    variant="outline"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setLocation('/academy/courses')}
              variant="outline"
              className="flex-1"
            >
              Browse More Courses
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Continue Learning
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Usage example in AcademyLessonViewer.tsx:
// const [showCertificateModal, setShowCertificateModal] = useState(false);
//
// // When course is completed:
// if (result.data.courseCompleted) {
//   setShowCertificateModal(true);
// }
//
// <CertificateShareModal
//   isOpen={showCertificateModal}
//   onClose={() => setShowCertificateModal(false)}
//   courseName={course.title}
//   courseId={courseId}
//   completedLessons={course.completedLessons}
//   totalLessons={course.totalLessons}
//   score={85}
// />
