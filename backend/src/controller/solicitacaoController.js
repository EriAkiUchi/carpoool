import axios from "axios";
import Solicitacao from "../models/Solicitacao.js";

class SolicitacaoController {
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