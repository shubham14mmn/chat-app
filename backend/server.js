
app.use(
  cors({
    origin: "https://chat-app-iota-seven-71.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

