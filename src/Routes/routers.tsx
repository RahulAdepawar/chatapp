
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/login/Login";
import Registration from "@/pages/registration/Registration";
import ProtectedRoute from "./ProtectedRoute";

export default function Routers() {
	return (
		<>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/registration" element={<Registration />} />
				<Route path="/" element={ <ProtectedRoute><Home /></ProtectedRoute>} />
			</Routes>
		</>
	);
};