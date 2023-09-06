import axios from 'axios';

const BASEURL = import.meta.env.VITE_API_URL;
axios.interceptors.request.use(
    function (config) {
        config.baseURL = BASEURL+'/';
        const login = window.sessionStorage.getItem('login');
        if (login && login === 'true') {
            config.headers['Authorization'] = 'Bearer ' + window.sessionStorage.getItem('token');
        }
        config.headers['Accept'] = 'application/json';
        config.headers['Content-Type'] = 'application/json';
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)

export default axios;