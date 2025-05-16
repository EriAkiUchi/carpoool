import axios from "axios";
import Solicitacao from "../models/Solicitacao.js";

class SolicitacaoController {
    /**
     * @swagger
     * /motoristas/solicitacoes:
     *   get:
     *     tags: [Solicitações]
     *     summary: Retorna todas as solicitações de carona
     *     responses:
     *       200:
     *         description: Lista de solicitações ou lista vazia
     *       500:
     *         description: Erro ao buscar solicitações
     */
    static async getSolicitacoes(req, res, firestore) {
        try {
            const solicitacoesRef = firestore.collection('solicitacoes');
            const snapshot = await solicitacoesRef.get();

            if (snapshot.empty) {
                return res.status(200).json([]);
            }

            const solicitacoes = snapshot.docs.map(doc => Solicitacao.fromFirestore(doc));
            res.status(200).json(solicitacoes);
        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
            res.status(500).json({ error: `Erro ao buscar solicitações: ${error}` });
        }
    }

    /**
     * @swagger
     * /motoristas/solicitacoes/verificar:
     *   get:
     *     tags: [Solicitações]
     *     summary: Verifica se existe uma solicitação específica
     *     parameters:
     *       - in: query
     *         name: idPassageiro
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: idViagem
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Solicitação encontrada ou objeto vazio se não existir
     *       500:
     *         description: Erro ao buscar solicitação
     */
    static async getSolicitacaoId(req, res, firestore) {
        try {
            const { idPassageiro, idViagem } = req.query;
            const solicitacaoRef = firestore.collection('solicitacoes');
            const snapshot = await solicitacaoRef
                                    .where('idPassageiro', '==', idPassageiro)  
                                    .where('idViagem', '==', idViagem)
                                    .get();

            if (snapshot.empty) {
                return res.status(200).json({});
            }

            const solicitacao = snapshot.docs.map(doc => Solicitacao.fromFirestore(doc));
            res.status(200).json(solicitacao);
        } catch (error) {
            console.error("Erro ao buscar solicitação:", error);
            res.status(500).json({ error: `Erro ao buscar solicitação: ${error}` });
        }
    }

    /**
     * @swagger
     * /motoristas/solicitacoes:
     *   post:
     *     tags: [Solicitações]
     *     summary: Cria uma nova solicitação de carona
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               idPassageiro:
     *                 type: string
     *               idViagem:
     *                 type: string
     *               nomePassageiro:
     *                 type: string
     *               enderecoOrigem:
     *                 type: object
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Solicitação criada com sucesso
     *       500:
     *         description: Erro ao criar solicitação
     */
    static async createSolicitacao(req, res, firestore) {
        try {
            const { idPassageiro, idViagem, nomeEmpresa, nomePassageiro, enderecoOrigem, genero } = req.body;

            const novaSolicitacao = new Solicitacao(idPassageiro, idViagem, nomeEmpresa, nomePassageiro, enderecoOrigem, genero);
            const solicitacaoRef = await firestore.collection('solicitacoes').add(novaSolicitacao.toFirestore());

            res.status(201).json({ id: solicitacaoRef.id, ...novaSolicitacao });

        } catch (error) {
            console.error("Erro ao criar solicitação:", error);
            res.status(500).json({ error: `Erro ao criar solicitação: ${error}` });
        }
    }

    /**
     * @swagger
     * /motoristas/solicitacoes/{id}:
     *   delete:
     *     tags: [Solicitações]
     *     summary: Deleta uma solicitação pelo ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Solicitação excluída com sucesso
     *       404:
     *         description: Solicitação não encontrada
     *       500:
     *         description: Erro ao excluir solicitação
     */
    static async deleteSolicitacao(req, res, firestore) {
        try {
            const { id } = req.params;
            const solicitacaoRef = firestore.collection('solicitacoes').doc(id);

            const doc = await solicitacaoRef.get();
            if (!doc.exists) {
                return res.status(404).json({ message: "Solicitação não encontrada." });
            }

            await solicitacaoRef.delete();
            res.status(200).json({ message: "Solicitação excluída com sucesso." });
        } catch (error) {
            console.error("Erro ao excluir solicitação:", error);
            res.status(500).json({ error: `Erro ao excluir solicitação: ${error}` });
        }
    }
}

export default SolicitacaoController;