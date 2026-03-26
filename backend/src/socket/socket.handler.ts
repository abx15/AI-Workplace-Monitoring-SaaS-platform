import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_company', (companyId: string) => {
      socket.join(companyId);
      console.log(`Socket ${socket.id} joined company room: ${companyId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const emitAlert = (companyId: string, alert: any) => {
  if (io) {
    io.to(companyId).emit('new_alert', alert);
  }
};

export const getIO = () => io;
