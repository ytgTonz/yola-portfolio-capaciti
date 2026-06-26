import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON and URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure public/uploads and public/data directories exist
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const dataDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const certsFilePath = path.join(dataDir, "certifications.json");
  const defaultCertifications = [
    { id: '1', name: 'CCNA Intro to Networks', issuer: 'Cisco', status: 'Completed' },
    { id: '2', name: 'CCNA Enterprise', issuer: 'Cisco', status: 'Completed' },
    { id: '3', name: 'CompTIA A+', issuer: 'CompTIA', status: 'In Progress' },
    { id: '4', name: 'CompTIA N+', issuer: 'CompTIA', status: 'In Progress' }
  ];

  const projectsFilePath = path.join(dataDir, "projects.json");
  const defaultProjects = [
    {
      id: "1",
      name: "Hexaura",
      subtitle: "MERN • React Native • Hardware",
      category: "Full-Stack",
      overview: "Transformed frontline interactions into customer loyalty moments.",
      role: "Contributor — in-field testing, admin features, hardware, and performance integration.",
      outcomes: "Integrated real-world hardware with software analytics to improve customer satisfaction metrics.",
      longDescription: "A comprehensive customer loyalty and frontline feedback system designed to bridge physical in-store customer touchpoints with digital analytics pipelines. Deployed both in-store and on mobile devices.",
      tags: ["React Native", "Expo", "MongoDB", "Express", "Node.js", "Hardware Integration", "MERN"],
      metrics: [
        "Interactive analytics dashboard built with real-time feedback ingestion.",
        "Facilitated in-field hardware installation and customer usability tests.",
        "Engineered reliable local synchronization schemas for offline-capable devices."
      ],
      githubUrl: "https://github.com",
      siteUrl: "https://hexaura.com"
    },
    {
      id: "2",
      name: "nomadyQ",
      subtitle: "Booking Engine • MongoDB • API",
      category: "Full-Stack",
      overview: "Users post accommodation needs; providers respond in a reverse-booking marketplace.",
      role: "Core developer — booking flows, backend APIs, database architecture.",
      outcomes: "Streamlined the matching logic and provided an intuitive flow for seamless user-provider negotiation.",
      longDescription: "A novel marketplace concept flipping the traditional booking dynamic. Instead of browsing listings, guests state their requirements, and approved accommodation providers pitch tailored offers.",
      tags: ["React", "Node.js", "Express", "MongoDB", "REST APIs", "Reverse Bidding", "Marketplace Engine"],
      metrics: [
        "Architected optimized queries supporting complex geolocation filter criteria.",
        "Implemented secure negotiation channels with automated expiry timers.",
        "Constructed intuitive client interface minimizing friction for booking requests."
      ],
      githubUrl: "https://github.com",
      siteUrl: "https://nomadyq.com"
    },
    {
      id: "3",
      name: "Delegat",
      subtitle: "Full-stack Lead • Render.com",
      category: "Full-Stack",
      overview: "Full-stack web-based boardroom booking system in active production.",
      role: "Lead developer — database design, API development, deployment, user training.",
      outcomes: "Successfully deployed and actively used by a company for daily operations.",
      longDescription: "An elegant enterprise booking hub used to coordinate corporate boardrooms, eliminate scheduling conflicts, and manage company resources with role-based permissions.",
      tags: ["React", "Express", "Node.js", "PostgreSQL", "Render.com", "Enterprise scheduling", "Authentication"],
      metrics: [
        "Reduced daily booking administrative overlaps by implementing strict calendar locks.",
        "Integrated dynamic roles: Administrator, Facilitator, and Standard Guest profiles.",
        "Completed secure CI/CD migration deploying the client and database to isolated cloud run environments."
      ],
      githubUrl: "https://github.com",
      siteUrl: "https://delegat.co.za"
    },
    {
      id: "4",
      name: "3-Tier Network",
      subtitle: "Cisco Packet Tracer • Security",
      category: "Networks & Security",
      overview: "Designed a comprehensive 3-tier network to optimise performance, security, and scalability.",
      role: "Designer and implementer.",
      outcomes: "Demonstrated practical application of enterprise networking principles and architecture.",
      longDescription: "A simulated high-security enterprise network structured with physical Core, Distribution, and Access layers to safeguard critical business servers and separate user departments.",
      tags: ["Cisco Packet Tracer", "Network Architecture", "Access Control Lists", "Subnetting", "VLANs", "Enterprise Security"],
      metrics: [
        "Designed strict VLAN tagging rules to segment public, administration, and database traffic.",
        "Constructed Access Control Lists (ACLs) providing fine-grained access policies on key subnets.",
        "Implemented redundant spanning-tree configurations to prevent network loops and single points of failure."
      ],
      githubUrl: "https://github.com",
      siteUrl: ""
    }
  ];

  // Certifications API endpoints
  app.get("/api/certifications", (req, res) => {
    try {
      if (!fs.existsSync(certsFilePath)) {
        fs.writeFileSync(certsFilePath, JSON.stringify(defaultCertifications, null, 2), "utf-8");
        return res.json(defaultCertifications);
      }
      const data = fs.readFileSync(certsFilePath, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Error reading certifications:", error);
      res.status(500).json({ error: "Failed to read certifications" });
    }
  });

  app.post("/api/certifications", (req, res) => {
    try {
      const certs = req.body;
      if (!Array.isArray(certs)) {
        return res.status(400).json({ error: "Invalid data format, expected array" });
      }
      fs.writeFileSync(certsFilePath, JSON.stringify(certs, null, 2), "utf-8");
      res.json({ success: true, data: certs });
    } catch (error) {
      console.error("Error saving certifications:", error);
      res.status(500).json({ error: "Failed to save certifications" });
    }
  });

  // Projects API endpoints
  app.get("/api/projects", (req, res) => {
    try {
      if (!fs.existsSync(projectsFilePath)) {
        fs.writeFileSync(projectsFilePath, JSON.stringify(defaultProjects, null, 2), "utf-8");
        return res.json(defaultProjects);
      }
      const data = fs.readFileSync(projectsFilePath, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Error reading projects:", error);
      res.status(500).json({ error: "Failed to read projects" });
    }
  });

  app.post("/api/projects", (req, res) => {
    try {
      const projects = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ error: "Invalid data format, expected array" });
      }
      fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), "utf-8");
      res.json({ success: true, data: projects });
    } catch (error) {
      console.error("Error saving projects:", error);
      res.status(500).json({ error: "Failed to save projects" });
    }
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });

  const upload = multer({ storage });

  app.post("/api/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(500).json({ error: err.message || "File upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      // Return the public URL for the uploaded file
      res.json({ url: `/uploads/${req.file.filename}` });
    });
  });

  // Global error handler for API routes
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("API error handler caught error:", err);
    res.status(err.status || 500).json({
      error: err.message || "An unexpected error occurred"
    });
  });

  // Explicitly serve uploads directory before Vite SPA fallback
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
