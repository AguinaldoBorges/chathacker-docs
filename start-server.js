#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const projectPath = __dirname;

console.log('Iniciando servidor Next.js...');
console.log('Acesse http://localhost:3000');

const server = spawn('npx', ['next', 'dev'], {
    cwd: projectPath,
    stdio: 'inherit',
    shell: true
});

server.on('error', (error) => {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\nServidor parado');
    server.kill();
    process.exit(0);
});
