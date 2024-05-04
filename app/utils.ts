import { Coords } from './types';

export const calculateDistance = (posA: Coords, posB: Coords) => {
    const deltaLat = Math.pow(posA.lat - posB.lat, 2);
    const deltaLon = Math.pow(posA.lon - posB.lon, 2)
    return Math.sqrt(deltaLat + deltaLon);
}

export const sortByDistance = (currentPos: Coords) => {
    return (a: Coords, b: Coords) => (
        calculateDistance(a, currentPos) - calculateDistance(b, currentPos)
    );
}

export const getLocalStorage = <T>(key: string, defaultValue: T) => {
    const val = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if(val === null) {
        return defaultValue;
    } else {
        return JSON.parse(val);
    }
}

export const setLocalStorage = <T>(key: string, val: T) => {
    if(typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(val));
    }
}