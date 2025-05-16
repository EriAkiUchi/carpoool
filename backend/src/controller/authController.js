class AuthController {
    /**
     * @swagger
     * /login/passageiro:
     *   post:
     *     tags: [Autenticação]
     *     summary: Realiza login de passageiro
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               senha:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *       401:
     *         description: Credenciais inválidas
     *       500:
     *         description: Erro ao realizar login
     */

    static async loginPassageiro(req, res, firestore) {
        try {
            const { email, senha } = req.body;

            if(!email || !senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
            }

            //buscar passageiro pelo email
            const passageirosRef = firestore.collection('passageiros');
            const snapshot = await passageirosRef.where('email', '==', email).get();

            if (snapshot.empty) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            //verificar senha
            const passageiro = snapshot.docs[0].data();
            if(passageiro.senha !== senha) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // responder com dados do passageiro
            res.status(200).json({
                id: snapshot.docs[0].id,
                nome: passageiro.nome,
                email: passageiro.email,
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao realizar login.', error: error.message });
        }
    }    /**
     * @swagger
     * /login/motorista:
     *   post:
     *     tags: [Autenticação]
     *     summary: Realiza login de motorista
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               senha:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *       401:
     *         description: Credenciais inválidas
     *       500:
     *         description: Erro ao realizar login
     */

    static async loginMotorista(req, res, firestore) {
        try {
            const { email, senha } = req.body;
            
            if (!email || !senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' });
            }
            
            // Buscar motorista pelo email
            const motoristasRef = firestore.collection('motoristas');
            const snapshot = await motoristasRef.where('email', '==', email).get();
            
            if (snapshot.empty) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            
            // Verificar senha (em produção, deveria usar bcrypt ou similar)
            const motorista = snapshot.docs[0].data();
            if (motorista.senha !== senha) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            
            // Responder com dados do motorista
            res.status(200).json({
                id: snapshot.docs[0].id,
                nome: motorista.nome,
                email: motorista.email
            });
            
        } catch (erro) {
            res.status(500).json({ message: 'Erro ao realizar login: ' + erro });
        }
    }
}

export default AuthController;