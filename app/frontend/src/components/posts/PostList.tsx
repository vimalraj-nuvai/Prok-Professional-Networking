import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from './api';

const API_URL = 'http://127.0.0.1:5000';

interface PostItem {
  id: number;
  content: string;
  media_url: string;
  media_type: string;
  created_at: string;
  author: { id: number; username: string } | null;
}

// ── Single Post Card ───────────────────────────────────────────────────────────
const PostCard: React.FC<{ post: PostItem }> = ({ post }) => {
  const initial = post.author?.username?.[0]?.toUpperCase() || '?';
  const timeAgo = formatTimeAgo(post.created_at);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Author header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
          {initial}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">
            {post.author?.username || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Media */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={`${API_URL}${post.media_url}`}
          alt="Post media"
          className="w-full max-h-96 object-cover rounded-lg"
        />
      )}
      {post.media_url && post.media_type === 'video' && (
        <video
          src={`${API_URL}${post.media_url}`}
          controls
          className="w-full max-h-96 rounded-lg"
        />
      )}
    </div>
  );
};

// ── Time formatting helper ─────────────────────────────────────────────────────
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ── PostList Component ─────────────────────────────────────────────────────────
const PostList: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsApi.listPosts();
        setPosts(data.posts);
      } catch {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <Link
          to="/posts/create"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm text-center">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-600 font-medium">No posts yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to share something!</p>
          <Link
            to="/posts/create"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;
