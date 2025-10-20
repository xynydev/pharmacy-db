const earth_radius_km = 6371;

function toRad(x: number) {
	return (x * Math.PI) / 180;
}

// starting point: [<Float> latitude, <Float> longitude]
// ending point: [<Float> latitude, <Float> longitude]
// units: <Number> earth_radius
export function haversineDistance(starting_point: [number, number], end_point: [number, number]) {
	const units = earth_radius_km;

	const lat1 = starting_point[0];
	const lat2 = end_point[0];

	const lon1 = starting_point[1];
	const lon2 = end_point[1];

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const radLat1 = toRad(lat1);
	const radLat2 = toRad(lat2);

	const arc =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
	return 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc)) * units;
}
