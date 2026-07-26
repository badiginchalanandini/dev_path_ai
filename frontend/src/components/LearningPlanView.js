import React from 'react';

const LearningPlanView = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel content-card">
        <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem', fontSize: '1.4rem' }}>📅 Timetable Learning Plan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {data.weeks?.map((week, idx) => (
            <div key={idx} style={{ padding: '1.2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
              <h4 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '1.1rem' }}>
                Week {week.weekNumber}: {week.theme}
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>Days</th>
                    <th style={{ padding: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>Topic Focus</th>
                    <th style={{ padding: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>Commitment</th>
                  </tr>
                </thead>
                <tbody>
                  {week.dailyBreakdown?.map((day, dayIdx) => (
                    <tr key={dayIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 600, color: '#a5b4fc', fontSize: '0.88rem' }}>{day.day}</td>
                      <td style={{ padding: '8px 6px', color: '#e2e8f0', fontSize: '0.88rem' }}>{day.topic}</td>
                      <td style={{ padding: '8px 6px', color: '#6ee7b7', fontSize: '0.88rem' }}>{day.hours} hrs/day</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPlanView;
