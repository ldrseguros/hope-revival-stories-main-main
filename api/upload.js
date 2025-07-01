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
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
console.log('Depois do Google Auth');

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
    console.log('Método:', req.method);
    console.log('Variáveis de ambiente:', {
      GOOGLE_SERVICE_ACCOUNT: !!process.env.GOOGLE_SERVICE_ACCOUNT,
      GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      DATABASE_URL: !!process.env.DATABASE_URL,
    });

    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Método não permitido' });
      return;
    }
    if (!FOLDER_ID || !process.env.GOOGLE_SERVICE_ACCOUNT) {
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
    console.error('Erro global na função upload:', error);
    res.status(500).json({ message: error.message });
  }
} 