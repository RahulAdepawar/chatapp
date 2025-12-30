interface Props {
	onMenuSelect: (view: "addContact" | "contactList") => void;
}

export default function ContactMenu({ onMenuSelect }: Props) {
	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700 pb-24">
			<li
				onClick={() => onMenuSelect("addContact")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
			>
				Add Contact
			</li>

			<li
				onClick={() => onMenuSelect("contactList")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
			>
				Contact List
			</li>
		</ul>
	);
}
