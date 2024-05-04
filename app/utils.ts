import { Coords } from './types';

export const calculateDistance = (posA: Coords, posB: Coords) => {
    const deltaLat = Math.pow(posA.lat - posB.lat, 2);
    const deltaLon = Math.pow(posA.lon - posB.lon, 2)
    return Math.sqrt(deltaLat + deltaLon);
}
