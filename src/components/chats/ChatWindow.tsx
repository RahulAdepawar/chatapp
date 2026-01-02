import { useEffect, useRef, useState } from "react";
import AxiosApi from "@/lib/axios";
import { socket } from "@/lib/socket";
import TypingIndicator from "../TypingIndicator";
import { RiAttachmentFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { TiArrowBack } from "react-icons/ti";
import CreateTaskModal from "../CreateTaskModal";
import ImagePreview from "../ImagePreview";
import { playNotificationSound } from "@/utils/sound";

/* -------------------- TYPES -------------------- */
type Attachment = {
	type: "image" | "file";
	filename: string;
	url: string;
};

type Message = {
	id: number;
	sender_id: number;
	message: string | null;
	created_at: string;
	attachments: Attachment[] | string | null;
	status?: "sent" | "delivered" | "read";
};

type ContactDetail = {
	contact_user_id: number;
	contact_user_name: string;
};

/* -------------------- COMPONENT -------------------- */
export default function ChatWindow({
	contactId,
	onBack,
}: {
	contactId: number;
	onBack: () => void;
}) {

	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [contactDetail, setContactDetail] = useState<ContactDetail | null>(null);
	const [isTyping, setIsTyping] = useState(false);

	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [openTaskModal, setOpenTaskModal] = useState(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const typingTimeout = useRef<number | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const currentUserId = Number(localStorage.getItem("user_id"));

	const getRoomId = (a: number, b: number) =>
		[a, b].sort((x, y) => x - y).join("_");

	/* -------------------- HELPERS -------------------- */
	const normalizeMessage = (msg: Message): Message => ({
		...msg,
		attachments:
			typeof msg.attachments === "string"
				? JSON.parse(msg.attachments)
				: msg.attachments,
	});

	/* -------------------- SOCKET CONNECT -------------------- */
	useEffect(() => {
		if (!socket.connected) socket.connect();
		return () => {
			socket.off();
		};
	}, []);

	/* -------------------- JOIN ROOM + FETCH -------------------- */
	useEffect(() => {
		if (!contactId || !currentUserId) return;

		const roomId = getRoomId(currentUserId, contactId);
		socket.emit("join_chat", roomId);

		(async () => {
			const res = await AxiosApi.get(`/api/get_messages/${contactId}`);
			setMessages(res.data.data.map(normalizeMessage));
		})();

		return () => {
			socket.emit("leave_chat", roomId);
		};
	}, [contactId, currentUserId]);

	/* -------------------- CONTACT DETAIL -------------------- */
	useEffect(() => {
		(async () => {
			const res = await AxiosApi.get(
				`/api/contact_list_detail/${currentUserId}/${contactId}`
			);
			setContactDetail(res.data.data);
		})();
	}, [contactId, currentUserId]);

	/* -------------------- RECEIVE MESSAGE -------------------- */
	useEffect(() => {
		if (!contactId || !currentUserId) return;

		const roomId = getRoomId(currentUserId, contactId);

		const handleReceiveMessage = (msg: Message) => {
			const isIncoming = msg.sender_id === contactId;

			const normalized = normalizeMessage(msg);

			setMessages((prev) =>
				prev.some((m) => m.id === normalized.id)
					? prev
					: [...prev, normalized]
			);

			// ✔ delivered
			console.log("isIncoming", isIncoming)
			if (isIncoming) {
				playNotificationSound();

				socket.emit("message_delivered", {
					roomId,
					messageId: msg.id,
				});
			}
		};

		socket.on("receive_message", handleReceiveMessage);

		return () => {
			socket.off("receive_message", handleReceiveMessage);
		};
	}, [contactId, currentUserId, contactDetail]);


	/* -------------------- STATUS UPDATE -------------------- */
	useEffect(() => {
		const handleStatusUpdate = ({
			messageId,
			status,
		}: {
			messageId: number;
			status: "sent" | "delivered" | "read";
		}) => {
			setMessages((prev) =>
				prev.map((m) =>
					m.id === messageId ? { ...m, status } : m
				)
			);
		};

		socket.on("message_status_update", handleStatusUpdate);
		return () => {
			socket.off("message_status_update", handleStatusUpdate);
		};
	}, []);

	/* -------------------- READ RECEIPTS -------------------- */
	useEffect(() => {
		const roomId = getRoomId(currentUserId, contactId);

		messages.forEach((msg) => {
			if (msg.sender_id === contactId && msg.status !== "read") {
				socket.emit("message_read", {
					roomId,
					messageId: msg.id,
				});
			}
		});
	}, [messages, contactId, currentUserId]);

	/* -------------------- TYPING -------------------- */
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

	/* -------------------- INPUT -------------------- */
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNewMessage(e.target.value);

		const roomId = getRoomId(currentUserId, contactId);
		socket.emit("typing", { roomId });

		if (typingTimeout.current) clearTimeout(typingTimeout.current);
		typingTimeout.current = window.setTimeout(() => {
			socket.emit("stop_typing", { roomId });
		}, 1000);
	};

	/* -------------------- FILES -------------------- */
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
	};

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	/* -------------------- SEND -------------------- */
	const handleSendMessage = async () => {
		if (!newMessage.trim() && selectedFiles.length === 0) return;

		const formData = new FormData();
		formData.append("contactId", String(contactId));
		formData.append("message", newMessage);
		selectedFiles.forEach((f) => formData.append("attachments", f));

		const res = await AxiosApi.post("/api/send_message", formData);
		const savedMessage = normalizeMessage(res.data.data);

		setMessages((prev) =>
			prev.some((m) => m.id === savedMessage.id) ? prev : [...prev, savedMessage]
		);
		setNewMessage("");
		setSelectedFiles([]);
	};


	/* -------------------- SCROLL ON NEW MESSAGES -------------------- */
	useEffect(() => {
		bottomRef.current?.scrollIntoView();
	}, [messages, isTyping]);


	/* -------------------- UI -------------------- */
	return (
		<div className="flex flex-col h-full bg-white dark:bg-[#0c1618] text-black dark:text-white">
			{/* Header */}
			<div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-white/10">
				<button onClick={onBack}><TiArrowBack size={22} /></button>
				<p className="font-semibold flex-1">
					{contactDetail?.contact_user_name}
				</p>
				<button onClick={() => setOpenTaskModal(true)}>
					<FaPlus />
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{messages.map((msg) => {
					console.log("msg", msg)
					const isIncoming = msg.sender_id === contactId;

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
							key={msg.id}
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

				{isTyping && <TypingIndicator />}
				{/* 👇 Scroll target */}
				<div ref={bottomRef} />
			</div>


			{/* Selected Files Preview */}
			{selectedFiles.length > 0 && (
				<div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black">
					<div className="flex gap-2 p-2 overflow-x-auto max-h-24">
						{selectedFiles.map((file, index) => {
							const isImage = file.type.startsWith("image/");

							return (
								<div
									key={index}
									className="relative w-16 h-16 rounded overflow-hidden border border-gray-300 dark:border-white/20 flex-shrink-0"
								>
									{isImage ? (
										<img
											src={URL.createObjectURL(file)}
											alt={file.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex items-center justify-center w-full h-full text-[10px] text-center p-1">
											📄 {file.name.length > 10
												? file.name.slice(0, 7) + "..."
												: file.name}
										</div>
									)}

									<button
										type="button"
										onClick={() => removeFile(index)}
										className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
									>
										✕
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}

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
					onChange={handleInputChange}
					className="flex-1 rounded bg-gray-100 dark:bg-[#121d20] px-2 py-1"
				/>

				<button onClick={handleSendMessage} className="px-3 py-1 bg-emerald-600 text-white rounded">
					Send
				</button>
			</div>

			{openTaskModal && (
				<CreateTaskModal
					contactId={contactId}
					onClose={() => setOpenTaskModal(false)}
				/>
			)}
		</div>
	);
}
