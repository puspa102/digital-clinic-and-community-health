import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

/**
 * Conversation Model
 * Represents a chat conversation between two users (Doctor-Patient)
 */
const Conversation = sequelize.define(
  "Conversation",
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    participant_one_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    participant_two_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "conversations",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["participant_one_id", "participant_two_id"],
      },
    ],
  }
);

/**
 * Message Model
 * Represents individual messages within a conversation
 */
const Message = sequelize.define(
  "Message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "conversation_id",
      },
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM("text", "image", "file"),
      defaultValue: "text",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: false,
  }
);

// Associations
Conversation.belongsTo(User, {
  as: "ParticipantOne",
  foreignKey: "participant_one_id",
});

Conversation.belongsTo(User, {
  as: "ParticipantTwo",
  foreignKey: "participant_two_id",
});

Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
  as: "Messages",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
});

Message.belongsTo(User, {
  as: "Sender",
  foreignKey: "sender_id",
});

export { Conversation, Message };
