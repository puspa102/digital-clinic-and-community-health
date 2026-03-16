import { Conversation, Message } from "../models/chat.model.js";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APPOINTMENT_STATUS,
} from "../utils/constants.js";

const CHAT_ALLOWED_APPOINTMENT_STATUSES = [
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.COMPLETED,
];

const hasAcceptedDoctorPatientAppointment = async (userOne, userTwo) => {
  const isDoctorPatientPair =
    (userOne.role === "Doctor" && userTwo.role === "Patient") ||
    (userOne.role === "Patient" && userTwo.role === "Doctor");

  if (!isDoctorPatientPair) {
    return false;
  }

  const doctorUserId = userOne.role === "Doctor" ? userOne.user_id : userTwo.user_id;
  const patientUserId = userOne.role === "Patient" ? userOne.user_id : userTwo.user_id;

  const doctorProfile = await Doctor.findOne({
    where: { user_id: doctorUserId },
    attributes: ["doctor_id"],
  });

  if (!doctorProfile) {
    return false;
  }

  const appointmentCount = await Appointment.count({
    where: {
      patient_id: patientUserId,
      doctor_id: doctorProfile.doctor_id,
      status: { [Op.in]: CHAT_ALLOWED_APPOINTMENT_STATUSES },
    },
  });

  return appointmentCount > 0;
};

/**
 * Get or create a conversation between two users
 * @route POST /api/chat/conversations
 * @access Private (Doctor, Patient)
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participant_id } = req.body;
    const userId = req.user.id;

    if (!participant_id) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Participant ID is required");
    }

    if (participant_id === userId) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Cannot start a conversation with yourself");
    }

    // Verify the other participant exists and is a Doctor or Patient
    const participant = await User.findByPk(participant_id);
    if (!participant) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
    }

    if (!["Doctor", "Patient"].includes(participant.role)) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Can only chat with doctors or patients");
    }

    const currentUser = await User.findByPk(userId, {
      attributes: ["user_id", "role"],
    });

    if (!currentUser) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isEligible = await hasAcceptedDoctorPatientAppointment(currentUser, participant);
    if (!isEligible) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Chat is available only after the doctor accepts your appointment",
      );
    }

    // Ensure participants are ordered consistently (lower ID first)
    const [participantOne, participantTwo] = userId < participant_id
      ? [userId, participant_id]
      : [participant_id, userId];

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      where: {
        participant_one_id: participantOne,
        participant_two_id: participantTwo,
      },
      include: [
        {
          model: User,
          as: "ParticipantOne",
          attributes: ["user_id", "full_name", "email", "role"],
        },
        {
          model: User,
          as: "ParticipantTwo",
          attributes: ["user_id", "full_name", "email", "role"],
        },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant_one_id: participantOne,
        participant_two_id: participantTwo,
      });

      // Reload with associations
      conversation = await Conversation.findByPk(conversation.conversation_id, {
        include: [
          {
            model: User,
            as: "ParticipantOne",
            attributes: ["user_id", "full_name", "email", "role"],
          },
          {
            model: User,
            as: "ParticipantTwo",
            attributes: ["user_id", "full_name", "email", "role"],
          },
        ],
      });
    }

    // Get the other participant's info
    const otherParticipant = conversation.ParticipantOne.user_id === userId
      ? conversation.ParticipantTwo
      : conversation.ParticipantOne;

    return successResponse(res, HTTP_STATUS.OK, "Conversation retrieved", {
      conversation_id: conversation.conversation_id,
      participant: otherParticipant,
      created_at: conversation.created_at,
      last_message_at: conversation.last_message_at,
    });
  } catch (error) {
    console.error("Get/Create conversation error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get all conversations for the current user
 * @route GET /api/chat/conversations
 * @access Private (Doctor, Patient)
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const { offset, limit: limitNum } = getPagination(page, limit);

    const { count, rows: conversations } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [
          { participant_one_id: userId },
          { participant_two_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "ParticipantOne",
          attributes: ["user_id", "full_name", "email", "role"],
        },
        {
          model: User,
          as: "ParticipantTwo",
          attributes: ["user_id", "full_name", "email", "role"],
        },
        {
          model: Message,
          as: "Messages",
          limit: 1,
          order: [["created_at", "DESC"]],
          attributes: ["content", "created_at", "is_read", "sender_id"],
        },
      ],
      order: [["last_message_at", "DESC"]],
      limit: limitNum,
      offset,
    });

    // Format conversations to show the other participant
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.ParticipantOne.user_id === userId
        ? conv.ParticipantTwo
        : conv.ParticipantOne;

      const lastMessage = conv.Messages?.[0] || null;
      const unreadCount = conv.Messages?.filter(
        (m) => !m.is_read && m.sender_id !== userId
      ).length || 0;

      return {
        conversation_id: conv.conversation_id,
        participant: otherParticipant,
        last_message: lastMessage ? {
          content: lastMessage.content,
          created_at: lastMessage.created_at,
          is_own: lastMessage.sender_id === userId,
        } : null,
        unread_count: unreadCount,
        last_message_at: conv.last_message_at,
      };
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Conversations retrieved",
      formatPaginatedResponse(formattedConversations, count, page, limitNum)
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get messages in a conversation
 * @route GET /api/chat/conversations/:conversationId/messages
 * @access Private (Doctor, Patient)
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50, before } = req.query;
    const { offset, limit: limitNum } = getPagination(page, limit);

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Conversation not found");
    }

    if (
      conversation.participant_one_id !== userId &&
      conversation.participant_two_id !== userId
    ) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied to this conversation");
    }

    // Build where clause
    const whereClause = { conversation_id: conversationId };
    if (before) {
      whereClause.created_at = { [Op.lt]: new Date(before) };
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["user_id", "full_name", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset,
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    // Format messages
    const formattedMessages = messages.map((msg) => ({
      message_id: msg.message_id,
      content: msg.content,
      message_type: msg.message_type,
      is_own: msg.sender_id === userId,
      sender: msg.Sender,
      is_read: msg.is_read,
      created_at: msg.created_at,
    })).reverse(); // Reverse to get chronological order

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Messages retrieved",
      formatPaginatedResponse(formattedMessages, count, page, limitNum)
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Send a message in a conversation
 * @route POST /api/chat/conversations/:conversationId/messages
 * @access Private (Doctor, Patient)
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, message_type = "text" } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Message content is required");
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Conversation not found");
    }

    if (
      conversation.participant_one_id !== userId &&
      conversation.participant_two_id !== userId
    ) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied to this conversation");
    }

    // Create the message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      message_type,
    });

    // Update conversation last_message_at
    await conversation.update({ last_message_at: new Date() });

    // Get sender info
    const sender = await User.findByPk(userId, {
      attributes: ["user_id", "full_name", "role"],
    });

    const responseMessage = {
      message_id: message.message_id,
      content: message.content,
      message_type: message.message_type,
      is_own: true,
      sender,
      is_read: false,
      created_at: message.created_at,
    };

    // Get the recipient ID for socket notification
    const recipientId = conversation.participant_one_id === userId
      ? conversation.participant_two_id
      : conversation.participant_one_id;

    return successResponse(res, HTTP_STATUS.CREATED, "Message sent", {
      message: responseMessage,
      recipient_id: recipientId,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get unread message count for the current user
 * @route GET /api/chat/unread-count
 * @access Private (Doctor, Patient)
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations for the user
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant_one_id: userId },
          { participant_two_id: userId },
        ],
      },
      attributes: ["conversation_id"],
    });

    const conversationIds = conversations.map((c) => c.conversation_id);

    // Count unread messages
    const unreadCount = await Message.count({
      where: {
        conversation_id: { [Op.in]: conversationIds },
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    });

    return successResponse(res, HTTP_STATUS.OK, "Unread count retrieved", {
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get chat contacts (doctors for patients, patients for doctors)
 * @route GET /api/chat/contacts
 * @access Private (Doctor, Patient)
 */
export const getChatContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { search } = req.query;

    let contacts = [];

    if (userRole === "Patient") {
      // Patients can chat with doctors only after doctor accepts appointment.
      const appointments = await Appointment.findAll({
        where: {
          patient_id: userId,
          doctor_id: { [Op.ne]: null },
          status: { [Op.in]: CHAT_ALLOWED_APPOINTMENT_STATUSES },
        },
        include: [
          {
            model: Doctor,
            include: {
              model: User,
              attributes: ["user_id", "full_name", "email", "role"],
            },
          },
        ],
        attributes: ["doctor_id"],
      });

      const doctorMap = new Map();
      appointments.forEach((apt) => {
        if (apt.Doctor?.User) {
          doctorMap.set(apt.Doctor.User.user_id, {
            user_id: apt.Doctor.User.user_id,
            full_name: apt.Doctor.User.full_name,
            email: apt.Doctor.User.email,
            role: apt.Doctor.User.role,
            specialization: apt.Doctor.specialization,
          });
        }
      });

      contacts = Array.from(doctorMap.values());
    } else if (userRole === "Doctor") {
      // Doctors can chat with patients whose appointments are accepted/confirmed.
      const doctor = await Doctor.findOne({
        where: { user_id: userId },
      });

      if (doctor) {
        const appointments = await Appointment.findAll({
          where: {
            doctor_id: doctor.doctor_id,
            status: { [Op.in]: CHAT_ALLOWED_APPOINTMENT_STATUSES },
          },
          include: [
            {
              model: User,
              as: "Patient",
              attributes: ["user_id", "full_name", "email", "role"],
            },
          ],
          attributes: ["patient_id"],
        });

        const patientMap = new Map();
        appointments.forEach((apt) => {
          if (apt.Patient) {
            patientMap.set(apt.Patient.user_id, {
              user_id: apt.Patient.user_id,
              full_name: apt.Patient.full_name,
              email: apt.Patient.email,
              role: apt.Patient.role,
            });
          }
        });

        contacts = Array.from(patientMap.values());
      }
    }

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.full_name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    return successResponse(res, HTTP_STATUS.OK, "Contacts retrieved", { contacts });
  } catch (error) {
    console.error("Get contacts error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Mark messages as read
 * @route PUT /api/chat/conversations/:conversationId/read
 * @access Private (Doctor, Patient)
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Conversation not found");
    }

    if (
      conversation.participant_one_id !== userId &&
      conversation.participant_two_id !== userId
    ) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied to this conversation");
    }

    // Mark all messages from other user as read
    const [updatedCount] = await Message.update(
      { is_read: true },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    return successResponse(res, HTTP_STATUS.OK, "Messages marked as read", {
      updated_count: updatedCount,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};
