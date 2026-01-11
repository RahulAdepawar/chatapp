import { useState, useEffect, useRef } from "react";
import AxiosApi from "@/lib/axios";
import { X } from "lucide-react";
import ImagePreview from "../ImagePreview";
// import TypingIndicator from "../TypingIndicator";
import { TiArrowBack } from "react-icons/ti";
import { RiAttachmentFill } from "react-icons/ri";

type Attachment = {
	type: "image" | "file";
	filename: string;
	url: string;
};

type Message = {
	task_discussion_id: number;
	sender_id: number;
	message: string | null;
	created_at: string;
	attachments: Attachment[] | string | null;
	status?: "sent" | "delivered" | "read";
};


function TaskDiscussion({
	taskId,
	assignTo,
	handleTaskDiscussion
}: {
	taskId: number;
	assignTo: number;
	handleTaskDiscussion: (id: number | null) => void;
}) {

	const [openDrawer, setOpenDrawer] = useState(false);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	// const [isTyping, setIsTyping] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);

	const [newMessage, setNewMessage] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	/* -------------------- HELPERS -------------------- */
	const normalizeMessage = (msg: Message): Message => ({
		...msg,
		attachments:
			typeof msg.attachments === "string"
				? JSON.parse(msg.attachments)
				: msg.attachments,
	});

	/* -------------------- SEND -------------------- */
	const handleSendMessage = async () => {
		if (!newMessage.trim() && selectedFiles.length === 0) return;

		const formData = new FormData();
		formData.append("task_id", String(taskId));
		formData.append("assignTo", String(assignTo));
		formData.append("message", newMessage);
		selectedFiles.forEach((f) => formData.append("attachments", f));

		const res = await AxiosApi.post("/api/tasks/send_message", formData);
		console.log("task msg res", res)

		const savedMessage = normalizeMessage(res.data.data);

		setMessages((prev) =>
			prev.some((m) => m.task_discussion_id === savedMessage.task_discussion_id) ? prev : [...prev, savedMessage]
		);

		setNewMessage("");
		setSelectedFiles([]);
	};

	/* -------------------- FILES -------------------- */
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNewMessage(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	/* -------------------- JOIN ROOM + FETCH -------------------- */
	useEffect(() => {
		let currentUserId = localStorage.getItem("user_id");
		if (!assignTo || !currentUserId) return;

		(async () => {
			const res = await AxiosApi.get(`/api/tasks/get_messages/${assignTo}/${taskId}`);
			setMessages(res.data.data.map(normalizeMessage));
		})();

	}, [assignTo]);

	return (
		<div className="h-screen flex flex-col bg-[#1b0429] text-white overflow-hidden relative">

			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b border-white/10">

				<div className="flex items-center gap-3">
					{/* Header / Back */}
					<button onClick={() => handleTaskDiscussion(null)}>
						<TiArrowBack size={22} />
					</button>
					<div>
						<p className="text-sm font-semibold">Task Discussion</p>
						<p className="text-xs text-gray-400">Task #{taskId}</p>
					</div>
				</div>


				<button
					onClick={() => setOpenDrawer(true)}
					className="px-4 py-2 text-sm rounded-lg purple"
				>
					View Task Details
				</button>
			</div>

			{/* ===== CHAT SECTION (MAIN VIEW) ===== */}
			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{messages.map((msg) => {
					console.log("msg", msg)
					const isIncoming = msg.sender_id === taskId;

					const msg_time = new Date(msg.created_at).toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
					});

					const attachments =
						msg.attachments &&
						(typeof msg.attachments === "string"
							? JSON.parse(msg.attachments)
							: msg.attachments);

					return (
						<div
							key={msg.task_discussion_id}
							className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
						>
							<div className="max-w-xs">
								<div
									className={`relative rounded p-2 ${isIncoming
										? "bg-gray-200 dark:bg-neutral-800"
										: "bg-[oklch(0.34_0.08_223.84)] text-white"
										}`}
								>
									{/* Message text */}
									{msg.message && (
										<p className="text-[14px] whitespace-pre-wrap">
											{msg.message}
										</p>
									)}

									{/* Attachments */}
									{attachments?.map((att: Attachment, i: number) => (
										<ImagePreview
											key={i}
											url={`${import.meta.env.VITE_SERVER_ORIGIN}${att.url}`}
										/>
									))}

									{/* Time + ticks */}
									<div className="flex items-center justify-end gap-1 mt-1">
										<span
											className={`text-[10px] ${isIncoming ? "text-gray-600" : "text-white/80"
												}`}
										>
											{msg_time}
										</span>

										{/* ✔✔ ticks (sent messages only) */}
										{!isIncoming && (
											<span
												className={`text-xs ${msg.status === "read"
													? "text-blue-400"
													: msg.status === "delivered"
														? "text-white/70"
														: "text-white/50"
													}`}
											>
												{msg.status === "sent" ? "✔" : "✔✔"}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>

					);
				})}

				{/* {isTyping && <TypingIndicator />} */}
				{/* 👇 Scroll target */}
				<div ref={bottomRef} />
			</div>
			{/* Input */}
			<div className="flex items-center gap-2 p-2 border-t border-gray-200 dark:border-white/10">
				<button onClick={() => fileInputRef.current?.click()}>
					<RiAttachmentFill size={20} />
				</button>

				<input
					ref={fileInputRef}
					type="file"
					multiple
					hidden
					onChange={handleFileSelect}
				/>

				<textarea
					value={newMessage}
					onChange={(e) => {
						handleInputChange(e);
					}}
					onKeyDown={handleKeyDown}
					placeholder="Type here...."
					className="flex-1 rounded bg-gray-100 dark:bg-[#121d20] px-2 py-1"
				/>

				<button onClick={handleSendMessage} className="px-3 py-1 bg-emerald-600 text-white rounded">
					Send
				</button>
			</div>

			{/* ===== OVERLAY ===== */}
			{openDrawer && (
				<div
					onClick={() => setOpenDrawer(false)}
					className="fixed inset-0 bg-black/50 z-40"
				/>
			)}

			{/* ===== DRAWER (PHASE 1 & 2) ===== */}
			<div
				className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#220833]
				z-50 transform transition-transform duration-300
				${openDrawer ? "translate-x-0" : "translate-x-full"}`}
			>
				{/* Drawer Header */}
				<div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
					<h3 className="text-lg font-semibold">Task Details</h3>
					<button onClick={() => setOpenDrawer(false)}>
						<X className="w-5 h-5 text-gray-300 hover:text-white" />
					</button>
				</div>

				{/* Phase 1 */}
				<div className="px-6 py-4 border-b border-white/10 space-y-4">
					<div>
						<p className="text-xs text-gray-400">Task ID</p>
						<p className="font-semibold">#TASK-1024</p>
					</div>

					<div>
						<p className="text-xs text-gray-400">Task Name</p>
						<p className="font-semibold">Design Chat UI</p>
					</div>

					<div>
						<p className="text-xs text-gray-400">Assigned By</p>
						<p className="font-semibold">Rahul Adepawar</p>
					</div>
				</div>

				{/* Phase 2 */}
				<div className="px-6 py-4 space-y-4">
					<div>
						<p className="text-xs text-gray-400 mb-1">Description</p>
						<p className="text-sm text-white/90">
							Implement a real-time chat UI for task discussions.
						</p>
					</div>

					<div className="flex gap-3">
						<span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
							In Progress
						</span>
						<span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
							High Priority
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskDiscussion;
