'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submissionService } from '../../../../services/submissionService';

const editSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

const categories = [
  'Design',
  'Video Editing',
  'Music',
  'Content Creation',
  'Photography',
  'Writing',
  'UI/UX Design',
  'Web Design',
  'Illustration',
  'Digital Art',
  'Fashion Design',
  'Creative Direction',
  'Advertising',
  'Art & Craft',
  'Business & Creative Strategist'
];

export default function EditSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [replaceVideo, setReplaceVideo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionService.getSubmissionForEdit(submissionId);
      const submission = response.submission;

      // Populate form
      setValue('title', submission.title);
      setValue('description', submission.description);
      setValue('category', submission.category);
      setValue('tags', submission.tags?.join(', ') || '');
      setCurrentFile(submission.fileUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submission');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('video/')) {
        alert('Please upload a video file');
        return;
      }
      
      setNewFile(file);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      setSaving(true);
      setError('');

      // Update submission details
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      await submissionService.updateSubmission(submissionId, {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: tagsArray,
      });

      // If new file selected, replace it
      if (newFile && replaceVideo) {
        await submissionService.replaceSubmissionFile(submissionId, newFile);
      }

      alert('Submission updated successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error && !currentFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
          <Link href="/dashboard" className="mt-4 inline-block text-violet-600 hover:text-violet-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              href="/dashboard"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Submission
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                placeholder="Enter submission title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                placeholder="Describe your submission..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                {...register('tags')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                placeholder="e.g., creative, showcase, audition"
              />
            </div>

            {/* Current Video */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Video</h3>
              {currentFile && (
                <div className="mb-4">
                  <video
                    src={currentFile}
                    controls
                    className="w-full max-h-64 rounded-lg"
                  />
                </div>
              )}

              {/* Replace Video Option */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="replaceVideo"
                  checked={replaceVideo}
                  onChange={(e) => setReplaceVideo(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <label htmlFor="replaceVideo" className="text-sm font-medium text-gray-700">
                  Replace video file
                </label>
              </div>

              {replaceVideo && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-violet-500 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="videoFile"
                  />
                  <label htmlFor="videoFile" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {newFile ? newFile.name : 'Click to upload new video'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Max 10 minutes, Max 50MB
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
