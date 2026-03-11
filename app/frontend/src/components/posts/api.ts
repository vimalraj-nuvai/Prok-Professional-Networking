const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

function getToken(): string {
  return localStorage.getItem('token') || '';
}

export const postsApi = {
  createPost: async (content: string, media?: File) => {
    const formData = new FormData();
    formData.append('content', content);
    if (media) formData.append('media', media);

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  },

  listPosts: async (options: {
    page?: number;
    perPage?: number;
    search?: string;
    sort?: string;
    category?: string;
    tags?: string;
  } = {}) => {
    const { page = 1, perPage = 20, search = '', sort = '', category = '', tags = '' } = options;
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (category) params.set('category', category);
    if (tags) params.set('tags', tags);

    const response = await fetch(`${API_URL}/api/posts?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
};
