# QuestGenie

Your AI-powered study assistant that transforms your course PDFs into smart quizzes. Upload any coursebook, and our AI automatically generates MCQs, SAQs, and LAQs tailored to your syllabus. Track your progress, save your answers, and prepare smarter with personalized assessments — all in one place.

## How It Was Built

This project is a full-stack application with a React frontend and a Node.js backend.

### Frontend (`quest-genie`)

- **Framework:** React (built with Create React App)
- **Styling:** Tailwind CSS for a modern, responsive UI.
- **Key Libraries:**
  - `react-markdown` & `remark-gfm`: To render markdown content, especially for formatted questions and answers from the AI.
  - `pdfjs-dist`: For handling PDF rendering directly in the browser.
  - `recharts`: For data visualization components, intended for progress tracking.
  - `react-icons`: For a rich set of icons used throughout the application.

### Backend (`server`)

- **Framework:** Node.js with Express.
- **Core Functionality:**
  - **PDF Processing:** Uses `pdf-parse` to extract text content from uploaded PDF files.
  - **AI Integration:** Leverages the Google Gemini API (`@google/generative-ai`) for AI-powered question generation.
  - **API:** A RESTful API built with Express to handle file uploads (using `multer`), process data, and serve the generated questions.
  - **Real-time Chat:** Implements a chat interface with real-time streaming responses using Server-Sent Events (SSE).
- **Key Dependencies:**
  - `express`: Web server framework.
  - `cors`: To handle cross-origin requests from the frontend.
  - `dotenv`: To manage environment variables like API keys.
  - `multer`: Middleware for handling `multipart/form-data`, used for file uploads.

## Setup

### Prerequisites

- Node.js (v18 or higher is recommended)
- npm (or yarn)

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
4.  Open the new `.env` file and add your Google Gemini API key:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### Frontend Setup

1.  Navigate to the `quest-genie` (frontend) directory:
    ```bash
    cd quest-genie
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  The frontend is pre-configured to connect to the backend at `http://localhost:5000` via the `REACT_APP_BACKEND_URL` variable in the `.env` file. No changes are needed if you run the backend on its default port.

## How to Run

1.  **Start the Backend Server:**
    From the `server` directory, run the development server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000` (or the port specified in your `server/.env` file).

2.  **Start the Frontend Application:**
    In a separate terminal, from the `quest-genie` directory, run the React development server:
    ```bash
    npm start
    ```
    The application will automatically open in your default web browser at `http://localhost:3000`.

## What's Done

### Must-Have Features

- **Source Selector & PDF Upload:** Users can upload their own PDF coursebooks. The UI includes components for selecting and managing these sources.
- **PDF Viewer:** A split-view or tabbed interface displays the selected PDF alongside the main interaction area (chat or quiz).
- **Quiz Generator Engine:**
  - The backend generates MCQs, SAQs, and LAQs from the content of uploaded PDFs.
  - The frontend renders the generated quizzes and allows users to select answers.
  - A "Generate New Quiz" feature is implicitly available by re-uploading or re-selecting a document.
- **Progress Tracking (UI):** A dashboard component exists to visualize the user's learning journey, though it is not yet connected to a persistent data store.

### Nice-to-Have Features

- **Chat UI (ChatGPT-inspired):**
  - A fully functional chat interface acts as a virtual teaching companion.
  - The layout includes a left drawer for chat history, a main chat window, and an input box.
  - The design is clean, modern, and mobile-responsive.
  - The backend supports real-time streaming of AI responses to the chat UI.

## What's Missing

- **Provide Explanations:** The application does not yet provide explanations for answers. This requires database integration.
- **Persistent Progress Tracking:** The dashboard for tracking strengths and weaknesses is a UI placeholder. It needs a backend persistence layer (a database) to store and retrieve user performance data across sessions.
- **Use AI for Validation** The application does not have feature to validate answers with an api call to ai, if validates the answer in frontend only.

## Use of LLM Tools

## 🧠 Use of LLM Tools

Yes, this project integrates multiple AI tools and Large Language Models (LLMs) for both development and in-app intelligence.

- **🧩 Google Gemini:**  
  Integrated directly into the app to power AI assistance — including question generation, YouTube topic suggestions, and real-time conversational support.

- **🤖 OpenAI GPT:**  
  Used during the planning and development phases to design the app’s architecture, plan folder structures, and generate boilerplate code efficiently.

- **⚙️ GitHub Copilot:**  
  Helped accelerate early-stage development and code completion during the base setup.

- **🧑‍💻 Cline IDE (Gemini Free Tier Mode):**  
  Actively used for coding, debugging, and integrating AI features during the build process.

  Overall, this app is powered by the combined strength of **ChatGPT** and **Gemini**, utilizing the best of both ecosystems for intelligent functionality and streamlined development.

- **Model Used In App:** Google Gemini, specifically the `gemini-2.5-pro` model, via the `@google/generative-ai` SDK.
- **Purposes:**
  1.  **Question Generation:** The Gemini model is prompted with text chunks from the uploaded PDFs to generate contextually relevant questions (MCQs, SAQs, and LAQs). The prompts are engineered to request specific formats for easy parsing.
  2.  **YouTube Video Topic Generation:** The model analyzes the PDF content to suggest relevant topics and optimized search queries for finding educational videos on YouTube.
  3.  **Conversational AI:** The model acts as a backend for the real-time chat feature, providing streaming answers to user questions related to their study material.

## 🚀 How to Use

The app is divided into **three main tabs** — each serving a unique purpose in your learning journey.

  ### 🏠 1. Dashboard
  - View your **learning journey** and overall **progress**.
  - Track your **quiz history**, **results**, and **performance insights**.
  - Helps you monitor how your understanding improves over time.

  ### 💬 2. Chats
  - A **chat interface powered by AI (SSE implemented)** for real-time responses.
  - Create new chats anytime and ask questions related to your study materials.
  - Works just like a traditional chat app — fast, interactive, and context-aware.
  - Use trash icon in the chat history items to delte a chat.

  ### 🧪 3. AI Quiz Lab
  This is the core feature of the app — your personalized AI learning lab.

  - Upload your **PDF coursebooks or notes** using the **Upload PDF** button (top-right corner).  
  - Once uploaded, click **Generate Quiz** to create questions (MCQs, SAQs, LAQs) using AI.  
  - Answer the generated questions and **submit** to instantly **view your score**.  
  - You can **re-attempt the quiz** or use the **Show Answers** option for review and learning.  
  - The **right panel** includes:
    - A **PDF preview**, so you can read your study material alongside the quiz.  
    - **YouTube video suggestions** automatically generated from your uploaded content.
  - Use trash icon in the source list items to delte a chat.

  ---

  With these three tabs, the app provides a complete AI-assisted study experience — helping you **learn, test, and improve** all in one place.

