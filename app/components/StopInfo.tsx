import { BusLocationArrival } from "../types";

type StopInfoProps = {
  stopName: string,
  arrivals: Array<BusLocationArrival> | undefined,
};

type ArrivalEntry = [string, Array<number>];

export function StopInfo({ stopName, arrivals }: StopInfoProps) {
  const arrivalsGrouped = new Map<string, Array<number>>();
  arrivals && arrivals.forEach(arrival => {
    const key = `${arrival.routeNr} ${arrival.headsign}`;
    const val = arrivalsGrouped.get(key) || [];
    val.push(arrival.waitingTime);
    arrivalsGrouped.set(key, val);
  });

  // TODO typing
  const arrivalEntries: Array<ArrivalEntry> = [...arrivalsGrouped.entries()];
  const sortedArrivals = arrivalEntries.toSorted(
    (a: ArrivalEntry, b: ArrivalEntry) => Math.min(...a[1]) - Math.min(...b[1])
  );

  return <>
    <div>{stopName}</div>
    {sortedArrivals.map(([key, times]) => (
      <div key={key}>{key}: {times.map(time => <span key={`${key}-${time}`}>{time}mín</span>)}</div>
    ))}
  </>;
}