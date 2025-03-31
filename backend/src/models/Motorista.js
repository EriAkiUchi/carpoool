import admin from 'firebase-admin';

class Motorista {
    constructor(nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento, genero, coordenadasOrigem, coordenadasDestino) {
        if(!nome || !email || !senha || !enderecoOrigem || !enderecoDestino || !dataNascimento) {
            for (const [key, value] of Object.entries({nome, email, senha, enderecoOrigem, enderecoDestino, dataNascimento})) {
                if(!value) {
                    throw new Error(`O campo ${key} é obrigatório`);
                }
            }
        }
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.enderecoOrigem = {
            logradouro: enderecoOrigem.logradouro,
            numero: enderecoOrigem.numero,
            bairro: enderecoOrigem.bairro,
            cidade: enderecoOrigem.cidade,
        };
        this.enderecoDestino = {
            logradouro: enderecoDestino.logradouro,
            numero: enderecoDestino.numero,
            bairro: enderecoDestino.bairro,
            cidade: enderecoDestino.cidade,
        };
        this.genero = genero;     
        this.coordenadasOrigem = {
            lat: coordenadasOrigem.lat,
            lng: coordenadasOrigem.lng
        };
        this.coordenadasDestino = {
            lat: coordenadasDestino.lat,
            lng: coordenadasDestino.lng
        };   

        // Converte a data de nascimento para o formato ISO antes de criar o objeto Date
        this.dataNascimento = this.processarDataNascimento(dataNascimento);
    }

// Processa data de nascimento consistentemente, lidando com objetos Date e formatos de string
    processarDataNascimento(dataNascimento) {
        // Caso já seja instância de Date (do controller)
        if (dataNascimento instanceof Date) {
            return admin.firestore.Timestamp.fromDate(dataNascimento);
        }
        
        // Caso seja uma string no formato "DD/MM/YYYY"
        else if (typeof dataNascimento === 'string' && dataNascimento.includes('/')) {
            const parts = dataNascimento.split('/');
            if (parts.length === 3) {
                const dia = parseInt(parts[0], 10);
                const mes = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                const ano = parseInt(parts[2], 10);
                
                const date = new Date(ano, mes, dia);
                if (!isNaN(date.getTime())) {
                    return admin.firestore.Timestamp.fromDate(date);
                }
            }
        }
        
        // Caso não seja uma data válida, retorna a data atual
        return admin.firestore.Timestamp.now();
    }

    // Método para converter uma data de "DD/MM/YYYY" para "YYYY-MM-DD"
    convertDateToISO(date) {
        if (typeof date !== 'string' && date.includes('/')) {
            const [day, month, year] = date.split('/');
            return `${year}-${month}-${day}T03:00:00Z`;
        }
        return date;
    }

    // Método para converter um objeto Passageiro para um documento que será salvo no Firestore
    toFirestore() {
        return {
            nome: this.nome,
            email: this.email,
            senha: this.senha,
            enderecoOrigem: {
                logradouro: this.enderecoOrigem.logradouro,
                numero: this.enderecoOrigem.numero,
                bairro: this.enderecoOrigem.bairro,
                cidade: this.enderecoOrigem.cidade,
            },
            enderecoDestino: {
                logradouro: this.enderecoDestino.logradouro,
                numero: this.enderecoDestino.numero,
                bairro: this.enderecoDestino.bairro,
                cidade: this.enderecoDestino.cidade,
            },
            dataNascimento: this.dataNascimento,
            genero: this.genero,
            coordenadasOrigem: {
                lat: this.coordenadasOrigem.lat,
                lng: this.coordenadasOrigem.lng
            },
            coordenadasDestino: {
                lat: this.coordenadasDestino.lat,
                lng: this.coordenadasDestino.lng
            }
        };
    }

    //
    static fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            enderecoOrigem: {
                logradouro: data.enderecoOrigem.logradouro,
                numero: data.enderecoOrigem.numero,
                bairro: data.enderecoOrigem.bairro,
                cidade: data.enderecoOrigem.cidade,
            },
            enderecoDestino: {
                logradouro: data.enderecoDestino.logradouro,
                numero: data.enderecoDestino.numero,
                bairro: data.enderecoDestino.bairro,
                cidade: data.enderecoDestino.cidade,
            },
            genero: data.genero,
            coordenadasOrigem: {
                lat: data.coordenadasOrigem.lat,
                lng: data.coordenadasOrigem.lng
            },
            coordenadasDestino: {
                lat: data.coordenadasDestino.lat,
                lng: data.coordenadasDestino.lng
            },

            // Convertendo o Timestamp para um objeto Date
            dataNascimento: data.dataNascimento.toDate().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'                
            })
        }
    }
}

export default Motorista;