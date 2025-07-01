const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('Antes do Prisma');
const prisma = new PrismaClient();
console.log('Depois do Prisma');

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

console.log('Antes do Google Auth');
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  
  // Corrigir formatação da chave privada
  if (credentials.private_key) {
    // Substituir \\n por \n (quebras de linha duplas por simples)
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    // Remover espaços extras no início e fim
    credentials.private_key = credentials.private_key.trim();
  }
  
  // Log para diagnosticar a chave privada
  console.log('Chave privada (primeiros 50 chars):', credentials.private_key.substring(0, 50));
  console.log('Chave privada (últimos 50 chars):', credentials.private_key.substring(credentials.private_key.length - 50));
  console.log('Chave privada contém \\n:', credentials.private_key.includes('\\n'));
  console.log('Chave privada contém \n:', credentials.private_key.includes('\n'));
  console.log('Tamanho da chave privada:', credentials.private_key.length);
  console.log('Chave privada começa com -----BEGIN:', credentials.private_key.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('Chave privada termina com -----END:', credentials.private_key.endsWith('-----END PRIVATE KEY-----'));
  
} catch (error) {
  console.error('Erro ao fazer parse da service account:', error);
  throw new Error('Erro na configuração da service account');
}

// Tentar abordagem alternativa com JWT
let auth;
try {
  console.log('Tentando autenticação com JWT...');
  const { JWT } = require('google-auth-library');
  
  auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  console.log('JWT criado com sucesso');
} catch (jwtError) {
  console.error('Erro com JWT, tentando GoogleAuth:', jwtError);
  
  // Fallback para GoogleAuth
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}
console.log('Depois do Google Auth');

// Testar autenticação de forma mais simples
try {
  console.log('Testando autenticação...');
  if (auth.getClient) {
    const authClient = await auth.getClient();
    console.log('Cliente de autenticação obtido com sucesso');
  } else {
    console.log('Usando JWT diretamente');
  }
} catch (authError) {
  console.error('Erro na autenticação:', authError);
  // Não vamos falhar aqui, deixar tentar o upload
}

async function uploadFileToDrive(drive, filePath, originalname, mimetype) {
  const fileMetadata = {
    name: originalname,
    parents: [FOLDER_ID],
  };
  const media = {
    mimeType: mimetype,
    body: fs.createReadStream(filePath),
  };
  try {
    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    fs.unlinkSync(filePath); // Remove o arquivo temporário
    return uploadedFile.data.id;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
}

module.exports = async function handler(req, res) {
  try {
    console.log('=== INÍCIO DO HANDLER ===');
    console.log('Método:', req.method);
    console.log('Variáveis de ambiente:', {
      GOOGLE_SERVICE_ACCOUNT: !!process.env.GOOGLE_SERVICE_ACCOUNT,
      GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      DATABASE_URL: !!process.env.DATABASE_URL,
    });

    if (req.method !== 'POST') {
      console.log('Método não permitido:', req.method);
      res.status(405).json({ message: 'Método não permitido' });
      return;
    }
    
    if (!FOLDER_ID || !process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.log('Variáveis de ambiente faltando:', {
        FOLDER_ID: !!FOLDER_ID,
        GOOGLE_SERVICE_ACCOUNT: !!process.env.GOOGLE_SERVICE_ACCOUNT
      });
      res.status(500).json({ message: 'Variáveis de ambiente não configuradas' });
      return;
    }

    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = {};
    const fileWrites = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const saveTo = path.join(os.tmpdir(), filename);
      files[fieldname] = { path: saveTo, originalname: filename, mimetype: mimeType };
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);
      const promise = new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      fileWrites.push(promise);
    });

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('finish', async () => {
      try {
        await Promise.all(fileWrites);
        const drive = google.drive({ version: 'v3', auth });
        const video = files['video'];
        const terms = files['terms'];
        if (!video || !terms) {
          res.status(400).json({ message: 'Vídeo e termo de uso são obrigatórios.' });
          return;
        }
        const [video_drive_id, terms_drive_id] = await Promise.all([
          uploadFileToDrive(drive, video.path, video.originalname, video.mimetype),
          uploadFileToDrive(drive, terms.path, terms.originalname, terms.mimetype),
        ]);
        await prisma.depoimento.create({
          data: {
            nome: fields.nome,
            email: fields.email,
            telefone: fields.telefone,
            rg: fields.rg,
            cpf: fields.cpf,
            endereco: fields.endereco,
            nacionalidade: fields.nacionalidade,
            estadoCivil: fields.estadoCivil,
            profissao: fields.profissao,
            relacao: fields.relacao,
            descricao: fields.descricao,
            video_drive_id,
            terms_drive_id,
          },
        });
        res.status(200).json({ videoId: video_drive_id, termsId: terms_drive_id });
      } catch (error) {
        console.error('Erro interno ao finalizar upload:', error);
        res.status(500).json({ message: error.message });
      }
    });

    req.pipe(busboy);
  } catch (error) {
    console.error('=== ERRO GLOBAL NA FUNÇÃO UPLOAD ===');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('Nome do erro:', error.name);
    
    // Se for erro de autenticação, retornar erro específico
    if (error.message.includes('autenticação') || error.message.includes('JWT')) {
      res.status(401).json({ 
        message: 'Erro de autenticação com Google Drive',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
} 