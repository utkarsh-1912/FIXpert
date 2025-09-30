
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

## Deployment

### Option 1: Deploying with Vercel (Recommended)

Vercel is the creator of Next.js and provides a seamless, one-click deployment experience.

1.  **Push to GitHub**: Make sure your project code is pushed to a GitHub repository.
2.  **Sign Up for Vercel**: Sign up for a free account at [vercel.com](https://vercel.com/signup) using your GitHub account.
3.  **Create a New Project**:
    *   From your Vercel dashboard, click "Add New..." and select "Project".
    *   Import the GitHub repository for your FIXpert project.
4.  **Configure the Project**:
    *   Vercel will automatically detect that it's a Next.js project.
    *   Expand the "Environment Variables" section and add your `GEMINI_API_KEY`.
5.  **Deploy**:
    *   Click "Deploy". Vercel will build and deploy your application, providing you with a public URL.

### Option 2: Deploying with Jenkins

For more control over your CI/CD process, you can use the included `Jenkinsfile`. This file defines a pipeline that tests and builds the application.

#### Jenkins Prerequisites
*   A running Jenkins instance.
*   Node.js installed on the Jenkins server (or agent).
*   The "Pipeline" plugin installed in Jenkins.
*   The "Credentials" plugin to securely manage your API key.

#### Jenkins Setup
1.  **Create Credentials**:
    *   In Jenkins, go to **Manage Jenkins > Credentials**.
    *   Add a new "Secret text" credential.
    *   Set the **ID** to `GEMINI_API_KEY` and the **Secret** to your actual Gemini API key. The `Jenkinsfile` is configured to use this ID.

2.  **Create a Pipeline Job**:
    *   Create a new "Pipeline" job in Jenkins.
    *   In the "Pipeline" section, select "Pipeline script from SCM".
    *   Choose "Git" as the SCM and enter your repository's URL.
    *   The "Script Path" should be `Jenkinsfile` (this is the default).

3.  **Run the Pipeline**:
    *   Save the job and click "Build Now".
    *   Jenkins will execute the stages defined in the `Jenkinsfile`: installing dependencies, linting, testing, and building the Next.js application.

#### Customizing the Deploy Stage
The provided `Jenkinsfile` includes a placeholder **Deploy** stage. You will need to customize this stage based on your hosting environment. Common deployment strategies include:
*   **Copying files to a server**: Use `scp` or `rsync` to transfer the `.next` directory, `public` directory, and `package.json` to your server, then run `npm start` using a process manager like `pm2`.
*   **Building a Docker container**: Create a `Dockerfile`, use the Jenkins pipeline to build and push the Docker image to a registry (like Docker Hub or GCR), and then deploy the container to your host.
