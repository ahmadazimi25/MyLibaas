const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  attachments: [{
    type: String,
    url: String,
    contentType: String
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  metadata: {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalHistory'
    },
    quickReplies: [{
      type: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update conversation timestamp when new message is added
messageSchema.post('save', async function(doc) {
  await mongoose.model('Conversation').findByIdAndUpdate(
    doc.conversation,
    {
      lastMessage: doc._id,
      updatedAt: Date.now()
    }
  );
});

// Generate quick replies based on conversation context
conversationSchema.methods.generateQuickReplies = function() {
  const quickReplies = [
    'Is this item still available?',
    'What are the measurements?',
    'Can I rent it for [date]?',
    'Is pickup available?',
    'Can you provide more photos?'
  ];

  if (this.metadata.rental) {
    quickReplies.push(
      'What time should I pick up?',
      'Here's my delivery address',
      'Thanks for renting!'
    );
  }

  return quickReplies;
};

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
