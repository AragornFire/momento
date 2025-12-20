import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

async function loadProfile (name) {
	const snap = await getDoc(doc(db, "profiles", name));
	if (snap.exists()) {
		return snap.data();
	}
	return;
};

async function saveProfiles (profiles) {
	await Promise.all(
		profiles
			.filter((pf) => {pf.name !== "Guest"})
			.map((pf) =>
				setDoc(doc(db, "profiles", pf.name), {
					name: pf.name,
					win_count: pf.win_count,
					updated: Date.now()
				})
			)
	)
}
