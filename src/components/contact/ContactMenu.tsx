interface Props {
	onMenuSelect: (view: "addContact" | "contactList") => void;
}

import { IoMdContacts } from "react-icons/io";
import { BiSolidContact } from "react-icons/bi";

export default function ContactMenu({ onMenuSelect }: Props) {
	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700 pb-24">
			<li
				onClick={() => onMenuSelect("addContact")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<IoMdContacts className="text-xl text-gray-600 dark:text-gray-300"/>
				<span>Add Contact</span>
			</li>

			<li
				onClick={() => onMenuSelect("contactList")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<BiSolidContact className="text-xl text-gray-600 dark:text-gray-300"/>
				<span>Contact List</span>
			</li>
		</ul>
	);
}
