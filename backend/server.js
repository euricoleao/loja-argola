import cors from "cors";
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 SEU TOKEN AQUI
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-6657644783641857-042410-7b745d4e17c598f0d81c8e7d4eaff76a-3357830212"
});


// 💳 PAGAMENTO CARTÃO (link)
app.post("/criar-pagamento", async (req, res) => {
  try {
    const { total } = req.body;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Pedido Loja",
            quantity: 1,
            unit_price: Number(total)
          }
        ]
      }
    });

    res.json({
      link: response.init_point
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ erro: "Erro pagamento" });
  }
});


// 📲 PIX
app.post("/criar-pix", async (req, res) => {
  try {
    const { total } = req.body;

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer SEU_ACCESS_TOKEN_AQUI`
      },
      body: JSON.stringify({
        transaction_amount: Number(total),
        description: "Pedido Loja",
        payment_method_id: "pix",
        payer: {
          email: "teste@test.com"
        }
      })
    });

    const data = await response.json();

    res.json({
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ erro: "Erro PIX" });
  }
});

app.listen(3000, () => console.log("Servidor rodando 🚀"));





// APP_USR-6657644783641857-042410-7b745d4e17c598f0d81c8e7d4eaff76a-3357830212