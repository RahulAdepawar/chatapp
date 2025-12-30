import { useEffect, useRef, useState } from "react";
// import type { ChangeEvent, KeyboardEvent } from "react";

import AxiosApi from "@/lib/axios";
import { socket } from "@/lib/socket";
import TypingIndicator from "../TypinkIndicator";
import { RiAttachmentFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";

type Attachment = {
	type: "image" | "file";
	filename: string;
	url: string;
};

type Message = {
	id: number;
	sender_id: number;
	message: string;
	created_at: string;
	attachments: Attachment[] | string | null;
};

type ContactDetail = {
	contact_list_id: number,
	contact_user_id: number,
	contact_user_name: string
	mute: number,
	pin: number,
	user_id: number,
}

// interface Task {
// 	title: string;
// 	description: string;
// }

export default function ChatWindow({
	contactId,
	onBack,
}: {
	contactId: number;
	onBack: () => void;
}) {
	/* -------------------- STATE -------------------- */
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [contactDetail, setContactDetail] = useState<ContactDetail | null>(null);
	const [isTyping, setIsTyping] = useState(false);

	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);

	const [openTaskModal, setOpenTaskModal] = useState<boolean>(false);
	const [taskTitle, setTaskTitle] = useState<string>("");
	const [taskDescription, setTaskDescription] = useState<string>("");
	const [selectedTaskFiles, setSelectedTaskFiles] = useState<File[]>([]);
	const fileInputRefTask = useRef<HTMLInputElement | null>(null);

	const handleTaskFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const files = Array.from(e.target.files);
		setSelectedTaskFiles((prev) => [...prev, ...files]);
	};

	const removeFile = (index: number) => {
		setSelectedTaskFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleCreateTask = () => {
		if (!taskTitle.trim()) return;

		console.log({
			title: taskTitle,
			description: taskDescription,
			files: selectedFiles,
		});

		setTaskTitle("");
		setTaskDescription("");
		setSelectedFiles([]);
		setOpenTaskModal(false);
	};

	const currentUserId = Number(localStorage.getItem("user_id"));

	/* -------------------- REFS -------------------- */
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const typingTimeout = useRef<number | null>(null);

	const hasScrolledInitially = useRef(false);
	const isUserNearBottom = useRef(true);

	const isUploading = uploadProgress > 0 && uploadProgress < 100;

	/* -------------------- HELPERS -------------------- */
	const getRoomId = (a: number, b: number) =>
		[a, b].sort((x, y) => x - y).join("_");

	const addFiles = (files: File[]) => {
		const allowed = files.filter(
			(f) =>
				f.type.startsWith("image/") ||
				f.type === "application/pdf"
		);
		setSelectedFiles((prev) => [...prev, ...allowed]);
	};

	/* -------------------- FILE HANDLERS -------------------- */
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		addFiles(Array.from(e.target.files));
		e.target.value = "";
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		addFiles(Array.from(e.dataTransfer.files));
	};

	const handleDragOver = (e: React.DragEvent) => e.preventDefault();

	/* -------------------- SCROLL DETECTION -------------------- */
	useEffect(() => {
		const el = messagesContainerRef.current;
		if (!el) return;

		const onScroll = () => {
			const distance =
				el.scrollHeight - el.scrollTop - el.clientHeight;
			isUserNearBottom.current = distance < 120;
		};

		el.addEventListener("scroll", onScroll);
		return () => el.removeEventListener("scroll", onScroll);
	}, []);

	/* -------------------- SOCKET CONNECT -------------------- */
	useEffect(() => {
		if (!socket.connected) socket.connect();
		return () => {
			socket.off("receive_message");
		};
	}, []);

	/* -------------------- JOIN ROOM + FETCH MESSAGES -------------------- */
	useEffect(() => {
		if (!contactId || !currentUserId) return;

		const roomId = getRoomId(currentUserId, contactId);
		hasScrolledInitially.current = false;
		isUserNearBottom.current = true;

		socket.emit("join_chat", roomId);

		const fetchMessages = async () => {
			const res = await AxiosApi.get(`/api/get_messages/${contactId}`);
			setMessages(res.data.data || []);
		};

		fetchMessages();

		return () => {
			socket.emit("leave_chat", roomId);
		};
	}, [contactId, currentUserId]);

	/* -------------------- CONTACT DETAIL -------------------- */
	useEffect(() => {
		const fetchContact = async () => {
			const res = await AxiosApi.get(
				`/api/contact_list_detail/${currentUserId}/${contactId}`
			);
			setContactDetail(res.data.data);
		};
		fetchContact();
	}, [contactId, currentUserId]);

	/* -------------------- TYPING INDICATOR -------------------- */
	useEffect(() => {
		socket.on("user_typing", (userId: number) => {
			if (userId === contactId) setIsTyping(true);
		});
		socket.on("user_stop_typing", (userId: number) => {
			if (userId === contactId) setIsTyping(false);
		});

		return () => {
			socket.off("user_typing");
			socket.off("user_stop_typing");
		};
	}, [contactId]);

	/* -------------------- RECEIVE MESSAGE -------------------- */
	useEffect(() => {
		const handleReceiveMessage = (msg: Message) => {
			setMessages((prev) => {
				if (prev.some((m) => m.id === msg.id)) return prev;
				return [...prev, msg];
			});
		};

		socket.on("receive_message", handleReceiveMessage);

		return () => {
			socket.off("receive_message", handleReceiveMessage);
		};
	}, []);


	/* -------------------- AUTO SCROLL -------------------- */
	useEffect(() => {
		if (!messages.length) return;

		if (!hasScrolledInitially.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
			hasScrolledInitially.current = true;
		} else if (isUserNearBottom.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	/* -------------------- INPUT CHANGE -------------------- */
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNewMessage(e.target.value);
		const roomId = getRoomId(currentUserId, contactId);

		socket.emit("typing", { roomId, userId: currentUserId });

		if (typingTimeout.current) clearTimeout(typingTimeout.current);
		typingTimeout.current = window.setTimeout(() => {
			socket.emit("stop_typing", { roomId, userId: currentUserId });
		}, 1000);
	};

	/* -------------------- SEND MESSAGE -------------------- */
	const handleSendMessage = async () => {
		if (!newMessage.trim() && selectedFiles.length === 0) return;

		const roomId = getRoomId(currentUserId, contactId);

		try {
			socket.emit("stop_typing", { roomId, userId: currentUserId });

			const formData = new FormData();
			formData.append("contactId", String(contactId));
			formData.append("message", newMessage);

			selectedFiles.forEach((file) => formData.append("attachments", file));

			const res = await AxiosApi.post("/api/send_message", formData, {
				headers: { "Content-Type": "multipart/form-data" },
				onUploadProgress: (progressEvent) => {
					const percent = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total!
					);
					setUploadProgress(percent);
				},
			});

			const savedMessage = res.data.data;

			// ✅ Only add if it doesn’t already exist
			setMessages((prev) => {
				if (prev.some((m) => m.id === savedMessage.id)) return prev;
				return [...prev, savedMessage];
			});

			setNewMessage("");
			setSelectedFiles([]);
			setUploadProgress(0);
		} catch (err) {
			console.error(err);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	/* -------------------- UI -------------------- */
	return (
		<div className="flex flex-col h-full bg-white dark:bg-[#2e3532] dark:text-white">
			{/* Header */}
			<div className="p-4 border-b flex gap-3">
				<button onClick={onBack}>←</button>
				<p className="font-semibold">
					{contactDetail?.contact_user_name ?? "Chat"}
				</p>
			</div>

			{/* Messages */}
			<div
				ref={messagesContainerRef}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				className="flex-1 overflow-y-auto p-4 space-y-3"
			>
				{messages.map((msg) => {
					const isIncoming = msg.sender_id === contactId;

					const attachments: Attachment[] | null =
						msg.attachments
							? typeof msg.attachments === "string"
								? (JSON.parse(msg.attachments) as Attachment[])
								: (msg.attachments as Attachment[])
							: null;

					return (
						<div
							key={msg.id}
							className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
						>
							<div>
								{msg.message && <div className={`whitespace-pre-wrap rounded p-2 text-sm max-w-xs ${isIncoming
									? "bg-gray-200 text-black dark:bg-neutral-800 dark:text-white"
									: "bg-gray-200 text-black"
									}`} >{msg.message}</div>}

								{attachments?.map((att, i) => (
									<div key={i} className="mt-2">
										{att.type === "image" ? (
											<img
												src={`${import.meta.env.VITE_SERVER_ORIGIN}${att.url}`}
												// className="rounded max-w-[200px]"
												className={`rounded p-2 max-w-xs ${isIncoming
													? "text-black dark:bg-neutral-800 dark:text-white"
													: "text-white"
													}`}
											/>
										) : (
											<a
												href={`${import.meta.env.VITE_SERVER_ORIGIN}${att.url}`}
												target="_blank"
												className="underline text-xs"
											>
												📎 Download
											</a>
										)}
									</div>
								))}
							</div>
						</div>
					);
				})}


				{isTyping && <TypingIndicator />}
				<div ref={messagesEndRef} />
			</div>

			{/* Preview */}
			{selectedFiles.length > 0 && (
				<div className="flex gap-2 p-2">
					{selectedFiles.map((file, i) => (
						<img
							key={i}
							src={URL.createObjectURL(file)}
							className="w-16 h-16 rounded object-cover"
						/>
					))}
				</div>
			)}

			{/* Progress */}
			{isUploading && (
				<div className="h-1 bg-gray-200">
					<div
						className="h-1 bg-gray-200"
						style={{ width: `${uploadProgress}%` }}
					/>
				</div>
			)}

			{/* Input */}
			<div className="p-2 border-t border-white/10 bg-[#0c1618]">
				<div className="flex items-end gap-2">
					{/* Attachment button */}
					<button
						onClick={() => fileInputRef.current?.click()}
						className="
							h-10 w-10
							flex items-center justify-center
							rounded-full
							text-gray-300
							hover:bg-white/10
							transition
						"
					>
						<RiAttachmentFill size={26} />
					</button>

					{/* Add Task button */}
					<button
						className="
							h-10 w-10
							flex items-center justify-center
							rounded-full
							text-gray-300
							hover:bg-white/10
							transition
						"
						onClick={() => setOpenTaskModal(true)}
					>
						<FaPlus size={22} />
					</button>

					{/* Message box */}
					<textarea
						value={newMessage}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						rows={1}
						placeholder="Type a message..."
						className="
							flex-1
							resize-none
							rounded-l
							bg-[#121d20]
							px-4 py-2
							text-sm text-gray-100
							placeholder-gray-400
							border border-white/10
							focus:outline-none
							focus:ring-2 focus:ring-emerald-500/40
							max-h-32
						"
					/>

					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						multiple
						hidden
						onChange={handleFileSelect}
					/>

					{/* Send button */}
					<button
						onClick={handleSendMessage}
						className="
							h-10 px-4
							rounded
							bg-emerald-600
							text-sm font-medium text-white
							hover:bg-emerald-700
							transition
							disabled:opacity-50
						"
					>
						Send
					</button>
				</div>
			</div>

			{/* Open modal for create task */}
			{/* Modal */}
			{openTaskModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black/60"
						onClick={() => setOpenTaskModal(false)}
					/>

					{/* Modal */}
					<div
						className=" relative z-10 w-full max-w-md rounded-xl bg-[#0c1618] p-5 text-gray-100 shadow-xl
      "
					>
						<h2 className="text-lg font-medium mb-4">
							Create Task
						</h2>

						{/* Title */}
						<input
							type="text"
							value={taskTitle}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setTaskTitle(e.target.value)
							}
							placeholder="Task title"
							className=" w-full mb-3 rounded-lg bg-[#121d20] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 "
						/>

						{/* Description */}
						<textarea
							value={taskDescription}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setTaskDescription(e.target.value)
							}
							rows={3}
							placeholder="Task description"
							className=" w-full mb-3 resize-none rounded-lg bg-[#121d20] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 "
						/>

						{/* Attachment row */}
						<div className="flex items-center gap-2 mb-4">
							<button
								type="button"
								onClick={() => fileInputRefTask.current?.click()}
								className=" h-10 w-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-white/10 transition "
							>
								<RiAttachmentFill size={24} />
							</button>

							<span className="text-xs text-gray-400">
								Attach files (optional)
							</span>

							<input
								ref={fileInputRefTask}
								type="file"
								multiple
								hidden
								onChange={handleTaskFileSelect	}
							/>
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setOpenTaskModal(false)}
								className=" px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg "
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleCreateTask}
								disabled={!taskTitle.trim()}
								className=" px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 "
							>
								Create & Send
							</button>
						</div>
						{/* Attachments preview */}
						{selectedTaskFiles.length > 0 && (
							<div className="mb-4 space-y-2">
								<p className="text-xs text-gray-400">
									Attachments ({selectedTaskFiles.length})
								</p>

								<div className="grid grid-cols-3 gap-2">
									{selectedTaskFiles.map((file, index) => {
										const isImage = file.type.startsWith("image/");

										return (
											<div
												key={index}
												className=" relative rounded-lg border border-white/10 bg-[#121d20] p-2"
											>
												{/* Remove button */}
												<button
													type="button"
													onClick={() => removeFile(index)}
													className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 text-white text-xs hover:bg-red-600"
												>
													✕
												</button>

												{/* Preview */}
												{isImage ? (
													<img
														src={URL.createObjectURL(file)}
														alt={file.name}
														className="h-20 w-full object-cover rounded"
													/>
												) : (
													<div className="flex flex-col items-center text-center">
														<span className="text-2xl">📄</span>
														<span className="text-[10px] text-gray-300 truncate w-full">
															{file.name}
														</span>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}

					</div>
				</div>
			)}

		</div>
	);
}

