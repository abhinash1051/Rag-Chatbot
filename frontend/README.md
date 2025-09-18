# NewsChat AI Frontend

This is the frontend application for NewsChat AI, a chatbot that can answer questions about the latest news using AI.

## Project Overview

NewsChat AI Frontend is a React-based web application that provides a user interface for interacting with the NewsChat AI backend. It allows users to ask questions about news topics and receive AI-generated responses based on the latest news articles.

## Features

- Real-time chat interface with typing animation
- Session management with localStorage persistence
- Connection status indicator
- Chat history retrieval
- Session reset functionality
- Responsive design

## Prerequisites

- Node.js (v14.0 or higher)
- npm (v6.0 or higher)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the frontend directory with the following configuration:

```env
# API URL for backend connection
REACT_APP_API_URL=http://localhost:8119/api/chat
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### `npm test`

Runs the test watcher in an interactive mode.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Project Structure

```
frontend/
├── public/           # Public assets
├── src/              # Source code
│   ├── components/   # React components
│   ├── styles/       # SCSS stylesheets
│   ├── App.js        # Main application component
│   └── index.js      # Entry point
├── .env              # Environment variables
├── package.json      # Project dependencies and scripts
└── README.md         # Project documentation
```

## Key Components

- **App.js**: Main application component with state management and API calls
- **ChatMessage.js**: Component for displaying individual chat messages
- **App.scss**: Main stylesheet for the application

## API Integration

The frontend communicates with the backend API using the following endpoints:

- `GET /health`: Check backend connection status
- `POST /message`: Send a message to the chatbot
- `GET /history/:sessionId`: Retrieve chat history for a specific session

## License

ISC