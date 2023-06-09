import { Router, Request, Response } from "express";
import UsuarioService from "../controllers/usuario.controller";
import IRespuesta from "../interfaces/respuesta.interface";
import { verificaToken } from "../middlewares/autenticacion.middlewares";

const usuarioRoutes = Router();
const usuarioService = new UsuarioService;

usuarioRoutes.get('/listar', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;

    switch( usuario.role ) {
        case 'SUDO':
            await usuarioService.listarUsuariosSudo( ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo ).json( respuesta );
            });
            break;

        case 'ADMIN_ROLE':
            await usuarioService.listarUsuarios( usuario, ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo ).json( respuesta );
            });
            break;

        default:
            return res.status(401).json({ ok: false, mensaje: 'No eres administrador', respuesta: null, codigo: 401 });
            break;
    }
});

usuarioRoutes.put('/actualizar', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;

    // if ( await usuarioService.verificarAdmin( usuario.role ) ) {

        
    // }
})

export default usuarioRoutes;