import axios from 'axios';

// Get base URL from environment variable
let rawURL = process.env.REACT_APP_BASE_URL ?? '';
rawURL = rawURL.replace(/['"]+/g, '').trim();

// If running on a live hosted domain (not localhost), override localhost URLs with relative path ('')
// so API requests are routed to the hosted backend server origin seamlessly.
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (rawURL.includes('localhost') || rawURL.includes('127.0.0.1')) {
        rawURL = '';
    }
}

const BASEURL = rawURL;

const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { BASEURL };
export default axiosInstance;
