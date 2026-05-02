'use client';

import { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { profileService } from '../../services/profileService';

interface VideoUploadModalProps {
  onClose: () => void;
  userId: string;
}

export default function VideoUploadModal({ onClose, userId }: VideoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size should be less than 100MB');
        return;
      }
      if (!selectedFile.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('userId', userId);

      await profileService.uploadBusinessVideo(formData);
      toast.success('Video uploaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaVideo className="text-blue-600" /> Upload Business Video
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Upload a short video (max 100MB) introducing your business. Tell us:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
              <li>What your business does</li>
              <li>Your products or services</li>
              <li>How customers can reach you</li>
              <li>What makes your business unique</li>
            </ul>
          </div>

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition"
            >
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Click to select video file</p>
              <p className="text-sm text-gray-500 mt-2">MP4, MOV, or WebM (max 100MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black">
                <video src={preview} controls className="w-full aspect-video object-cover" />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Choose Different File
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
