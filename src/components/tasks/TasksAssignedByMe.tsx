import { useEffect, useState } from "react";
import AxiosApi from "@/lib/axios";
import { Loader2 } from "lucide-react";
import TaskDiscussion from "./TasksDiscussion";

interface Task {
	task_id: number;
	title: string;
	description: string;
	assigned_to: number;
	assigned_to_name: string;
	status: "pending" | "in_progress" | "completed" | "cancelled";
	priority: "low" | "medium" | "high" | "urgent";
	due_date: string | null;
	created_at: string;
}

const statusColor = {
	pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
	in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
	completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const priorityColor = {
	low: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
	medium: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
	high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
	urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function TasksAssignedByMePage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	let [selectedTask, setSelectedTask] = useState<number | null>(null);
	let [assignTo, setAssignTo] = useState<number>(0);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await AxiosApi.get("/api/tasks/assigned");
				const taskList = await res.data;
				if (taskList.success) {
					setTasks(taskList.data);
				}
			} catch (err) {
				console.error("Failed to fetch tasks", err);
			} finally {
				setLoading(false);
			}
		};

		fetchTasks();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	const handleTaskDiscussion = (task_id: number | null) => {
		setSelectedTask(task_id);
	};

	return (
		<div className="h-full flex flex-col">
			{selectedTask ? (
				<div className="">
					{/* FULL SCREEN PROFILE */}
					<div className="flex-1 overflow-y-auto">
						<TaskDiscussion taskId={selectedTask} assignTo={assignTo} handleTaskDiscussion={handleTaskDiscussion} />
					</div>
				</div>
			) : (
				<>
					{/* Page Header */}
					<div className="p-3 border-b border-gray-200 dark:border-neutral-700">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-semibold">
								Tasks I Assigned
							</h1>
							<span className="text-sm">
								Total: {tasks.length}
							</span>
						</div>
					</div>

					{tasks.length === 0 ? (
						<div className="rounded-lg border border-dashed p-6 text-center">
							You have not assigned any tasks yet.
						</div>
					) : (
						<div className="p-4">
							{tasks.map((task) => (
								<div
									key={task.task_id}
									className="relative rounded-xl border p-5 shadow-sm hover:shadow-md transition mt-3"
									onClick={() => {
										handleTaskDiscussion(task.task_id);
										setAssignTo(task.assigned_to);
									}}
								>
									{/* Priority Accent Bar */}
									<div
										className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${task.priority === "urgent"
											? "bg-red-500"
											: task.priority === "high"
												? "bg-orange-500"
												: task.priority === "medium"
													? "bg-indigo-500"
													: "bg-gray-400"
											}`}
									/>

									{/* Header */}
									<div className="flex items-start justify-between gap-4">
										<div>
											<div className="flex items-center gap-2">
												<span className="text-xs font-mono">
													#{task.task_id}
												</span>
												<h2 className="text-lg font-semibold">
													{task.title}
												</h2>
											</div>

											{task.description && (
												<p className="mt-1 text-sm line-clamp-2">
													{task.description}
												</p>
											)}
										</div>

										{/* Status & Priority */}
										<div className="flex flex-col items-end gap-2">
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[task.status]}`}
											>
												{task.status.replace("_", " ")}
											</span>

											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColor[task.priority]}`}
											>
												{task.priority}
											</span>
										</div>
									</div>

									{/* Footer */}
									<div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
										<span>
											Assigned to <strong>{task.assigned_to_name}</strong>
										</span>

										{task.due_date ? (
											<span>
												Due:{" "}
												<strong>
													{new Date(task.due_date).toLocaleDateString()}
												</strong>
											</span>
										) : (
											<span>No due date</span>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</div>

	);
}
