import { Router, Request, Response } from 'express';
import UrlService from '../controllers/url.controller';
import { IArchive } from '../interfaces/archive.interface';
import { checkToken } from '../middlewares/autenticacion.middlewares';
import CSVToJSON from 'csvtojson';
import path from 'path';

const urlRoutes = Router();
const urlCtrl = new UrlService;

urlRoutes.post('/overallInventory', checkToken, async (req: any, res: Response) => {
    const user = req.body.user;
    const project = req.body.project;
    const temp = await path.resolve(__dirname, '../temp');
    const archive: IArchive = req.files.archive;

    if (!project) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }
    
    if (!req.files) {
        return res.status(400).json({ ok: false, mensaje: 'You did not send any file', respuesta: null, codigo: 400 });
    }

    if (!archive) {
        return res.status(400).json({ ok: false, mensaje: 'You did not send any file', respuesta: null, codigo: 400 });
    }

    if (!archive.mimetype.includes('vnd.ms-excel')) {
        return res.status(400).json({ ok: false, mensaje: 'This file is not a CSV', respuesta: null, codigo: 400 });
    }

    try {
        const response = await urlCtrl.csvSaveTemporary( archive ).then(() => {
            CSVToJSON().fromFile(`${temp}/archive.csv`).then(async( urls: any ) => {
                await urlCtrl.urlsCreate(urls, user.empresa, project)
            })
        })
        return res.json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err)
    }
});

urlRoutes.post('/create', checkToken, async (req: Request, res: Response) => {
    const user = req.body.user;
    const project = req.body.project;
    const url = req.body.url;

    if (!project) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }

    if (!url) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }

    if (user.role === 'VISTA_ROLE'){
        return res.status(401).json({ ok: false, mensaje: 'You do not have permission to create urls', respuesta: null, codigo: 401 });
    }

    try {
        const response = urlCtrl.urlCreate(url, user.company, project);
        return res.json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err)
    }
});

urlRoutes.get('/list/:project', checkToken, async(req: Request, res: Response) => {
    const user = req.body.user;
    const project = req.params.project;

    if (!project) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }

    try {
        const response = urlCtrl.urlList( user.company, project)
        return res.json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err)
    }
});

urlRoutes.put('/urlUpdate', checkToken, async( req: Request, res: Response ) => {
    const user = req.body.user;
    const project = req.body.project;
    const url = req.body.url;
    const id = req.body.id;

    if (!project) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }

    if (!url) {
        return res.status(400).json({ ok: false, mensaje: 'Incorrect data', respuesta: null, codigo: 400 });
    }

    try {
        const response = urlCtrl.urlUpdate( url, id, user.empresa, project);
        return res.json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err)
    } 
});

export default urlRoutes;