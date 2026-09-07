import React, { useEffect } from "react";
import FlightCard from "./FlightCard";
import { listFlights } from "../../api/firestore";

// The sidebar's price radios are buckets in thousands of rupees, not amounts:
// "5" means 4000-5000, "6" 5000-6000, "7" 6000-7000, "8" 7000-8000. The
// upstream code sent the bucket straight through as a rupee value
// (price_lte=8), so the filter matched nothing - flights run 4210 to 8999.
const getData = (page, priceValue) => {
  const bucket = Number(priceValue) || 8;
  return listFlights({
    page,
    limit: 5,
    priceMin: (bucket - 1) * 1000,
    priceMax: bucket * 1000,
  });
};

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
