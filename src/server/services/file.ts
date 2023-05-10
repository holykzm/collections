import { File } from '../../config/types.js';
import { env } from '../../env.js';
import { FilesRepository } from '../repositories/files.js';
import { getStorage } from '../storages/storage.js';

export class FileService {
  async upload(buffer: Buffer, file: Omit<File, 'id'>): Promise<number> {
    const storage = getStorage(env.STORAGE_DRIVER);
    await storage.put(file.fileNameDisk, buffer);

    const repository = new FilesRepository();
    const result = await repository.create(file);

    return result.id;
  }
}