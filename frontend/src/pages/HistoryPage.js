import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { historyAPI } from '../services/api';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await historyAPI.listHistory(search, filter, page, 5);
      if (res.data && res.data.success) {
        setHistoryItems(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to retrieve generation history.');
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleToggleFavorite = async (id) => {
    try {
      await historyAPI.toggleFavorite(id);
      // Toggle state locally to keep responsive visual update
      setHistoryItems(
        historyItems.map((item) =>
          item.id === id ? { ...item, is_favorite: item.is_favorite ? 0 : 1 } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history log?')) return;
    try {
      await historyAPI.deleteEntry(id);
      setHistoryItems(historyItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatPayloadToText = (item, payload) => {
    let text = `==================================================\n`;
    text += `          DEVPATH AI - MENTORSHIP REPORT          \n`;
    text += `==================================================\n\n`;
    text += `Report Title: ${item.title}\n`;
    text += `Document Type: ${item.type === 'career_plan' ? 'AI Career Roadmap' : 'Project Blueprint'}\n`;
    text += `Generated on: ${new Date(item.created_at).toLocaleString()}\n\n`;
    text += `--------------------------------------------------\n\n`;

    if (item.type === 'career_plan') {
      text += `1. TECHNICAL SKILL GAP ANALYSIS\n`;
      text += `===============================\n`;
      text += `Job Preparedness Score: ${payload.skill_gap_analysis?.matchPercentage || 0}%\n\n`;
      
      text += `Acquired Skills (Met requirements):\n`;
      if (payload.skill_gap_analysis?.acquiredSkills?.length) {
        payload.skill_gap_analysis.acquiredSkills.forEach(s => {
          text += `  [✓] ${s}\n`;
        });
      } else {
        text += `  None listed.\n`;
      }
      text += `\n`;

      text += `Identified Missing Skills:\n`;
      if (payload.skill_gap_analysis?.missingSkills?.length) {
        payload.skill_gap_analysis.missingSkills.forEach(m => {
          text += `  [*] Skill: ${m.skill}\n`;
          text += `      Priority: ${m.importance || 'Medium'}\n`;
          text += `      Why needed: ${m.reason}\n`;
          text += `      How to learn: ${m.howToLearn}\n\n`;
        });
      } else {
        text += `  None identified.\n\n`;
      }

      text += `2. 90-DAY CAREER ROADMAP PLAN\n`;
      text += `==============================\n`;
      if (payload.roadmap_90_day?.phases?.length) {
        payload.roadmap_90_day.phases.forEach(p => {
          text += `Phase ${p.phaseNumber}: ${p.title} (${p.timeframe || 'N/A'})\n`;
          text += `  Focus Area: ${p.focus}\n`;
          text += `  Goal/Milestone: ${p.milestone}\n\n`;
        });
      } else {
        text += `  No roadmap phases generated.\n\n`;
      }

      text += `3. WEEKLY LEARNING TIMETABLE\n`;
      text += `============================\n`;
      if (payload.weekly_learning_plan?.weeks?.length) {
        payload.weekly_learning_plan.weeks.forEach(w => {
          text += `Week ${w.weekNumber}: ${w.theme || 'Core Studies'}\n`;
          if (w.dailyBreakdown?.length) {
            w.dailyBreakdown.forEach(d => {
              text += `  - ${d.day}: ${d.topic} (Dedicated: ${d.hours || 0} hrs/day)\n`;
            });
          }
          text += `\n`;
        });
      } else {
        text += `  No learning timetable generated.\n\n`;
      }

      text += `4. SUGGESTED RESOURCES\n`;
      text += `======================\n`;
      text += `Recommended Courses:\n`;
      if (payload.recommended_courses?.length) {
        payload.recommended_courses.forEach(c => {
          text += `  - ${c.courseName} (${c.platform}) - Focus: ${c.focus}\n`;
        });
      } else {
        text += `  - None suggested.\n`;
      }
      text += `\n`;

      text += `Recommended Books:\n`;
      if (payload.books?.length) {
        payload.books.forEach(b => {
          text += `  - "${b.title}" by ${b.author} (Target area: ${b.focus})\n`;
        });
      } else {
        text += `  - None suggested.\n`;
      }
      text += `\n`;

      text += `Recommended Channels:\n`;
      if (payload.youtube_channels?.length) {
        payload.youtube_channels.forEach(ch => {
          text += `  - ${ch.channelName} (${ch.link}) - Focus: ${ch.focus}\n`;
        });
      } else {
        text += `  - None suggested.\n`;
      }
      text += `\n`;
    } else {
      // Project Blueprint
      text += `1. SUMMARY & PROBLEM STATEMENT\n`;
      text += `==============================\n`;
      text += `Project Title: ${payload.project_title || 'N/A'}\n`;
      text += `Description: ${payload.description || 'N/A'}\n`;
      text += `Problem Statement: ${payload.problem_statement || 'N/A'}\n\n`;

      text += `2. ARCHITECTURAL PATTERN\n`;
      text += `========================\n`;
      text += `${payload.architecture || 'N/A'}\n\n`;

      text += `3. TARGET DATABASE SCHEMA TABLES\n`;
      text += `================================\n`;
      if (payload.schema?.length) {
        payload.schema.forEach(tableObj => {
          text += `Table: ${tableObj.table}\n`;
          if (tableObj.fields?.length) {
            tableObj.fields.forEach(field => {
              text += `  - ${field}\n`;
            });
          }
          text += `\n`;
        });
      } else if (payload.database_schema?.length) {
        payload.database_schema.forEach(tableObj => {
          text += `Table: ${tableObj.table}\n`;
          if (tableObj.columns?.length) {
            tableObj.columns.forEach(col => {
              text += `  - ${col}\n`;
            });
          }
          text += `\n`;
        });
      } else {
        text += `  No database schemas listed.\n\n`;
      }

      text += `4. BACKEND API ENDPOINTS LIST\n`;
      text += `=============================\n`;
      const apis = payload.endpoints || payload.api_list;
      if (apis?.length) {
        apis.forEach(endpoint => {
          text += `  [${endpoint.method || 'GET'}] ${endpoint.path} -> ${endpoint.desc || endpoint.description || 'API Action'}\n`;
        });
        text += `\n`;
      } else {
        text += `  No API endpoints defined.\n\n`;
      }

      text += `5. SYSTEM IMPLEMENTATION PHASES\n`;
      text += `===============================\n`;
      const phases = payload.phases || payload.timeline;
      if (phases?.length) {
        phases.forEach(ph => {
          const phaseTitle = ph.phase || ph.milestone || 'Phase';
          const phaseDesc = ph.desc || ph.duration || 'Details';
          text += `* ${phaseTitle}:\n`;
          text += `  Details: ${phaseDesc}\n\n`;
        });
      } else {
        text += `  No execution roadmap timeline defined.\n\n`;
      }
    }

    text += `==================================================\n`;
    text += `          END OF GENERATED REPORT PROFILE         \n`;
    text += `==================================================\n`;
    return text;
  };

  const handleDownload = (item) => {
    try {
      const parsedPayload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
      const reportText = formatPayloadToText(item, parsedPayload);
      
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      // Sanitize title to construct safe filename
      const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      downloadAnchor.download = `${cleanTitle}_report.txt`;
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download execution failed:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="glass-panel content-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📂 Generation History</h2>
          <p style={{ color: '#94a3b8' }}>
            Browse, search, download, or bookmark your generated AI career roadmaps and project plans.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="🔍 Search history logs by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="career_plan">Career Roadmaps</option>
            <option value="project_plan">Project Blueprints</option>
          </select>
        </div>

        {loading ? (
          <Loading message="Fetching history archives..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchHistory} />
        ) : historyItems.length === 0 ? (
          <div className="glass-panel content-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#94a3b8' }}>No history records match the filter criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyItems.map((item) => {
              const isExpanded = expandedId === item.id;
              // Parse payload if it is string
              const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;

              return (
                <div key={item.id} className="glass-panel" style={{ padding: '1.2rem 1.8rem', borderLeft: item.type === 'career_plan' ? '4px solid var(--primary)' : '4px solid var(--success)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className={`badge ${item.type === 'career_plan' ? 'badge-primary' : 'badge-success'}`} style={{ marginBottom: '6px' }}>
                        {item.type === 'career_plan' ? 'Career Plan' : 'Project Plan'}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Generated on: {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', borderColor: item.is_favorite ? 'var(--warning)' : 'rgba(255,255,255,0.1)' }}
                        onClick={() => handleToggleFavorite(item.id)}
                      >
                        {item.is_favorite ? '⭐ Favorited' : '☆ Favorite'}
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => handleDownload(item)}
                      >
                        📥 Download Report (.txt)
                      </button>

                      <button
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑️ Delete
                      </button>

                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        {isExpanded ? '▲ Collapse' : '▼ Expand'}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Expansion Drawer */}
                  {isExpanded && (
                    <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <h5 style={{ color: '#a5b4fc', marginBottom: '12px', fontSize: '1rem', fontWeight: 600 }}>🔍 Summary Output Preview</h5>
                      {item.type === 'career_plan' ? (
                        <div className="grid-3" style={{ gap: '1rem', marginTop: '10px' }}>
                          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PREPAREDNESS INDEX</span>
                            <strong style={{ fontSize: '1.3rem', color: '#6ee7b7' }}>{payload.skill_gap_analysis?.matchPercentage || 0}% Match</strong>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>90-DAY KEY FOCUS AREA</span>
                            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>{payload.roadmap_90_day?.phases?.[0]?.focus || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                          <div className="grid-3" style={{ gap: '1rem' }}>
                            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ARCHITECTURE</span>
                              <strong style={{ fontSize: '0.9rem', color: '#a5b4fc' }}>{payload.architecture || 'Modular / Clean'}</strong>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', gridColumn: 'span 2' }}>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>TECHNOLOGY STACK</span>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                {(payload.features || payload.techStack || payload.tech_stack || ['React', 'Express', 'SQL']).map((tech, tIdx) => (
                                  <span key={tIdx} className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'none', padding: '4px 8px' }}>
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PROJECT DESCRIPTION</span>
                            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>{payload.description || 'Custom tailored software blueprint.'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  ◀ Previous
                </button>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
