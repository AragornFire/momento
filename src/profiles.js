import { getDB } from "./firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function loadProfile (name) {
	const db = getDB();
	const snap = await getDoc(doc(db, "profiles", name));
	if (snap.exists()) {
		return snap.data();
	}
	return;
};

export async function saveProfiles (profiles) {
	const db = getDB();
	await Promise.all(
		profiles
			.filter((pf) => pf.name !== "Guest")
			.map((pf) =>
				setDoc(doc(db, "profiles", pf.name), {
					name: pf.name,
					win_count: pf.win_count,
					updated: Date.now()
				})
			)
	)
}
