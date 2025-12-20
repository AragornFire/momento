// Online connection detection
let online = navigator.onLine;
let onfire = false;
const savebutton = document.getElementById("savegame");

function saveButtonUpdate () {
	savebutton.classList.toggle("offline", !online);
	savebutton.classList.toggle("offfire", online && !onfire);
	savebutton.classList.toggle("ready", online && onfire);
};

window.addEventListener('online', () => {
	online = true;
	saveButtonUpdate();
	console.log("Online");
});

window.addEventListener('offline', () => {
	online = false;
	onfire = false;
	saveButtonUpdate();
	console.log("Offline");
});

let profilesAPI;
async function checkProfiles () {
	if (!online) {
		onfire = false;
		return false;
	}
	
	if (profilesAPI) {
		onfire = true;
		saveButtonUpdate();
		return true;
	}

	try {
		profilesAPI = await import('./profiles.js');
		onfire = true;
		saveButtonUpdate();
		return true;
	} catch (e) {
		console.error("Firebase unavailable:", e);
		onfire = false;
		saveButtonUpdate();
		return false;
	}
};

savebutton.addEventListener('click', async () => {
	const ok = await checkProfiles();
	if (!ok) {
		savebutton.textContent = "Check Connection";
		return;
	}

	await saveProfiles(profiles);
	savebutton.textContent = "Data Saved";
});

// All of the elements needed
const field = document.getElementById('field');
const announcement = document.getElementById('announcement');

const player1box = document.getElementById("player1");
const player2box = document.getElementById("player2");
const blade1box = document.getElementById("blade1");
const blade2box = document.getElementById("blade2");

// For accessing just the players without needing to check properties
const players = [
	{
		name: "Player 1",
		class: "player",
		team: "red",
		size: 50,
		health: 5,
		x: 50,
		y: 50,
		vx: 0,
		vy: 0,
		sprite: player1box,
		thrusters: [].slice.call(player1box.children),
		controls: ["a", "w", "d", "s"]
	},
	{
		name: "Player 2",
		class: "player",
		team: "blue",
		size: 50,
		health: 5,
		x: 100,
		y: 100,
		vx: 0,
		vy: 0,
		sprite: player2box,
		thrusters: [].slice.call(player2box.children),
		controls: ["arrowleft", "arrowup", "arrowright", "arrowdown"]

	}
]

const objects = [
	players[0],
	players[1],
	{
		name: "Blade 1",
		class: "blade",
		team: "red",
		player: players[0],
		size: 20,
		health: -1,
		x: 200,
		y: 200,
		vx: 0,
		vy: 0,
		sprite: blade1box,
		controls: ["shiftleft"]
	},
	{
		name: "Blade 2",
		class: "blade",
		team: "blue",
		player: players[1],
		size: 20,
		health: -1,
		x: 300,
		y: 300,
		vx: 0,
		vy: 0,
		sprite: blade2box,
		controls: ["shiftright"]
	}
];

const infoboxes = [
	document.getElementById("infobox1"),
	document.getElementById("infobox2")
]

// Set info in the infobar
function setInfo (num, info) {
	let box;
	if (num === 1) {
		box = infoboxes[0];
	} else {
		box = infoboxes[1];
	}
	if (info.name) box.children[0].textContent = info.name;
	box.children[1].textContent = info.win_count;
};

profiles = [
	{name: 'Guest', win_count: 0},
	{name: 'Guest', win_count: 0}
]

setInfo(1, profiles[0]);
setInfo(2, profiles[1]);

const pick1 = document.getElementById("pick1");
const pick2 = document.getElementById("pick2");

pick1.addEventListener('submit', (e) => {
	console.log("Handling submit");
	e.preventDefault();
	const data = new FormData(pick1);
	profiles[0].name = String(data.get('username'));
	setInfo(1, profiles[0]);
});

pick2.addEventListener('submit', (e) => {
	console.log("Handling submit");
	e.preventDefault();
	const data = new FormData(pick2);
	profiles[1].name = String(data.get('username'));
	setInfo(2, profiles[1]);
});

// Displays health into h3
objects[0].sprite.firstChild.textContent = objects[0].health;
objects[1].sprite.firstChild.textContent = objects[1].health;

// Global variables
const STEP = 1000 / 60;
const keys = {};
const maxspeed = 5;
const drag_const = 0.001;
const wall_efficiency = 0.5;
const acceleration = 0.1;
const collision_efficiency = 0.8;
let lose;

const select = document.getElementById("select");
const game = document.getElementById("game");

const observer = new ResizeObserver((entries) => {
	for (const entry of entries) {
		screen_size = entry.contentRect;
	}
});

observer.observe(field);

// Define the height and width of objects based on properties
player1box.style.height = players[0].size + 'px';
player1box.style.width = players[0].size + 'px';
player2box.style.height = players[1].size + 'px';
player2box.style.width = players[1].size + 'px';
blade1box.style.height = objects[2].size + 'px';
blade1box.style.width = objects[2].size + 'px';
blade2box.style.height = objects[3].size + 'px';
blade2box.style.width = objects[3].size + 'px';

players.forEach((pl) => {
	const thrusters = pl.thrusters;
	const thr_offsets = [
		[-pl.size/6, pl.size/3],
		[pl.size/3, -pl.size/6],
		[pl.size - pl.size/6, pl.size/3],
		[pl.size/3, pl.size - pl.size/6]
	]
	for (let i = 0; i < pl.thrusters.length; i++) {
		thrusters[i].style.left = thr_offsets[i][0] + 'px';
		thrusters[i].style.top = thr_offsets[i][1] + 'px';
		thrusters[i].style.height = (pl.size / 3) + 'px';
		thrusters[i].style.width = (pl.size / 3) + 'px';
	}
});

// Keypress detection
document.addEventListener("keydown", e => {
	const key = e.key.toLowerCase();

	if (key === "shift") {
		if (e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT)
			keys["shiftleft"] = true;
		if (e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT)
			keys["shiftright"] = true;
	}

	keys[key] = true;
});

document.addEventListener("keyup", e => {
	const key = e.key.toLowerCase();

	if (key === "shift") {
		if (e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT)
			keys["shiftleft"] = false;
		if (e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT)
			keys["shiftright"] = false;
	}

	keys[key] = false;
});

// Makes sure there's no speed up when moving two directions at once
function normalize (player) { // Garish
	const vx = player.vx;
	const vy = player.vy;
	if (Math.sqrt(vx*vx + vy*vy) > maxspeed) {
		const len = Math.hypot(vx, vy);
		player.vx /= len;
		player.vy /= len;
		player.vx *= maxspeed;
		player.vy *= maxspeed;
	}
}

// Keep the player within the field
function boxin (player) {
	if (player.x < 0) {
		player.vx = -player.vx * wall_efficiency;
		player.x = 1;
	}
	if (player.x > screen_size.width - player.size) {
		player.vx = -player.vx * wall_efficiency;
		player.x = (screen_size.width - player.size) - 1;
	}
	if (player.y < 0) {
		player.vy = -player.vy * wall_efficiency;
		player.y = 1;
	}
	if (player.y > screen_size.height - player.size) {
		player.vy = -player.vy * wall_efficiency;
		player.y = (screen_size.height - player.size) - 1;
	}
}

// Apply a drag force
function drag (player) {
	if (player.vx != 0 || player.vy != 0) {
		player.vx -= player.vx * drag_const;
		player.vy -= player.vy * drag_const;
	}
}

// Consistent time between steps
function wait (time) {
	return new Promise(resolve => {
		const start = performance.now();

		setTimeout(() => {
			const end = performance.now();
			resolve(end - start);
		}, time);
	});
};

// Collision calculations
function collide (a, b) {
	const x_col = Math.min((a.x + a.size) - b.x, (b.x + b.size) - a.x);
	const y_col = Math.min((a.y + a.size) - b.y, (b.y + b.size) - a.y);

	if (x_col < 0 || y_col < 0) return;
	
	if (x_col < y_col) {
		const temp = a.vx;
		a.vx = b.vx * collision_efficiency;
		b.vx = temp * collision_efficiency;
	} else {
		const temp = a.vy;
		a.vy = b.vy * collision_efficiency;
		b.vy = temp * collision_efficiency;
	}

	if (x_col < y_col) {
		if (a.x < b.x) {
			a.x -= x_col / 2;
			b.x += x_col / 2;
		} else {
			a.x += x_col / 2;
			b.x -= x_col / 2;
		}
	} else {
		if (a.y < b.y) {
			a.y -= y_col / 2;
			b.y += y_col / 2;
		} else {
			a.y += y_col / 2;
			b.y -= y_col / 2;
		}
	}
	
	let pl;

	if (a.class == "player") {
		pl = a;
	} else if (b.class == "player") {
		pl = b;
	}

	if (!pl) return;
	
	if (a.class == "blade" || b.class == "blade") {
		pl.health -= 1;
		console.log(pl.health);
		pl.sprite.firstChild.textContent = pl.health;
	}
	
	if (pl.health == 0) {
		lose = pl.team;
	}
};

// Moves blade towards player (could generalize
function attract (bl, pl, scacc) {
	pl = bl.player;
	direction = {vx: bl.x - pl.x, vy: bl.y - pl.y};
	if (direction.vx != 0 || direction.vy != 0) {
		const len = Math.hypot(direction.vx, direction.vy);
		direction.vx /= len;
		direction.vy /= len;
		bl.vx -= direction.vx * scacc;
		bl.vy -= direction.vy * scacc;
	}
}

function brighten (thruster) {
	thruster.classList.add('propelling');
}

function darken (thruster) {
	thruster.classList.remove('propelling');
}

function move (object, dt) {
	const scacc = acceleration * (dt / STEP); // Scaled acceleration
	if (object.class == "player") {
		object.thrusters.forEach((thr) => {darken(thr)})

		if (keys[object.controls[0]]) {
			object.vx -= scacc;
			brighten(object.thrusters[0]);
		}
		if (keys[object.controls[1]]) {
			object.vy -= scacc;
			brighten(object.thrusters[1]);
		}
		if (keys[object.controls[2]]) {
			object.vx += scacc;
			brighten(object.thrusters[2]);
		}
		if (keys[object.controls[3]]) {
			object.vy += scacc;
			brighten(object.thrusters[3]);
		}
	} else { // Must be a blade
		if (keys[object.controls[0]]) {
			attract(object, object.player, scacc);
			brighten(object.sprite);
		} else {darken(object.sprite)}
	}
	
	// Basically the limit function from the Python version
	normalize(object);
	drag(object);
	
	// Apply movement
	object.x += object.vx;
	object.y += object.vy;

	// Prevents overflow, part of limit
	boxin(object);

	// Moves (the 'px' is VITAL I can't forget)
	object.sprite.style.left = object.x + 'px';
	object.sprite.style.top = object.y + 'px';
};

function setPositions () {
	const rect = field.getBoundingClientRect();
	screen_size = {width: rect.width, height: rect.height};

	const positions = [
		[screen_size.width/4 - objects[0].size/2, screen_size.height/3 - objects[0].size/2],
		[3*screen_size.width/4 - objects[1].size/2, screen_size.height/3 - objects[1].size/2],
		[screen_size.width/4 - objects[2].size/2, 2*screen_size.height/3 - objects[2].size/2],
		[3*screen_size.width/4 - objects[3].size/2, 2*screen_size.height/3 - objects[3].size/2]
	];
	for (let i = 0; i < objects.length; i++) {
		const obj = objects[i];
		console.log(positions[i]);
		obj.x = positions[i][0];
		obj.y = positions[i][1];
		obj.vx = 0;
		obj.vy = 0;
		obj.sprite.style.left = objects[i].x + 'px';
		obj.sprite.style.top = objects[i].y + 'px';
	};
};

async function play (time) {
	let playing = true;
	let winning = false;
	while (playing) {
		const waited = await wait(time);
		objects.forEach((obj) => {move(obj, waited)});

		for (let i = 0; i < objects.length; i++) {
			for (let j = i+1; j < objects.length; j++) {
				collide(objects[i], objects[j]);
			};
		};

		if (lose) {
			playing = false;
			winning = true;
		};
	};
	if (winning) { // Movement no longer processed
		let winner;
		let pakige;
		if (lose == 'red') {
			winner = "Blue";
			pakige = [2, profiles[1]];
		} else {
			winner = "Red";
			pakige = [1, profiles[0]];
		};
		pakige[1].win_count += 1;
		setInfo(pakige[0], pakige[1]);
		announcement.textContent = winner + ' wins!';
	};
	// Function exits
};

function startGame () {
	lose = false;
	announcement.textContent = "Who will win?";
	savebutton.textContent = "Save Data";
	Object.keys(keys).forEach((v) => {keys[v] = false;});
	select.classList.add('hidden');
	select.classList.remove('column');
	game.classList.remove('hidden');
	console.log("Game started");
	setPositions();
	players.forEach((pl) => {pl.health = 5; pl.sprite.firstChild.textContent = pl.health; console.log(pl.health)});
	play(STEP);
}

function main () {
	let setup = true;
	let playing = false;
	if (setup) {
		game.classList.add('hidden');
	}
}

main();
