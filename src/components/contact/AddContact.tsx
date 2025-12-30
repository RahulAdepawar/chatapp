import { useState } from "react";
import AxiosApi from "@/lib/axios";

interface ContactForm {
	name: string;
	email_mobile: string;
}

const AddContact = () => {
	let [error, setError] = useState("");
	let [success, setSuccess] = useState("");

	const [form, setForm] = useState<ContactForm>({
		name: "",
		email_mobile: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		setError("");
		setSuccess("");
		e.preventDefault();

		try {
			const response = await AxiosApi.post("/api/add_contact", form);

			if (response.data.status == 200) {
				setError("");
				setSuccess("Data successfully saved.");
			}
			else {
				setError(response.data.message);
				setSuccess("");
			}
		}
		catch (e: any) {
			setError(e.response.data.message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
			<div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 sm:p-8">
				<h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-6">
					Add New Contact
				</h2>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							required
							placeholder="John Doe"
							className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Email
						</label>
						<input
							type="text"
							name="email_mobile"
							value={form.email_mobile}
							onChange={handleChange}
							placeholder="Enter Email/Mobile"
							className="mt-1 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
						/>
					</div>

					{/* Submit */}
					<button
						type="submit"
						className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
					>
						Add Contact
					</button>

					{error && <p className="text-red-500 text-center">{error}</p>}
					{success && <p className="text-green-500 text-center">{success}</p>}
				</form>
			</div>
		</div>
	);
};

export default AddContact;
