import RNFS from 'react-native-fs';
import path from 'path'
import { VerifiableCredential } from "@extrimian/agent";

const DIR_STORAGE = 'quarkid_fs'

class VCAttachment {
    title!: string;
    description!: string;
    url!: string;
    hash?: string;
    contentType?: string;
}
interface AttachmentStorage {
    saveFile(params: { file: ArrayBuffer, attachmentInfo: VCAttachment, vc: VerifiableCredential, fileExtension: string, contentType: string }): Promise<void>;
    getFilePath(params: { attachmentInfo: VCAttachment, vc: VerifiableCredential, fileExtension: string }): Promise<string>
    deleteAttachment(id: string, contextParams: { vc: VerifiableCredential }): Promise<void>;
    getFile(filePath: string): Promise<ArrayBuffer>; 
    createRootDir():Promise<void>;
}

export class AttachmentFileStorage implements AttachmentStorage {
    constructor(){
        this.createRootDir()
    }

    private rootDirectory = `${RNFS.DocumentDirectoryPath}/${DIR_STORAGE}`;

    async createRootDir() {
        try{
            const existingDirs = await RNFS.readDir(RNFS.DocumentDirectoryPath);
            const folderNames = existingDirs.filter((item) => item.isDirectory()).map((item) => item.name);
            console.log('Root folder in process')
            if(!folderNames.includes(DIR_STORAGE)){
                const folderPath = this.rootDirectory;
                await RNFS.mkdir(folderPath);
                console.log('Root folder succesfully created')
            }else{
                console.log('Root folder already created')
            }
        }catch(error){console.log('Something went wrong: ' , error)} 
    }
    public async getFilePath(params: { attachmentInfo: VCAttachment, vc: VerifiableCredential, fileExtension: string }): Promise<string> {
        const issuerRaw = params.vc.issuer;
        const issuerStr = typeof issuerRaw === "string" ? issuerRaw : issuerRaw && issuerRaw.id ? issuerRaw.id : undefined;
        const hashStr = params.attachmentInfo.hash;
        if (!issuerStr) {
            console.error('[getFilePath] issuer es undefined o no tiene id:', issuerRaw);
        }
        if (!hashStr) {
            console.error('[getFilePath] attachmentInfo.hash es undefined:', params.attachmentInfo);
        }
        const joined = path.join(
            this.rootDirectory,
            (issuerStr || 'unknown_issuer').replace(/:/g, "_"),
            hashStr || 'unknown_hash',
        );
        console.log('[getFilePath] path.join args:', this.rootDirectory, issuerStr, hashStr, '->', joined);
        return `${joined}.${params.fileExtension}`;
    }
    private async ensureDirectoryExistence(vc: VerifiableCredential): Promise<void> {
        const dirname = (typeof vc.issuer === "string" ? vc.issuer : vc.issuer.id).replace(/:/g, "_")
        const existingDirs = await RNFS.readDir(this.rootDirectory);
        const folderNames = existingDirs.filter((item) => item.isDirectory()).map((item) => item.name);
        if(!folderNames.includes(dirname)){
            const folderPath = `${this.rootDirectory}/${dirname}`;
            await RNFS.mkdir(folderPath);
        }
    }   
    async saveFile(params: {
        file: ArrayBuffer, attachmentInfo: VCAttachment, vc: VerifiableCredential, fileExtension: string
    }): Promise<void> {
        const filePath = await this.getFilePath({ attachmentInfo: params.attachmentInfo, vc: params.vc, fileExtension: params.fileExtension });
        await this.ensureDirectoryExistence(params.vc);
        const buffer = Buffer.from(params.file); // Convertir ArrayBuffer a Buffer
        await RNFS.writeFile(filePath, buffer.toString('base64'), 'base64');
        console.log(`File saved at: ${filePath}`);
    }
    async getFile(filePath: string): Promise<ArrayBuffer> {
        const data = await RNFS.readFile(filePath , 'base64');
        const buffer = Buffer.from(data, 'base64');
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        return arrayBuffer;
    }

    async deleteAttachment(id: string, contextParams: { vc: VerifiableCredential }): Promise<void> {
        try {
            const issuerRaw = contextParams.vc.issuer;
            const issuerStr = typeof issuerRaw === "string" ? issuerRaw : issuerRaw && issuerRaw.id ? issuerRaw.id : undefined;
            if (!issuerStr) {
                console.error('[deleteAttachment] issuer es undefined o no tiene id:', issuerRaw);
            }
            const directoryPath = path.join(
                this.rootDirectory,
                (issuerStr || 'unknown_issuer').replace(/:/g, "_")
            );
            console.log('[deleteAttachment] path.join args:', this.rootDirectory, issuerStr, '->', directoryPath);
            const files = await RNFS.readDir(directoryPath);
    
            for (const file of files) {
                if (file.name.includes(id)) {
                    const filePath = path.join(directoryPath, file.name);
                    await RNFS.unlink(filePath);
                    console.log(`File deleted: ${filePath}`);
                    return;
                }
            }
            console.log(`File with id ${id} not found`);
        } catch (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }

    
}