import Ticket from "../model/ticket.models.js";

class TicketDAO {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }

  async getTicketById(ticketId) {
    return await Ticket.findById(ticketId);
  }
}

export default new TicketDAO();
