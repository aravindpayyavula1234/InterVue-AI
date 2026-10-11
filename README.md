InterVue — Personalized Interview Preparation

Your Resume. Your Skills. Your Interview.

InterVue is a personalized interview-preparation platform designed to help users practice interviews based on their resumes, technical skills, projects, and job descriptions.

✨ Features

- 🔐 User authentication and protected accounts
- 📄 Resume upload and skill extraction
- 🎯 Personalized interview questions based on resume topics
- 💼 Optional job description analysis
- 🎙️ Interview practice with text and audio support
- 🤖 AI-powered answer evaluation and feedback
- 📊 Performance analytics and progress tracking
- 📚 Interview history and detailed reports
- 💬 User feedback and profile management

🛠️ Tech Stack

Update this list to match the technologies actually used in your project.

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS
- Backend: Next.js API routes or server-side services
- Database and Authentication: Supabase or your configured provider
- AI Integration: Configured AI provider
- Charts: Recharts
- Package Manager: npm

📋 Prerequisites

Install the following before running the project:

- "Node.js" (https://nodejs.org/) — preferably the version specified in ".nvmrc" or "package.json"
- npm, included with Node.js
- Git
- A code editor such as "Visual Studio Code" (https://code.visualstudio.com/)

Check your installations:

node --version
npm --version
git --version

🚀 Installation and Local Setup

1. Clone the repository

git clone https://github.com/aravindpayyavula1234/InterVue-AI.git

2. Navigate to the project folder

cd InterVue-AI

3. Install dependencies

If the project uses npm:

npm install

If the repository contains a "package-lock.json", use "npm ci" instead when you want a clean installation matching the lockfile.

4. Configure environment variables

Create a ".env.local" file in the project root, alongside "package.json".

Add the environment variables required by your application. For example, if you use Supabase:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

AI_API_KEY=your_server_side_ai_api_key

Important:

- Replace the example values with your actual configuration.
- Use the variable names required by your codebase.
- Keep private API keys on the server. Never expose them through client-side code.
- Do not commit ".env.local" or other files containing secrets to GitHub.
- If your app uses Firebase instead of Supabase, configure the Firebase variables required by your project.

5. Start the development server

npm run dev

6. Open the application

Visit:intervue-ai-bot.ai.studio



The development server should display your application locally.

🧪 Available Scripts

Common Next.js scripts include the following. Run only the scripts defined in your "package.json".

Command| Description
"npm run dev"| Starts the development server
"npm run build"| Creates a production build
"npm run start"| Starts the production server after building
"npm run lint"| Runs lint checks, if configured

For example, to test a production build:

npm run build
npm run start

🗂️ Project Structure

Your actual folders may differ.

InterVue-AI/
├── app/                 # Pages and layouts (if using App Router)
├── components/          # Reusable UI components
├── lib/                 # Utilities and service clients
├── public/              # Static assets
├── .env.local           # Local environment variables
├── .gitignore
├── package.json         # Dependencies and scripts
└── README.md

🔧 Troubleshooting

Dependency installation fails

npm install

Check your Node.js version and follow any version requirements in the repository.

Environment variable errors

- Verify that ".env.local" exists in the project root.
- Check that variable names match those referenced in the code.
- Restart the development server after changing environment variables.

Port 3000 is already in use

npm run dev -- --port 3001

Open "intervue-ai-bot.ai.studio".

Authentication or AI features are not working

- Verify your provider configuration and API keys.
- Confirm that the required authentication, database, storage, and AI services are enabled.
- Check the terminal and browser console for errors.
- Ensure server-side secrets are not exposed in client-side code.

🔒 Security

- Never commit API keys, passwords, or private credentials.
- Use server-side authorization and enforce user-level data access.
- Validate uploaded files before processing them.
- Keep private resumes and interview data protected.
- Configure production environment variables separately from local development.

🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request describing your changes.

📄 License

Add your chosen license here before distributing the project.

👨‍💻 Developed By

TEAM NEW
