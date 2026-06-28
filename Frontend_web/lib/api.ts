import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learning-app-4xa9.onrender.com/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 10 second timeout — prevents hanging requests
});

// ─── Token Management ────────────────────────────────────────────────────────
let _token: string | null = null;

export const setAuthToken = (token: string | null) => { _token = token; };

// ─── Request Interceptor: attach token ──────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
    if (_token) {
        config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
});

// ─── Response Interceptor: handle errors globally ───────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error: any) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error.message;

        if (status === 401) {
            // Token expired or invalid
            setAuthToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
            }
        } else if (status === 403) {
            return Promise.reject(new Error('You do not have permission to access this resource.'));
        } else if (status === 404) {
            return Promise.reject(new Error('The requested resource was not found.'));
        } else if (status === 429) {
            return Promise.reject(new Error('Too many requests. Please slow down and try again.'));
        } else if (status >= 500) {
            // Log server errors for tracking but show a user-friendly message
            console.error('Critical Server Error:', error.response?.data);
            return Promise.reject(new Error('Server error. Our engineers have been notified. Please try again in a moment.'));
        }

        return Promise.reject(new Error(message || 'An unexpected error occurred.'));
    }
);

export default apiClient;

// ─── Data Services ───────────────────────────────────────────────────────────
export const dataService = {
    getDashboard: () => apiClient.get('/dashboard').then(r => r.data),
    getAnnouncements: () => apiClient.get('/announcements').then(r => r.data),
    getVideoPlaylists: () => apiClient.get('/courses').then(r => r.data),
    getVideoPlaylistById: (id: string) => apiClient.get(`/courses/${id}`).then(r => r.data),
    getQuizPlaylists: () => apiClient.get('/quiz-playlists').then(r => r.data),
    getQuizPlaylistById: (id: string) => apiClient.get(`/quiz-playlists/${id}`).then(r => r.data),
    getTests: () => apiClient.get('/tests').then(r => r.data),
    getTestById: (id: string) => apiClient.get(`/tests/${id}`).then(r => r.data),
    submitTest: (testId: string, answers: { questionId: string, selectedOption: number | null }[], timeSpent?: number) => apiClient.post('/tests/submit', { testId, answers, timeSpent }).then(r => r.data),
    getLeaderboard: () => apiClient.get('/users/leaderboard').then(r => r.data),
    getProfile: () => apiClient.get('/users/profile').then(r => r.data),
    updateProfile: (data: any) => apiClient.put('/users/profile', data).then(r => r.data),
    getMyTests: () => apiClient.get('/users/my-attempts').then(r => r.data),
    getAttemptById: (id: string) => apiClient.get(`/users/my-attempts/${id}`).then(r => r.data),
    getMyCourses: () => apiClient.get('/users/my-courses').then(r => r.data),
    // Compatibility aliases
    getCourses: () => apiClient.get('/courses').then(r => r.data),
    getCourseDetail: (id: string) => apiClient.get(`/courses/${id}`).then(r => r.data),
    getPlaylists: () => apiClient.get('/quiz-playlists').then(r => r.data),
    getPlaylistById: (id: string) => apiClient.get(`/quiz-playlists/${id}`).then(r => r.data),
};

export const paymentService = {
    createOrder: (itemId: string, itemType: string) => apiClient.post('/payments/create-order', { itemId, itemType }).then(r => r.data),
    verifyPayment: (data: any) => apiClient.post('/payments/verify-payment', data).then(r => r.data),
    getMyOrders: () => apiClient.get('/payments/my-orders').then(r => r.data),
};

