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

# NewsChat AI Backend

This is the backend server for NewsChat AI, a chatbot that can answer questions about the latest news using AI and RAG (Retrieval-Augmented Generation) technology.

## Project Overview

NewsChat AI Backend is an Express.js server that provides API endpoints for the frontend application. It integrates with various AI services, including Google Gemini, for natural language processing and news analysis. The backend also implements a RAG pipeline to retrieve relevant news articles and use them to generate informative responses to user queries.

## Features

- RESTful API endpoints for chat functionality
- RAG pipeline for news retrieval and analysis
- Redis caching for chat history
- Periodic news data refresh (every 30 minutes)
- AI-powered response generation using Google Gemini
- CORS support for frontend integration

## Prerequisites

- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- Redis server
- Qdrant vector database
- API keys for Google Gemini and Jina AI

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the backend directory with the following configuration:

```env
# Environment
NODE_ENV=development
PORT=8119

# Redis configuration
REDIS_URL=redis://localhost:6379

# Qdrant vector database
QDRANT_URL=http://localhost:6333

# AI service API keys
GEMINI_API_KEY=your_gemini_api_key_here
JINA_API_KEY=your_jina_api_key_here
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Starts the server in production mode.

### `npm run dev`

Starts the server in development mode using nodemon for automatic restarts on file changes.

### `npm test`

Runs tests (currently a placeholder).

## Project Structure

```
backend/
├── src/               # Source code
│   ├── controllers/   # API controllers
│   ├── routes/        # Express routes
│   ├── services/      # Business logic and external integrations
│   ├── utils/         # Helper functions
│   └── index.js       # Entry point and server setup
├── .env               # Environment variables
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation
```

## API Endpoints

### Health Check

- **GET /api/chat/health**
  - Description: Check if the API is running
  - Response: `{ "status": "ok", "message": "Chat API is running" }`

### Chat Messages

- **POST /api/chat/message**
  - Description: Send a message to the chatbot and get a response
  - Request Body: `{ "sessionId": "string", "message": "string" }`
  - Response: `{ "sessionId": "string", "reply": "string", "history": [...] }`

### Chat History

- **GET /api/chat/history/:sessionId**
  - Description: Retrieve chat history for a specific session
  - Response: `{ "history": [...] }`

### Session Management

- **DELETE /api/chat/session/:sessionId**
  - Description: Clear chat history for a specific session
  - Response: `{ "success": true }`

## Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Redis**: Cache storage for chat history
- **Qdrant**: Vector database for news article embedding
- **Google Gemini**: AI model for generating responses
- **Jina AI**: News analysis service
- **Axios**: HTTP client for external API calls
- **CORS**: Cross-origin resource sharing

## RAG Pipeline

The RAG (Retrieval-Augmented Generation) pipeline is responsible for:

1. Fetching and processing the latest news articles
2. Generating vector embeddings for the articles
3. Storing the embeddings in Qdrant vector database
4. Retrieving relevant articles based on user queries
5. Using the retrieved articles to generate context-aware responses

The pipeline automatically refreshes the news data every 30 minutes to ensure the chatbot has access to the latest information.

## License

ISC
