export interface Coords {
    lat: number,
    lon: number,
}

export type Stop = {
    id: number,
    name: string,
    lat: number,
    lon: number,
    type: number,
    rotation: number,
    code: string,
    isTerminal: boolean,
    routes: string[],
    alerts: string[],
}

export type BusLocationTrip = {
    id: number,
    lineString: string,
}

export type BusLocationArrival = {
    arrival: string,
    busId: string,
    headsign: string,
    lat: number,
    lon: number,
    rotation: number,
    routeNr: string,
    trip: BusLocationTrip,
    waitingTime: number,
}