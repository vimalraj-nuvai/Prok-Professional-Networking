import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { postsApi } from './api';

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Media drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setMedia(file);

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    if (content.length > 5000) {
      setError('Post must be under 5000 characters');
      return;
    }

    setSubmitting(true);
    try {
      await postsApi.createPost(content.trim(), media || undefined);
      setSuccess(true);
      setTimeout(() => navigate('/posts'), 1200);
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr?.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share an update, idea, or article..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${content.length > 5000 ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/5000
            </p>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Media</h2>

          {mediaPreview ? (
            <div className="relative">
              {mediaType === 'image' ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-80 rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow"
              >
                X
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {media?.name} ({(media?.size ? media.size / 1024 / 1024 : 0).toFixed(1)}MB)
              </p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-3xl mb-2">📷</p>
              {isDragActive ? (
                <p className="text-blue-600 font-medium text-sm">Drop your file here...</p>
              ) : (
                <>
                  <p className="text-gray-600 text-sm font-medium">
                    Drag & drop an image or video, or click to select
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG, GIF, MP4, MOV, WEBM up to 10MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Post Preview */}
        {content.trim() && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Preview</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  U
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">You</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{content}</p>
              {mediaPreview && mediaType === 'image' && (
                <img src={mediaPreview} alt="Media" className="mt-3 rounded-lg max-h-60 object-cover" />
              )}
              {mediaPreview && mediaType === 'video' && (
                <video src={mediaPreview} controls className="mt-3 rounded-lg max-h-60 w-full" />
              )}
            </div>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm text-center">
            Post created! Redirecting...
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            'Publish Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default PostCreate;
