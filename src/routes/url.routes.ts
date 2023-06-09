import { Router, Request, Response } from 'express';
import UrlService from '../controllers/url.controller';
import { IArchivo } from '../interfaces/archivo.interface';
import { verificaToken } from '../middlewares/autenticacion.middlewares';
import CSVToJSON from 'csvtojson';
import path from 'path';
import IRespuesta from '../interfaces/respuesta.interface';

const urlRoutes = Router();
const urlService = new UrlService;

urlRoutes.post('/inventarioGlobal', verificaToken, async ( req: any, res: Response ) => {
    const usuario = req.body.usuario;
    const proyecto = req.body.proyecto;
    const temp = await path.resolve( __dirname, '../temp');

    if ( !proyecto ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }
    
    if ( !req.files ) {
        return res.status(400).json({ ok: false, mensaje: 'No enviastes ningun archivo', respuesta: null, codigo: 400 });
    }
    
    const archivo: IArchivo = req.files.archivo;

    if ( !archivo ) {
        return res.status(400).json({ ok: false, mensaje: 'No enviastes ningun archivo', respuesta: null, codigo: 400 });
    }

    if ( !archivo.mimetype.includes('vnd.ms-excel') ) {
        return res.status(400).json({ ok: false, mensaje: 'El archivo no es un csv', respuesta: null, codigo: 400 });
    }

    await urlService.guardarCsvTemporal( archivo ).then(() => {
        CSVToJSON().fromFile(`${temp}/archivo.csv`).then(async( urls: any ) => {
            await urlService.crearUrls(urls, usuario.empresa, proyecto, ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo).json( respuesta );
            })
        })
    })

});

urlRoutes.post('/crear', verificaToken, async ( req: Request, res: Response ) => {
    const usuario = req.body.usuario;
    const proyecto = req.body.proyecto;
    const url = req.body.url;

    if ( !proyecto ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    if ( !url ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    if ( usuario.role === 'VISTA_ROLE' ){
        return res.status(401).json({ ok: false, mensaje: 'No cuentas con permisos para crear urls', respuesta: null, codigo: 401 });
    }

    urlService.crearUrl(url, usuario.empresa, proyecto, ( respuesta : IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

urlRoutes.get('/listar/:proyecto', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;
    const proyecto = req.params.proyecto;

    if ( !proyecto ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    urlService.listar( usuario.empresa, proyecto, ( respuesta: IRespuesta ) => {
        return res.status(respuesta.codigo).json(respuesta);
    })
});

urlRoutes.put('/actualizar', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;
    const proyecto = req.body.proyecto;
    const url = req.body.url;
    const id = req.body.id;

    if ( !proyecto ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    if ( !url ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    urlService.actualizar( url, id, usuario.empresa, proyecto, ( respuesta: IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

export default urlRoutes;