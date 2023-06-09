import { IUsuario, IUsuarioUpdate } from "../interfaces/usuario.interface";
import Usuario from "../models/usuario.model";

export default class UsuarioService {
    constructor() {}

    async listarUsuarios( usuario: IUsuario, callback: Function ) {
        const role = usuario.role;
        const empresa = usuario.empresa;

        if ( await this.verificarAdmin( role )) {
            return callback({ ok: false, mensaje: 'No eres administrador', respuesta: null, codigo: 401 });
        }

        Usuario.find({ empresa: empresa }, ( err: any, usuariosDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( usuariosDB.length < 1 ) {
                return callback({ ok: false, mensaje: 'No hay usuarios para listar', respuesta: null, codigo: 400 });
            }

            return callback({ ok: true, mensaje: 'Usuarios listados correctamente', respuesta: usuariosDB , codigo: 200 });
        })
    }

    async listarUsuariosSudo( callback: Function ) {
        Usuario.find({}, ( err: any, usuariosDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Usuarios listados con exito', respuesta: usuariosDB, codigo: 200 });
        })
    }

    async actualizarUsuario( usuario: IUsuarioUpdate, callback: Function ) {
        Usuario.updateOne( { id: usuario.id }, { $set: { usuario } }, {}, ( err: any, usuarioAct: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: null, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Usuario actualizado', respuesta: null, codigo: 200 });
        })
    }

    async verificarAdmin( role: string ): Promise<boolean> {
        return new Promise( ( respuesta, error ) => {
            switch( role ) {
                case 'SUDO_ROLE':
                    respuesta( false );
                    break;
                case 'ADMIN_ROLE':
                    respuesta( false );
                    break;

                default:
                    respuesta( true );
                    break;
            }
        })
    }
}