
# FIXpert - The Ultimate FIX Protocol Toolkit for Financial Engineers

FIXpert is a comprehensive, AI-powered Next.js application designed to be an indispensable toolkit for financial engineers, developers, and QA testers working with the Financial Information eXchange (FIX) protocol. From decoding complex messages to visualizing entire workflows, FIXpert streamlines your development process and enhances your understanding of FIX.

## Key Features

FIXpert offers a suite of powerful, intuitive tools to handle all aspects of FIX message processing:

-   **AI-Powered Interpreter**: Decode raw, pipe-separated FIX messages instantly. The AI provides a human-readable breakdown of each tag, including its name, value, and meaning, along with a summary of the message's purpose.
-   **Log Analyzer**: Parse, filter, and analyze large FIX log files. Quickly identify message types, senders, and targets, and use the powerful filter to zero in on the exact messages you need.
-   **Log Processor**: Merge and sort multiple log files chronologically. Upload several files, and the processor will intelligently combine them into a single, time-sorted log, ready for analysis or download.
-   **Message Comparator**: Perform a side-by-side, field-level comparison of two FIX messages or entire message sets. Differences are highlighted, making it easy to spot discrepancies.
-   **FIX-to-XML Formatter**: Convert raw, pipe-separated FIX messages into a clean, well-structured XML format, perfect for documentation, sharing, or further processing.
-   **AI-Powered Workflow Visualizer**: Generate clear, interactive flowcharts from plain English descriptions of trading scenarios. You can also build diagrams manually or by writing MermaidJS syntax.
-   **Symbol Search**: Look up real-time trading symbols from Yahoo Finance. Find stocks, currencies, and other assets by ticker or name.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

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
