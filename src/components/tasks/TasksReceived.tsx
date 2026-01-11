import { useEffect, useState } from "react";
import AxiosApi from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface Task {
	task_id: number;
	title: string;
	description: string;
	assigned_by_name: string;
	status: "pending" | "in_progress" | "completed" | "cancelled";
	priority: "low" | "medium" | "high" | "urgent";
	due_date: string | null;
	created_at: string;
}

const statusColor: Record<Task["status"], string> = {
	pending: "bg-yellow-100 text-yellow-700",
	in_progress: "bg-blue-100 text-blue-700",
	completed: "bg-green-100 text-green-700",
	cancelled: "bg-red-100 text-red-700",
};

const priorityColor: Record<Task["priority"], string> = {
	low: "bg-gray-100 text-gray-700",
	medium: "bg-indigo-100 text-indigo-700",
	high: "bg-orange-100 text-orange-700",
	urgent: "bg-red-100 text-red-700",
};

export default function TasksReceivedPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await AxiosApi.get("/api/tasks/received");
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

	return (
		<div className="p-4 space-y-4">
			<h1 className="text-xl font-semibold">Tasks Assigned To Me</h1>

			{tasks.length === 0 ? (
				<p className="text-gray-500">No tasks assigned to you.</p>
			) : (
				<div className="grid gap-4">
					{tasks.map((task) => (
						<div
							key={task.task_id}
							className="rounded-2xl border p-4 shadow-sm space-y-2"
						>
							<div className="flex justify-between items-start">
								<h2 className="font-medium text-base">{task.title}</h2>

								<div className="flex gap-2">
									<span
										className={`px-2 py-1 rounded text-xs ${statusColor[task.status]}`}
									>
										{task.status.replace("_", " ")}
									</span>
									<span
										className={`px-2 py-1 rounded text-xs ${priorityColor[task.priority]}`}
									>
										{task.priority}
									</span>
								</div>
							</div>

							{task.description && (
								<p className="text-sm text-gray-600">{task.description}</p>
							)}

							<div className="flex justify-between text-xs text-gray-500 pt-2">
								<span>Assigned by: {task.assigned_by_name}</span>
								{task.due_date && (
									<span>
										Due: {new Date(task.due_date).toLocaleDateString()}
									</span>
								)}
							</div>
						</div>

					))}
				</div>
			)}
		</div>
	);
}
