import { createFlight, listFlights, deleteFlight } from "../../api/firestore";
import {
  DELETE_FLIGHTS,
  FETCH_FLIGHTS,
  FLIGHT_FAILURE,
  FLIGHT_REQUEST,
  GET_FLIGHT_SUCCESS,
  POST_FLIGHT_SUCCESS,
} from "./actionType";

export const getFlightSuccess = (payload) => {
  return { type: GET_FLIGHT_SUCCESS, payload };
};

export const postFlightSuccess = (payload) => {
  return { type: POST_FLIGHT_SUCCESS };
};

export const flightRequest = () => {
  return { type: FLIGHT_REQUEST };
};

export const flightFailure = () => {
  return { type: FLIGHT_FAILURE };
};

//
export const fetch_flights_product = (payload) => {
  return { type: FETCH_FLIGHTS, payload };
};
//
export const handleDeleteProduct = (payload) => {
  return { type: DELETE_FLIGHTS, payload };
};

export const addFlight = (payload) => (dispatch) => {
  dispatch(flightRequest());

  createFlight(payload)
    .then(() => {
      dispatch(postFlightSuccess());
    })
    .catch((err) => {
      console.error("add flight failed", err);
      dispatch(flightFailure());
    });
};

//
export const fetchFlightProducts = (limit) => (dispatch) => {
  dispatch(flightRequest());
  listFlights({ limit })
    .then((flights) => {
      dispatch(fetch_flights_product(flights));
    })
    .catch((err) => {
      console.error("fetch flights failed", err);
      dispatch(flightFailure());
    });
};

export const DeleteFlightProducts = (deleteId) => async (dispatch) => {
  try {
    await deleteFlight(deleteId);
    dispatch(handleDeleteProduct(deleteId));
  } catch (e) {
    console.log(e);
  }
};
