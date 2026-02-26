import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { mockUser } from './mockData';

// ── Types ──────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
  skills: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
}

interface FormErrors {
  [key: string]: string;
}

// ── Image Upload Zone ──────────────────────────────────────────────────────────
const ImageUpload: React.FC<{
  preview: string | null;
  onDrop: (file: File) => void;
  uploading: boolean;
}> = ({ preview, onDrop, uploading }) => {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles[0]);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    multiple: false,
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Current avatar */}
      <div className="relative">
        <img
          src={preview || mockUser.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-100"
        />
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-2xl mb-1">📸</p>
        {isDragActive ? (
          <p className="text-blue-600 font-medium text-sm">Drop the image here...</p>
        ) : (
          <>
            <p className="text-gray-600 text-sm font-medium">Drag & drop a photo, or click to select</p>
            <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Field with real-time error ─────────────────────────────────────────────────
const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ label, name, value, error, required, placeholder, type = 'text', rows, onChange, onBlur }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {rows ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ── ProfileEdit ────────────────────────────────────────────────────────────────
const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    title: '',
    location: '',
    bio: '',
    skills: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load mock user data
  useEffect(() => {
    const timer = setTimeout(() => {
      const u = mockUser;
      setFormData({
        name: u.name,
        email: u.email,
        title: u.title,
        location: u.location,
        bio: u.profile.bio,
        skills: u.profile.skills.join(', '),
        website: u.socialLinks.website || '',
        linkedin: u.socialLinks.linkedin || '',
        github: u.socialLinks.github || '',
        twitter: u.socialLinks.twitter || '',
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const validate = (data: FormData): FormErrors => {
    const errs: FormErrors = {};

    // Name — required, at least 2 characters
    if (!data.name.trim()) {
      errs.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    // Email — required, valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errs.email = 'Enter a valid email address';
    }

    // Bio — optional, max 500 characters
    if (data.bio.length > 500) {
      errs.bio = `Bio must be 500 characters or less (currently ${data.bio.length})`;
    }

    // Skills — optional, max 20 skills
    const skillCount = data.skills.split(',').filter((s) => s.trim()).length;
    if (skillCount > 20) {
      errs.skills = `Too many skills (${skillCount}/20 max)`;
    }

    // URLs — optional, but must start with https:// if provided
    const isValidUrl = (url: string) => !url.trim() || url.startsWith('https://');
    if (!isValidUrl(data.website))  errs.website  = 'URL must start with https://';
    if (!isValidUrl(data.linkedin)) errs.linkedin = 'URL must start with https://';
    if (!isValidUrl(data.github))   errs.github   = 'URL must start with https://';
    if (!isValidUrl(data.twitter))  errs.twitter  = 'URL must start with https://';

    return errs;
  };

  // Real-time validation on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Only show errors for fields the user has already touched
    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] || '' }));
    }
  };

  // Mark field as touched on blur → triggers validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(formData);
    setErrors((prev) => ({ ...prev, [name]: errs[name] || '' }));
  };

  // Image drop handler
  const handleImageDrop = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate upload delay
      setTimeout(() => {
        setImagePreview(reader.result as string);
        setUploading(false);
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    const errs = validate(formData);
    setErrors(errs);

    if (Object.values(errs).some(Boolean)) return;

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call (Day 4 replaces this with real fetch)
      await new Promise((res) => setTimeout(res, 1000));
      setSubmitStatus('success');
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* ── Profile Photo ── */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo</h2>
          <ImageUpload
            preview={imagePreview}
            onDrop={handleImageDrop}
            uploading={uploading}
          />
        </div>

        {/* ── Basic Info ── */}
        <div className="bg-white rounded-lg shadow p-6 mb-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Full Name" name="name" value={formData.name}
              error={errors.name} required placeholder="Your full name"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormField
              label="Email" name="email" value={formData.email} type="email"
              error={errors.email} required placeholder="your@email.com"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Professional Title" name="title" value={formData.title}
              error={errors.title} placeholder="e.g. Senior Developer"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormField
              label="Location" name="location" value={formData.location}
              error={errors.location} placeholder="City, Country"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <FormField
              label="Bio" name="bio" value={formData.bio}
              error={errors.bio} rows={4}
              placeholder="Tell people about yourself..."
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.bio.length}/500
            </p>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills</h2>
          <FormField
            label="Skills (comma-separated)" name="skills" value={formData.skills}
            error={errors.skills} placeholder="React, TypeScript, Node.js..."
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {/* Preview */}
          {formData.skills && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* ── Social Links ── */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Social Links</h2>
          <FormField
            label="Website" name="website" value={formData.website} type="url"
            error={errors.website} placeholder="https://yoursite.com"
            onChange={handleChange} onBlur={handleBlur}
          />
          <FormField
            label="LinkedIn" name="linkedin" value={formData.linkedin} type="url"
            error={errors.linkedin} placeholder="https://linkedin.com/in/..."
            onChange={handleChange} onBlur={handleBlur}
          />
          <FormField
            label="GitHub" name="github" value={formData.github} type="url"
            error={errors.github} placeholder="https://github.com/..."
            onChange={handleChange} onBlur={handleBlur}
          />
          <FormField
            label="Twitter / X" name="twitter" value={formData.twitter} type="url"
            error={errors.twitter} placeholder="https://twitter.com/..."
            onChange={handleChange} onBlur={handleBlur}
          />
        </div>

        {/* ── Submit ── */}
        {submitStatus === 'success' && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm text-center">
            ✅ Profile saved! Redirecting...
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm text-center">
            ❌ Something went wrong. Please try again.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
