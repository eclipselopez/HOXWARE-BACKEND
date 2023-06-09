import { Router, Request, Response } from "express";
import ProyectoService from "../controllers/proyecto.controller";
import IProyecto from "../interfaces/proyecto.interface";
import IRespuesta from "../interfaces/respuesta.interface";
import { verificaToken } from "../middlewares/autenticacion.middlewares";

const proyectoRoutes = Router();
const proyectoService = new ProyectoService;

proyectoRoutes.post('/crear', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;
    let proyecto: IProyecto = req.body.proyecto;

    proyecto.propietario = await usuario.empresa;
    proyecto.permisos = [];
    proyecto.permisos.push(usuario.id);

    proyectoService.crearProyecto(proyecto, ( respuesta: IRespuesta ) => {
        return res.status(respuesta.codigo).json(respuesta);
    });
});

proyectoRoutes.get('/listar', verificaToken, async( req: Request, res: Response ) => {
    const usuario = req.body.usuario;

    switch ( usuario.role ) {
        case 'SUDO':
            await proyectoService.obtenerProyectosSudo( ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo ).json( respuesta );
            });
            break;
        case 'ADMIN_ROLE':
            await proyectoService.obtenerProyectos( usuario.empresa, ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo ).json( respuesta );
            });
            break;

        case 'USER_ROLE':
            await proyectoService.obtenerProyectosId( usuario.empresa, usuario.id, ( respuesta: IRespuesta ) => {
                return res.status( respuesta.codigo).json( respuesta );
            });
            break;
    }
});

export default proyectoRoutes;