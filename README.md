# FIXpert - FIX Protocol Toolkit

FIXpert is a comprehensive Next.js application designed to provide a suite of tools for financial engineers and developers working with the Financial Information eXchange (FIX) protocol.

## Features

- **Interpreter**: Decode and understand raw, pipe-separated FIX messages.
- **Log Analyzer**: Parse, filter, and analyze FIX log files.
- **Log Processor**: Merge and sort multiple log files by timestamp.
- **Comparator**: Perform a side-by-side comparison of two FIX messages.
- **Formatter**: Convert raw FIX messages into a readable XML format.
- **Workflow Visualizer**: Generate flowcharts from FIX scenario descriptions using AI.
- **Symbol Search**: Look up real-time trading symbols.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Configure Firebase

Before running the application, you need to configure your Firebase credentials.

Open the file `src/lib/firebase.ts` and replace the placeholder values with your actual Firebase project configuration. You can get these values from your Firebase project settings.

```typescript
// src/lib/firebase.ts

const firebaseConfig = {
  apiKey: "your-api-key", // Replace with your API Key
  authDomain: "your-auth-domain", // Replace with your Auth Domain
  projectId: "your-project-id", // Replace with your Project ID
  appId: "your-app-id", // Replace with your App ID
};
```

### 2. Set Up Environment Variables

Some features, like the AI-powered Interpreter and Visualizer, require an API key for Google's Gemini models. Create a file named `.env` in the root of the project and add the following variable:

```bash
# .env
# Required for AI-powered features like the Interpreter and Visualizer.
GEMINI_API_KEY="your-gemini-api-key"
```

You can get a Gemini API key from Google AI Studio.

### 3. Installation and Running the App

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
