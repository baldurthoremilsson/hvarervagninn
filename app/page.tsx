"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react';

const STRAETO_API = "https://straeto.is/graphql"

const DEFAULT_LAT = 64.143303656234;
const DEFAULT_LON = -21.9146771540298;

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
    let params = new URLSearchParams({
      operationName: "Stops",
      variables: JSON.stringify({}),
      extensions: JSON.stringify({"persistedQuery":{"version":1,"sha256Hash":"f08f0d5961220e45de84d6d2b77a6e21de36e37066d510fa6c0d6f1ce145a82f"}}),
    })
    fetch(`${STRAETO_API}?` + params, {
      headers: {"Content-Type": "application/json"}
    })
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
