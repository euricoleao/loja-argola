import cors from 'cors';
import express from 'express';
import admin from 'firebase-admin';
import { createRequire } from 'module';
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const serviceAccount = require('./firebase-admin.json');

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const ASAAS_TOKEN =
  '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAwZTliYmM2LWY1NGYtNGFkYi1hODI5LWUyMjhiNjQ1MDRiYTo6JGFhY2hfMmE3ZDRjYTMtNzJkYS00MWYxLTg0MWEtMjE5NDk2ZGU5NDc0';

// 🔥 CRIAR PIX
app.post('/criar-pix', async (req, res) => {
  try {
    const { total, pedidoId } = req.body;

    console.log('TOTAL:', total);
    console.log('PEDIDO ID:', pedidoId);

    // 1️⃣ criar cliente
    const clienteRes = await fetch(
      'https://sandbox.asaas.com/api/v3/customers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_TOKEN,
        },
        body: JSON.stringify({
          name: 'Cliente Teste',
          email: 'cliente@gmail.com',
          cpfCnpj: '12345678909', // 👈 CPF válido fake (pode usar esse)
        }),
      },
    );

    const cliente = await clienteRes.json();
    console.log('CLIENTE:', cliente);

    // 2️⃣ criar pagamento
    const pagamentoRes = await fetch(
      'https://sandbox.asaas.com/api/v3/payments',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_TOKEN,
        },
        body: JSON.stringify({
          customer: cliente.id,

          billingType: 'PIX',

          value: Number(total),

          description: 'Pedido Loja',

          dueDate: new Date().toISOString().split('T')[0],

          pixAddressKey: 'email@teste.com',

          externalReference: pedidoId,
        }),
      },
    );

    const pagamento = await pagamentoRes.json();
    console.log('PAGAMENTO:', pagamento);

    // ⚠️ SE DER ERRO AQUI, PARA TUDO
    if (!pagamento.id) {
      return res.status(400).json({
        erro: 'Erro ao criar pagamento',
        detalhe: pagamento,
      });
    }

    // 3️⃣ pegar QR
    const qrRes = await fetch(
      `https://sandbox.asaas.com/api/v3/payments/${pagamento.id}/pixQrCode`,
      {
        headers: {
          access_token: ASAAS_TOKEN,
        },
      },
    );

    const qr = await qrRes.json();
    console.log('QR:', qr);

    if (!qr.encodedImage) {
      return res.status(400).json({
        erro: 'QR não gerado',
        detalhe: qr,
      });
    }

    res.json({
      qr_code: qr.payload,
      qr_base64: qr.encodedImage,
    });
  } catch (error) {
    console.log('ERRO GERAL:', error);
    console.log('❌ ERRO COMPLETO:', error.response?.data || error);
    res.status(500).json({ erro: 'Erro PIX Asaas' });
  }
});

app.post('/criar-cartao', async (req, res) => {
  try {
    const { total } = req.body;

    const response = await fetch(
      'https://sandbox.asaas.com/api/v3/paymentLinks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_TOKEN,
        },
        body: JSON.stringify({
          name: 'Pedido Loja',
          description: 'Compra no app',
          value: Number(total),
          billingType: 'CREDIT_CARD', // 👈 AQUI SIM
          chargeType: 'DETACHED',
        }),
      },
    );

    const data = await response.json();
    console.log('LINK CARTAO:', data);

    if (!data.url) {
      return res.status(400).json({
        erro: 'Erro ao gerar link',
        detalhe: data,
      });
    }

    res.json({
      link: data.url,
    });
  } catch (error) {
    console.log('ERRO CARTAO:', error);
    res.status(500).json({ erro: 'Erro cartão' });
  }
});

//   const token = req.headers['asaas-access-token'];

//   if (token !== 'whsec_5ULLn4GVD_aVD4cnkvUWGLlsk_TVXNw_2P8kMwGf0NQ') {
//     console.log('❌ Token inválido');
//     return res.sendStatus(401);
//   }

//   try {
//     const evento = req.body;

//     console.log('🔔 WEBHOOK ASAAS:', evento);

//     // pagamento recebido
//     if (evento.event === 'PAYMENT_RECEIVED') {
//       const pagamentoId = evento.payment.id;

//       // buscar pagamento completo
//       const pagamentoRes = await fetch(
//         `https://sandbox.asaas.com/api/v3/payments/${pagamentoId}`,
//         {
//           headers: {
//             access_token: ASAAS_TOKEN,
//           },
//         },
//       );

//       const pagamento = await pagamentoRes.json();

//       console.log('Pagamento:', pagamento);

//       const pedidoId = pagamento.externalReference;

//       if (pedidoId) {
//         await db.collection('pedidos').doc(pedidoId).update({
//           statusPagamento: 'pago',

//           pagoEm: admin.firestore.FieldValue.serverTimestamp(),
//         });

//         console.log('✅ Pedido pago:', pedidoId);
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     console.log('❌ ERRO WEBHOOK:', error);

//     res.sendStatus(500);
//   }
// });

// app.post('/webhook-asaas', (req, res) => {
//   console.log('🔔 Webhook Asaas recebido');
//   console.log(JSON.stringify(req.body, null, 2));

//   res.status(200).send('OK');
// });
app.post('/webhook-asaas', async (req, res) => {
  try {
    console.log('🔔 WEBHOOK RECEBIDO');

    const evento = req.body;

    // Valida o token enviado pelo Asaas
    const token = req.headers['asaas-access-token'];

    if (token !== 'whsec_GKi1-fJpWh3fljpitTAmWZysGReftIYcV-66eXy-7uU') {
      console.log('❌ Token inválido');
      return res.sendStatus(401);
    }

    if (
      evento.event === 'PAYMENT_RECEIVED' ||
      evento.event === 'PAYMENT_CONFIRMED' ||
      evento.event === 'PAYMENT_UPDATED'
    ) {
      const pedidoId = evento.payment.externalReference;

      console.log('Pedido:', pedidoId);

      await db.collection('pedidos').doc(pedidoId).update({
        statusPagamento: 'pago',
        pagoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ Pedido atualizado!');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
});
app.listen(3000, () => console.log('Servidor rodando 🚀'));

// whsec_AD4NqUhih2vGot-1Z8CuQT44CWtNLUWXTD3M1E7_ekg
// whsec_5ULLn4GVD_aVD4cnkvUWGLlsk_TVXNw_2P8kMwGf0NQ
