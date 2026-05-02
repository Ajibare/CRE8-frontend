'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { learningService, Learning } from '../../../services/learningService';
import { FaArrowLeft, FaPlay, FaPause, FaExpand, FaVolumeHigh, FaVolumeXmark, FaClock, FaUserTie, FaGraduationCap } from 'react-icons/fa6';
import Link from 'next/link';

export default function LearningViewer() {
  const params = useParams();
  const router = useRouter();
  const [learning, setLearning] = useState<Learning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLearning();
  }, [params.id]);

  const fetchLearning = async () => {
    try {
      setLoading(true);
      const data = await learningService.getLearningById(params.id as string);
      setLearning(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load learning resource');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !learning) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <FaGraduationCap className="w-16 h-16 text-purple-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Learning Resource Not Found</h1>
        <p className="text-gray-400 mb-6">{error || 'The resource you\'re looking for doesn\'t exist.'}</p>
        <Link href="/dashboard" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-lg truncate max-w-md">{learning.title}</h1>
            <p className="text-sm text-gray-400">{learning.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            {learning.duration} min
          </span>
          <span className="flex items-center gap-2">
            <FaUserTie className="w-4 h-4" />
            {learning.instructor}
          </span>
        </div>
      </div>

      {/* Main Content - Zoom-like layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Area */}
        <div className="flex-1 bg-black relative" ref={containerRef}>
          <video
            ref={videoRef}
            src={learning.videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Custom Controls Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-0 hover:opacity-100 transition bg-gradient-to-t from-black/70 via-transparent to-black/30">
            {/* Top Bar */}
            <div className="pointer-events-auto flex justify-between items-start">
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"
              >
                <FaExpand className="w-5 h-5" />
              </button>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-purple-600/90 hover:bg-purple-600 rounded-full flex items-center justify-center transition transform hover:scale-110"
                >
                  <FaPlay className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pointer-events-auto space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-12">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-sm text-gray-300 w-12">{learning.duration}:00</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-purple-400 transition"
                >
                  {isPlaying ? <FaPause className="w-6 h-6" /> : <FaPlay className="w-6 h-6" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-purple-400 transition"
                >
                  {isMuted ? <FaVolumeXmark className="w-6 h-6" /> : <FaVolumeHigh className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Info Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-white mb-2">About This Course</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{learning.description}</p>
            </div>

            {/* Tags */}
            {learning.tags && learning.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {learning.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Info */}
            <div>
              <h3 className="font-semibold text-white mb-2">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <FaUserTie className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{learning.instructor}</p>
                  <p className="text-gray-500 text-sm">FUNTECH Academy Instructor</p>
                </div>
              </div>
            </div>

            {/* Back to Dashboard */}
            <Link
              href="/dashboard"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Back to Learning Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
