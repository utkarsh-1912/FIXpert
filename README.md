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

### Environment Variables

Before running the application, you need to set up your environment variables. Create a file named `.env` in the root of the project and add the following variables. You can use the `.env.example` file as a template.

```bash
# Firebase Configuration
# You can get these values from your Firebase project settings.
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"

# Google AI for Genkit
# Required for AI-powered features like the Interpreter and Visualizer.
GEMINI_API_KEY="your-gemini-api-key"
```

### Installation and Running the App

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
