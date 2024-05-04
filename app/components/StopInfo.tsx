import { BusLocationArrival } from "../types";
import styles from "./StopInfo.module.css";

type StopInfoProps = {
  stopName: string,
  arrivals: Array<BusLocationArrival> | undefined,
  isFavorite: boolean,
  toggleFavorite: () => void,
};

type ArrivalEntry = [string, Array<number>];

export function StopInfo({ stopName, arrivals, isFavorite, toggleFavorite }: StopInfoProps) {
  const arrivalsGrouped = new Map<string, Array<number>>();
  arrivals && arrivals.forEach(arrival => {
    const key = `${arrival.routeNr} ${arrival.headsign}`;
    const val = arrivalsGrouped.get(key) || [];
    val.push(arrival.waitingTime);
    arrivalsGrouped.set(key, val);
  });

  const arrivalEntries: Array<ArrivalEntry> = [...arrivalsGrouped.entries()];
  const sortedArrivals = arrivalEntries.toSorted(
    (a: ArrivalEntry, b: ArrivalEntry) => Math.min(...a[1]) - Math.min(...b[1])
  );

  return <>
    <div className={styles.stopName}>{stopName} <span onClick={toggleFavorite}>{isFavorite ? "★" : "☆"}</span></div>
    {sortedArrivals.map(([route, times]) => (
      <div key={route}><span className={styles.route}>{route}</span> {times.map(time => (
        <span key={`${route}-${time}`} className={styles.time}>{time}mín</span>
      ))}</div>
    ))}
  </>;
}