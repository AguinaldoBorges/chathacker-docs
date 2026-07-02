#!/usr/bin/env node
const { execSync } = require('child_process');

try {
    console.log('Instalando @google/generative-ai...');
    execSync('npm install @google/generative-ai', {
        cwd: __dirname,
        stdio: 'inherit'
    });
    console.log('✓ Instalação concluída!');
} catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
}
