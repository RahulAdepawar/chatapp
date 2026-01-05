
type ContactProfileProps = {
	contact: {
		contact_user_id: number;
		contact_user_name: string;
		profile_image?: string;
		is_saved: number;
		mute: number;
		email?: string;
		mobile?: string;
	};
};

export default function ContactProfile({ contact }: ContactProfileProps) {
	
	return (
		<div className="w-full h-full bg-white dark:bg-[#0c1618] flex justify-center">
			<div className="w-full max-w-md md:max-w-sm lg:max-w-md p-4 sm:p-6">				
				{/* Avatar */}
				<div className="flex flex-col items-center gap-3">
					{contact.profile_image ? (
						<img
							src={`${import.meta.env.VITE_SERVER_ORIGIN}${contact.profile_image}`}
							alt={contact.contact_user_name}
							className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border"
						/>
					) : (
						<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
							{contact.contact_user_name.charAt(0).toUpperCase()}
						</div>
					)}

					{/* Name */}
					<h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
						{contact.contact_user_name}
					</h2>
				</div>

				{/* Divider */}
				<div className="my-6 border-t dark:border-gray-700" />

				{/* Contact Details */}
				<div className="space-y-4">
					{contact.email && (
						<div className="flex flex-col bg-gray-50 dark:bg-[#132326] rounded-lg p-3">
							<span className="text-xs text-gray-500 dark:text-gray-400">
								Email
							</span>
							<span className="text-sm font-medium break-all text-gray-900 dark:text-gray-100">
								{contact.email}
							</span>
						</div>
					)}

					{contact.mobile && (
						<div className="flex flex-col bg-gray-50 dark:bg-[#132326] rounded-lg p-3">
							<span className="text-xs text-gray-500 dark:text-gray-400">
								Mobile
							</span>
							<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
								{contact.mobile}
							</span>
						</div>
					)}
				</div>

				{/* Status */}
				<div className="mt-6 flex gap-2 justify-center">
					{contact.is_saved === 1 && (
						<span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
							Saved
						</span>
					)}

					{contact.mute === 1 && (
						<span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
							Muted
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
