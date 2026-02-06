import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { musicApi } from '../services/api'

const AudioPlayerContext = createContext(null)

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [tracks, setTracks] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  // Fetch tracks from FastAPI music endpoint
  useEffect(() => {
    musicApi.getAll().then((data) => {
      const fetchedTracks = data?.tracks || []
      setTracks(fetchedTracks)
      if (fetchedTracks.length > 0) {
        const activeIndex = fetchedTracks.findIndex(t => t.is_active)
        if (activeIndex !== -1) {
          setCurrentTrackIndex(activeIndex)
          setCurrentTrack(fetchedTracks[activeIndex])
        } else {
          setCurrentTrack(fetchedTracks[0])
        }
      }
    }).catch(console.error)
  }, [])

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
    }

    const audio = audioRef.current

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration || 0)
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        playTrackAtIndex(currentTrackIndex + 1)
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentTrackIndex, tracks])

  // Update audio src when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying
      audioRef.current.src = currentTrack.audio_url
      audioRef.current.volume = isMuted ? 0 : volume
      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentTrack?.id])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const playTrackAtIndex = useCallback((index) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrackIndex(index)
      setCurrentTrack(tracks[index])
      setIsPlaying(true)
    }
  }, [tracks])

  const playTrack = useCallback((track, allTracks = null, index = -1) => {
    if (!track?.audio_url) return

    // If same track, toggle
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    if (allTracks) {
      setTracks(allTracks)
    }
    setCurrentTrack(track)
    setCurrentTrackIndex(index >= 0 ? index : 0)
    setIsPlaying(true)
  }, [currentTrack, togglePlay])

  const nextTrack = useCallback(() => {
    if (currentTrackIndex < tracks.length - 1) {
      playTrackAtIndex(currentTrackIndex + 1)
    }
  }, [currentTrackIndex, tracks, playTrackAtIndex])

  const previousTrack = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0)
    } else if (currentTrackIndex > 0) {
      playTrackAtIndex(currentTrackIndex - 1)
    }
  }, [currentTrackIndex, currentTime, playTrackAtIndex])

  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolumeVal = useCallback((newVolume) => {
    setVolume(newVolume)
    if (newVolume > 0) setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    tracks,
    currentTrackIndex,
    play,
    pause,
    togglePlay,
    stop,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume: setVolumeVal,
    toggleMute,
    playTrack,
    playTrackAtIndex,
  }

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}
