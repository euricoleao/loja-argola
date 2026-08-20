import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export async function verificarVencimentos() {
  try {
    console.log('🔎 Verificando vencimentos...');

    const hoje = new Date();

    const pedidosRef = collection(db, 'pedidos');

    const q = query(pedidosRef, where('formaPagamento', '==', 'prazo'));

    const snapshot = await getDocs(q);

    console.log(`📦 Pedidos a prazo encontrados: ${snapshot.size}`);

    for (const pedidoDoc of snapshot.docs) {
      const pedido = pedidoDoc.data();

      if (!pedido.uid || !pedido.parcelas) {
        continue;
      }

      // 🔔 Verificar se o cliente permite notificações de vencimento
      const configRef = doc(
        db,
        'usuarios',
        pedido.uid,
        'configuracoes',
        'notificacoes',
      );

      const configSnap = await getDoc(configRef);

      const notificacoesAtivas = configSnap.exists()
        ? configSnap.data()
        : {
            gerais: true,
            vencimentos: true,
          };

      // 🚫 Cliente desativou notificações gerais
      if (notificacoesAtivas.gerais === false) {
        console.log(`🔕 Notificações gerais desativadas para ${pedido.uid}`);
        continue;
      }

      // 🚫 Cliente desativou vencimentos
      if (notificacoesAtivas.vencimentos === false) {
        console.log(`🔕 Vencimentos desativados para ${pedido.uid}`);
        continue;
      }

      for (const parcela of pedido.parcelas) {
        if (!parcela.vencimento) {
          continue;
        }

        const vencimento = parcela.vencimento.toDate
          ? parcela.vencimento.toDate()
          : new Date(parcela.vencimento);

        const diferencaMs = vencimento.getTime() - hoje.getTime();

        const diasRestantes = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

        console.log(
          `📅 Pedido ${pedidoDoc.id} | Parcela ${parcela.numero} | Faltam ${diasRestantes} dias`,
        );

        // 🔔 7 DIAS ANTES
        if (diasRestantes === 7) {
          await criarNotificacao(
            pedido.uid,
            pedidoDoc.id,
            parcela,
            '7_dias',
            `Sua parcela ${parcela.numero} vence em 7 dias.`,
          );
        }

        // 🔔 1 DIA ANTES
        if (diasRestantes === 1) {
          await criarNotificacao(
            pedido.uid,
            pedidoDoc.id,
            parcela,
            '1_dia',
            `Sua parcela ${parcela.numero} vence amanhã.`,
          );
        }

        // 🚨 VENCE HOJE
        if (diasRestantes === 0) {
          await criarNotificacao(
            pedido.uid,
            pedidoDoc.id,
            parcela,
            'vence_hoje',
            `Sua parcela ${parcela.numero} vence hoje.`,
          );
        }

        // ⚠️ VENCIDA
        if (diasRestantes < 0 && parcela.status === 'pendente') {
          await criarNotificacao(
            pedido.uid,
            pedidoDoc.id,
            parcela,
            'vencida',
            `A parcela ${parcela.numero} está vencida.`,
          );
        }
      }
    }

    console.log('✅ Verificação de vencimentos concluída.');
  } catch (error) {
    console.log('❌ Erro ao verificar vencimentos:', error);
  }
}

async function criarNotificacao(uid, pedidoId, parcela, tipo, mensagem) {
  try {
    const notificacoesRef = collection(db, 'usuarios', uid, 'notificacoes');

    // 🔎 Verifica se essa notificação já existe
    const q = query(
      notificacoesRef,
      where('pedidoId', '==', pedidoId),
      where('parcelaNumero', '==', parcela.numero),
      where('tipo', '==', tipo),
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log(
        `⏭️ Notificação já existe: ${tipo} | Parcela ${parcela.numero}`,
      );

      return;
    }

    // 🔔 Cria somente se ainda não existir
    await addDoc(notificacoesRef, {
      titulo: 'Lembrete de pagamento 🔔',
      mensagem,
      tipo,
      pedidoId,
      parcelaNumero: parcela.numero,
      valor: parcela.valor,
      vencimento: parcela.vencimento,
      lida: false,
      criadoEm: new Date(),
    });

    console.log(`🔔 Notificação criada: ${tipo} | Parcela ${parcela.numero}`);
  } catch (error) {
    console.log('❌ Erro ao criar notificação:', error);
  }
}
