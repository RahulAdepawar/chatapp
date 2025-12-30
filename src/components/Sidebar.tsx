import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { CgMenuMotion } from "react-icons/cg";
import ContactList from "./chats/ContactList";
import ContactMenu from "./contact/ContactMenu";
import SettingsMenu from "./settings/SettingsMenu";
import { CiChat1 } from "react-icons/ci";

type SideBarOption = {
	name: string,
	SideBarOption: 'Chats' | 'Menu' | 'Setting',
};

export default function Sidebar({ onMenuSelect, onSelectContact, selectedContactId }: any) {

	const [isOpenSideBarOption, setIsOpenSideBarOption] = useState<SideBarOption | null>({ name: "Chats", SideBarOption: "Chats" })

	return (
		<div className="h-full bg-white text-gray-900 border-r border-gray-200 bg-[#0c1618] dark:bg-[#0c1618] dark:text-gray-100 dark:border-neutral-700 relative">
			{/* Header */}
			<div className="p-4 font-bold border-b border-gray-200 dark:border-neutral-700">
				{isOpenSideBarOption && isOpenSideBarOption.name}
			</div>

			{isOpenSideBarOption &&
				(isOpenSideBarOption.SideBarOption === 'Menu' ? (
					<ContactMenu onMenuSelect={onMenuSelect} />
				) : isOpenSideBarOption.SideBarOption === 'Chats' ? (
					<ContactList onMenuSelect={onMenuSelect} onSelectContact={onSelectContact} selectedContactId={selectedContactId} />
				) : isOpenSideBarOption.SideBarOption === 'Setting' ? (
					<SettingsMenu onMenuSelect={onMenuSelect} />
				) : ''
				)
			}

			{/* Bottom Bar */}
			<div className="flex items-center justify-between absolute bottom-0 w-full p-4 border-t border-gray-200">
				{/* Left content */}
				<div className="text-md text-gray-700 dark:text-gray-100 font-semibold">
					ChatApp
				</div>

				{/* Right icons */}
				<div className="flex items-center gap-4 text-2xl text-gray-700 dark:text-gray-100">
					<IoSettingsSharp title="settings" className="cursor-pointer hover:text-blue-500 transition" onClick={() => setIsOpenSideBarOption({ name: 'Settings', SideBarOption: 'Setting' })} />
					<CgMenuMotion title="menu" className="cursor-pointer hover:text-blue-500 transition" onClick={() => setIsOpenSideBarOption({ name: 'Menu', SideBarOption: 'Menu' })} />
					<CiChat1 title="menu" className="cursor-pointer hover:text-blue-500 transition" onClick={() => setIsOpenSideBarOption({ name: 'Chats', SideBarOption: 'Chats' })} />
				</div>
			</div>
		</div>
	);
}
