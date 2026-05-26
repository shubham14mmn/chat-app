
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-iota-seven-71.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

