import { createHotel, listHotels, deleteHotel } from "../../api/firestore";
import {
  HOTEL_FAILURE,
  HOTEL_REQUEST,
  GET_HOTEL_SUCCESS,
  POST_HOTEL_SUCCESS,
  NEW_GET_HOTELS_SUCCESS,
  DELETE_HOTEL,
} from "./actionType";

export const getHotelSuccess = (payload) => {
  return { type: GET_HOTEL_SUCCESS, payload };
};

export const postHotelSuccess = (payload) => {
  return { type: POST_HOTEL_SUCCESS };
};

export const hotelRequest = () => {
  return { type: HOTEL_REQUEST };
};

export const hotelFailure = () => {
  return { type: HOTEL_FAILURE };
};

export const fetch_hotel = (payload) => {
  return { type: NEW_GET_HOTELS_SUCCESS, payload };
};

//
export const handleDeleteHotel = (payload) => {
  return { type: DELETE_HOTEL, payload };
};

//

export const addHotel = (payload) => (dispatch) => {
  dispatch(hotelRequest());

  createHotel(payload)
    .then(() => {
      dispatch(postHotelSuccess());
    })
    .catch((err) => {
      console.error("add hotel failed", err);
      dispatch(hotelFailure());
    });
};

export const fetchingHotels = (limit) => (dispatch) => {
  listHotels({ limit })
    .then((hotels) => {
      dispatch(fetch_hotel(hotels));
    })
    .catch((err) => {
      console.log(err);
    });
};

export const DeleteHotel = (deleteId) => async (dispatch) => {
  try {
    await deleteHotel(deleteId);
    dispatch(handleDeleteHotel(deleteId));
  } catch (e) {
    console.log(e);
  }
};
