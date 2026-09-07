import { getCounts } from "../../api/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFlightProducts } from "../../Redux/AdminFlights/action";
import "./AdminDashboard.Module.css";


export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [flight, setFlight] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [users, setUsers] = useState(0);
  const [giftCard, setGiftCard] = useState(0);
  const [things, setThings] = useState(0);
 const [loading, setLoading] = useState(false);

  // One aggregation query per collection instead of downloading every document
  // just to read .length - 5 billed reads rather than ~350.
  const getHotel = () => {
    setLoading(true);
    getCounts()
      .then((counts) => {
        setFlight(counts.flights);
        setHotel(counts.hotels);
        setUsers(counts.users);
        setGiftCard(counts.giftcards);
        setThings(counts.thingsToDo);
      })
      .catch((err) => {
        console.error("dashboard counts failed", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getHotel();
  }, []);

  return (
    <>
      <div className="mainAdminLandingpage">
        <div className="adminSideBr">
          <h1><Link to={"/admin"}>Home</Link></h1>
          <h1><Link to={"/admin/adminflight"}>Add Flight</Link></h1>
          <h1><Link to={"/admin/adminstay"}>Add Stays</Link></h1>
          <h1><Link to={"/admin/products"}>All Flights</Link></h1>
          <h1><Link to={"/admin/hotels"}>All Hotels</Link></h1>
          <h1><Link to={"/"}>Log out</Link></h1>
        </div>
        <div className="mainBox">
          <div className="mainBoxHead">
            <h1>Admin Dashboard</h1>
            <hr />
            <hr />
            <hr />
          </div>
          <div className="DataBoxes">
            {/*  */}
            <div className="dataBx">
              <h1>Total Hotel</h1>
              {<h1>{hotel}</h1>}
              <Link to="/admin/hotels">View</Link>
            </div>
            <div className="dataBx">
              <h1>Total Flights</h1>
              {<h1>{flight}</h1>}
              <Link to="/admin/flights">View</Link>
            </div>
            <div className="dataBx">
              <h1>Total Users</h1>
              {<h1>{users}</h1>}
              <Link to="/admin">View</Link>
            </div>
            <div className="dataBx">
              <h1>Giftcards</h1>
              {<h1>{giftCard}</h1>}
              <Link to="/admin/giftcards">View</Link>
            </div>
            <div className="dataBx">
              <h1>Pakages Available</h1>
              {<h1>{things}</h1>}
              <Link to="/setThings">View</Link>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </>
  );
};
