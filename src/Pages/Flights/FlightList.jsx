import React, { useEffect } from "react";
import FlightCard from "./FlightCard";
import { listFlights } from "../../api/firestore";

const getData = (page, priceValue) =>
  listFlights({
    page,
    limit: 5,
    priceMin: priceValue - 2000,
    priceMax: priceValue,
  });

export default function FlightList({ page, priceValue }) {
  const [data, setData] = React.useState([]);

  useEffect(() => {
    getData(page, priceValue).then((res) => {
      setData(res);
    });
  }, [page, priceValue]);

  return (
    <div>
      {data.length > 0 &&
        data.map((item) => {
          return (
            <div key={item.id}>
              <FlightCard data={item} />
            </div>
          );
        })}
    </div>
  );
}
