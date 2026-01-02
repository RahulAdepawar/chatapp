import { CgProfile } from "react-icons/cg";
import { BiSolidLogOut } from "react-icons/bi";
import AxiosApi from "@/lib/axios";
import { useNavigate } from "react-router-dom";

interface Props {
	onMenuSelect: (view: "Profile") => void;
}

export default function SettingsMenu({ onMenuSelect }: Props) {

	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			let res = await AxiosApi.post("/api/logout");
			const status = await res.data.status;

			if (status) {
				navigate("/login", {replace: true});
			}
		}
		catch(error) {
			console.log(error);
		}
	};

	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700 pb-24">
			<li
				onClick={() => onMenuSelect("Profile")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<CgProfile className="text-xl text-gray-600 dark:text-gray-300" />
				<span>Profile</span>
			</li>

			<li
				onClick={handleLogout}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3 text-red-600 dark:text-red-400"
			>
				<BiSolidLogOut className="text-xl" />
				<span>Logout</span>
			</li>
		</ul>
	);
}
