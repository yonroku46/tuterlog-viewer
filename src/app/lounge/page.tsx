'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, User, Search, MapPin, AlertCircle, Send, Image as ImageIcon, Flag, Trash2, Eye, PenSquare, ChevronDown } from 'lucide-react';
import SlideDialog from '@/components/dialog/SlideDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import './Lounge.scss';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const CENTERS = ['TutorLog 필라테스 강남점', 'TutorLog 요가 서초점', 'TutorLog 번지 피트니스 광교점'];

const MOCK_POSTS: CenterPost[] = [
  {
    postId: '1',
    centerId: 'c1',
    author: '관리자',
    center: 'TutorLog 필라테스 강남점',
    date: '2026-05-11 14:20',
    content: '안녕하세요! 우리 센터에 새로운 필라테스 기구가 도입되었습니다. 리포머 룸에서 확인해보세요!',
    images: ['https://images.unsplash.com/photo-1518611012118-29a81f3c9c2c?w=800&auto=format&fit=crop&q=60'],
    likes: 12,
    comments: [
      { commentId: '101', postId: '1', author: '김지현', date: '2026-05-11 14:22', content: '와 리포머 룸 기대되네요!' },
      { commentId: '102', postId: '1', author: '이성민', date: '2026-05-11 14:24', content: '내일 수업 때 가봐야겠어요.' },
    ],
  },
  {
    postId: '2',
    centerId: 'c1',
    author: '이유나 강사',
    center: 'TutorLog 요가 서초점',
    date: '2026-05-11 12:00',
    content: '오늘 오전 수업 다들 수고 많으셨습니다! 스트레칭 잊지 마시고 내일 또 봬요 :)',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60'],
    likes: 24,
    comments: [
      { commentId: '201', postId: '2', author: '박은지', date: '2026-05-11 13:00', content: '선생님 오늘 수업 너무 시원했어요!' },
    ],
  },
  {
    postId: '3',
    centerId: 'c2',
    author: '박소윤 강사',
    center: 'TutorLog 필라테스 강남점',
    date: '2026-05-10 18:00',
    content: '여름 맞이 바디 챌린지가 시작됩니다! 관심 있으신 분들은 인포데스크로 문의주세요.',
    images: [],
    likes: 18,
    comments: [],
  }
];

const SafeImage = ({ src, alt }: { src: string; alt: string; }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="image-error-fallback">
        <ImageIcon size={40} />
        <span>이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '13rem' }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        style={{ objectFit: 'cover' }}
        onError={() => setError(true)} 
      />
    </div>
  );
};

const LoungePost = ({ 
  post, 
  isReported,
  onOpenComments,
  onReport
}: { 
  post: CenterPost;
  isReported: boolean;
  onOpenComments: (post: CenterPost) => void;
  onReport: (id: string) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [revealReported, setRevealReported] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleReport = () => {
    if (confirm('이 게시글을 신고하시겠습니까? 신고 후에는 게시글이 숨겨집니다.')) {
      onReport(post.postId);
      setIsMenuOpen(false);
    }
  };

  return (
    <article className={`lounge-post ${isReported && !revealReported ? 'is-reported' : ''}`}>
      {isReported && !revealReported && (
        <div className="reported-overlay">
          <AlertCircle size={32} />
          <p>신고한 게시글입니다</p>
          <button className="reveal-btn" onClick={() => setRevealReported(true)}>
            <Eye size={14} />
            내용 보기
          </button>
        </div>
      )}

      <div className="post-header">
        <div className="author-info">
          <div className="author-avatar">
            <User size={20} />
          </div>
          <div className="meta">
            <div className="name-row">
              <span className="author-name">{post.author}</span>
              <span className="center-tag">
                <MapPin size={10} />
                {post.center.split('TutorLog ')[1] || post.center}
              </span>
            </div>
            <span className="post-date">{dayjs(post.date).fromNow()}</span>
          </div>
        </div>
        <div className="more-menu-container" ref={menuRef}>
          <button className="more-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button onClick={handleReport} disabled={isReported} style={isReported ? { opacity: 0.5, cursor: 'default', color: '#8e8e93' } : {}}>
                <Flag size={14} />
                {isReported ? '이미 신고됨' : '게시글 신고하기'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((img, idx) => (
              <SafeImage key={idx} src={img} alt="post content" />
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className="action-btn">
          <Heart size={20} />
          <span>{post.likes}</span>
        </button>
        <button className="action-btn" onClick={() => onOpenComments(post)}>
          <MessageCircle size={20} />
          <span>{post.comments.length}</span>
        </button>
      </div>
    </article>
  );
};

export default function LoungePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CenterPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCenter, setNewPostCenter] = useState(CENTERS[0]);

  // 로컬 스토리지에서 신고된 ID 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('reported_post_ids');
    if (saved) {
      try {
        setReportedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse reported IDs', e);
      }
    }
  }, []);

  const filteredPosts = useMemo(() => {
    return MOCK_POSTS.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCenter = !selectedCenter || post.center === selectedCenter;
      return matchesSearch && matchesCenter;
    });
  }, [searchQuery, selectedCenter]);

  const handleOpenComments = (post: CenterPost) => {
    setSelectedPost(post);
    setCommentDialogOpen(true);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    alert(`댓글이 작성되었습니다: ${newComment}`);
    setNewComment('');
  };

  const handleReportPost = (id: string) => {
    const newReportedIds = [...reportedIds, id];
    setReportedIds(newReportedIds);
    localStorage.setItem('reported_post_ids', JSON.stringify(newReportedIds));
    alert('신고가 접수되었습니다. 해당 게시글은 이제 숨겨집니다.');
  };

  const getRelativeTime = (date: string) => {
    return dayjs(date).fromNow();
  };

  const handleCloseWriteDialog = () => {
    if (newPostContent.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        setIsWriteDialogOpen(false);
        setNewPostContent('');
      }
    } else {
      setIsWriteDialogOpen(false);
    }
  };

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) return;
    alert('게시글이 등록되었습니다.');
    setIsWriteDialogOpen(false);
    setNewPostContent('');
  };

  return (
    <div className="lounge-page">
      <div className="search-filter-section">
        <div className={`search-row ${isSearchFocused || searchQuery ? 'is-searching' : ''}`}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="글 내용이나 작성자를 검색해보세요" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <button className="write-btn" onClick={() => setIsWriteDialogOpen(true)}>
            <PenSquare size={20} />
          </button>
        </div>
        
        <div className="center-filter">
          <button
            className={`filter-chip ${selectedCenter === null ? 'active' : ''}`}
            onClick={() => setSelectedCenter(null)}
          >
            전체
          </button>
          {CENTERS.map((center) => (
            <button
              key={center}
              className={`filter-chip ${selectedCenter === center ? 'active' : ''}`}
              onClick={() => setSelectedCenter(center)}
            >
              {center.split('TutorLog ')[1] || center}
            </button>
          ))}
        </div>
      </div>

      <div className="posts-container">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <LoungePost 
              key={post.postId} 
              post={post} 
              isReported={reportedIds.includes(post.postId)}
              onOpenComments={handleOpenComments} 
              onReport={handleReportPost}
            />
          ))
        ) : (
          <div className="empty-posts">
            <AlertCircle size={48} />
            <p>조건에 맞는 게시글이 없습니다.</p>
          </div>
        )}
      </div>

      <SlideDialog
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        title={selectedPost ? `${selectedPost.author}님의 글에 댓글` : '댓글'}
        noPadding
        footer={
          <div className="comment-input-area">
            <input 
              type="text" 
              placeholder="댓글을 입력하세요..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button className={`send-btn ${newComment.trim() ? 'active' : ''}`} onClick={handleSendComment}>
              <Send size={20} />
            </button>
          </div>
        }
      >
        <div className="comment-list-view">
          {selectedPost && (
            <div className="original-post-preview">
              <div className="preview-author">
                <div className="avatar">
                  <User size={14} />
                </div>
                <span className="name">{selectedPost.author}</span>
                <span className="center">{selectedPost.center.split('TutorLog ')[1] || selectedPost.center}</span>
              </div>
              <p className="preview-content">{selectedPost.content}</p>
            </div>
          )}

          {selectedPost && selectedPost.comments.length > 0 ? (
            <div className="comments-section">
              {selectedPost.comments.map((comment) => (
                <div key={comment.commentId} className="comment-item">
                  <div className="comment-avatar">
                    <User size={16} />
                  </div>
                  <div className="comment-content-wrap">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{getRelativeTime(comment.date)}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-comments">
              <MessageCircle size={40} />
              <p>첫 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </SlideDialog>

      <SlideDialog
        noPadding
        isOpen={isWriteDialogOpen}
        onClose={handleCloseWriteDialog}
        title="새 글 작성"
        footer={
          <div className="write-dialog-footer">
            <button 
              className={`submit-btn ${newPostContent.trim() ? 'active' : ''}`}
              onClick={handleSubmitPost}
              disabled={!newPostContent.trim()}
            >
              등록하기
            </button>
          </div>
        }
      >
        <div className="write-post-view">
          <div className="center-selector-wrap">
            <label>게시할 센터</label>
            <div className="select-box-wrap">
              <select 
                value={newPostCenter}
                onChange={(e) => setNewPostCenter(e.target.value)}
              >
                {CENTERS.map(center => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="select-arrow" />
            </div>
          </div>

          <div className="post-input-wrap">
            <textarea 
              placeholder="센터 회원들과 공유하고 싶은 소식을 적어보세요..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={10}
            />
          </div>

          <div className="image-upload-placeholder">
            <div className="upload-btn">
              <ImageIcon size={24} />
              <span>사진 추가 (최대 5장)</span>
            </div>
          </div>
        </div>
      </SlideDialog>
    </div>
  );
}
