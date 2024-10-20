import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return Math.random().toString(36).substr(2, 9);  // Generar un código único
    }
  },
  purchase_datetime: {
    type: Date,
    default: Date.now  // Guarda la fecha y hora actuales
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true  // Guardar el correo electrónico del usuario
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
