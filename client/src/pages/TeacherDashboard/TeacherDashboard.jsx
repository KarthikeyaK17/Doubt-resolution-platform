import React, { useEffect, useState } from 'react';
import styles from './TeacherDashboard.module.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TeacherChat from '../TeacherChat/TeacherChat'; // adjust path if needed

const TeacherDashboard = () => {
  const [doubts, setDoubts] = useState([]);
  const [filter, setFilter] = useState({ branch: '', status: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const navigate = useNavigate();

  const branches = Array.from(
    new Set(doubts.map(d => d.student?.branch?.trim()).filter(Boolean))
  );

  const fetchDoubts = async (branchFilter = '', statusFilter = '', sortMethod = 'createdAt') => {
    setLoading(true);
    setError(null);
    try {
      const params = { sortBy: sortMethod };
      if (branchFilter) params.branch = branchFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(
        'http://localhost:5000/api/doubts/teacher/all-doubts',
        { params, withCredentials: true }
      );
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load doubts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts(filter.branch, filter.status, sortBy);
  }, [filter, sortBy]);

  const handleDoubtClick = (doubt) => {
    navigate(`/teacher/doubts/${doubt._id}`);
  };

  // Example teacher info — replace with real data from context or auth
  const teacherId = "teacher123";
  const teacherName = "Mr. Smith";

  return (
    <div className={styles.dashboard}>
      <h2>Teacher Dashboard</h2>

      <button 
        className={styles.liveChatButton} 
        onClick={() => setShowChat(true)}
      >
        💬 Live Chat
      </button>

      {showChat ? (
        <div className={styles.chatWrapper}>
          <button 
            className={styles.closeChatButton} 
            onClick={() => setShowChat(false)}
          >
            ✖ Close Chat
          </button>
          <TeacherChat teacherId={teacherId} teacherName={teacherName} />
        </div>
      ) : (
        <>
          <div className={styles.filters}>
            <select
              value={filter.branch}
              onChange={e => setFilter({ ...filter, branch: e.target.value })}
              disabled={loading}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="solved">Solved</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              disabled={loading}
            >
              <option value="createdAt">Latest</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>

          {loading && <p>Loading doubts...</p>}
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.doubtList}>
            {!loading && doubts.length === 0 && (
              <p>No doubts found for selected filters.</p>
            )}

            {!loading &&
              doubts.map(doubt => {
                const statusLower = (doubt.status || '').toLowerCase().trim();
                return (
                  <div
                    key={doubt._id}
                    className={styles.doubtCard}
                    onClick={() => handleDoubtClick(doubt)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => { if (e.key === 'Enter') handleDoubtClick(doubt); }}
                  >
                    <h4>{doubt.subject?.trim() || 'Untitled Doubt'}</h4>

                    <p>{doubt.description || doubt.doubtText || 'No description available.'}</p>
                    <p><strong>Branch:</strong> {doubt.student?.branch || 'N/A'}</p>
                    <p><strong>Upvotes:</strong> {doubt.upvotes || 0}</p>
                    <p className={statusLower === 'pending' ? styles.pending : styles.solved}>
                      {doubt.status?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
