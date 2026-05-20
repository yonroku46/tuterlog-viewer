'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, User, Search, MapPin, AlertCircle, Send, Image as ImageIcon, Flag, Eye, PenSquare, ChevronDown, X, Loader2, Trash2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/providers/AuthProvider';
import SlideDialog from '@/components/dialog/SlideDialog';
import AppImage from '@/components/contents/AppImage';
import LoadingSpinner from '@/components/contents/LoadingSpinner';
import EmptyState from '@/components/contents/EmptyState';
import LoungeService from '@/api/service/LoungeService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import './Lounge.scss';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const SafeImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '13rem' }}>
      <AppImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        style={{ objectFit: 'cover' }}
        fallback={
          <div className="image-error-fallback">
            <ImageIcon size={40} />
            <span>이미지를 불러올 수 없습니다</span>
          </div>
        }
      />
    </div>
  );
};

const LoungePost = ({
  post,
  isReported,
  currentUser,
  onOpenComments,
  onReport,
  onLike,
  onEdit,
  onDelete,
}: {
  post: CenterPostRes;
  isReported: boolean;
  currentUser: any;
  onOpenComments: (post: CenterPostRes) => void;
  onReport: (id: string) => void;
  onLike: (post: CenterPostRes) => void;
  onEdit: (post: CenterPostRes) => void;
  onDelete: (id: string) => void;
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

  const handleEdit = () => {
    onEdit(post);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (confirm('이 게시글을 정말 삭제하시겠습니까?')) {
      onDelete(post.postId);
      setIsMenuOpen(false);
    }
  };

  const isMyPost = post.author?.userId === currentUser?.userId;

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
            <AppImage
              src={post.author.profileImg}
              alt={post.author.name}
              width={32}
              height={32}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              fallback={<User size={20} />}
            />
          </div>
          <div className="meta">
            <div className="name-row">
              <span className="author-name">{post.author.name}</span>
              <span className="center-tag">
                <MapPin size={10} />
                {post.center}
              </span>
            </div>
            <span className="post-date">{dayjs(post.createTime).fromNow()}</span>
          </div>
        </div>
        <div className="more-menu-container" ref={menuRef}>
          <button className="more-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              {isMyPost ? (
                <>
                  <button onClick={handleEdit}>
                    <PenSquare size={14} className="text-gray-700" />
                    수정하기
                  </button>
                  <button onClick={handleDelete} className="delete-btn">
                    <Trash2 size={14} />
                    삭제하기
                  </button>
                </>
              ) : (
                <button
                  className="report-btn"
                  onClick={handleReport}
                  disabled={isReported}
                  style={isReported ? { opacity: 0.5, cursor: 'default', color: '#8e8e93' } : {}}
                >
                  <Flag size={14} />
                  {isReported ? '이미 신고됨' : '게시글 신고하기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.images?.length > 0 && (
          <div className="post-images">
            {post.images.map((img, idx) => (
              <SafeImage key={idx} src={img} alt="post content" />
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className={`action-btn ${post.liked ? 'liked' : ''}`} onClick={() => onLike(post)}>
          <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
        <button className="action-btn" onClick={() => onOpenComments(post)}>
          <MessageCircle size={20} />
          <span>{post.commentCount || 0}</span>
        </button>
      </div>
    </article>
  );
};

export default function LoungePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CenterPostRes[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CenterPostRes | null>(null);
  const [comments, setComments] = useState<CenterPostCommentRes[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [editingPost, setEditingPost] = useState<CenterPostRes | null>(null);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCenterId, setNewPostCenterId] = useState('');
  const [newPostImages, setNewPostImages] = useState<{ file?: File; preview: string; isExisting?: boolean; url?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 신고 목록 복원
    try {
      const saved = localStorage.getItem('reported_post_ids');
      if (saved) setReportedIds(JSON.parse(saved));
    } catch {
      /* ignore */
    }

    // 센터 목록 + 게시글 목록 병렬 로드
    const load = async () => {
      setIsLoading(true);
      try {
        const [centerRes, postRes] = await Promise.all([
          LoungeService.getCenterList(),
          LoungeService.getPostList(),
        ]);

        if (centerRes?.list) {
          setCenters(centerRes.list);
          if (centerRes.list.length > 0) {
            setNewPostCenterId(centerRes.list[0].centerId);
          }
        }
        if (postRes?.list) {
          setPosts(postRes.list);
        }
      } catch (err) {
        console.error('초기 데이터 로드 실패', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const fetchPosts = useCallback(async (centerId?: string | null, keyword?: string) => {
    setIsLoading(true);
    try {
      const res = await LoungeService.getPostList({
        centerId: centerId ?? undefined,
        keyword: keyword || undefined,
      });
      if (res?.list) setPosts(res.list);
    } catch (err) {
      console.error('게시글 목록 조회 실패', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 검색어 / 센터 필터 변경 시 서버에서 재조회
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(selectedCenter, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCenter, searchQuery, fetchPosts]);

  const filteredPosts = useMemo(() => posts, [posts]);

  const handleLike = async (post: CenterPost) => {
    const prevPosts = posts;
    setPosts(prev =>
      prev.map(p =>
        p.postId === post.postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      await LoungeService.toggleLike(post.postId, !!post.liked);
    } catch {
      setPosts(prevPosts);
    }
  };

  const handleOpenComments = async (post: CenterPostRes) => {
    setSelectedPost(post);
    setComments([]);
    setCommentDialogOpen(true);
    setIsCommentsLoading(true);
    try {
      const res = await LoungeService.getCommentList(post.postId);
      if (res?.list) setComments(res.list);
    } catch (err) {
      console.error('댓글 조회 실패', err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedPost || isSendingComment) return;
    setIsSendingComment(true);
    try {
      const res = await LoungeService.createComment({
        postId: selectedPost.postId,
        content: newComment.trim(),
      });
      if (res?.success) {
        setNewComment('');
        const updated = await LoungeService.getCommentList(selectedPost.postId);
        if (updated?.list) setComments(updated.list);
        setPosts(prev =>
          prev.map(p =>
            p.postId === selectedPost.postId
              ? { ...p, comments: updated?.list ?? p.comments }
              : p
          )
        );
      }
    } catch (err: any) {
      console.error('댓글 작성 실패', err);
      enqueueSnackbar(err.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.', { variant: 'error' });
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleReportPost = async (id: string) => {
    try {
      const res = await LoungeService.reportPost(id);
      if (res?.success !== false) {
        const updated = [...reportedIds, id];
        setReportedIds(updated);
        localStorage.setItem('reported_post_ids', JSON.stringify(updated));
        enqueueSnackbar('신고가 접수되었습니다. 해당 게시글은 이제 숨겨집니다.', { variant: 'success' });
      }
    } catch (err: any) {
      console.error('신고 실패', err);
      const updated = [...reportedIds, id];
      setReportedIds(updated);
      localStorage.setItem('reported_post_ids', JSON.stringify(updated));
      enqueueSnackbar('신고가 접수되었습니다. 해당 게시글은 이제 숨겨집니다.', { variant: 'success' });
    }
  };

  const handleCloseWriteDialog = () => {
    if (newPostContent.trim() || newPostImages.length > 0) {
      if (confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        resetWriteDialog();
      }
    } else {
      resetWriteDialog();
    }
  };

  const resetWriteDialog = () => {
    setIsWriteDialogOpen(false);
    setEditingPost(null);
    setNewPostContent('');
    newPostImages.forEach(img => {
      if (!img.isExisting && img.preview) {
        try {
          URL.revokeObjectURL(img.preview);
        } catch { /* ignore */ }
      }
    });
    setNewPostImages([]);
  };

  const handleEditPost = (post: CenterPostRes) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    setNewPostCenterId(post.centerId);
    const existing = (post.images || []).map(url => ({
      preview: url,
      isExisting: true,
      url: url
    }));
    setNewPostImages(existing);
    setIsWriteDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await LoungeService.deletePost(postId);
      if (res?.success !== false) {
        enqueueSnackbar('게시글이 삭제되었습니다.', { variant: 'success' });
        await fetchPosts(selectedCenter, searchQuery);
      }
    } catch (err: any) {
      console.error('게시글 삭제 실패', err);
      enqueueSnackbar(err.message || '게시글 삭제에 실패했습니다.', { variant: 'error' });
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingPost) {
        const existingImages = newPostImages
          .filter(img => img.isExisting)
          .map(img => img.url || '');
        const newImageFiles = newPostImages
          .filter(img => !img.isExisting && img.file)
          .map(img => img.file as File);

        const res = await LoungeService.updatePost({
          postId: editingPost.postId,
          centerId: newPostCenterId,
          content: newPostContent.trim(),
          existingImages,
          imageFiles: newImageFiles,
        });

        if (res?.success !== false) {
          enqueueSnackbar('게시글이 수정되었습니다.', { variant: 'success' });
          resetWriteDialog();
          await fetchPosts(selectedCenter, searchQuery);
        }
      } else {
        const newImageFiles = newPostImages
          .filter(img => img.file)
          .map(img => img.file as File);

        const res = await LoungeService.createPost({
          centerId: newPostCenterId,
          content: newPostContent.trim(),
          imageFiles: newImageFiles,
        });

        if (res?.success !== false) {
          enqueueSnackbar('게시글이 등록되었습니다.', { variant: 'success' });
          resetWriteDialog();
          await fetchPosts(selectedCenter, searchQuery);
        }
      }
    } catch (err: any) {
      console.error('게시글 저장 실패', err);
      enqueueSnackbar(err.message || '게시글 저장에 실패했습니다. 다시 시도해주세요.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 5 - newPostImages.length;
    const selected = Array.from(files).slice(0, remainingSlots);
    const newImgs = selected.map(file => ({ file, preview: URL.createObjectURL(file), isExisting: false }));
    setNewPostImages(prev => [...prev, ...newImgs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setNewPostImages(prev => {
      const img = prev[index];
      if (!img.isExisting && img.preview) {
        try {
          URL.revokeObjectURL(img.preview);
        } catch { /* ignore */ }
      }
      return prev.filter((_, i) => i !== index);
    });
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
              onChange={e => setSearchQuery(e.target.value)}
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
          {centers.map(center => (
            <button
              key={center.centerId}
              className={`filter-chip ${selectedCenter === center.centerId ? 'active' : ''}`}
              onClick={() => setSelectedCenter(center.centerId)}
            >
              {center.name}
            </button>
          ))}
        </div>
      </div>

      <div className="posts-container">
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <LoungePost
              key={post.postId}
              post={post}
              isReported={reportedIds.includes(post.postId)}
              currentUser={user}
              onOpenComments={handleOpenComments}
              onReport={handleReportPost}
              onLike={handleLike}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <EmptyState icon={AlertCircle} message="조건에 맞는 게시글이 없습니다" />
        )}
      </div>

      <SlideDialog
        isOpen={commentDialogOpen}
        onClose={() => {
          setCommentDialogOpen(false);
          setSelectedPost(null);
          setComments([]);
        }}
        title={selectedPost ? `${selectedPost.author.name}님의 글에 댓글` : '댓글'}
        noPadding
        footer={
          <div className="comment-input-area">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isSendingComment && handleSendComment()}
              disabled={isSendingComment}
            />
            <button
              className={`send-btn ${newComment.trim() ? 'active' : ''}`}
              onClick={handleSendComment}
              disabled={isSendingComment || !newComment.trim()}
            >
              {isSendingComment ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        }
      >
        <div className="comment-list-view">
          {selectedPost && (
            <div className="original-post-preview">
              <div className="preview-author">
                <div className="avatar">
                  <AppImage 
                    src={selectedPost.author.profileImg} 
                    alt={selectedPost.author.name} 
                    width={24} 
                    height={24} 
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                    fallback={<User size={14} />}
                  />
                </div>
                <span className="name">{selectedPost.author.name}</span>
                <span className="center">
                  {selectedPost.center.split('TuterLog ')[1] || selectedPost.center}
                </span>
              </div>
              <p className="preview-content">{selectedPost.content}</p>
            </div>
          )}

          {isCommentsLoading ? (
            <LoadingSpinner size={24} variant="section" />
          ) : comments.length > 0 ? (
            <div className="comments-section">
              {comments.map(comment => (
                <div key={comment.commentId} className="comment-item">
                  <div className="comment-avatar">
                    <AppImage 
                      src={comment.author.profileImg} 
                      alt={comment.author.name} 
                      width={32} 
                      height={32} 
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      fallback={<User size={16} />}
                    />
                  </div>
                  <div className="comment-content-wrap">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.author.name}</span>
                      <span className="comment-date">{dayjs(comment.createTime).fromNow()}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={MessageCircle} message="첫 댓글을 남겨보세요!" variant="inline" />
          )}
        </div>
      </SlideDialog>

      <SlideDialog
        noPadding
        isOpen={isWriteDialogOpen}
        onClose={handleCloseWriteDialog}
        title={editingPost ? '게시글 수정' : '새 글 작성'}
        footer={
          <div className="write-dialog-footer">
            <button
              className={`submit-btn ${newPostContent.trim() && !isSubmitting && centers.length > 0 ? 'active' : ''}`}
              onClick={handleSubmitPost}
              disabled={!newPostContent.trim() || isSubmitting || centers.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {editingPost ? '수정 중...' : '등록 중...'}
                </>
              ) : (
                editingPost ? '수정하기' : '등록하기'
              )}
            </button>
          </div>
        }
      >
        <div className="write-post-view">
          <div className="center-selector-wrap">
            <label>게시할 센터</label>
            {centers.length > 0 ? (
              <div className="select-box-wrap">
                <select
                  value={newPostCenterId}
                  onChange={e => setNewPostCenterId(e.target.value)}
                >
                  {centers.map(center => (
                    <option key={center.centerId} value={center.centerId}>
                      {center.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="select-arrow" />
              </div>
            ) : (
              <p className="no-center-notice">가입된 센터가 없어 글을 작성할 수 없습니다.</p>
            )}
          </div>

          <div className="post-input-wrap">
            <textarea
              placeholder="센터 회원들과 공유하고 싶은 소식을 적어보세요..."
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              rows={10}
            />
          </div>

          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={newPostImages.length >= 5}
            />

            {newPostImages.length > 0 && (
              <div className="image-preview-grid">
                {newPostImages.map((img, idx) => (
                  <div key={idx} className="preview-item">
                    <Image src={img.preview} alt={`preview ${idx}`} fill style={{ objectFit: 'cover' }} />
                    <button className="remove-btn" onClick={() => handleRemoveImage(idx)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {newPostImages.length < 5 && (
                  <button className="add-more-btn" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon size={20} />
                    <span>{newPostImages.length}/5</span>
                  </button>
                )}
              </div>
            )}

            {newPostImages.length === 0 && (
              <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-btn">
                  <ImageIcon size={24} />
                  <span>사진 추가 (최대 5장)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SlideDialog>
    </div>
  );
}
