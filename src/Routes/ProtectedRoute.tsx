import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import AxiosApi from "@/lib/axios";
import FullScreenLoader from '@/components/Loader';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		AxiosApi.post("/api/auth/check")
			.then(() => setAuthorized(true))
			.catch(() => setAuthorized(false))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <FullScreenLoader />

	return authorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
