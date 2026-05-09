import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, Upload, Shield, Lock, Zap, CheckCircle, Clock, FileText, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { VerificationStatus } from '@/hooks/useVerification';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: VerificationStatus;
  onSubmit: (idImage: string) => void;
  actionType: 'sell' | 'message';
}

export function VerificationModal({
  isOpen,
  onClose,
  status,
  onSubmit,
  actionType,
}: VerificationModalProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleFileSelect = () => {
    // Simulate file upload with placeholder
    const placeholderIds = [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=250&fit=crop',
    ];
    setUploadedImage(placeholderIds[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect();
  };

  const handleSubmit = () => {
    if (uploadedImage) {
      onSubmit(uploadedImage);
    }
  };

  const handleClose = () => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.98,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const actionText = actionType === 'sell' ? 'start selling' : 'message sellers';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-white/[0.08] p-0 overflow-hidden">
        <div ref={contentRef}>
          {/* Header */}
          <div className="bg-[#11362e] relative bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-[#14594a] w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Verify Your Account
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2">
              To {actionText} and keep UniMarket safe, please verify your student status.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 bg-[#0e100f]">
            {status === 'unverified' && (
              <>
                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Unlock full features</p>
                      <p className="text-xs text-muted-foreground">
                        Sell items and message other students securely
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Your info is secure</p>
                      <p className="text-xs text-muted-foreground">
                        Encrypted and never shared with third parties
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Quick verification</p>
                      <p className="text-xs text-muted-foreground">
                        Usually takes just a few minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Upload your student ID or valid ID
                  </p>
                  
                  {!uploadedImage ? (
                    <div
                      onClick={handleFileSelect}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-white/[0.14] hover:border-primary/50 hover:bg-secondary/30'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or PDF up to 5MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-white/10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={uploadedImage}
                        alt="ID Preview"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-white">ID Uploaded</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!uploadedImage}
                  className="bg-[#177865] w-full h-12 mt-6 rounded-xl cursor-pointer hover:bg-primary/90 text-[#022420] font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Submit for Verification
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting, you agree to our verification process and privacy policy.
                </p>
              </>
            )}

            {status === 'pending' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Verification in Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We&apos;re reviewing your ID. This usually takes just a few minutes. We&apos;ll notify you once it&apos;s complete.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Submitted: {new Date().toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="mt-6 rounded-xl border-white/10"
                >
                  Got it
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
