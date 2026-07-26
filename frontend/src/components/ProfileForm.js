import React, { useState, useEffect } from 'react';
import { profileAPI, aiAPI } from '../services/api';

const skillSuggestionsMap = {
  'full stack': ['Node.js', 'React', 'Express.js', 'MySQL', 'Docker', 'REST APIs', 'Git', 'TypeScript'],
  'frontend': ['React', 'TypeScript', 'CSS/Sass', 'Redux', 'Webpack', 'TailwindCSS', 'HTML5', 'Next.js'],
  'backend': ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker', 'System Design', 'REST APIs', 'MongoDB'],
  'devops': ['Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Linux Shell', 'Terraform', 'Nginx'],
  'data scientist': ['Python', 'SQL', 'Pandas', 'TensorFlow', 'Scikit-Learn', 'Machine Learning', 'Data Visualization'],
  'data engineer': ['Python', 'SQL', 'Spark', 'Airflow', 'Snowflake', 'ETL Pipelines', 'Hadoop'],
  'software engineer': ['Data Structures & Algorithms', 'System Design', 'Git', 'Java', 'Python', 'SQL', 'REST APIs'],
  'mobile': ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Mobile UI Design', 'iOS/Android APIs'],
  'cloud': ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Linux', 'Cloud Architecture', 'IAM Security'],
  'cybersecurity': ['Network Security', 'Penetration Testing', 'Cryptography', 'Linux', 'OWASP Top 10', 'Python']
};

const getSuggestedSkills = (goal, company) => {
  const suggested = new Set();
  const goalLower = (goal || '').toLowerCase();
  const companyLower = (company || '').toLowerCase();

  // Check goal matches
  Object.keys(skillSuggestionsMap).forEach(key => {
    if (goalLower.includes(key)) {
      skillSuggestionsMap[key].forEach(s => suggested.add(s));
    }
  });

  // Default fallback if no match but goal is typed
  if (suggested.size === 0 && goalLower.trim().length > 0) {
    ['Data Structures & Algorithms', 'Git', 'System Design', 'REST APIs'].forEach(s => suggested.add(s));
  }

  // Add dream company specific recommendations
  if (companyLower.length > 0) {
    if (['google', 'meta', 'facebook', 'amazon', 'microsoft', 'netflix', 'apple'].some(c => companyLower.includes(c))) {
      suggested.add('Data Structures & Algorithms');
      suggested.add('System Design');
      suggested.add('Scalability');
    }
    if (['stripe', 'uber', 'airbnb', 'grab'].some(c => companyLower.includes(c))) {
      suggested.add('System Design');
      suggested.add('REST APIs');
      suggested.add('Microservices');
    }
  }

  return Array.from(suggested);
};

const ProfileForm = ({ onInsightsGenerated, initialProfile }) => {
  const [formData, setFormData] = useState({
    student_name: initialProfile?.student_name || '',
    college: initialProfile?.college || '',
    year: initialProfile?.year || 1,
    degree: initialProfile?.degree || '',
    branch: initialProfile?.branch || '',
    current_skills: initialProfile?.current_skills || '',
    interested_skills: initialProfile?.interested_skills || '',
    career_goal: initialProfile?.career_goal || '',
    dream_company: initialProfile?.dream_company || '',
    daily_hours: initialProfile?.daily_hours || 4,
    cgpa: initialProfile?.cgpa || '8.0'
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Compute dynamic suggestions on form input changes
  useEffect(() => {
    const suggested = getSuggestedSkills(formData.career_goal, formData.dream_company);
    setSuggestions(suggested);
  }, [formData.career_goal, formData.dream_company]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagClick = (tag) => {
    const currentList = formData.interested_skills
      ? formData.interested_skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    let newList;
    if (currentList.includes(tag)) {
      newList = currentList.filter(s => s !== tag);
    } else {
      newList = [...currentList, tag];
    }
    
    setFormData({ ...formData, interested_skills: newList.join(', ') });
  };

  const handleAutofillAll = () => {
    if (suggestions.length > 0) {
      setFormData({ ...formData, interested_skills: suggestions.join(', ') });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Pre-populate interested_skills with suggestions if it's left blank
    let finalFormData = { ...formData };
    if (!formData.interested_skills.trim() && suggestions.length > 0) {
      finalFormData.interested_skills = suggestions.join(', ');
    }

    try {
      // 1. Save Profile Inputs to MySQL
      await profileAPI.saveProfile(finalFormData);
      
      // 2. Generate and Save Career Mentor Insights
      const aiRes = await aiAPI.generateAllInsights();
      if (aiRes.data && aiRes.data.success) {
        onInsightsGenerated(aiRes.data.data);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error processing career mentor insights.');
    } finally {
      setLoading(false);
    }
  };

  const currentInterestedArray = formData.interested_skills
    ? formData.interested_skills.split(',').map(s => s.trim())
    : [];

  return (
    <form className="glass-panel content-card" onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.2rem', color: '#a5b4fc' }}>📝 Mentorship Questionnaire</h3>
      {msg && <div className="alert alert-error">{msg}</div>}

      {/* Row 1: Name & College */}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Student Name</label>
          <input
            type="text"
            className="form-input"
            name="student_name"
            required
            value={formData.student_name}
            onChange={handleChange}
            placeholder="Alex Smith"
          />
        </div>

        <div className="form-group">
          <label className="form-label">College / University</label>
          <input
            type="text"
            className="form-input"
            name="college"
            required
            value={formData.college}
            onChange={handleChange}
            placeholder="Stanford University"
          />
        </div>
      </div>

      {/* Row 2: Year, Degree, Branch */}
      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">Current Academic Year</label>
          <select className="form-select" name="year" value={formData.year} onChange={handleChange}>
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Degree</label>
          <input
            type="text"
            className="form-input"
            name="degree"
            required
            value={formData.degree}
            onChange={handleChange}
            placeholder="B.Tech / B.S."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Branch / Major</label>
          <input
            type="text"
            className="form-input"
            name="branch"
            required
            value={formData.branch}
            onChange={handleChange}
            placeholder="Computer Science"
          />
        </div>
      </div>

      {/* Row 3: Target Role & Dream Company (Moved to top so suggestions can populate) */}
      <div className="grid-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Target Career Goal / Role</label>
          <input
            type="text"
            className="form-input"
            name="career_goal"
            required
            value={formData.career_goal}
            onChange={handleChange}
            placeholder="Full Stack Developer / DevOps Engineer"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Dream Company</label>
          <input
            type="text"
            className="form-input"
            name="dream_company"
            required
            value={formData.dream_company}
            onChange={handleChange}
            placeholder="Google / Stripe / Netflix"
          />
        </div>
      </div>

      {/* Row 4: Skills Known & Skills to Learn with dynamic suggestions */}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Technical Skills You Know (Comma Separated)</label>
          <textarea
            className="form-textarea"
            name="current_skills"
            rows={2}
            required
            value={formData.current_skills}
            onChange={handleChange}
            placeholder="HTML, CSS, JavaScript, Basic SQL"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Skills You Want to Learn</label>
            {suggestions.length > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                onClick={handleAutofillAll}
              >
                ✨ Autofill Suggested
              </button>
            )}
          </div>
          <textarea
            className="form-textarea"
            name="interested_skills"
            rows={2}
            value={formData.interested_skills}
            onChange={handleChange}
            placeholder={suggestions.length > 0 ? `e.g. ${suggestions.slice(0, 3).join(', ')}` : "Node.js, React, Docker"}
          />

          {/* Dynamic Suggestion Pills */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                💡 Recommended for {formData.career_goal || 'your goal'} at {formData.dream_company || 'your target company'}:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {suggestions.map((tag, idx) => {
                  const isActive = currentInterestedArray.includes(tag);
                  return (
                    <span
                      key={idx}
                      onClick={() => handleTagClick(tag)}
                      className={`badge ${isActive ? 'badge-primary' : 'badge-outline'}`}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s',
                        background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        color: isActive ? '#fff' : '#cbd5e1'
                      }}
                    >
                      {isActive ? `✓ ${tag}` : `+ ${tag}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Committed Hours & CGPA */}
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Daily Study Hours Committed</label>
          <input
            type="number"
            className="form-input"
            name="daily_hours"
            min={1}
            max={24}
            required
            value={formData.daily_hours}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Current CGPA / GPA</label>
          <input
            type="text"
            className="form-input"
            name="cgpa"
            required
            value={formData.cgpa}
            onChange={handleChange}
            placeholder="8.5"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.2rem', padding: '12px' }} disabled={loading}>
        {loading ? '🧠 Architecting Your Career Path...' : '🎯 Generate AI Mentorship Package'}
      </button>
    </form>
  );
};

export default ProfileForm;
