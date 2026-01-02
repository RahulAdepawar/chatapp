import { BrowserRouter } from "react-router-dom";
import Routers from "@/Routes/routers";
import { useEffect } from "react";
import { requestNotificationPermission } from "@/utils/notifications";

function App() {
	useEffect(() => {
		requestNotificationPermission();
	}, []);

	useEffect(() => {
		const unlockAudio = () => {
			const audio = new Audio();
			audio.play().catch(() => { });
			document.removeEventListener("click", unlockAudio);
		};

		document.addEventListener("click", unlockAudio);
	}, []);


	return (
		<>
			<BrowserRouter>
				<Routers />
			</BrowserRouter>
		</>
	)
};

export default App;
