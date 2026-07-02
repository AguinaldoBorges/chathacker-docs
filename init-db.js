#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
    console.log('Sincronizando banco de dados...');
    execSync('npx prisma db push --skip-generate', {
        cwd: __dirname,
        stdio: 'inherit'
    });
    console.log('✓ Banco de dados sincronizado com sucesso!');
} catch (error) {
    console.error('✗ Erro ao sincronizar banco de dados:', error.message);
    process.exit(1);
}
