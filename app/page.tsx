"use client"

import styles from './page.module.css'
import { useCallback, useEffect, useState } from 'react';
import { fetchBusLocationByStop, fetchStops } from './queries';
import { sortByDistance, getLocalStorage, setLocalStorage } from './utils';
import { Coords, Stop, BusLocationArrival } from './types';
import { StopInfo } from './components/StopInfo';

const DEFAULT_LAT = 64.143303656234;
const DEFAULT_LON = -21.9146771540298;
const DEFAULT_NUMBER_OF_STOPS = 5;
const FETCH_BUS_LOCATION_BY_STOP_TIMEOUT = 30 * 1000; // 30 seconds
const FAVORITE_STOPS_KEY = "FAVORITE_STOPS_KEY_1";

export default function Home() {
  let [currentPos, setCurrentPos] = useState<Coords>({lat: DEFAULT_LAT, lon: DEFAULT_LON});
  let [stops, setStops] = useState<Array<Stop>>([]);
  let [sortedStops, setSortedStops] = useState<Array<Stop>>([]);
  let [numberOfStops, setNumberOfStops] = useState<number>(DEFAULT_NUMBER_OF_STOPS);
  let [arrivals, setArrivals] = useState<Map<number, Array<BusLocationArrival>>>(new Map());
  let [favoriteIds, setFavoriteIds] = useState<Set<number>>(
    new Set(getLocalStorage(FAVORITE_STOPS_KEY, []))
  );

  useEffect(() => {
    navigator.geolocation.watchPosition(pos => setCurrentPos({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
    }));
  }, []);

  useEffect(() => {
    fetchStops()
      .then(setStops)
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    setNumberOfStops(current => Math.max(current, favoriteIds.size, DEFAULT_NUMBER_OF_STOPS));
  }, [favoriteIds]);

  useEffect(() => {
    if(stops !== undefined) {
      const favoriteStops = stops
        .filter(stop => favoriteIds.has(stop.id))
        .toSorted(sortByDistance(currentPos));
      const otherStops = stops
        .filter(stop => !favoriteIds.has(stop.id))
        .toSorted(sortByDistance(currentPos));
      
      const stopsSorted = [
        ...favoriteStops,
        ...otherStops.slice(0, numberOfStops-favoriteStops.length)
      ];
      setSortedStops(stopsSorted);
    }
  }, [currentPos, stops, favoriteIds, numberOfStops]);

  const updateArrivals = useCallback((busLocationByStop: any) => {
    const stopId = busLocationByStop.stop.id;
    setArrivals(arrivals => new Map(arrivals.set(stopId, busLocationByStop.arrivals)));
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    let stopsToFetch = new Array(...sortedStops);

    const fetchNext = () => {
      const nextStop = stopsToFetch.pop();
      if(nextStop === undefined) {
        stopsToFetch = new Array(...sortedStops);
        timeout = setTimeout(fetchNext, FETCH_BUS_LOCATION_BY_STOP_TIMEOUT);
      } else {
        fetchBusLocationByStop(nextStop.id.toString())
          .then(updateArrivals)
          .catch(e => console.error(e))
          .finally(fetchNext);
      }
    }
    fetchNext();

    return () => clearTimeout(timeout);
  }, [sortedStops, updateArrivals]);

  const increaseNumberOfStops = useCallback(() => {
    setNumberOfStops(num => num + DEFAULT_NUMBER_OF_STOPS);
  }, []);

  const toggleFavorite = useCallback((stopId: number) => {
    setFavoriteIds(ids => {
      const updatedIds = new Set(ids);
      if(ids.has(stopId)) {
        updatedIds.delete(stopId);
      } else {
        updatedIds.add(stopId);
      }
      setLocalStorage(FAVORITE_STOPS_KEY, [...updatedIds]);
      return updatedIds;
    })
  }, []);

  return (
    <main className={styles.main}>
      <ol>
        {sortedStops.map(stop => (
          <li key={stop.id}>
            <StopInfo
              stopName={stop.name}
              arrivals={arrivals.get(stop.id)}
              isFavorite={favoriteIds.has(stop.id)}
              toggleFavorite={() => toggleFavorite(stop.id)}
            />
          </li>
        ))}
      </ol>
      <button onClick={increaseNumberOfStops}>Sýna fleiri</button>
    </main>
  )
}
