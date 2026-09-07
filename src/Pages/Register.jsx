import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import firebase_app from "../01_firebase/config_firebase";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, userRigister } from "../Redux/Authantication/auth.action";
import Navbar from "../Components/Navbar";

const auth = getAuth(firebase_app);
const state = {
  number: "",
  otp: "",
  user_name: "",
  password: "",
  verify: false,
  otpVerify: false,
};

export const Register = () => {
  const [check, setCheck] = useState(state);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let exist = false;
  const { number, otp, verify, otpVerify, user_name, password } = check;

  // store value and getting user to check if the number is exist or not
  const { user, isLoading } = useSelector((store) => {
    return {
      user: store.LoginReducer.user,
      isLoading: store.LoginReducer.isLoading,
    };
  });

  //  check if the user is exist of not
  for (let i = 0; i <= user.length - 1; i++) {
    if (user[i].number === number) {
      exist = true;
      break;
    }
  }

  //  capture
  const handleRegisterUser = async () => {
    let newObj = {
      number,
      user_name,
      password,
      email: "",
      dob: "",
      gender: "",
      marital_status: null,
    };
    // Wait for the Firestore write to land before reloading the page. Navigating
    // first can abort the in-flight request and silently drop the registration.
    try {
      await dispatch(userRigister(newObj));
    } catch (err) {
      console.error("registration failed", err);
    }
    setCheck(state);
    window.location = "/login";
  };

  // oonCapture
  // Tear down any previous verifier before building a new one.
  //
  // window.recaptchaVerifier outlives this component: it survives navigating
  // between /login and /register and any remount, but the #recaptcha-container
  // div it rendered into does not. Reusing a verifier whose container has been
  // replaced throws "reCAPTCHA has already been rendered in this element", so
  // caching it was not enough - it has to be cleared and rebuilt each time, and
  // the container emptied, because grecaptcha can leave nodes behind.
  function resetCaptcha() {
    try {
      window.recaptchaVerifier?.clear?.();
    } catch (e) {
      /* already torn down */
    }
    window.recaptchaVerifier = null;
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";
  }

  function onCapture() {
    resetCaptcha();
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
    return window.recaptchaVerifier;
  }

  //   Verify button
  function handleVerifyNumber() {
    document.querySelector("#nextButton").innerText = "Please wait...";
    const countryCode = process.env.REACT_APP_PHONE_COUNTRY_CODE || "+1";
    const phoneNumber = `${countryCode}${number}`;
    if (number.length === 10) {
      if (exist) {
        document.querySelector("#nextButton").innerText = "Next";
        document.querySelector("#loginMesageError").innerHTML =
          "That number is already registered - use Sign In instead.";
        document.querySelector("#loginMesageSuccess").innerHTML = ``;
      } else {
        const appVerifier = onCapture();
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            setCheck({ ...check, verify: true });
            document.querySelector(
              "#loginMesageSuccess"
            ).innerHTML = `Otp Send To ${number} !`;
            document.querySelector("#loginMesageError").innerHTML = "";
            document.querySelector("#nextButton").style.display = "none";
            // ...
          })
          .catch((error) => {
            console.error("OTP send failed", error);
            resetCaptcha();
            const btn = document.querySelector("#nextButton");
            if (btn) btn.innerText = "Next";
            document.querySelector("#loginMesageSuccess").innerHTML = "";
            document.querySelector("#loginMesageError").innerHTML =
              "Could not send code: " + (error?.code || error?.message || "unknown error");
            // Error; SMS not sent
            // document.querySelector("#nextButton").innerText = 'Server Error'
            // ...
          });
      }
      //
    } else {
      document.querySelector("#nextButton").innerText = "Next";
      document.querySelector("#loginMesageSuccess").innerHTML = ``;
      document.querySelector("#loginMesageError").innerHTML =
        "Enter a 10-digit number, digits only (no +1, no dashes).";
    }
  }

  // if the code is verifyed
  function verifyCode() {
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        setCheck({ ...check, otpVerify: true });
        document.querySelector(
          "#loginMesageSuccess"
        ).innerHTML = `Verifyed Successful`;
        document.querySelector("#loginMesageError").innerHTML = "";
        document.querySelector("#loginNumber").style.display = "none";
        document.querySelector("#loginOtp").style.display = "none";
        // ...
      })
      .catch((error) => {
        // User couldn't sign in (bad verification code?)
        document.querySelector("#loginMesageSuccess").innerHTML = ``;
        document.querySelector("#loginMesageError").innerHTML = "Invalid OTP";
        // ...
      });
  }

  // setting the typed value to the input state
  const handleChangeMobile = (e) => {
    let val = e.target.value;
    setCheck({ ...check, [e.target.name]: val });
  };

  useEffect(() => {
    dispatch(fetch_users);
    // Leaving this page invalidates the rendered widget.
    return () => resetCaptcha();
  }, []);

  return (
    <>
      <div className="mainLogin">
        <div id="recaptcha-container"></div>
        <div className="loginBx">
        <div className="logoImgdivReg"><img className="imglogoReg" src="https://i.postimg.cc/QxksRNkQ/expedio-Logo.jpg':'https://i.postimg.cc/fRx4D7QH/logo3.png" alt="" /></div>

          <div className="loginHead">
          <hr /><hr /><hr />

            <h1>Register</h1>
          </div>
          
          <div className="loginInputB" id="loginNumber">
            <label htmlFor="">Enter Your Number</label>
            <span>
              <input
                type="number"
                readOnly={verify}
                name="number"
                value={number}
                onChange={(e) => handleChangeMobile(e)}
                placeholder="Number"
              />
              <button
                disabled={verify}
                onClick={handleVerifyNumber}
                id="nextButton"
              >
                Next
              </button>
            </span>
          </div>
          {verify ? (
            <div className="loginInputB" id="loginOtp">
              <label htmlFor="">Enter OTP</label>
              <span>
                <input
                  type="number"
                  name="otp"
                  value={otp}
                  onChange={(e) => handleChangeMobile(e)}
                />
                <button onClick={verifyCode}>Next</button>
              </span>
            </div>
          ) : (
            ""
          )}

          {otpVerify ? (
            <>
              <div className="loginInputB">
                <label htmlFor="">Enter Your Full name</label>
                <span>
                  <input
                    type="text"
                    name="user_name"
                    value={user_name}
                    onChange={(e) => handleChangeMobile(e)}
                  />
                </span>
              </div>
              <div className="loginInputB">
                <label htmlFor="">Your Password</label>
                <span>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => handleChangeMobile(e)}
                  />
                </span>
              </div>
              <div className="loginInputB">
                <button onClick={handleRegisterUser}>Continue</button>
              </div>
            </>
          ) : (
            ""
          )}

          {isLoading ? <h1>Please wait...</h1> : ""}

          <div className="loginTerms">
          <div className="inpChecbx"><input className="inp" type="checkbox" /> <h2>Keep me signed in</h2></div>
            <p>Selecting this checkbox will keep you signed into your account on this device until you sign out. Do not select this on shared devices.</p>
            <h6>By signing in, I agree to the Expedia <span> Terms and Conditions</span>, <span>Privacy Statement</span> and <span>Expedia Rewards Terms and Conditions</span>.</h6>
          </div>
          <br />
          <h3 id="loginMesageError"></h3>
          <h3 id="loginMesageSuccess"></h3>
        </div>
      </div>
    </>
  );
};
