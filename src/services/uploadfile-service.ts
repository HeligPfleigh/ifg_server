import {inject} from '@loopback/core';
import md5 from 'js-md5';
import multer from 'multer';
import {mkdir, existsSync} from 'fs';
import {RestBindings, Response, Request, HttpErrors} from '@loopback/rest';

export class UploadFileService {
  storage: multer.StorageEngine;
  constructor(
    @inject(RestBindings.Http.REQUEST)
    private req: Request,
    @inject(RestBindings.Http.RESPONSE)
    private res: Response,
  ) {
    this.storage = multer.diskStorage({
      destination: function(request, file, cb) {
        if (!existsSync('./public/uploads')) {
          mkdir('./public/uploads', err => {
            if (err) throw err;
          });
        }
        cb(null, './public/uploads');
      },
      filename: function(request, file, cb) {
        const fileSuff = file.originalname.substr(
          file.originalname.lastIndexOf('.') + 1,
        );
        const safeFileType = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        if (!safeFileType.includes(fileSuff)) {
          cb(new HttpErrors.UnsupportedMediaType(), file.originalname);
        } else {
          cb(null, md5(file.fieldname + '-' + Date.now()) + '.' + fileSuff);
        }
      },
    });
  }

  async download(filepath: string) {
    return new Promise((res, ref) => {
      this.res.download(filepath, info => {
        if (info) {
          ref(false);
        }
        res(true);
      });
    });
  }

  async upload() {
    const multerUpload = multer({storage: this.storage});
    return new Promise<object>((resolve, reject) => {
      multerUpload.any()(this.req, this.res, (err: Error) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          files: this.req.files,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fields: (this.req as any).fields,
        });
      });
    });
  }
}
