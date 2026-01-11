import { io, server } from './app';

const startServer = async () => {
  const port = 3000;

  server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
};


startServer();
