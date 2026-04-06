import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp' as const,
    };
    return imageCompression(file, options);
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;

    if (fileArray.length > remaining) {
      toast({
        title: 'Too many images',
        description: `You can only add ${remaining} more image${remaining !== 1 ? 's' : ''} (max ${maxImages})`,
        variant: 'destructive',
      });
      return;
    }

    // Validate
    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: 'Invalid format', description: `${file.name} is not a supported format (JPG, PNG, WebP only)`, variant: 'destructive' });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'File too large', description: `${file.name} exceeds 5MB limit`, variant: 'destructive' });
        return;
      }
    }

    setIsCompressing(true);
    setUploadProgress(0);

    try {
      const totalSteps = fileArray.length * 2; // compress + upload
      let completedSteps = 0;

      const newUrls: string[] = [];

      for (const file of fileArray) {
        // Compress
        const compressed = await compressImage(file);
        completedSteps++;
        setUploadProgress(Math.round((completedSteps / totalSteps) * 100));

        // Upload
        const filePath = `${user?.id || 'anon'}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, compressed, { contentType: 'image/webp' });

        if (uploadError) {
          toast({ title: 'Upload failed', description: `Could not upload ${file.name}`, variant: 'destructive' });
          completedSteps++;
          setUploadProgress(Math.round((completedSteps / totalSteps) * 100));
          continue;
        }

        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
        newUrls.push(urlData.publicUrl);
        completedSteps++;
        setUploadProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls]);
        toast({ title: 'Images uploaded', description: `${newUrls.length} image(s) optimized & uploaded` });
      }
    } catch (err) {
      console.error('Image processing error:', err);
      toast({ title: 'Processing failed', description: 'Could not process images. Please try again.', variant: 'destructive' });
    } finally {
      setIsCompressing(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = '';
    }
  }, [images, maxImages, user, onImagesChange, toast]);

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Property Images</h3>

      {/* Upload area */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium mb-1">Upload Property Images</p>
        <p className="text-xs text-muted-foreground mb-3">
          Max {maxImages} images · JPG, PNG, WebP · Under 5MB each
        </p>

        {isCompressing ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Optimizing images for faster upload...
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              id="img-uploader-input"
              onChange={handleFileSelect}
              disabled={images.length >= maxImages}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={images.length >= maxImages}
              onClick={() => document.getElementById('img-uploader-input')?.click()}
            >
              {images.length >= maxImages ? 'Max images reached' : 'Choose Files'}
            </Button>
          </>
        )}
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={img}
                alt={`Property ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images · Images are auto-compressed to WebP for faster loading
      </p>
    </div>
  );
};

export default ImageUploader;
