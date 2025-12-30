import { useEffect, useRef, useState } from "react";
import AxiosApi from "@/lib/axios";

interface ProfileData {
	username: string;
	email: string;
	mobile?: string;
	about?: string;
	profile_image?: string;
}

export default function Profile() {
	const [isEditing, setIsEditing] = useState(false);
	const [profile, setProfile] = useState<ProfileData>({
		username: "NA",
		email: "NA",
		mobile: "NA",
		about: "NA",
	});
	const [preview, setPreview] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			const response = await AxiosApi.get("/api/profile");
			console.log(response.data.data);
			setProfile(response.data.data);
		};
		fetchProfile();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// ✅ Instant preview
		setPreview(URL.createObjectURL(file));

		const formData = new FormData();
		formData.append("profile_image", file);

		try {
			const res = await AxiosApi.post(
				"/api/upload-profile-image",
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);

			// ✅ Update profile image from backend response
			setProfile((prev) => ({
				...prev,
				profile_image: res.data.image,
			}));
		} catch (err) {
			console.error("Upload failed", err);
		}
	};

	const handleSave = () => {
		setIsEditing(false);
	};

	return (
		<div className="h-full w-full flex flex-col bg-gray-50 dark:bg-neutral-900 dark:bg-black dark:text-white">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-4">
				<h2 className="text-lg font-semibold"> Profile</h2>
				{!isEditing && (
					<button
						onClick={() => setIsEditing(true)}
						className="px-4 py-2 bg-indigo-600 rounded-lg"
					>
						Edit
					</button>
				)}
			</div>

			{/* Body */}
			<div className="flex-1 px-6 py-8">
				<div className="flex flex-col md:flex-row gap-10">
					{/* Avatar */}
					<div className="flex flex-col items-center md:w-1/3">
						<div className="w-36 h-36 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center">
							{preview || profile.profile_image ? (
								<img
									src={`${import.meta.env.VITE_SERVER_ORIGIN}${profile.profile_image}`}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-5xl font-bold">
									{profile.username.charAt(0)}
								</span>
							)}
						</div>

						{/* Hidden input */}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileChange}
						/>

						<button
							onClick={() => fileInputRef.current?.click()}
							className="mt-4 text-sm text-indigo-600 hover:underline"
						>
							Change photo
						</button>
					</div>

					{/* Fields */}
					<div className="flex-1 space-y-6">
						<input
							name="username"
							value={profile.username}
							onChange={handleChange}
							disabled={!isEditing}
							className="w-full rounded-lg px-4 py-2 border"
						/>

						<input
							value={profile.email}
							disabled
							className="w-full rounded-lg px-4 py-2 border"
						/>

						<input
							name="mobile"
							value={profile.mobile}
							onChange={handleChange}
							disabled={!isEditing}
							className="w-full rounded-lg px-4 py-2 border"
						/>

						<textarea
							name="about"
							value={profile.about}
							onChange={handleChange}
							disabled={!isEditing}
							rows={4}
							className="w-full rounded-lg px-4 py-2 border"
						/>
					</div>
				</div>
			</div>

			{/* Footer */}
			{isEditing && (
				<div className="px-6 py-4 flex justify-end gap-3">
					<button
						onClick={() => setIsEditing(false)}
						className="px-4 py-2 rounded-lg"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-indigo-600 rounded-lg"
					>
						Save Changes
					</button>
				</div>
			)}
		</div>
	);
}
