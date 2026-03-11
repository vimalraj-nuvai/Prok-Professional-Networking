import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from './api';
import { useDebounce } from '../hooks/useDebounce';

const API_URL = 'http://127.0.0.1:5000';

interface PostItem {
  id: number;
  content: string;
  media_url: string;
  media_type: string;
  created_at: string;
  author: { id: number; username: string } | null;
  category: string;
  tags: string[];
  likes_count: number;
  views_count: number;
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const observer = useRef<IntersectionObserver>();
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    try {
      const currentPage = reset ? 1 : page;
      const data = await postsApi.listPosts({
        page: currentPage,
        search: debouncedSearchTerm,
        sort: sortBy,
        category,
        tags: tags.join(','),
      });
      setPosts((prevPosts) => (reset ? data.posts : [...prevPosts, ...data.posts]));
      setHasMore(data.posts.length > 0);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, sortBy, category, tags]);

  useEffect(() => {
    fetchPosts(true);
  }, [debouncedSearchTerm, sortBy, category, tags]);


  useEffect(() => {
    if (page > 1) {
      fetchPosts();
    }
  }, [page]);


  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetch(`${API_URL}/api/posts/categories`).then(res => res.json()),
          fetch(`${API_URL}/api/posts/popular-tags`).then(res => res.json()),
        ]);
        setAvailableCategories(categoriesData);
        setPopularTags(tagsData);
      } catch (error) {
        console.error("Failed to fetch filters", error);
      }
    };
    fetchFilters();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 pb-16">
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

      {/* Filters */}
      <div className="mb-4 space-y-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <div className="flex justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="created_at">Newest</option>
            <option value="likes_count">Most Liked</option>
            <option value="views_count">Most Viewed</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              className={`px-3 py-1 rounded-full text-sm ${tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm text-center">
          {error}
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-600 font-medium">No posts found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} /></div>;
            } else {
              return <PostCard key={post.id} post={post} />;
            }
          })}
        </div>
      )}
      {loading && (
        <div className="text-center py-4">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default PostList;
