import express from 'express';
import 'dotenv/config';
import jsonRoutes from './routes/jsonRoutes.js';
import xmlRoutes from './routes/xmlRoutes.js'

const app = express();
app.use(express.json());
app.use(express.text({ type: 'application/xml' }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

// Rotas
app.use('/json', jsonRoutes);
app.listen('/xml', xmlRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
