import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import { getCroppedImg } from "./types/CropImage";

type Props = {
	image: string;
	onCropDone: (file: File) => void;
	onCancel: () => void;
};

export default function ImageCropper({ image, onCropDone, onCancel }: Props) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

	const onCropComplete = useCallback((_: any, croppedPixels: any) => {
		setCroppedAreaPixels(croppedPixels);
	}, []);

	const createCroppedImage = async () => {
		const file = await getCroppedImg(image, croppedAreaPixels);
		onCropDone(file);
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
			<div className="bg-white dark:bg-neutral-900 rounded-2xl w-[90%] max-w-md p-4">
				<div className="relative h-64 w-full">
					<Cropper
						image={image}
						crop={crop}
						zoom={zoom}
						aspect={1}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
					/>
				</div>

				<input
					type="range"
					min={1}
					max={3}
					step={0.1}
					value={zoom}
					onChange={(e) => setZoom(Number(e.target.value))}
					className="w-full mt-4"
				/>

				<div className="flex gap-3 mt-4">
					<button
						onClick={onCancel}
						className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-neutral-700"
					>
						Cancel
					</button>
					<button
						onClick={createCroppedImage}
						className="flex-1 py-2 rounded-xl bg-indigo-600 text-white"
					>
						Crop
					</button>
				</div>
			</div>
		</div>
	);
}
