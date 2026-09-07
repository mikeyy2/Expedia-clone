import { createHotel, listHotels, deleteHotel } from "../../api/firestore";
import {
  SELECTED_DATE_AND_CITY,
  SELECTED_CITY,
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

//Pick date and city for storing into redux store

export const selectDateAndCity = (checkInDate,checkOutDate) => {
  return { type: SELECTED_DATE_AND_CITY, payload: { checkInDate, checkOutDate } };
};
export const selectCity = (selectedCity) => {
  return { type: SELECTED_CITY, payload: { selectedCity } };
};

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

// Browse hotels, 20 per page, optionally sorted.
export const fetchingHotels = (sort, order, page) => async (dispatch) => {
  dispatch({ type: HOTEL_REQUEST });
  try {
    const hotels = await listHotels({ sort, order, page, limit: 20 });
    dispatch({ type: GET_HOTEL_SUCCESS, payload: hotels });
  } catch (err) {
    dispatch({ type: HOTEL_FAILURE });
    console.error("fetch hotels failed", err);
  }
};





//

export const DeleteHotel = (deleteId) => async (dispatch) => {
  try {
    await deleteHotel(deleteId);
    dispatch(handleDeleteHotel(deleteId));
  } catch (e) {
    console.log(e);
  }
};