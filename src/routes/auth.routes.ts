import { Router, Request, Response } from "express";
import AuthUsuarioService from "../controllers/auth.controller";
import IRespuesta from "../interfaces/response.interface";
import { checkToken } from "../middlewares/autentication.middlewares";

const authUsuarioRoutes = Router();
const authUsuarioService = new AuthUsuarioService;

authUsuarioRoutes.post('/admin/registrar', async (req: Request, res: Response) => {
    const usuario = req.body.usuario;
    const exp = req.body.duracion ? req.body.duracion : '30d';

    let respuesta = await authUsuarioService.crearAdmin(usuario, exp);

    return res.status( respuesta.codigo ).json( respuesta );
});

authUsuarioRoutes.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    authUsuarioService.login( email, password, ( respuesta: IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

authUsuarioRoutes.put('/activar', async (req: Request, res: Response) => {
    const email = req.body.email;
    const licencia = req.body.licencia;

    authUsuarioService.activarLicencia(email, licencia, async (respuesta: IRespuesta) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

authUsuarioRoutes.post('/crearUsuario', checkToken, async ( req: Request, res: Response ) => {
    const admin = req.body.usuario;
    const usuario = req.body.noadmin;

    if ( !usuario ) {
        return res.status( 400 ).json({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
    }

    await authUsuarioService.crearUsuario(usuario, admin, ( respuesta: IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

authUsuarioRoutes.get('/:token', async( req: Request, res: Response ) => {
    let token = req.params.token;

    await authUsuarioService.checkTokenUsuario( token ).then(( respuesta ) => {
        return res.redirect('https://hoxware.tech');
    }).catch((error) => {
        return res.redirect(401, 'https://hoxware.tech');
    })
});

authUsuarioRoutes.put('/reenviarCorreo', checkToken, async( req: Request, res: Response ) => {
    const role = req.body.usuario.role;
    const id = req.body.id;

    if ( role === 'VISTA_ROLE' || role === 'USER_ROLE' ) {
        return res.status(401).json({ ok: false, mensaje: 'No eres administrador', respuesta: null, codigo: 401 });
    }

    authUsuarioService.reenviarCorreoAct( id, ( respuesta: IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    });
});

authUsuarioRoutes.post('/resetPassword', async( req: Request, res: Response ) => {
    const email = req.body.email;

    if ( !email ) {
        return res.status(400).json({ ok: false, mensaje: 'Datos incorrector', respuesta: null, codigo: 400 });
    }

    authUsuarioService.resetPassword(email, ( respuesta: IRespuesta ) => {
        return res.status( respuesta.codigo ).json( respuesta );
    })
});

authUsuarioRoutes.get('/resetPwd/:token', async( req: Request, res: Response ) => {
    const token = req.params.token;

    await authUsuarioService.verficarResetPassword(token).then((respuesta) => {
        res.send(respuesta);
    }).catch((error) => {
        throw error;
    });
});


export default authUsuarioRoutes;