interface Props {
	onMenuSelect: (view: "Profile" ) => void;
}

export default function SettingsMenu({ onMenuSelect }: Props) {
	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700 pb-24">
			<li
				onClick={() => onMenuSelect("Profile")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
			>
				Profile
			</li>
		</ul>
	);
}
