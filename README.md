# Expedia Clone

A React + Redux travel booking web app inspired by Expedia. Users can search and browse hotels, flights, and things to do, manage a cart, and sign in via phone number + OTP (Firebase Authentication). Includes a basic admin panel for managing listings.

This project was built for **SE 3290 – Software Project Management (Fall 2026)** as the "Prelude Project," using an existing open-source codebase as the vehicle for practicing full project lifecycle management: setup, deployment, debugging, and documentation.

## Features

**User**
- Landing page
- Sign up / sign in via phone number + OTP (Firebase Authentication)
- Browse and search hotels, flights, and things to do
- Sort and filter results (by price, rating)
- Add items to cart
- Book flights and hotels

**Admin**
- Manage hotel listings
- View bookings and user data
- Oversee cart and transaction activity

## Tech Stack

- **Frontend:** React, Redux (with Redux Thunk), React Router, Chakra UI
- **Auth:** Firebase Authentication (Phone/OTP)
- **Mock Backend / Data:** [json-server](https://github.com/typicode/json-server) serving `db.json` (hotels, flights, users, things to do)
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- A [Firebase](https://console.firebase.google.com/) account (free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Expedia-clone.git
cd Expedia-clone
```

### 2. Install dependencies

```bash
npm install
```

This project also relies on `json-server` for local mock data. It's used at a pinned older version (`0.17.4`) because the current major version of json-server changed its pagination response format in a way this app doesn't expect:

```bash
npm install json-server@0.17.4 --save-dev
```

### 3. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under **Build > Authentication**, enable **Phone** as a sign-in method.
3. Under **Project Settings > General > Your apps**, register a new Web app and copy the config object.
4. Paste your config into `src/firebase.js` (or the equivalent config file), replacing the placeholder values.

> Note: Phone/OTP auth requires reCAPTCHA, which Firebase sets up automatically for web apps. Sending real SMS messages in production requires Firebase's Blaze (pay-as-you-go) plan.

### 4. Run the app locally

This app needs **two processes running simultaneously** in separate terminals:

**Terminal 1 — mock data server:**
```bash
npm run server
```
Starts `json-server` on `http://localhost:8080`, serving hotel/flight/user data from `db.json`.

**Terminal 2 — React app:**
```bash
npm start
```
Opens the app at `http://localhost:3000`.

## Known Limitations

- "Cars" and "Things To Do" sections exist in the codebase but are outside the scope of this assignment and have not been fully verified.
- Some ESLint warnings remain (unused variables, missing `useEffect` dependencies) — these do not affect functionality but are noted for future cleanup.
- The original codebase pointed to a now-defunct hosted backend (`cyclic.app`); all API calls have been redirected to the local `json-server` instance for this deployment.

## Deployment

This project can be deployed to a cloud host such as [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Connect the repo to Vercel.
3. Add your Firebase config as environment variables in the Vercel project settings.
4. Deploy, then verify authentication, search, and booking work on the live URL.

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add: description of your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes.

Please keep pull requests focused on a single feature or fix, and describe any manual testing you performed (e.g., "tested sign-in flow with a real phone number").

## License

This project is for educational purposes as part of a university course assignment.
