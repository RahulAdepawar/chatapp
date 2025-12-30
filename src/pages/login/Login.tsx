import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AxiosApi from "@/lib/axios";
import { validate_email } from "@/utils/validation";
import { useNavigate } from "react-router-dom";

export default function Login() {

	const navigate = useNavigate();

	const [form, setForm] = useState({ username: "", password: "" });
	const [loading, setLoading] = useState(false);
	let [error, setError] = useState("");
	let [success, setSuccess] = useState("");

	// Check use is already login
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const authResponse = await AxiosApi.post("/api/auth/check");
				let data  = await authResponse.data.user;

				localStorage.setItem("user_id", data.user_id);

				if (authResponse.data.authenticated) {
					navigate("/", { replace: true });
				}
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [navigate]);

	if (loading) return null;


	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setSuccess("");
		setError("");

		if (form.username != "") {
			if (!validate_email(form.username)) {
				setError("Invalid email address.");
				setLoading(false);
				return;
			}
		}
		else {
			setError("Email address cannot be blank");
			setLoading(false);
			return;
		}

		if (form.password == "") {
			setError("Password cannot be blank");
			setLoading(false);
			return;
		}

		try {
			let response = await AxiosApi.post("/api/login", form);

			if (response.status == 200) {
				localStorage.setItem("user_id", response.data.user_id);

				setError("");
				setSuccess("Successfully login");
				navigate("/", { replace: true })
			}
			else {
				setError(response.data.message);
				setSuccess("");
			}
		}
		catch (e: any) {
			setError(e.response.data.message);
		}

		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center from-indigo-500 to-purple-600 px-4 dark:bg-black dark:text-white">
			<div className="w-full max-w-md bg-white rounded-l shadow-xl p-8 dark:bg-black dark:text-white">
				<h2 className="text-2xl font-bold text-center mb-6">
					Welcome Back
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Email
						</label>
						<input
							type="email"
							name="username"
							value={form.username}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border  focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">
							Password
						</label>
						<input
							type="password"
							name="password"
							value={form.password}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border  focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="••••••••"
						/>
					</div>

					<div className="flex items-center justify-between text-sm">
						<label className="flex items-center gap-2">
							<input type="checkbox" className="rounded" />
							Remember me
						</label>
						<a href="#" className="text-indigo-600 hover:underline">
							Forgot password?
						</a>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2  bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>

					{error && <p className="text-red-500 text-center">{error}</p>}
					{success && <p className="text-green-500 text-center">{success}</p>}
				</form>

				<p className="text-center text-sm mt-6">
					Don’t have an account?{" "}
					<Link to={"/registration"} className="text-indigo-600 font-medium hover:underline">Sign up</Link>
				</p>
			</div>
		</div>
	);
}
