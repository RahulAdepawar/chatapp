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
	const [priority, setPriority] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [attachment, setAttachment] = useState<File | null>(null);

	const handleAttachmentChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];

		if (!file) {
			setAttachment(null);
			return;
		}

		// ✅ File size validation (5MB)
		const MAX_SIZE = 5 * 1024 * 1024;
		if (file.size > MAX_SIZE) {
			setError("File size must be less than 5MB");
			e.target.value = ""; // reset input
			return;
		}

		// ✅ Allowed file types (optional)
		const allowedTypes = [
			"image/png",
			"image/jpeg",
			"application/pdf",
		];

		if (!allowedTypes.includes(file.type)) {
			setError("Only PNG, JPG, or PDF files are allowed");
			e.target.value = "";
			return;
		}

		setError("");
		setAttachment(file);
	};

	const handleCreateTask = async () => {
		if (!title.trim()) {
			setError("Task title is required");
			return;
		}

		try {
			setLoading(true);
			setError("");

			const response = await AxiosApi.post("/api/tasks/create", {
				title,
				description,
				priority,
				due_date: dueDate,
				contactId,
				attachments: attachment
			});

			if (response.status) {
				onClose(); // ✅ Close modal on success
			}

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
				<div className="space-y-5">
					{/* Title */}
					<div className="space-y-1">
						<label className="text-sm font-medium">
							Title <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="Enter task title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm
										bg-white dark:bg-neutral-800
										border-gray-300 dark:border-neutral-700
										focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					{/* Description */}
					<div className="space-y-1">
						<label className="text-sm font-medium">
							Description
						</label>
						<textarea
							placeholder="Add more details (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full rounded-lg border px-3 py-2 text-sm resize-none
										bg-white dark:bg-neutral-800
										border-gray-300 dark:border-neutral-700
										focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					{/* Priority */}
					<div className="space-y-1">
						<label className="text-sm font-medium">
							Priority
						</label>
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm
									bg-white dark:bg-neutral-800
									border-gray-300 dark:border-neutral-700
									focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
							<option value="urgent">Urgent</option>
						</select>
					</div>

					{/* Due Date */}
					<div className="space-y-1">
						<label className="text-sm font-medium">
							Due Date
						</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="w-full rounded-lg border px-3 py-2 text-sm
									bg-white dark:bg-neutral-800
									border-gray-300 dark:border-neutral-700
									focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					{/* Attachment */}
					<div className="space-y-1">
						<label className="text-sm font-medium">
							Attachment
						</label>
						<input
							type="file"
							onChange={handleAttachmentChange}
							className="w-full text-sm
									file:mr-4 file:rounded-md file:border-0
									file:bg-indigo-600 file:text-white
									file:px-4 file:py-2
									hover:file:bg-indigo-700"
						/>
					</div>

					{/* Error */}
					{error && (
						<p className="text-sm text-red-500">
							{error}
						</p>
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
