'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submissionService } from '../../../services/submissionService';

const submissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
  file: z.instanceof(File, { message: 'File is required' }).optional(),
});

const categories = [
  { value: 'design', label: 'Design' },
  { value: 'video-editing', label: 'Video Editing' },
  { value: 'music', label: 'Music' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'web-design', label: 'Web Design' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'fashion-design', label: 'Fashion Design' },
  { value: 'creative-direction', label: 'Creative Direction' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'art-craft', label: 'Art & Craft' },
  { value: 'business-creative-strategist', label: 'Business & Creative Strategist' },
];

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function SubmitWorkPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const watchedFile = watch('file');

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      setSubmitting(true);
      setError('');

      const submissionData = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        file: data.file,
      };

      await submissionService.submitWork(submissionData);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'audio/mp3', 'audio/wav', 'audio/m4a',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images, videos, audio, and documents are allowed.');
        return;
      }

      setValue('file', file);
      setError('');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Work Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your submission has been received and is now under review. You'll be notified once it's approved.
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setValue('title', '');
                setValue('description', '');
                setValue('tags', '');
                setValue('file', undefined);
              }}
              className="block w-full border border-violet-300 text-violet-700 py-3 rounded-xl font-semibold hover:bg-violet-50 transition text-center"
            >
              Submit Another Work
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Submit Your Work
              </h1>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-3 text-black border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Enter your submission title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 text-black border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 text-black border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Describe your work..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="w-full px-4 py-3 text-black  border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="design, creative, modern (comma separated)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate tags with commas
                  </p>
                </div>

                {/* Creative Showcase Video Upload */}
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-6 border-2 border-violet-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🎬 Creative Showcase</h3>
                    <p className="text-gray-700">
                      Make a <span className="font-bold text-violet-700">10-minute video</span> showcasing yourself creatively! 
                      This is your chance to shine and show the world your unique talents, personality, and creativity.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-violet-700 bg-white px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="font-medium">Max 10 minutes</span>
                    </div>
                    <div className="flex items-center gap-1 text-violet-700 bg-white px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                      </svg>
                      <span className="font-medium">Max 50MB</span>
                    </div>
                    <div className="flex items-center gap-1 text-violet-700 bg-white px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <span className="font-medium">Video/Audio only</span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-violet-300 rounded-lg p-6 text-center hover:border-violet-500 transition-colors bg-white">
                    <input
                      {...register('file')}
                      type="file"
                      id="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="video/*,audio/*"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        {watchedFile ? watchedFile.name : 'Click to upload your video or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, AVI, MOV, WMV, WebM, MP3, WAV, M4A
                      </p>
                    </label>
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !watchedFile}
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-4 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 8 0 014 8 8 0 01-4 4 4 0 022-4 4zm0 0l-4 4m0 0l4 4m-4-4a4 4 0 00-4 4 4 0 004-4 4z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      Submit Work
                    </span>
                  )}
                </button>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
}
