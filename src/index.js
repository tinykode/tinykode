import { TinyKode } from './core/tinykode.js';

const tinykode = new TinyKode();

tinykode.processQuery("Can you run the ls command?", (update) => {
    process.stdout.write(update);
});