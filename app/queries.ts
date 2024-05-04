const STRAETO_API = "https://straeto.is/graphql"
const GRAPHQL_HEADERS = { "Content-Type": "application/json" };
const QUERY_STOPS = `
fragment StopsResult on GtfsStop {
  id
  name
  lat
  lon
  type
  rotation
  code
  isTerminal
  routes
  alerts {
    id
    cause
    effect
    routes
    title
    text
    dateStart
    dateEnd
  }
}

query Stops($date: String) {
  GtfsStops(date: $date) {
    results {
      ...StopsResult
    }
  }
}`;

const QUERY_BUS_LOCATION_BY_STOP = `
fragment BusLocationByStopArrivals on BusLocationArrival {
  rotation
  arrival
  waitingTime
  headsign
  routeNr
  lat
  lng
  busId
  trip {
    id
    lineString
  }
}
fragment BusLocationByStop on BusLocationByStop {
  lastUpdate
  stop {
    id
    name
    lat
    lon
  }
  name
  arrivals {
    ...BusLocationByStopArrivals
  }
  errorCode
}
query BusLocationByStop($stopId: String!) {
  BusLocationByStop(stopId: $stopId) {
    ...BusLocationByStop
  }
}`;

export const fetchStops = () => {
    const now = new Date();
    return fetch(STRAETO_API, {
        method: "POST",
        headers: GRAPHQL_HEADERS,
        body: JSON.stringify({
            query: QUERY_STOPS,
            variables: {
                date: now.toISOString().slice(0, 10),
            }
        }),
    })
        .then(response => response.json())
        .then(stopsData => stopsData.data.GtfsStops.results);
}

export const fetchBusLocationByStop = (stopId: string) => {
    return fetch(STRAETO_API, {
        method: "POST",
        headers: GRAPHQL_HEADERS,
        body: JSON.stringify({
            query: QUERY_BUS_LOCATION_BY_STOP,
            variables: {
                stopId,
            }
        }),
    })
        .then(response => response.json())
        .then(busLocationByStopData => busLocationByStopData.data.BusLocationByStop);
}