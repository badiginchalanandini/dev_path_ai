import React, { useState, useEffect } from 'react';

const SkillGapView = ({ data }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!data) return null;

  const slides = [
    {
      src: "/skill_gap_bridge.png",
      badge: "💡 Growth Mindset",
      title: "Bridge the Competency Gap",
      quote: "Every missing skill is just an opportunity waiting to be unlocked. Follow your 90-Day learning path to complete the transition.",
      color: "rgba(99, 102, 241, 0.04)",
      borderColor: "rgba(99, 102, 241, 0.2)",
      badgeColor: "#a5b4fc",
      highlight: "Consistency defeats intensity. Start learning!"
    },
    {
      src: "/career_growth.png",
      badge: "🚀 Future Outlook",
      title: "Accelerate Career Trajectory",
      quote: `Targeting your dream role as a ${data.career_goal || 'Engineer'} requires mastering the underlying design. Level up one sprint at a time.`,
      color: "rgba(16, 185, 129, 0.04)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      badgeColor: "#6ee7b7",
      highlight: "Unlock opportunities with direct roadmap actions."
    },
    {
      src: "/learning_brain.png",
      badge: "🧠 Active Mastery",
      title: "Consolidate Tech Domain",
      quote: "Knowledge compounding is real. The more skills you acquire, the easier it becomes to pick up new frameworks and system architectures.",
      color: "rgba(245, 158, 11, 0.04)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      badgeColor: "#fcd34d",
      highlight: "Turn knowledge gaps into engineering strengths."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        @keyframes floatEffect {
          0% { transform: translateY(0px); filter: drop-shadow(0 8px 16px rgba(99,102,241,0.2)); }
          50% { transform: translateY(-6px); filter: drop-shadow(0 16px 24px rgba(99,102,241,0.4)); }
          100% { transform: translateY(0px); filter: drop-shadow(0 8px 16px rgba(99,102,241,0.2)); }
        }
        .animated-motivation-image {
          animation: floatEffect 4.5s ease-in-out infinite;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          max-width: 100%;
          max-height: 180px;
          object-fit: contain;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          transition: transform 0.3s ease;
        }
        .animated-motivation-image:hover {
          transform: scale(1.03);
        }
        .slide-fade-container {
          transition: opacity 0.4s ease-in-out;
        }
      `}</style>

      {/* Main Split Layout Grid */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.30fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT PANEL: SKILL GAP DATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Skill Match Index Card */}
          <div className="glass-panel content-card">
            <h3 style={{ color: '#a5b4fc', marginBottom: '1.2rem', fontSize: '1.4rem' }}>⚡ Technical Skill Gap Analysis</h3>
            
            <div style={{ marginBottom: '1.8rem', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--primary)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{data.matchPercentage}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Job Role Preparedness Score</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Your current profile matches {data.matchPercentage}% of technical requirements for your target role.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Acquired Skills */}
              <div style={{ padding: '1.2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
                <h4 style={{ color: '#10b981', marginBottom: '10px', fontSize: '1.05rem' }}>✓ Skills Met</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {data.acquiredSkills?.map((skill, idx) => (
                    <span key={idx} className="badge badge-success" style={{ textTransform: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div style={{ padding: '1.2rem', background: 'rgba(15,23,42,0.4)', borderRadius: '8px' }}>
                <h4 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '1.05rem' }}>✗ Missing Skills Identified</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {data.missingSkills?.map((item, idx) => (
                    <div key={idx} style={{ paddingBottom: '12px', borderBottom: idx !== data.missingSkills.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#fca5a5', fontSize: '0.95rem' }}>{item.skill}</strong>
                        <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>{item.importance} Priority</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '5px' }}>
                        <strong>Why:</strong> {item.reason}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#a5b4fc', marginTop: '4px' }}>
                        <strong>How to Learn:</strong> {item.howToLearn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: STICKY ANIMATED MOTIVATION CAROUSEL */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div 
            className="glass-panel content-card slide-fade-container" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center', 
              padding: '1.8rem 1.5rem', 
              background: slides[activeSlide].color, 
              border: `1px solid ${slides[activeSlide].borderColor}`,
              borderRadius: '12px',
              minHeight: '440px',
              transition: 'all 0.5s ease'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: slides[activeSlide].badgeColor, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', transition: 'color 0.5s ease' }}>
              {slides[activeSlide].badge}
            </span>
            <h4 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.2rem', fontWeight: 700 }}>
              {slides[activeSlide].title}
            </h4>
            
            <div style={{ margin: '0.2rem 0 1.5rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img
                src={slides[activeSlide].src}
                alt={slides[activeSlide].title}
                key={activeSlide} // Triggers animation reset on change
                className="animated-motivation-image"
              />
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.55', maxWidth: '300px', minHeight: '80px', margin: '0 auto 1.2rem' }}>
              "{slides[activeSlide].quote}"
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 500 }}>
                {slides[activeSlide].highlight}
              </span>
            </div>

            {/* Slideshow Pagination Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    padding: 0,
                    background: index === activeSlide ? slides[activeSlide].badgeColor : 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SkillGapView;
