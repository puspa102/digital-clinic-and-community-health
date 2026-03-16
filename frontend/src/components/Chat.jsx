import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { chatAPI, handleApiError, formatDateTime } from "../services/api";
import {
  X,
  Send,
  MessageSquare,
  Search,
  ChevronLeft,
  User,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const Chat = ({ isOpen, onClose, onUnreadChange }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen || !user) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("new_message", (data) => {
      const currentConv = selectedConversationRef.current;
      if (data.conversationId === currentConv?.conversation_id) {
        setMessages((prev) => [...prev, { ...data.message, is_own: false }]);
        // Mark as read
        chatAPI.markAsRead(data.conversationId);
        newSocket.emit("mark_read", {
          conversationId: data.conversationId,
          recipientId: data.message.sender?.user_id,
        });
      }
      // Update conversation list
      fetchConversations();
    });

    newSocket.on("message_notification", (data) => {
      const currentConv = selectedConversationRef.current;
      // If user is viewing this conversation, add the message directly
      if (data.conversationId === currentConv?.conversation_id) {
        setMessages((prev) => [...prev, { ...data.message, is_own: false }]);
        // Mark as read immediately
        chatAPI.markAsRead(data.conversationId);
        newSocket.emit("mark_read", {
          conversationId: data.conversationId,
          recipientId: data.message.sender?.user_id,
        });
      } else {
        // Only increment unread if not viewing that conversation
        setUnreadCount((prev) => prev + 1);
      }
      fetchConversations();
    });

    newSocket.on("user_typing", (data) => {
      const currentConv = selectedConversationRef.current;
      if (data.conversationId === currentConv?.conversation_id) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));
      }
    });

    newSocket.on("messages_read", (data) => {
      const currentConv = selectedConversationRef.current;
      if (data.conversationId === currentConv?.conversation_id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.is_own ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, user]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const response = await chatAPI.getContacts(searchQuery);
      if (response.success) {
        setContacts(response.data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", handleApiError(error));
    }
  }, [searchQuery]);

  // Sync unread count with parent component
  useEffect(() => {
    if (onUnreadChange) {
      onUnreadChange(unreadCount);
    }
  }, [unreadCount, onUnreadChange]);

  // Initial data fetch
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      // Fetch accurate unread count when chat opens
      chatAPI.getUnreadCount().then(response => {
        if (response.success) {
          setUnreadCount(response.data.unread_count || 0);
        }
      }).catch(() => {});
    }
  }, [isOpen, fetchConversations]);

  // Join all conversation rooms when conversations are loaded
  useEffect(() => {
    if (socket && conversations.length > 0) {
      conversations.forEach((conv) => {
        socket.emit("join_conversation", conv.conversation_id);
      });
    }
  }, [socket, conversations]);

  // Fetch contacts when search changes
  useEffect(() => {
    if (showContacts) {
      fetchContacts();
    }
  }, [showContacts, searchQuery, fetchContacts]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await chatAPI.getMessages(
          selectedConversation.conversation_id
        );
        if (response.success) {
          setMessages(response.data || []);
        }
        // Join socket room
        socket?.emit("join_conversation", selectedConversation.conversation_id);
        // Mark as read
        await chatAPI.markAsRead(selectedConversation.conversation_id);
        // Update unread count locally instead of API call
        setUnreadCount(prev => Math.max(0, prev - (selectedConversation.unread_count || 0)));
      } catch (error) {
        console.error("Error fetching messages:", handleApiError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      socket?.emit("leave_conversation", selectedConversation.conversation_id);
    };
  }, [selectedConversation, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      const response = await chatAPI.sendMessage(
        selectedConversation.conversation_id,
        messageContent
      );

      if (response.success) {
        const sentMessage = response.data.message;
        setMessages((prev) => [...prev, sentMessage]);

        // Emit via socket
        socket?.emit("send_message", {
          conversationId: selectedConversation.conversation_id,
          message: { ...sentMessage, is_own: false },
          recipientId: response.data.recipient_id,
        });
      }
    } catch (error) {
      console.error("Error sending message:", handleApiError(error));
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    socket.emit("typing", {
      conversationId: selectedConversation.conversation_id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: selectedConversation.conversation_id,
        isTyping: false,
      });
    }, 2000);
  };

  // Start new conversation
  const startConversation = async (contact) => {
    try {
      setLoading(true);
      const response = await chatAPI.getOrCreateConversation(contact.user_id);
      if (response.success) {
        setSelectedConversation({
          conversation_id: response.data.conversation_id,
          participant: response.data.participant,
        });
        setShowContacts(false);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error starting conversation:", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Format message time
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div
          className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search / New Chat Toggle */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={showContacts ? "Search contacts..." : "Search conversations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  setShowContacts(!showContacts);
                  setSearchQuery("");
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showContacts
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {showContacts ? "Back" : "New"}
              </button>
            </div>
          </div>

          {/* Conversations or Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading && !selectedConversation ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : showContacts ? (
              // Contacts List
              contacts.length > 0 ? (
                contacts.map((contact) => (
                  <button
                    key={contact.user_id}
                    onClick={() => startConversation(contact)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        contact.role === "Doctor"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {contact.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.role}
                        {contact.specialization && ` - ${contact.specialization}`}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No contacts found"
                    : user?.role === "Patient"
                    ? "Your doctor will appear here after appointment is accepted"
                    : "Your patients will appear here"}
                </div>
              )
            ) : // Conversations List
            conversations.length > 0 ? (
              conversations
                .filter(
                  (conv) =>
                    !searchQuery ||
                    conv.participant?.full_name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                      selectedConversation?.conversation_id === conv.conversation_id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        conv.participant?.role === "Doctor"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {conv.participant?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {conv.participant?.full_name}
                        </p>
                        {conv.last_message && (
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.last_message
                          ? `${conv.last_message.is_own ? "You: " : ""}${conv.last_message.content}`
                          : "No messages yet"}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No conversations yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    selectedConversation.participant?.role === "Doctor"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                >
                  {selectedConversation.participant?.full_name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedConversation.participant?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.participant?.role}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={msg.message_id || index}
                        className={`flex ${msg.is_own ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            msg.is_own
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.is_own
                                ? "text-blue-100 justify-end"
                                : "text-gray-400"
                            }`}
                          >
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {msg.is_own && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {Object.values(typingUsers).some(Boolean) && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 text-gray-500 px-4 py-2 rounded-2xl shadow">
                          <span className="italic">Typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            // No conversation selected
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
