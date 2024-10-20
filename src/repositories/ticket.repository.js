import TicketDAO from "../dao/daos/ticket.dao.js";

class TicketRepository {
  async createTicket(ticketData) {
    return await TicketDAO.createTicket(ticketData);
  }

  async getTicketById(ticketId) {
    return await TicketDAO.getTicketById(ticketId);
  }
}

export default new TicketRepository();
