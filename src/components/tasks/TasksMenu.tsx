interface Props {
	onMenuSelect: (view: "addTasks" | "TasksListReceived" | "TasksListAssigned") => void;
}

import { GrTask } from "react-icons/gr";
// import { MdAddTask } from "react-icons/md";

export default function TasksMenu({ onMenuSelect }: Props) {
	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700">
			{/* <li
				onClick={() => onMenuSelect("addTasks")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<MdAddTask className="text-xl text-gray-600 dark:text-gray-300"/>
				<span>Add Task</span>
			</li> */}

			<li
				onClick={() => onMenuSelect("TasksListReceived")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<GrTask className="text-xl text-gray-600 dark:text-gray-300"/>
				<span>Tasks List (Received)</span>
			</li>

			<li
				onClick={() => onMenuSelect("TasksListAssigned")}
				className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-3"
			>
				<GrTask className="text-xl text-gray-600 dark:text-gray-300"/>
				<span>Tasks List (I Assigned)</span>
			</li>
		</ul>
	);
}
