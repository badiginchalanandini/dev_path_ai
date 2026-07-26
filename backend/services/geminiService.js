const dotenv = require('dotenv');

dotenv.config();

// Helper for Exponential Backoff Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Call Gemini API Streaming Endpoint
const callGeminiStreamAPI = async (prompt, onChunk, retries = 3, delay = 1000) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Missing Gemini API Key. Configure GEMINI_API_KEY in your .env file.');
  }

  // API Timeout Controller (Aborts after 15 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,          // Lower temp for deterministic, fast outputs
          maxOutputTokens: 2048      // Token optimization to save bandwidth
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini Stream HTTP error! Status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // SSE response is formatted as array of JSON items or stream lines
      // Let's parse complete JSON array blocks or lines
      const parts = buffer.split('\n');
      buffer = parts.pop() || ''; // Keep incomplete JSON in buffer

      for (const part of parts) {
        const cleanPart = part.replace(/^data:\s*/, '').trim();
        if (!cleanPart) continue;

        try {
          const parsed = JSON.parse(cleanPart);
          const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textChunk) {
            onChunk(textChunk);
          }
        } catch (e) {
          // Parsing might fail if chunk boundary is split
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('⚠️ Gemini stream request timed out (15s limit). Retrying...');
    }

    if (retries > 0) {
      console.log(`🔄 Retrying Gemini stream request... Attempts left: ${retries}. Delaying ${delay}ms`);
      await sleep(delay);
      return callGeminiStreamAPI(prompt, onChunk, retries - 1, delay * 2);
    }
    throw error;
  }
};

// 1. Career Mentor Generator (Standard non-streaming REST)
const generateCareerMentorInsights = async (profile) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getFallbackCareerInsights(profile);
  }

  const prompt = `
    You are an elite career mentor. Create a structured mentorship package for:
    Name: ${profile.student_name}
    College: ${profile.college}
    Year: ${profile.year}
    Degree: ${profile.degree} in ${profile.branch}
    Current Skills: ${profile.current_skills}
    Interested Skills: ${profile.interested_skills}
    Career Goal: ${profile.career_goal}
    Dream Company: ${profile.dream_company}
    Daily Hours: ${profile.daily_hours} hrs/day
    Current CGPA: ${profile.cgpa}

    Return JSON matching this exact structure:
    {
      "skill_gap_analysis": {
        "matchPercentage": 75,
        "acquiredSkills": ["skill1"],
        "missingSkills": [{"skill": "skill", "importance": "High", "reason": "reason", "howToLearn": "how"}]
      },
      "roadmap_90_day": {
        "title": "90 Day Career Roadmap",
        "phases": [
          {"phaseNumber": 1, "timeframe": "Days 1-30", "title": "Phase 1 Title", "focus": "Focus description", "milestone": "Milestone description"},
          {"phaseNumber": 2, "timeframe": "Days 31-60", "title": "Phase 2 Title", "focus": "Focus description", "milestone": "Milestone description"},
          {"phaseNumber": 3, "timeframe": "Days 61-90", "title": "Phase 3 Title", "focus": "Focus description", "milestone": "Milestone description"}
        ]
      },
      "weekly_learning_plan": {
        "weeks": [
          {
            "weekNumber": 1,
            "theme": "Theme Name",
            "dailyBreakdown": [
              {"day": "Day 1-3", "topic": "Topic Focus 1 (e.g. foundational syntax)", "hours": 3},
              {"day": "Day 4-5", "topic": "Topic Focus 2 (e.g. data structure integration)", "hours": 3},
              {"day": "Day 6-7", "topic": "Topic Focus 3 (e.g. simple exercises & testing)", "hours": 3}
            ]
          }
        ]
      },
      "monthly_goals": [
        {"month": 1, "goal": "Goal 1", "metrics": "Metrics"}
      ],
      "recommended_courses": [
        {"title": "Course Title", "platform": "Coursera/Udemy/etc", "reason": "Why this course"}
      ],
      "books": [
        {"title": "Book Name", "author": "Author", "keyTakeaway": "Takeaway"}
      ],
      "youtube_channels": [
        {"name": "Channel Name", "focus": "What they teach"}
      ],
      "projects_to_build": [
        {"title": "Project Title 1", "difficulty": "Medium", "description": "Description of project 1", "techStack": ["React", "Node.js"]},
        {"title": "Project Title 2", "difficulty": "Hard", "description": "Description of project 2", "techStack": ["Go", "Redis", "Docker"]},
        {"title": "Project Title 3", "difficulty": "Easy", "description": "Description of project 3", "techStack": ["JavaScript", "HTML", "CSS"]}
      ],
      "interview_topics": [
        {"topicName": "Topic", "difficulty": "Medium", "sampleQuestion": "Question"}
      ]
    }
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    }
  } catch (err) {
    console.warn('Gemini generateContent error. Using fallback data.');
  }
  return getFallbackCareerInsights(profile);
};

// 2. Project Mentor Generator (Standard non-streaming REST)
const generateProjectMentorBlueprint = async (profile) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getFallbackProjectBlueprint(profile);
  }

  const prompt = `
    You are a Senior Project Architect. Construct a full-fidelity software design blueprint for:
    Skills Available: ${profile.skills}
    Preferred Domain: ${profile.domain}
    Difficulty Target: ${profile.difficulty}
    Available Time: ${profile.available_time}
    Team Size: ${profile.team_size} members
    Preferred Language/Stack: ${profile.language}

    Return JSON matching this exact structure:
    {
      "project_title": "Title",
      "description": "Short summary",
      "problem_statement": "Detailed problem state",
      "features": ["Feature 1", "Feature 2"],
      "architecture": "MVC / Clean Architecture overview",
      "folder_structure": {
        "root": ["src", "tests"],
        "src": ["controllers", "models"]
      },
      "frontend": {
        "framework": "React/etc",
        "components": ["Navbar", "Dashboard"]
      },
      "backend": {
        "framework": "Express/etc",
        "middlewares": ["AuthMiddleware"]
      },
      "database_schema": [
        {"table": "users", "columns": ["id INT", "name VARCHAR"]}
      ],
      "api_list": [
        {"method": "GET", "path": "/api/users", "description": "Get users"}
      ],
      "timeline": [
        {"milestone": "Setup", "duration": "Week 1"}
      ],
      "deployment": "Render/AWS/etc detailed guide",
      "testing": ["Unit Tests for endpoints", "Integration Tests"],
      "future_scope": ["OAuth Integration", "AI Caching"],
      "interview_questions": [
        {"question": "How do you secure your endpoints?", "answer": "Using JWT cookies."}
      ]
    }
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    }
  } catch (err) {
    console.warn('Gemini generateContent error. Using fallback.');
  }
  return getFallbackProjectBlueprint(profile);
};

// Fallback Helper Functions
function getFallbackCareerInsights(profile) {
  const currentList = (profile.current_skills || "")
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  
  const interestedList = (profile.interested_skills || "")
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const goal = (profile.career_goal || "").toLowerCase();

  // Define industry-standard skills for common roles
  let roleRequiredSkills = [];
  if (goal.includes("front") || goal.includes("web")) {
    roleRequiredSkills = ["React", "JavaScript (ES6+)", "CSS Flexbox/Grid", "TypeScript", "Vite/Webpack"];
  } else if (goal.includes("back") || goal.includes("api")) {
    roleRequiredSkills = ["Node.js/Express", "SQL (MySQL/PostgreSQL)", "RESTful APIs", "JWT Security", "Redis Caching", "Docker"];
  } else if (goal.includes("full") || goal.includes("software")) {
    roleRequiredSkills = ["React", "Node.js/Express", "SQL/NoSQL Databases", "RESTful API Design", "JavaScript (ES6+)", "Git/Version Control", "Docker"];
  } else if (goal.includes("data") || goal.includes("ml") || goal.includes("ai") || goal.includes("machine")) {
    roleRequiredSkills = ["Python", "SQL", "Pandas/NumPy", "Machine Learning (Scikit-Learn)", "Deep Learning (PyTorch/TensorFlow)"];
  } else if (goal.includes("devops") || goal.includes("cloud") || goal.includes("sys")) {
    roleRequiredSkills = ["Docker & Kubernetes", "CI/CD Pipelines", "AWS/GCP Cloud Solutions", "Terraform", "Linux/Bash Scripting"];
  } else {
    // Default standard developer requirement
    roleRequiredSkills = ["Git/Version Control", "Data Structures & Algorithms", "RESTful API Design", "SQL Databases"];
  }

  // Determine acquired and missing
  const acquiredSkills = (profile.current_skills || "")
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const missingSkillsMap = new Map();

  // 1. Add any role-required skill that is missing from current_skills
  roleRequiredSkills.forEach(skillName => {
    const isAcquired = currentList.some(s => s.includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(s));
    if (!isAcquired) {
      missingSkillsMap.set(skillName.toLowerCase(), {
        skill: skillName,
        importance: "High",
        reason: `Critical foundation skill required for target career role of ${profile.career_goal || 'Software Developer'}.`,
        howToLearn: `Complete hands-on projects and tutorials specializing in ${skillName}.`
      });
    }
  });

  // 2. Add any interested skills that are not already acquired
  interestedList.forEach(skillName => {
    const isAcquired = currentList.some(s => s.includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(s));
    if (!isAcquired) {
      missingSkillsMap.set(skillName.toLowerCase(), {
        skill: skillName,
        importance: "Medium",
        reason: `Target skill chosen by student to level up career proficiency towards ${profile.dream_company || 'dream companies'}.`,
        howToLearn: `Read official documentation and integrate ${skillName} into a mini flagship app.`
      });
    }
  });

  const missingSkills = Array.from(missingSkillsMap.values());

  // Calculate Match Percentage dynamically
  const acquiredCount = acquiredSkills.length;
  const missingCount = missingSkills.length;
  const totalCount = acquiredCount + missingCount;
  let matchPercentage = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 50;
  matchPercentage = Math.max(20, Math.min(95, matchPercentage));

  return {
    skill_gap_analysis: {
      matchPercentage,
      acquiredSkills,
      missingSkills
    },
    roadmap_90_day: {
      title: "90 Day Career Roadmap",
      phases: [
        {
          phaseNumber: 1,
          timeframe: "Days 1-30",
          title: "Foundation & Skill Bridging",
          focus: `Focus on mastering ${profile.interested_skills} and maintaining your CGPA of ${profile.cgpa} at ${profile.college}.`,
          milestone: "Construct 3 fully tested small projects on GitHub."
        },
        {
          phaseNumber: 2,
          timeframe: "Days 31-60",
          title: "Core Development & Practical Integration",
          focus: `Hands-on application development building full-stack components. Focus on backend APIs, database relationships, styling, and state management.`,
          milestone: "Deploy a fully functional preview version of your project."
        },
        {
          phaseNumber: 3,
          timeframe: "Days 61-90",
          title: "System Design & Interview Defense Preparation",
          focus: `Master architectural patterns, performance optimization, caching strategies, and practice oral project defense defense questions.`,
          milestone: "Deliver 1 comprehensive flagship project and complete 3 mock interview defense sessions."
        }
      ]
    },
    weekly_learning_plan: {
      weeks: [
        {
          weekNumber: 1,
          theme: "Core Principles & Setup",
          dailyBreakdown: [
            { day: "Day 1-3", topic: `Setting up workspace & Git version control for ${profile.interested_skills}`, hours: profile.daily_hours },
            { day: "Day 4-5", topic: `Understanding the fundamentals and architecture of ${profile.interested_skills}`, hours: profile.daily_hours },
            { day: "Day 6-7", topic: `Building a simple hello-world API using ${profile.interested_skills}`, hours: profile.daily_hours }
          ]
        },
        {
          weekNumber: 2,
          theme: "Deep Dive & Core Implementation",
          dailyBreakdown: [
            { day: "Day 1-3", topic: `Database design, schemas, and setting up relationships`, hours: profile.daily_hours },
            { day: "Day 4-5", topic: `Creating RESTful endpoints and request validation`, hours: profile.daily_hours },
            { day: "Day 6-7", topic: `Implementing security, authentication, and middlewares`, hours: profile.daily_hours }
          ]
        },
        {
          weekNumber: 3,
          theme: "Frontend Integration & State",
          dailyBreakdown: [
            { day: "Day 1-3", topic: `Developing UI views and component hierarchy`, hours: profile.daily_hours },
            { day: "Day 4-5", topic: `Managing application state and API client service integration`, hours: profile.daily_hours },
            { day: "Day 6-7", topic: `Form handling, error states, and responsive styling`, hours: profile.daily_hours }
          ]
        },
        {
          weekNumber: 4,
          theme: "Testing, Deployment & Review",
          dailyBreakdown: [
            { day: "Day 1-3", topic: `Writing unit tests and integration tests`, hours: profile.daily_hours },
            { day: "Day 4-5", topic: `Deploying application to cloud platforms (Render/Vercel/AWS)`, hours: profile.daily_hours },
            { day: "Day 6-7", topic: `Self-review, optimizing load times, and updating GitHub documentation`, hours: profile.daily_hours }
          ]
        }
      ]
    },
    monthly_goals: [
      { month: 1, goal: `Master foundational aspects of ${profile.interested_skills}`, metrics: "Complete 1 mini-project" }
    ],
    recommended_courses: [
      { title: "Full Stack Web Developer Nanodegree", platform: "Udacity / Coursera", reason: "Hands-on experience with production-level deployments." }
    ],
    books: [
      { title: "Clean Code", author: "Robert C. Martin", keyTakeaway: "Clean software practices." }
    ],
    youtube_channels: [
      { name: "Hussein Nasser", focus: "Database deep-dives." }
    ],
    projects_to_build: [
      { title: "Distributed Task Scheduler & Message Queue", difficulty: "Hard", description: "Resilient backend message broker executing microservice tasks with retry logic.", techStack: ["Go/Node.js", "Redis", "Docker", "RabbitMQ"] },
      { title: "Real-time Collaborative Document Canvas", difficulty: "Medium", description: "A Notion-like editing workspace with live cursor indicators and presence channels.", techStack: ["React", "WebSockets", "Node.js", "MongoDB"] },
      { title: "Developer Portfolio Analytics & Insights Engine", difficulty: "Medium", description: "Extracts commit histories and code metrics via GitHub OAuth API to render custom dashboard statistics.", techStack: ["React", "Express.js", "Chart.js", "GitHub API"] }
    ],
    interview_topics: [
      { topicName: "Database Indexing & Locks", difficulty: "Hard", sampleQuestion: "How do B-Trees optimize SQL SELECT operations?" }
    ]
  };
}

function getFallbackProjectBlueprint(profile) {
  return {
    project_title: `AI-Powered ${profile.domain} Platform`,
    description: `A custom-fit ${profile.difficulty} level solution built in ${profile.language}.`,
    problem_statement: `Automating ${profile.domain} workflows.`,
    features: ["JWT Secure Authentication", "Data charts"],
    architecture: "MVC",
    folder_structure: { root: ["src", "config"] },
    frontend: { framework: "React", components: ["Navbar", "Dashboard"] },
    backend: { framework: "Express", middlewares: ["Helmet"] },
    database_schema: [{ table: "users", columns: ["id INT", "email VARCHAR"] }],
    api_list: [{ method: "POST", path: "/api/auth/login", description: "Logs in users" }],
    timeline: [{ milestone: "DB Design", duration: "Week 1" }],
    deployment: "Deploy on Render.",
    testing: ["Jest units"],
    future_scope: ["Redis caching"],
    interview_questions: [{ question: "Why cookies?", answer: "XSS protection." }]
  };
}

const generateRecommendedProjectBlueprint = async (projectTitle, profile) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getFallbackRecommendedProjectBlueprint(projectTitle, profile);
  }

  const prompt = `
    You are an elite system architect. Construct a personalized, high-fidelity system design blueprint specifically for the project: "${projectTitle}".
    Tailor the technologies and architecture patterns to a student with these skills: ${profile?.current_skills || 'React, Express'} and career goal: ${profile?.career_goal || 'Software Engineer'}.

    Return JSON matching this exact structure:
    {
      "architecture": "A brief overview of the selected system architecture and patterns (e.g. MVC, microservices, etc.).",
      "schema": [
        {
          "table": "name of table",
          "fields": ["column_name DATA_TYPE constraints", "another_column DATA_TYPE"]
        }
      ],
      "endpoints": [
        {
          "method": "GET/POST/PUT/DELETE",
          "path": "/api/v1/resource-path",
          "desc": "Short description of what the endpoint does."
        }
      ],
      "phases": [
        {
          "phase": "Phase name (e.g. Phase 1: Database Design)",
          "desc": "Key tasks to perform in this phase."
        }
      ]
    }
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    }
  } catch (err) {
    console.warn('Gemini generateRecommendedProjectBlueprint error:', err);
  }
  return getFallbackRecommendedProjectBlueprint(projectTitle, profile);
};

function getFallbackRecommendedProjectBlueprint(projectTitle, profile) {
  const title = projectTitle || "Distributed Task Scheduler";
  const titleLower = title.toLowerCase();

  // 1. Scheduler / Message Queue
  if (titleLower.includes('scheduler') || titleLower.includes('queue') || titleLower.includes('message')) {
    return {
      architecture: "Asynchronous Worker Architecture. Decouples job enqueues from worker daemons via Redis key-value stores.",
      schema: [
        {
          table: "jobs",
          fields: ["id VARCHAR(36) PRIMARY KEY", "payload JSON NOT NULL", "queue_name VARCHAR(100) NOT NULL", "status VARCHAR(30) DEFAULT 'queued'", "retry_count INT DEFAULT 0", "scheduled_at TIMESTAMP", "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"]
        },
        {
          table: "worker_nodes",
          fields: ["id VARCHAR(36) PRIMARY KEY", "hostname VARCHAR(255)", "status VARCHAR(50)", "tasks_processed INT DEFAULT 0", "last_heartbeat TIMESTAMP"]
        }
      ],
      endpoints: [
        { method: "POST", path: "/api/v1/jobs", desc: "Schedules a new job into the queue" },
        { method: "GET", path: "/api/v1/jobs/:id", desc: "Checks specific job execution logs and status" },
        { method: "DELETE", path: "/api/v1/jobs/:id", desc: "Cancels a scheduled or pending job" }
      ],
      phases: [
        { phase: "Phase 1: Broker & Redis config", desc: "Initialize containerized Redis and setup pub/sub listeners." },
        { phase: "Phase 2: Execution Worker", desc: "Build asynchronous job handler loops with automated retry parameters." },
        { phase: "Phase 3: Telemetry Dashboard", desc: "Expose job metrics endpoints and plot graphs using ChartJS." }
      ]
    };
  }

  // 2. Collaborative Document Canvas
  if (titleLower.includes('canvas') || titleLower.includes('collaborative') || titleLower.includes('document')) {
    return {
      architecture: "Conflict-free Replicated Data Type (CRDT) Architecture. Synchronizes real-time delta state via WebSocket gateways.",
      schema: [
        {
          table: "documents",
          fields: ["id VARCHAR(36) PRIMARY KEY", "title VARCHAR(255) NOT NULL", "content TEXT", "version INT DEFAULT 1", "updated_at TIMESTAMP"]
        },
        {
          table: "active_peers",
          fields: ["id VARCHAR(36) PRIMARY KEY", "document_id VARCHAR(36)", "user_name VARCHAR(100)", "cursor_position JSON", "FOREIGN KEY (document_id) REFERENCES documents(id)"]
        }
      ],
      endpoints: [
        { method: "POST", path: "/api/v1/documents", desc: "Creates a new workspace canvas" },
        { method: "GET", path: "/api/v1/documents/:id", desc: "Loads the initial document text state" },
        { method: "GET", path: "/api/v1/documents/:id/sessions", desc: "Fetches user profiles currently viewing the canvas" }
      ],
      phases: [
        { phase: "Phase 1: WebSocket Presence Channel", desc: "Develop the WebSocket subscription logic and synchronize peer connection state." },
        { phase: "Phase 2: Delta Sync Engine", desc: "Integrate YJS/Automerge delta synchronization models to prevent race collisions." },
        { phase: "Phase 3: Persistence Sync", desc: "Configure database adapters to write periodically compiled memory buffers back to SQL." }
      ]
    };
  }

  // 3. Portfolio Analytics Engine
  if (titleLower.includes('analytics') || titleLower.includes('portfolio') || titleLower.includes('insights')) {
    return {
      architecture: "Data Ingestion Pipeline Architecture. Periodically crawls GitHub OAuth REST endpoints and stores analytics cache.",
      schema: [
        {
          table: "git_profiles",
          fields: ["id INT AUTO_INCREMENT PRIMARY KEY", "github_username VARCHAR(100) UNIQUE NOT NULL", "access_token VARCHAR(255)", "synced_at TIMESTAMP"]
        },
        {
          table: "commit_statistics",
          fields: ["id INT AUTO_INCREMENT PRIMARY KEY", "profile_id INT", "repository_name VARCHAR(150)", "additions INT", "deletions INT", "committed_at TIMESTAMP", "FOREIGN KEY (profile_id) REFERENCES git_profiles(id)"]
        }
      ],
      endpoints: [
        { method: "POST", path: "/api/v1/sync", desc: "Initiates asynchronous repository metadata crawling" },
        { method: "GET", path: "/api/v1/analytics/commits", desc: "Retrieves timeline statistics for commit frequency graphs" },
        { method: "GET", path: "/api/v1/analytics/languages", desc: "Calculates overall codebase language ratios" }
      ],
      phases: [
        { phase: "Phase 1: OAuth Authentication", desc: "Set up GitHub OAuth strategy and store user access credentials." },
        { phase: "Phase 2: Crawling Worker", desc: "Implement recursive Git API crawler with request rate-limit throttling." },
        { phase: "Phase 3: Chart API Aggregator", desc: "Build SQL queries to calculate line changes and expose graph datasets." }
      ]
    };
  }

  // 4. E-Commerce Microservices Orchestrator
  if (titleLower.includes('ecommerce') || titleLower.includes('orchestrator') || titleLower.includes('microservices')) {
    return {
      architecture: "Choreographed Event Sourcing Architecture. Leverages asynchronous brokers to resolve cross-service Saga actions.",
      schema: [
        {
          table: "orders",
          fields: ["id VARCHAR(36) PRIMARY KEY", "customer_email VARCHAR(255) NOT NULL", "amount DECIMAL(10,2)", "payment_status VARCHAR(50)", "fulfillment_status VARCHAR(50)"]
        },
        {
          table: "inventory_log",
          fields: ["id VARCHAR(36) PRIMARY KEY", "product_id VARCHAR(36)", "stock_deducted INT", "status VARCHAR(50)"]
        }
      ],
      endpoints: [
        { method: "POST", path: "/api/v1/orders", desc: "Fires checkouts and publishes order-created events" },
        { method: "GET", path: "/api/v1/orders/:id/status", desc: "Tracks order delivery status across fulfillment microservices" },
        { method: "POST", path: "/api/v1/orders/:id/refund", desc: "Triggers compensating transactions to roll back inventories" }
      ],
      phases: [
        { phase: "Phase 1: Kafka/RabbitMQ Router", desc: "Configure message broker bindings to link orders and checkout handlers." },
        { phase: "Phase 2: Saga Transaction Logic", desc: "Write transaction checkpoint logs and compensating rollbacks." },
        { phase: "Phase 3: Performance Telemetry", desc: "Expose tracing endpoints using OpenTelemetry to check latency bottlenecks." }
      ]
    };
  }

  // Default Standard Fallback
  return {
    architecture: `Modular Clean Architecture optimized for ${title}. Uses layered repository patterns to decouple services from the database context.`,
    schema: [
      {
        table: "users",
        fields: ["id INT AUTO_INCREMENT PRIMARY KEY", "email VARCHAR(255) UNIQUE NOT NULL", "password_hash VARCHAR(255) NOT NULL", "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"]
      },
      {
        table: "tasks_blueprint",
        fields: ["id INT AUTO_INCREMENT PRIMARY KEY", "title VARCHAR(255) NOT NULL", "status VARCHAR(50) DEFAULT 'pending'", "assigned_user_id INT", "FOREIGN KEY (assigned_user_id) REFERENCES users(id)"]
      }
    ],
    endpoints: [
      { method: "POST", path: "/api/auth/register", desc: "Registers a new user context" },
      { method: "POST", path: "/api/auth/login", desc: "Issues JWT access & refresh tokens" },
      { method: "POST", path: "/api/tasks", desc: `Creates a new task within ${title} pipeline` },
      { method: "GET", path: "/api/tasks", desc: "Lists all tasks and their completion states" }
    ],
    phases: [
      { phase: "Phase 1: DB & Docker Setup", desc: "Configure relational schema and initialize container environments." },
      { phase: "Phase 2: Core Business Logic", desc: `Build services, routers, controller endpoints, and validate schema models.` },
      { phase: "Phase 3: Integration & Testing", desc: "Connect frontend components and test endpoints using Jest framework." }
    ]
  };
}

module.exports = {
  generateCareerMentorInsights,
  generateProjectMentorBlueprint,
  generateRecommendedProjectBlueprint,
  callGeminiStreamAPI
};
