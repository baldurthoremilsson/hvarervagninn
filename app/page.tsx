"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react';

const STRAETO_API = "https://straeto.is/graphql"

const DEFAULT_LAT = 64.143303656234;
const DEFAULT_LON = -21.9146771540298;

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

interface Coords {
  lat: number,
  lon: number,
}

type Stop = {
		id: number,
		name: string,
		lat: number,
		lon: number,
		type: number,
		rotation: number,
		code: string,
		isTerminal: boolean,
		routes: Array<string>,
		alerts: Array<string>,
}

const calcPos = (posA: Coords, posB: Coords) => Math.sqrt(Math.pow(posA.lat - posB.lat, 2) + Math.pow(posA.lon - posB.lon, 2))

const fetchStops = () => {
  const now = new Date();
  return fetch(STRAETO_API, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      query: QUERY_STOPS,
      variables: {
        date: now.toISOString().slice(0, 10),
      }
    }),
  });
}

export default function Home() {
  let [currentPos, setCurrentPos] = useState<Coords>({lat: DEFAULT_LAT, lon: DEFAULT_LON});
  let [stops, setStops] = useState<Array<Stop>>([]);

  useEffect(() => {
    navigator.geolocation.watchPosition(pos => setCurrentPos({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
    }));
  }, [setCurrentPos]);

  useEffect(() => {
    fetchStops()
      .then(response => response.json())
      .then(stopsData => stopsData.data.GtfsStops.results.sort((a: Coords, b: Coords) => calcPos(a, currentPos) - calcPos(b, currentPos)))
      .then(setStops)
      .catch(e => console.error(e));
  }, [currentPos, setStops]);

  return (
    <main className={styles.main}>
      <div>Stops:</div>
      <ol>
        {stops.map(stop => (
          <li key={stop.id}>{stop.name}</li>
        ))}
      </ol>
    </main>
  )
}
