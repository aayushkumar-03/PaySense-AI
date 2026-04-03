# PaySense AI 🚀 

**PaySense AI** is a next-generation, AI-powered conversational financial copilot tailored for modern digital users. It combines complete transactional visibility with intelligent, proactive insights powered by Google Generative AI (Gemini 1.5 Flash) and specialized RAG methodologies using Pinecone vector databases.

Designed specifically with culturally contextual awareness (seamlessly supporting English, Hindi, and Hinglish), PaySense AI actively empowers individuals to understand their money better—guiding users on budget tracking, SIP investment suggestions, EMI calculation, and fraud alert detection.

## ✨ Key Features

- **Conversational Financial Copilot:** Ask questions about your spending, loans, or investment strategies natively using Hinglish or regional languages via our conversational Gemini AI integration.
- **AI-Powered Spend Analysis:** See a real-time auto-categorized overview of your total spent, remaining budgets, and trends via dynamically generated UI dashboards.
- **Credit Coaching & Planning:** Personalized tips on maintaining or improving credit scores based on historic utilization data.
- **Automated Fraud & Anomaly Detection:** Proactive flagging of suspicious transactions directly into your Alerts feed.
- **RAG-Backed Knowledge Base:** Advanced financial knowledge retrieval (via Pinecone + multi-lingual e5 embeddings) grounding the AI responses with reliable macroeconomic & investing data.
- **Enterprise-Grade Security:** Fast and secure authentication powered by Firebase (OAuth & phone verification).

## 🛠 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling & Animations:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Charts:** [Recharts](https://recharts.org/)
- **Routing:** React Router v7

### Backend
- **Server:** Node.js Express Server
- **Database:** PostgreSQL (pg pool) for transactional state logic.
- **Vector Database:** [Pinecone](https://www.pinecone.io/) for RAG functionality.
- **AI Integration:** [Google Generative AI SDK](https://ai.google.dev/) (Gemini 1.5 Flash).

### Auth & Cloud
- **Firebase Authentication:** Seamless integration via Client & Admin SDKs.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed locally or via a cloud instance
- Firebase Project with Auth enabled
- Pinecone Account
- Gemini API Key

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aayushkumar-03/PaySense-AI.git
   cd PaySense-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on the `.env.example`:
   ```env
   # PostgreSQL
   DATABASE_URL=postgresql://user:password@localhost:5432/paysense_db
   
   # Firebase Client Config (VITE_ prefixed)
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   
   # Firebase Admin Config
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   
   # Google GenAI (Gemini)
   GEMINI_API_KEY=your_gemini_key
   
   # Pinecone
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX=paysense-rag
   ```

4. **Initialize the Database**
   Configure your PostgreSQL DB schema using the scripts provided inside `server/db/schema.sql` by running the migrations.

5. **Run the Application**
   ```bash
   # Run Vite frontend and Express Backend concurrently
   npm run build
   npm run dev
   ```

## 🧠 AI Integration Notes

This application underwent a migration to **Google Generative AI (Gemini 1.5 Flash)** to ensure rapid conversational experiences. The backend leverages semantic prompt injection mapped with the user's localized banking data, ensuring the copilot always accurately guides you around limits, SIPs, and flagged charges.

---

*Made for the modern financial landscape. Monitor your wealth with intelligence.*
