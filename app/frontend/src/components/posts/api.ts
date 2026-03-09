const API_URL = 'http://127.0.0.1:5000';

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

  listPosts: async (page = 1, perPage = 20) => {
    const response = await fetch(
      `${API_URL}/api/posts?page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
};
