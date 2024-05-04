import { BusLocationArrival } from "../types";
import styles from "./StopInfo.module.css";

type StopInfoProps = {
  stopName: string,
  arrivals: BusLocationArrival[] | undefined,
  isFavorite: boolean,
  toggleFavorite: () => void,
};

type ArrivalInfo = {
  key: string,
  routeNr: string,
  headsign: string,
  arrivals: BusLocationArrival[],
};

function ArrivalInfo({ info }: { info: ArrivalInfo}) {
  let timestamp = null;
  if(info.arrivals.length > 0) {
    timestamp = <span className={styles.waitingTime}>{info.arrivals[0].waitingTime} mín.</span>
  }
  return <div className={`${styles.arrivalInfo} route-${info.routeNr}`}>
    <span className={styles.routeNumber}>{info.routeNr}</span>
    <span className={styles.routeArrow}>→</span>
    <span className={styles.routeHeadsign}>{info.headsign}</span>
    {timestamp}
    {info.arrivals.map(busLocationArrival => (
      <span key={`${info.key}-${busLocationArrival.arrival}`} className={styles.arrivalTime}>{busLocationArrival.arrival}</span>
    ))}
  </div>;
}

export function StopInfo({ stopName, arrivals, isFavorite, toggleFavorite }: StopInfoProps) {
  const arrivalsGrouped = new Map<string, ArrivalInfo>();
  arrivals && arrivals.forEach(arrival => {
    const key = `${arrival.routeNr} ${arrival.headsign}`;
    const val = arrivalsGrouped.get(key) || {
      key,
      routeNr: arrival.routeNr,
      headsign: arrival.headsign,
      arrivals: [],
    };
    val.arrivals.push(arrival);
    arrivalsGrouped.set(key, val);
  });

  const arrivalInfos: ArrivalInfo[] = [...arrivalsGrouped.values()];
  const sortedArrivals = arrivalInfos.toSorted((a: ArrivalInfo, b: ArrivalInfo) => {
    const keyA = `${a.routeNr} ${a.headsign}`;
    const keyB = `${b.routeNr} ${b.headsign}`;
    return keyA < keyB ? -1 : 1;
  });

  return <div className={styles.stopInfo}>
    <div className={styles.stopName}>{stopName} <span onClick={toggleFavorite}>{isFavorite ? "★" : "☆"}</span></div>
    {sortedArrivals.map(info => <ArrivalInfo key={info.key} info={info} />)}
  </div>;
}