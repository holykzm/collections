import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { FilesRepository } from '../repositories/files.js';
import { getStorage } from '../storages/storage.js';
import { FileNotFoundException } from '../../exceptions/storage/fileNotFound.js';

const app = express();

app.get(
  '/assets/:fileName',
  asyncHandler(async (req: Request, res: Response) => {
    const repository = new FilesRepository();
    const file = (await repository.read({ fileNameDisk: req.params.fileName }))[0];

    if (!file) throw new FileNotFoundException('file_does_not_exist');

    const storage = getStorage(file.storage);
    const key = storage.key(file.fileNameDisk);

    const data = await storage.getBuffer(key);

    res.type(file.type);
    res.setHeader('Content-Length', data.length);
    res.setHeader('Content-Disposition', 'attachment; filename=' + file.fileName);
    res.send(data);
  })
);

export const assets = app;