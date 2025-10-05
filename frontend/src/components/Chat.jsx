import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import client from "../api/client";

export default function Chat() {
  const { rideId, otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setError(null);
        const { data } = await client.get(`/chat/history/${rideId}/${otherUserId}`);
        setMessages(data?.messages || []);
        setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 100);
      } catch (e) {
        console.error('Failed to load chat history:', e);
        setError('Failed to load chat history');
      }
    }
    loadHistory();
  }, [rideId, otherUserId]);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error('Failed to decode token:', e);
        setError('Authentication error');
      }
    }
  }, []);

  const socket = useMemo(() => {
    if (socketRef.current) {
      return socketRef.current;
    }
    const token = localStorage.getItem("token");
    const newSocket = io(client.defaults.baseURL, { 
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000, // Faster retries
      reconnectionAttempts: 5,
      timeout: 20000, // Added client-side timeout
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('connected');
      setError(null);
      // Attempt to join the room on connect
      try {
        newSocket.emit('chat:join', { rideId, otherUserId });
      } catch {}
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setConnectionStatus('disconnected');
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnectionStatus('error');
      setError('Connection failed');
    });

    newSocket.on('chat:joined', () => {
      console.log('Joined chat room');
      setJoined(true);
    });

    newSocket.on('chat:error', (payload) => {
      const msg = payload?.message || 'Chat error occurred';
      console.error('Chat error:', msg);
      setError(msg);
    });

    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log('Reconnecting attempt:', attempt);
      setConnectionStatus('connecting');
    });

    newSocket.io.on('reconnect', (attempt) => {
      console.log('Reconnected after attempts:', attempt);
      setConnectionStatus('connected');
    });

    newSocket.io.on('reconnect_error', (err) => {
      console.error('Reconnection error:', err);
      setConnectionStatus('error');
    });

    socketRef.current = newSocket;
    return newSocket;
  }, []);

  useEffect(() => {
    if (!socket || !currentUserId) return;
    // Join when dependencies change and we are connected
    if (connectionStatus === 'connected') {
      setJoined(false);
      socket.emit('chat:join', { rideId, otherUserId });
    }
    
    const handleMessage = (msg) => {
      console.log('Received message:', msg);
      setMessages((prev) => {
        // Prevent duplicate messages by id
        const exists = prev.some(m => m._id === msg._id);
        if (exists) return prev;

        // Reconcile optimistic message (temp) sent by current user
        const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id || '') : msg.sender;
        const isMine = senderId === currentUserId;
        let next = prev;
        if (isMine) {
          const idx = prev.findIndex(m => m.__temp && m.text === msg.text);
          if (idx !== -1) {
            next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
          }
        }
        return [...next, msg];
      });
      setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 50);
    };
    
    socket.on("chat:message", handleMessage);
    
    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [socket, rideId, otherUserId, currentUserId, connectionStatus]);

  // Cleanup on unmount: remove listeners but do NOT disconnect the shared socket
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off('chat:message');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
      }
    };
  }, []);

  useEffect(() => {
    // ensure we stay scrolled to bottom when messages list changes
    setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 50);
  }, [messages]);

  const send = () => {
    if (!text.trim() || !socket || connectionStatus !== 'connected' || !joined) {
      setError('Cannot send: Check connection status.');
      return;
    }

    try {
      // Optimistic local echo
      const now = new Date().toISOString();
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        ride: rideId,
        sender: currentUserId,
        recipient: otherUserId,
        text,
        createdAt: now,
        __temp: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit("chat:send", { rideId, recipientId: otherUserId, text });
      setText("");
      setError(null);
    } catch (e) {
      console.error('Failed to send message:', e);
      setError('Failed to send message: ' + e.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e24] text-white p-6 font-poppins">
      <div className="max-w-2xl mx-auto bg-[#111114] border border-[#2e2e3e] rounded-2xl p-4 flex flex-col h-[80vh]">
        <div className="pb-3 border-b border-[#2a2a35] flex items-center justify-between">
          <span>Chat</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {connectionStatus === 'connected' && !joined && (
          <div className="mb-3 flex items-center gap-3 text-sm">
            <span className="text-yellow-400">Not joined to room yet.</span>
            <button
              onClick={() => {
                setError(null);
                setJoined(false);
                socketRef.current?.emit('chat:join', { rideId, otherUserId });
              }}
              className="px-3 py-1 rounded-md bg-[#2a2a35] hover:bg-[#343446]"
            >
              Retry join
            </button>
          </div>
        )}
        
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 py-3">
          {!joined && connectionStatus === 'connected' && (
            <div className="text-center text-yellow-400 text-sm mb-2">
              Joining room...
            </div>
          )}
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => {
              const senderId = typeof m.sender === 'object' ? (m.sender?._id || m.sender?.id || '') : m.sender;
              const isCurrentUser = senderId === currentUserId;
              return (
                <div key={m._id} className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      `max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ` +
                      (isCurrentUser
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-br-none'
                        : 'bg-[#2a2a35] text-gray-100 rounded-bl-none')
                    }
                    aria-label={isCurrentUser ? 'Your message' : 'Their message'}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p className={`text-[10px] mt-1 opacity-70 ${isCurrentUser ? 'text-white/80 text-right' : 'text-gray-300/80 text-left'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="pt-3 flex gap-2">
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message" 
            className="flex-1 bg-[#1e1e24] border border-[#2a2a35] rounded-xl px-3 py-2 focus:outline-none focus:border-[#f72585]"
            disabled={connectionStatus !== 'connected'}
          />
          <button 
            onClick={send} 
            disabled={!text.trim() || connectionStatus !== 'connected'}
            className="bg-gradient-to-r from-[#f72585] to-[#7209b7] text-white rounded-xl px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


