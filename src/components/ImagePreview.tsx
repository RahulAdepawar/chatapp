import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";

type ImagePreviewProps = {
	url: string;
	alt?: string;
};

export default function ImagePreview({ url, alt }: ImagePreviewProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleDownload = async (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent modal close

		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = url.split("/").pop() || "image";
			link.click();

			window.URL.revokeObjectURL(blobUrl); // free memory
		} catch (err) {
			console.error("Download failed:", err);
		}
	};


	return (
		<>
			{/* Thumbnail */}
			<div
				className="relative group cursor-pointer max-w-xs overflow-hidden rounded"
				onClick={() => setIsOpen(true)}
			>
				<img
					src={url}
					alt={alt || "attachment"}
					className="rounded max-w-xs transition duration-200 group-hover:blur-sm"
				/>

				{/* Hover Arrow */}
				<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					<div className="bg-black/60 p-2 rounded-full text-white text-lg">➜</div>
				</div>
			</div>

			{/* Fullscreen Modal */}
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
					onClick={() => setIsOpen(false)}
				>
					{/* Controls */}
					<div className="absolute top-4 right-4 flex gap-2">
						{/* Download Button */}
						<button
							onClick={handleDownload}
							className="bg-white/10 hover:bg-white/20 text-white p-2 rounded"
						>
							<IoMdDownload />
						</button>

						{/* Close Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								setIsOpen(false);
							}}
							className="bg-white/10 hover:bg-white/20 text-white p-2 rounded"
						>
							<IoCloseSharp />
						</button>
					</div>

					<img
						src={url}
						alt={alt || "attachment"}
						className="max-h-[90vh] max-w-[90vw] object-contain touch-pan-y"
						onContextMenu={(e) => {
							// Right-click → download
							e.preventDefault();
							handleDownload(e as any);
						}}
					/>
				</div>
			)}
		</>
	);
}
