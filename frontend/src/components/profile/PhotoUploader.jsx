import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { useUploadPhoto, useRemovePhoto } from '../../hooks/useProfile';
import toast from 'react-hot-toast';
import { Camera, Trash2, UploadCloud, X, Loader2, Check } from 'lucide-react';

const PhotoUploader = ({ currentPhotoUrl, userName }) => {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadPhotoMutation = useUploadPhoto();
  const removePhotoMutation = useRemovePhoto();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result));
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    multiple: false
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Compress
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(croppedBlob, options);
      
      const response = await uploadPhotoMutation.mutateAsync(compressedFile);
      setPhotoUrl(response.avatar_url);
      setImageToCrop(null);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to update photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        await removePhotoMutation.mutateAsync();
        setPhotoUrl(null);
        toast.success('Profile photo removed');
      } catch (error) {
        toast.error('Failed to remove photo');
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar View Mode */}
      {!imageToCrop ? (
        <div className="relative group mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center relative">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">
                {getInitials(userName)}
              </span>
            )}
            
            {/* Hover overlay */}
            <div 
              {...getRootProps()}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <input {...getInputProps()} />
              <Camera className="w-8 h-8 text-white mb-1" />
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </div>
          
          {photoUrl && (
            <button 
              onClick={handleRemove}
              className="absolute bottom-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors transform hover:scale-110"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Cropper View Mode */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Photo</h3>
              <button 
                onClick={() => setImageToCrop(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative w-full h-64 sm:h-80 bg-gray-900 rounded-xl overflow-hidden mb-6">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setImageToCrop(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Set Photo</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper text when not cropping */}
      {!imageToCrop && (
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or WEBP (Max 1MB)</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
