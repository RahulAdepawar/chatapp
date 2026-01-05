type ProfileDrawerProps = {
	open: boolean;
	onClose: () => void;
	contact: any;
};

export default function ProfileDrawer({
	open,
	onClose,
	contact,
}: ProfileDrawerProps) {

	return (
		<>
			{/* Backdrop */}
			{open && (
				<div
					onClick={onClose}
					className="fixed inset-0 bg-black/40 z-40"
				/>
			)}

			{/* Drawer */}
			<div
				className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900
				rounded-t-2xl transition-transform duration-300 ease-out
				${open ? "translate-y-0" : "translate-y-full"}`}
				style={{ height: "85vh" }}
			>
				{/* Handle */}
				<div className="flex justify-center py-2">
					<div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
				</div>

				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/10">
					<h2 className="font-semibold text-lg">
						Contact Info
					</h2>

					<button onClick={onClose} className="text-xl">
						✕
					</button>
				</div>

				{/* Content */}
				<div className="h-full overflow-y-auto px-4 py-4">
					{/* Avatar */}
					<div className="flex flex-col items-center gap-3">
						<div className="w-24 h-24 rounded-lg flex items-center justify-center text-white text-3xl">
							{contact.profile_image ? (
								<img
									src={`${import.meta.env.VITE_SERVER_ORIGIN}${contact.profile_image}`}
									className="rounded-lg object-cover"
								/>
							) : (
								<div className="rounded-lg bg-blue-600 flex items-center justify-center text-white">
									{contact.contact_user_name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>

						<p className="text-lg font-semibold">
							{contact.contact_user_name}
						</p>
					</div>

					{/* Details */}
					<div className="mt-6 space-y-4">
						{contact.email && (
							<div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3">
								<p className="text-xs text-gray-500">Email</p>
								<p className="text-sm">{contact.email}</p>
							</div>
						)}

						{contact.mobile && (
							<div className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3">
								<p className="text-xs text-gray-500">Mobile</p>
								<p className="text-sm">{contact.mobile}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
