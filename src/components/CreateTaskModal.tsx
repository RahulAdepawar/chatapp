import { useState } from "react";
import AxiosApi from "@/lib/axios";
import { X } from "lucide-react";

interface Props {
	contactId: number;
	onClose: () => void;
}

export default function CreateTaskModal({ contactId, onClose }: Props) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleCreateTask = async () => {
		if (!title.trim()) {
			setError("Task title is required");
			return;
		}

		try {
			setLoading(true);
			setError("");

			await AxiosApi.post("/api/tasks/create", {
				title,
				description,
				due_date: dueDate || null,
				contactId,
			});

			onClose(); // ✅ Close modal on success
		} catch (err) {
			console.error(err);
			setError("Failed to create task");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 p-5 shadow-lg">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Create Task</h2>
					<button onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className="space-y-3">
					<input
						type="text"
						placeholder="Task title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full border rounded px-3 py-2 dark:bg-neutral-800"
					/>

					<textarea
						placeholder="Description (optional)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full border rounded px-3 py-2 dark:bg-neutral-800"
						rows={3}
					/>

					<input
						type="date"
						value={dueDate}
						onChange={(e) => setDueDate(e.target.value)}
						className="w-full border rounded px-3 py-2 dark:bg-neutral-800"
					/>

					{error && (
						<p className="text-sm text-red-500">{error}</p>
					)}
				</div>

				{/* Footer */}
				<div className="mt-5 flex justify-end gap-2">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded border"
					>
						Cancel
					</button>

					<button
						onClick={handleCreateTask}
						disabled={loading}
						className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
					>
						{loading ? "Creating..." : "Create"}
					</button>
				</div>
			</div>
		</div>
	);
}
