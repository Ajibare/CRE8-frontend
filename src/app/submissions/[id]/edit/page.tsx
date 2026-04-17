'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { submissionService, Submission } from '../../../../services/submissionService';

export default function EditSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'file'>('details');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getSubmissionForEdit(submissionId);
      
      if (!data.canEdit) {
        setError('This submission cannot be edited. The contest may no longer be active.');
        return;
      }
      
      setSubmission(data.submission);
      setFormData({
        title: data.submission.title,
        description: data.submission.description,
        tags: data.submission.tags || []
      });
      
      // Set file preview
      if (data.submission.fileType === 'image') {
        setFilePreview(data.submission.fileUrl);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Fetch submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch submission');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File must be less than 50MB');
        return;
      }
      setNewFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
      
      setError('');
    }
  };

  const saveDetails = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await submissionService.updateSubmission(submissionId, {
        title: formData.title,
        description: formData.description,
        tags: formData.tags
      });

      setSuccess('Submission details updated successfully!');
    } catch (err: any) {
      console.error('Update submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  const replaceFile = async () => {
    if (!newFile) {
      setError('Please select a new file');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = await submissionService.replaceSubmissionFile(submissionId, newFile);
      
      setSubmission(data.submission);
      setNewFile(null);
      setSuccess('File replaced successfully! Your submission has been reset to pending status for review.');
    } catch (err: any) {
      console.error('Replace file error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to replace file');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubmission = async () => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await submissionService.deleteSubmission(submissionId);
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Delete submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete submission');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium mr-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Submission
                </h1>
              </div>
              <button
                onClick={deleteSubmission}
                disabled={saving}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-2 mb-6">
            <div className="flex space-x-2">
              {[
                { id: 'details', label: 'Edit Details', icon: 'document' },
                { id: 'file', label: 'Replace File', icon: 'upload' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Submission Info Card */}
          {submission && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Submission Info</h2>
                  <p className="text-sm text-gray-600">
                    {submission.contest?.title} • Week {submission.week}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  submission.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : submission.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {submission.status === 'approved'
                    ? 'Approved'
                    : submission.status === 'rejected'
                    ? 'Rejected'
                    : 'Pending Review'}
                </span>
              </div>
              
              {submission.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Admin Feedback:</h4>
                  <p className="text-sm text-blue-800">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Enter submission title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Describe your creative work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-violet-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-violet-600 hover:text-violet-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={saveDetails}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Replace File Tab */}
          {activeTab === 'file' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current File</h3>
                {submission?.fileType === 'image' && (
                  <img
                    src={submission.fileUrl}
                    alt="Current submission"
                    className="max-w-md max-h-64 mx-auto rounded-lg object-cover"
                  />
                )}
                {submission?.fileType === 'video' && (
                  <video
                    src={submission.fileUrl}
                    className="max-w-md max-h-64 mx-auto rounded-lg"
                    controls
                  />
                )}
                <div className="mt-4 text-sm text-gray-600">
                  <p>File type: {submission?.fileType}</p>
                  <p>Size: {(submission?.fileSize || 0) > 1024 * 1024 
                    ? `${((submission?.fileSize || 0) / (1024 * 1024)).toFixed(1)}MB`
                    : `${((submission?.fileSize || 0) / 1024).toFixed(1)}KB`}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New File</h3>
                
                <div className="mb-6">
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum file size: 50MB. Supported formats: Images, Videos, Audio, PDF, Documents
                  </p>
                </div>

                {newFile && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">New File Preview</h4>
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="New file preview"
                        className="max-w-md max-h-48 mx-auto rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className="text-sm text-gray-600">{newFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(newFile.size / (1024 * 1024)).toFixed(2)}MB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Important Note</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Replacing the file will reset your submission to "pending" status and require re-approval. 
                        Your vote count will be preserved.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={replaceFile}
                  disabled={saving || !newFile}
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Uploading...' : 'Replace File'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
