const intervals = new Map();
const timeouts = new Map();

const intervalNodes = new Map();
const timeoutNodes = new Map();

const intervalCounters = new Map();

const intervalsContainer = document.getElementById('intervals-container');
const timeoutsContainer = document.getElementById('timeouts-container');

const timeoutInput = document.getElementById('timeout-input');

let id = 0;

document.addEventListener('click', onClick);

/** Tools, Utils */
function createTimerNode(type) {
	const el = document
		.getElementById(type)
		.content.cloneNode(true).firstElementChild;
	el.setAttribute('data-id', `${type}-${++id}`);
	return el;
}

function parseTime(seconds) {
	let result = '';
	let rest = seconds;
	const hours = Math.floor(rest / 3600);
	if (hours) {
		result += `${wrapNumbers(hours)}:`;
		rest -= hours * 3600;
	}
	const minutes = Math.floor(rest / 60);
	result += `${wrapNumbers(minutes)}:${wrapNumbers(rest % 60)}`;
	return result;
}

function wrapNumbers(num) {
	return num >= 10 ? `${num}` : `0${num}`;
}

function getDate(time) {
	const options = {
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	};
	return new Date(time).toLocaleString(undefined, options);
}

/** Interval Actions */
function addInterval() {
	if (intervalNodes.size < 10) {
		const el = createTimerNode('interval');
		const id = el.getAttribute('data-id');
		intervalsContainer.append(el);
		intervalCounters.set(id, {counter: 0});
		intervalNodes.set(id, el);
	}
}

function startInterval(id, el) {
	const time = el.querySelector('.time');
	el.classList.add('active');
	intervals.set(
		id,
		setInterval(() => {
			time.textContent = parseTime(++intervalCounters.get(id).counter);
		}, 1000)
	);
}

function stopInterval(id, el) {
	clearInterval(intervals.get(id));
	intervals.set(id, null);
	el.classList.remove('active');
}

function deleteInterval(id, el) {
	clearInterval(intervals.get(id));
	el.remove();
	intervalNodes.delete(id);
	intervals.delete(id);
	intervalCounters.delete(id);
}

/** Timeout Actions */
function addTimeout() {
	if (timeoutNodes.size < 5 && timeoutInput.value > 0) {
		const el = createTimerNode('timeout');
		const id = el.getAttribute('data-id');
		timeoutsContainer.append(el);
		timeoutNodes.set(id, el);
		timeouts.set(id, {delay: timeoutInput.value * 1000, timer: null});
		timeoutInput.value = null;
		startTimeout(id, el);
	}
}

function startTimeout(id, el) {
	const now = Date.now();
	const timeout = timeouts.get(id);
	el.querySelector('[data-role=start]').textContent = getDate(now);
	el.querySelector('[data-role=end]').textContent = getDate(
		now + timeout.delay
	);
	el.querySelector('[data-role=state]').textContent = 'In Progress';
	el.querySelector('[data-role=duration]').textContent = parseTime(
		timeout.delay / 1000
	);
	el.setAttribute('data-state', 'in-progress');
	timeout.timer = setTimeout(() => {
		stopTimeout(id, el);
	}, timeout.delay);
}

function stopTimeout(id, el) {
	el.querySelector('[data-role=state]').textContent = `Done, ${getDate(
		Date.now()
	)}`;
	el.setAttribute('data-state', 'done');
}

function deleteTimeout(id, el) {
	timeoutNodes.delete(id);
	timeouts.delete(id);
	el.remove();
}

function handleTimeoutAction(id, action) {
	const el = timeoutNodes.get(id);
	if (action === 'timeout-delete') {
		deleteTimeout(id, el);
	}
}

/** Control Actions */
function startAll() {
	const entries = intervalNodes.entries();
	let entry = entries.next().value;
	while (entry) {
		const [id, el] = entry;
		if (!intervals.get(id)) {
			startInterval(id, el);
		}
		entry = entries.next().value;
	}
}

function stopAll() {
	const entries = intervalNodes.entries();
	let entry = entries.next().value;
	while (entry) {
		stopInterval(entry[0], entry[1]);
		entry = entries.next().value;
	}
}

function resetApp() {
	stopAll();
	intervals.clear();
	intervalCounters.clear();
	intervalNodes.forEach((el) => el.remove());
	intervalNodes.clear();
	startApp();
}

/** Handlers */
function onClick(e) {
	const timer = e.target.closest('[data-id]');
	const timerAction = e.target.closest('[data-action]');
	const controlButton = e.target.closest('[data-control]');
	if (timer && timerAction) {
		const id = timer.getAttribute('data-id');
		if (id.startsWith('interval')) {
			handleIntervalAction(id, timerAction.getAttribute('data-action'));
		}
		if (id.startsWith('timeout')) {
			handleTimeoutAction(id, timerAction.getAttribute('data-action'));
		}
	}
	if (controlButton) {
		handleControlButton(controlButton.getAttribute('data-control'));
	}
}

function handleIntervalAction(id, action) {
	const el = intervalNodes.get(id);
	if (el && action === 'start') {
		startInterval(id, el);
	}
	if (el && action === 'stop') {
		stopInterval(id, el);
	}
	if (el && action === 'interval-delete') {
		deleteInterval(id, el);
	}
}

function handleControlButton(action) {
	switch (action) {
		case 'start-all':
			startAll();
			break;
		case 'stop-all':
			stopAll();
			break;
		case 'reset':
			resetApp();
			break;
		case 'reload':
			window.location.reload();
			break;
		case 'add-interval':
			addInterval();
			break;
		case 'add-timeout':
			addTimeout();
			break;
	}
}

/** Entry Point */
function startApp() {
	addInterval();
	addInterval();
	addInterval();
}

startApp();
//startAll();
