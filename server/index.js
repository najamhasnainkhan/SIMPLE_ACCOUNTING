import 'dotenv/config';
import { createApp } from './app.js';

const port = process.env.API_PORT || 3001;
createApp().listen(port, () => console.log(`API listening on ${port}`));
