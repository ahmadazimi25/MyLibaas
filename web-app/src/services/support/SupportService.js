import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import NotificationService from '../NotificationService';

class SupportService {
  static TICKET_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  };

  static TICKET_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  };

  static async createTicket(data) {
    try {
      const { userId, subject, description, priority = this.TICKET_PRIORITY.MEDIUM } = data;

      const ticketId = `TICKET_${Date.now()}`;
      const ticket = {
        id: ticketId,
        userId,
        subject,
        description,
        priority,
        status: this.TICKET_STATUS.OPEN,
        messages: [{
          content: description,
          sender: userId,
          timestamp: Timestamp.now(),
          type: 'initial'
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'support_tickets', ticketId), ticket);

      // Notify support team
      await NotificationService.sendNotification({
        type: 'new_support_ticket',
        ticketId,
        priority,
        subject
      });

      return ticket;
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  }

  static async updateTicketStatus(ticketId, status, notes = '') {
    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const update = {
        status,
        updatedAt: Timestamp.now()
      };

      if (notes) {
        update.messages = [...ticket.messages, {
          content: notes,
          sender: 'system',
          timestamp: Timestamp.now(),
          type: 'status_update'
        }];
      }

      await setDoc(doc(db, 'support_tickets', ticketId), update, { merge: true });

      // Notify user
      await NotificationService.sendNotification({
        type: 'ticket_status_update',
        ticketId,
        status,
        userId: ticket.userId
      });

      return true;
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw new Error('Failed to update ticket status');
    }
  }

  static async addMessage(ticketId, message) {
    try {
      const { content, sender } = message;
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const newMessage = {
        content,
        sender,
        timestamp: Timestamp.now(),
        type: 'message'
      };

      const update = {
        messages: [...ticket.messages, newMessage],
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'support_tickets', ticketId), update, { merge: true });

      // Notify other party
      const recipientId = sender === ticket.userId ? 'support_team' : ticket.userId;
      await NotificationService.sendNotification({
        type: 'new_ticket_message',
        ticketId,
        messageId: ticket.messages.length,
        recipientId
      });

      return newMessage;
    } catch (error) {
      console.error('Failed to add message:', error);
      throw new Error('Failed to add message to ticket');
    }
  }

  static async resolveTicket(ticketId, resolution) {
    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const update = {
        status: this.TICKET_STATUS.RESOLVED,
        resolution,
        resolvedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        messages: [...ticket.messages, {
          content: resolution,
          sender: 'system',
          timestamp: Timestamp.now(),
          type: 'resolution'
        }]
      };

      await setDoc(doc(db, 'support_tickets', ticketId), update, { merge: true });

      // Notify user
      await NotificationService.sendNotification({
        type: 'ticket_resolved',
        ticketId,
        userId: ticket.userId,
        resolution
      });

      return true;
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      throw new Error('Failed to resolve ticket');
    }
  }

  static async getTicketAnalytics(period = '7d') {
    try {
      const startDate = new Date();
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const tickets = await this.getTickets(startDate);

      return {
        totalTickets: tickets.length,
        byStatus: this.countByStatus(tickets),
        byPriority: this.countByPriority(tickets),
        averageResolutionTime: this.calculateAverageResolutionTime(tickets),
        period
      };
    } catch (error) {
      console.error('Failed to get ticket analytics:', error);
      throw new Error('Failed to get ticket analytics');
    }
  }

  static async getTicket(ticketId) {
    const ticketDoc = await getDoc(doc(db, 'support_tickets', ticketId));
    return ticketDoc.exists() ? ticketDoc.data() : null;
  }

  static async getTickets(startDate) {
    const q = query(
      collection(db, 'support_tickets'),
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static countByStatus(tickets) {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
  }

  static countByPriority(tickets) {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});
  }

  static calculateAverageResolutionTime(tickets) {
    const resolvedTickets = tickets.filter(t => t.status === this.TICKET_STATUS.RESOLVED && t.resolvedAt);
    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      return sum + (ticket.resolvedAt.toMillis() - ticket.createdAt.toMillis());
    }, 0);

    return totalTime / resolvedTickets.length;
  }
}

export default SupportService;
