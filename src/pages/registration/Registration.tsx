import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { validate_email, validateMobile, validatePassword } from "@/utils/validation";
import AxiosApi from "@/lib/axios";
import { useNavigate } from "react-router-dom";

type formTypes = {
	name: string;
	mobile: string;
	email: string;
	password: string;
};

export default function Registration() {
	let navigate = useNavigate();

	const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "" });
	const [loading, setLoading] = useState(false);
	let [error, setError] = useState("");
	let [success, setsuccess] = useState("");

	// Check use is already login
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const authResponse = await AxiosApi.post("/api/auth/check");
				if (authResponse.data.authenticated) {
					navigate("/", { replace: true });
				}
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [navigate]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		let validate = validateForm(form);
		console.log("validate", validate)
		if (!validate) {
			return;
		} 

		setError("");
		setLoading(true);

		try {
			const response = await AxiosApi.post("/api/users ", form);
			console.log(response.data);
			
			if (response.data.status == 200) {
				setsuccess(response.data.message);
				setError("");
			}
			else {
				setError(response.data.message);
				setsuccess("");
			}
		} catch (error: any) {
			console.error(error.response?.data || error.message);
			setError(error.message);
			setsuccess("");
		}

		setLoading(false);
	};

	const validateForm = (form: formTypes):boolean => {
		if (form.name == "") {
			setError("Name Cannot be blank.");
			setLoading(false);
			return false;
		}

		if (form.mobile != "") {
			if (!validateMobile(form.mobile)) {
				setError("Enter a valid 10-digit mobile number");
				setLoading(false);
				return false;
			}
		}
		else {
			setError("Mobile Number Cannot be blank.");
			setLoading(false);
			return false;
		}

		if (form.email != "") {
			if (!validate_email(form.email)) {
				setError("Invalid email address.");
				setLoading(false);
				return false;
			}
		}
		else {
			setError("Email address cannot be blank");
			setLoading(false);
			return false;
		}

		if (form.password != "") {
			if (!validatePassword(form.password)) {
				console.log(validatePassword(form.password), "pass", form.password)
				setError(
					"Password must be at least 8 characters and include uppercase, lowercase, number & special character"
				);
				setLoading(false);
				return false;
			}
		}
		else {
			setError("Password cannot be blank.");
			setLoading(false);
			return false;
		}

		return true;
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white-to-r from-indigo-500 to-purple-600 px-4 dark:bg-black dark:text-white">
			<div className="w-full max-w-md bg-white rounded-l shadow-xl p-8 dark:bg-black dark:text-white">
				<h2 className="text-2xl font-bold text-center mb-6">
					Register here
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							className="w-full px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="Name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Mobile
						</label>
						<input
							type="number"
							name="mobile"
							value={form.mobile}
							onChange={handleChange}
							className="w-full px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="Mobile number"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							className="w-full px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
							className="w-full px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
					>
						{loading ? "Signing Up..." : "Sign Up"}
					</button>

					{error && <p className="text-red-500 text-center">{error}</p>}
					{success && <p className="text-green-500 text-center">{success}</p>}

				</form>

				<p className="text-center text-sm mt-6">
					Already have an account?{" "}
					<Link to={"/login"} className="text-indigo-600 font-medium hover:underline">Sign in</Link>
				</p>
			</div>
		</div>
	);
}
