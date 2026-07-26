import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import Loading from './Loading';

const ProjectsView = ({ data }) => {
  const [blueprint, setBlueprint] = useState(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');

  if (!data) return null;

  // Append high-quality recommended projects if list is short to ensure plenty of choices are immediately displayed
  const displayedProjects = Array.isArray(data)
    ? data.filter(p => p && p.title && p.title.toLowerCase() !== "devpath ai career platform")
    : [];
  
  const defaultPool = [
    {
      title: "Distributed Task Scheduler & Message Queue",
      difficulty: "Hard",
      description: "A highly resilient backend message broker executing microservice tasks with retry logic and telemetry dashboard.",
      techStack: ["Node.js", "Redis", "Docker", "RabbitMQ"]
    },
    {
      title: "Real-time Collaborative Document Canvas",
      difficulty: "Medium",
      description: "A Notion-like real-time editing workspace with concurrent document synchronizations and presence channels.",
      techStack: ["React", "WebSockets", "Node.js", "MongoDB"]
    },
    {
      title: "Developer Portfolio Analytics & Insights Engine",
      difficulty: "Medium",
      description: "Extracts commit histories and code metrics via GitHub OAuth API to render custom dashboard statistics.",
      techStack: ["React", "Express.js", "Chart.js", "GitHub API"]
    },
    {
      title: "E-Commerce Microservices Orchestrator",
      difficulty: "Hard",
      description: "An orchestrator managing payments, shipping tracking, and inventory microservices with event sourcing.",
      techStack: ["Docker", "Kubernetes", "gRPC", "PostgreSQL"]
    }
  ];

  defaultPool.forEach(p => {
    if (!displayedProjects.some(existing => existing.title.toLowerCase() === p.title.toLowerCase())) {
      displayedProjects.push(p);
    }
  });

  const handleGenerateBlueprint = async (title) => {
    setBlueprintLoading(true);
    setSelectedTitle(title);
    setBlueprint(null);
    try {
      const res = await aiAPI.generateProjectBlueprint(title);
      if (res.data && res.data.success && res.data.data) {
        setBlueprint(res.data.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setBlueprintLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel content-card">
        <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem', fontSize: '1.4rem' }}>🚀 AI Recommended Projects</h3>
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {displayedProjects.map((project, idx) => (
            <div key={idx} style={{ padding: '1.2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '1.1rem' }}>{project.title}</h4>
                  <span className="badge badge-primary">{project.difficulty}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>{project.description}</p>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600 }}>Stack: </span>
                  {project.techStack?.map((tech, tIdx) => (
                    <span key={tIdx} className="badge badge-success" style={{ marginRight: '4px', textTransform: 'none', fontSize: '0.7rem' }}>{tech}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '6px 12px', alignSelf: 'flex-start' }} onClick={() => handleGenerateBlueprint(project.title)}>
                🏗️ Generate Blueprint
              </button>
            </div>
          ))}
        </div>

        {/* Blueprint Generator Output */}
        {blueprintLoading && <Loading message={`Generating System Blueprint for ${selectedTitle}...`} />}

        {blueprint && (
          <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
            <h4 style={{ color: '#fcd34d', marginBottom: '1rem', fontSize: '1.2rem' }}>📐 Project Blueprint: {selectedTitle}</h4>
            
            <div style={{ marginBottom: '1.2rem' }}>
              <strong style={{ color: '#a5b4fc' }}>System Architecture:</strong>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '4px' }}>{blueprint.architecture}</p>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <strong style={{ color: '#a5b4fc' }}>Target Database Schema:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                {blueprint.schema.map((sch, sIdx) => (
                  <div key={sIdx} style={{ padding: '10px', background: '#0f172a', borderRadius: '6px', minWidth: '180px' }}>
                    <strong style={{ color: '#6ee7b7', fontSize: '0.88rem' }}>Table: {sch.table}</strong>
                    <ul style={{ paddingLeft: '14px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                      {sch.fields.map((fld, fIdx) => <li key={fIdx}>{fld}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ color: '#a5b4fc' }}>Backend API Endpoints:</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '6px', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '6px', color: '#94a3b8' }}>Method</th>
                    <th style={{ padding: '6px', color: '#94a3b8' }}>Endpoint</th>
                    <th style={{ padding: '6px', color: '#94a3b8' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blueprint.endpoints.map((ep, eIdx) => (
                    <tr key={eIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px', color: '#ef4444', fontWeight: 700 }}>{ep.method}</td>
                      <td style={{ padding: '6px', color: '#6ee7b7' }}>{ep.path}</td>
                      <td style={{ padding: '6px', color: '#94a3b8' }}>{ep.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {blueprint.phases && Array.isArray(blueprint.phases) && (
              <div style={{ marginTop: '1.2rem' }}>
                <strong style={{ color: '#a5b4fc' }}>Execution Roadmap Phases:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {blueprint.phases.map((ph, pIdx) => (
                    <div key={pIdx} style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '6px' }}>
                      <strong style={{ color: '#6ee7b7', fontSize: '0.88rem' }}>{ph.phase}</strong>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>{ph.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;
