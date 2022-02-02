// TODO: write unit tests for the util functions

function getTimezoneOffset() {
	const date = new Date();
	return date.getTimezoneOffset();
}

function convertTimestampToUTCMinutes(timestamp: string) {
	const minutesOffset = getTimezoneOffset();
	const hours = timestamp.split(':')[0];
	const minutes = timestamp.split(':')[1];
	const minutesDay = Number(hours) * 60 + Number(minutes) + minutesOffset;
	return minutesDay >= 0 ? minutesDay : 1440 + minutesDay;
}

function convertUTCMinutesToTimestamp(minutesTotal: number) {
	if (!minutesTotal) return '19:30';
	const minutesOffset = getTimezoneOffset();
	let minutesDay = minutesTotal - minutesOffset;
	minutesDay = minutesDay >= 0 ? minutesDay : 1440 + minutesDay;
	const hours = `${Math.floor(minutesDay / 60)}`;
	const minutes = `${minutesDay % 60}`;
	return `${hours.length == 2 ? hours : '0' + hours}:${minutes.length == 2 ? minutes : '0' + minutes}`;
}

function urlBase64ToUint8Array(base64String: string) {
	var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

	var rawData = window.atob(base64);
	var outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function formatUSD(amount: number) {
	return amount ? `$${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 2 }).format(amount)}` : '';
}

export { formatUSD, convertTimestampToUTCMinutes, convertUTCMinutesToTimestamp, urlBase64ToUint8Array };
