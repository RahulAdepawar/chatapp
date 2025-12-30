import axios from "axios";

const AxiosApi = axios.create({
	baseURL: `${import.meta.env.VITE_SERVER_ORIGIN}`,	
	withCredentials: true // 🍪 allow cookies
});

export default AxiosApi;
