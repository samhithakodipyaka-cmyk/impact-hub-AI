import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/common/ReportModal';
import {
  IconThumbsUp,
  IconMessage,
  IconFlag,
  IconSparkles,
  IconUsers,
  IconShieldCheck,
  IconPlus,
  IconAlertCircle,
  IconCheckCircle,
} from '../components/common/Icons';

export default function CommunityFeedPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [causeFilter, setCauseFilter] = useState('All Causes');

  // New Post form state
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [postCause, setPostCause] = useState('Food & Hunger');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Comment section state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Report modal state
  const [reportTarget, setReportTarget] = useState(null);

  const causesList = [
    'All Causes',
    'Food & Hunger',
    'Environment & Nature',
    'Education & Literacy',
    'Healthcare & Blood Donation',
    'Animal Welfare',
    'Community Cleanup',
    'Civic Engagement',
  ];

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await feedService.getFeed({
        cause: causeFilter !== 'All Causes' ? causeFilter : '',
        limit: 20,
      });
      if (res.success) {
        setPosts(res.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [causeFilter]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setPosting(true);
    setError('');
    setSuccess('');

    try {
      const res = await feedService.createPost({
        content,
        mediaUrl,
        causeCategory: postCause,
      });

      if (res.success) {
        setPosts([res.post, ...posts]);
        setContent('');
        setMediaUrl('');
        setSuccess('Post published to the community feed!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!isAuthenticated) return;
    try {
      const res = await feedService.toggleLike(postId);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount }
              : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    if (!commentsMap[postId]) {
      try {
        const res = await feedService.getComments(postId);
        if (res.success) {
          setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim() || !isAuthenticated) return;
    setCommentLoading(true);

    try {
      const res = await feedService.addComment(postId, commentInput.trim());
      if (res.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.comment],
        }));
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, commentsCount: res.commentsCount } : p))
        );
        setCommentInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleFollow = async (targetId) => {
    if (!isAuthenticated) return;
    try {
      const res = await feedService.toggleFollow(targetId);
      alert(res.message);
    } catch (err) {
      alert(err.message || 'Follow action failed.');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            <IconUsers width={14} height={14} /> Community Square
          </div>
          <h1>Community Updates & Impact Stories</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time stories, field photographs, and reflections from volunteers and organizations.
          </p>
        </div>

        <div className="feed-layout">
          {/* Main Feed Column */}
          <div>
            {/* Create Post Box */}
            {isAuthenticated ? (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                  Share an Update or Activity Story
                </h3>

                {success && (
                  <div className="alert alert-success" style={{ padding: '0.6rem 1rem' }}>
                    <IconCheckCircle width={16} height={16} />
                    <span>{success}</span>
                  </div>
                )}
                {error && (
                  <div className="alert alert-error" style={{ padding: '0.6rem 1rem' }}>
                    <IconAlertCircle width={16} height={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePost}>
                  <div className="form-group">
                    <textarea
                      className="textarea-field"
                      style={{ minHeight: '90px' }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What impact did you create today? Share photos and learnings with fellow volunteers..."
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Related Cause</label>
                      <select
                        className="select-field"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.88rem' }}
                        value={postCause}
                        onChange={(e) => setPostCause(e.target.value)}
                      >
                        {causesList.filter((c) => c !== 'All Causes').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Photo URL (Optional)</label>
                      <input
                        type="url"
                        className="input-field"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.88rem' }}
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://images.example.com/field.jpg"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" disabled={posting} className="btn btn-primary btn-sm">
                      {posting ? 'Publishing...' : 'Share Update'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Log in to like posts, comment, and share your own social impact reflections.
                </p>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}

            {/* Posts List */}
            {loading ? (
              <div>
                <div className="skeleton" style={{ height: 200, marginBottom: '1.5rem' }} />
                <div className="skeleton" style={{ height: 200, marginBottom: '1.5rem' }} />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const author = post.author || {};
                const postComments = commentsMap[post._id] || [];
                const isCommentsOpen = activeCommentsPostId === post._id;

                return (
                  <article key={post._id} className="post-card">
                    {/* Post Header */}
                    <div className="post-header">
                      <div className="post-author-info">
                        <Link to={`/users/${author._id}`}>
                          {author.avatarUrl ? (
                            <img src={author.avatarUrl} alt={author.name} className="post-avatar" />
                          ) : (
                            <div className="post-avatar" style={{ background: 'var(--forest-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--forest-800)' }}>
                              {author.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </Link>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Link to={`/users/${author._id}`} style={{ fontWeight: 600, color: 'var(--forest-900)' }}>
                              {author.name}
                            </Link>
                            <span className="badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                              {author.role}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-category">{post.causeCategory}</span>
                        {isAuthenticated && author._id !== user?._id && (
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(author._id)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Follow
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setReportTarget({ type: 'post', id: post._id, title: 'Post' })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                          title="Report Post"
                        >
                          <IconFlag width={15} height={15} />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="post-content">{post.content}</div>

                    {/* Post Media */}
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Community post media"
                        className="post-media"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}

                    {/* Tied Initiative Link */}
                    {post.initiative && (
                      <div style={{ backgroundColor: 'var(--sage-surface)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>In connection with: </span>
                        <Link to={`/initiatives/${post.initiative._id}`} style={{ fontWeight: 600, color: 'var(--forest-800)' }}>
                          {post.initiative.title}
                        </Link>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="post-actions">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post._id)}
                        className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
                      >
                        <IconThumbsUp width={16} height={16} />
                        <span>{post.likesCount || 0} Likes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComments(post._id)}
                        className="post-action-btn"
                      >
                        <IconMessage width={16} height={16} />
                        <span>{post.commentsCount || 0} Comments</span>
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {isCommentsOpen && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                          {postComments.length > 0 ? (
                            postComments.map((comm) => (
                              <div key={comm._id} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0 }}>
                                  {comm.author?.name?.charAt(0) || 'U'}
                                </div>
                                <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--forest-900)' }}>
                                    {comm.author?.name}
                                  </div>
                                  <div>{comm.content}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No comments yet. Be the first to share feedback!</p>
                          )}
                        </div>

                        {isAuthenticated && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder="Write a supportive comment..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(post._id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post._id)}
                              disabled={commentLoading}
                              className="btn btn-primary btn-sm"
                            >
                              Post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No posts published in this category yet. Be the first to start a conversation!</p>
              </div>
            )}
          </div>

          {/* Feed Sidebar: Causes Filter & Community Rules */}
          <aside>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                Filter by Cause
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {causesList.map((cause) => (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => setCauseFilter(cause)}
                    className={`btn btn-sm ${causeFilter === cause ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      justifyContent: 'flex-start',
                      border: 'none',
                      background: causeFilter === cause ? 'var(--forest-800)' : 'transparent',
                    }}
                  >
                    {cause}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--forest-800)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <IconShieldCheck width={16} height={16} /> Community Trust Charter
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Share genuine on-site updates and celebrate verified volunteer outcomes. Spam, unverified claims, and commercial solicitation are moderated.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          title={reportTarget.title}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
