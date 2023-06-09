import { IUsuario } from '../interfaces/usuario.interface';
import Usuario from '../models/usuario.model';
import * as encriptar from '../class/encrypt.class';
import * as email from '../function/email.function';
import IRespuesta from '../interfaces/respuesta.interface';
import { verify } from 'jsonwebtoken';
import ProyectoService from './proyecto.controller';

const proyectoService = new ProyectoService;

export default class AuthUsuarioService {

    async verificarSudo() {
        let respuesta = true;

        await Usuario.findOne({ role: 'SUDO' }, (err: any, sudoDB: any) => {
            if (err) {
                throw err;
            }

            if (sudoDB) {
                return respuesta = true;
            }

            return respuesta = false;
        })

        return respuesta;
    }

    async crearSudo(): Promise<string> {
        let respuesta = 'Aun no hago nada';
        if (await this.verificarSudo()) {
            return respuesta = 'Usuario sudo existente en la base de datos';
        } else {
            const { salt, passwordHash } = await encriptar.generarPassword('Lobo48tft803@');
            let licencia = await this.generarLicencia();

            await encriptar.tokenLicencia(licencia, '999999d', async (token: any) => {
                let sudo: IUsuario = {
                    nombre: 'Hoxware',
                    apellidoP: 'Security',
                    apellidoM: 'Server',
                    email: 'soporte@hoxware.tech',
                    password: passwordHash,
                    salt: salt,
                    licencia: token,
                    role: 'SUDO',
                    status: 'ACTIVO',
                    empresa: 'Hoxware'
                }

                await Usuario.create(sudo, (err: any, sudoCreado: any) => {
                    if (err) {
                        console.log(err);
                        return respuesta = JSON.stringify(err);
                    }

                    return respuesta = 'Super usuario creado con exito';
                });
            });
        }

        return respuesta;
    }

    async crearAdmin(usuario: IUsuario, duracion?: string): Promise<IRespuesta> {
        let callback: IRespuesta = {
            ok: true,
            mensaje: 'Usuario creado con exito',
            respuesta: null,
            codigo: 200,
        }

        if (await this.verificaEmpresa(usuario.empresa)) {
            return callback = await { ok: false, mensaje: 'Esta empresa ya existe', respuesta: null, codigo: 400 };
        }

        let licencia = await this.generarLicencia();
        let exp = duracion ? duracion : '30d';

        await encriptar.tokenLicencia(licencia, exp, async (token: any) => {
            usuario.licencia = await token;
            const { salt, passwordHash } = await encriptar.generarPassword(usuario.password);
            usuario.password = await passwordHash;
            usuario.salt = await salt;
            await Usuario.create(usuario, async (err: any, usuarioCreado: any) => {
                if (err) {
                    return callback = await { ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 };
                }
                
                await setTimeout(() => {}, 1000);

                callback = await { ok: true, mensaje: 'Usuario creado con exito', respuesta: null, codigo: 200 };
                
                const cuerpo = await `<p> Gracias por contratar HOXWARE, su licencia por tiempo limitado es : ${licencia} y tiene una duración de ${exp} <p>`;
                return await email.enviarEmail(usuarioCreado.email, 'Licencia Hoxware', cuerpo);

            })
        })

        return await callback;
    }

    async crearUsuario(usuario: any, admin: IUsuario, callback: Function ) {
        if ( !admin.id ) {
            return callback({ ok: false, mensaje: 'No hay datos de admin', respuesta: null, codigo: 400 });
        }

        let licencia = await this.obtenerLicencia( admin.id );
        console.log(licencia);
        let password = await encriptar.passwordSeguro();

        const { salt, passwordHash } = await encriptar.generarPassword(password);

        usuario.password = await passwordHash;
        usuario.salt = await salt;
        usuario.empresa = await admin.empresa;
        usuario.licencia = await licencia;

        Usuario.create( usuario, async( err: any, usuarioCreado: any ) => {
            if  ( err ) {
                return callback({ ok: false, mensaje: 'Error error en base de datos', respuesta: err, codigo: 500 });
            }

            encriptar.tokenEmail(usuarioCreado, async ( tokenGenerado: any ) => {
                const cuerpo = await `<p> Esta es tu contraseña para ingresar a la plataforma Hoxware : ${password} antes de ingresar, activa tu usuario confirmando tu correo con el siguiente link ${serverName}auth/${tokenGenerado} <p>`;

                await email.enviarEmail(usuarioCreado.email, 'Alta de usuario nuevo', cuerpo);
                return callback({ ok: true, mensaje: 'Usuario creado con exito', respuesta: usuarioCreado, codigo: 200 });
            })
        })
    }

    async login( email: string, password: string, callback: Function ): Promise<any> {

        await Usuario.findOne( { email: email }, async(err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 400 });
            }

            /* if ( await this.verificarLicencia( usuarioDB.licencia ) ) {
                return callback({ ok: false, mensaje: 'Licencia expirada o incorrecta', respuesta: null, codigo: 400 });
            } */

            const passwordHash = await encriptar.sha512(password, usuarioDB.salt);

            if ( usuarioDB.password !== passwordHash.passwordHash ) {
                return callback({ ok: false, mensaje: 'Datos incorrectos', respuesta: err, codigo: 400 });
            }
            
            if ( usuarioDB.status == 'INACTIVO' ) {
                if ( usuarioDB.role !== 'ADMIN_ROLE' ) {
                    return callback({ ok: false, mensaje: 'Usuario inactivo, por favor verifica tu email', respuesta: null, codigo: 403 });
                } else {
                    return callback({ ok: false, mensaje: 'Usuario inactivo', respuesta: err, codigo: 401 });
                }
            }

            const usuarioFront = {
                id: usuarioDB._id,
                nombre: usuarioDB.nombre,
                apellidoP: usuarioDB.apellidoP,
                apellidoM: usuarioDB.apellidoM,
                email: usuarioDB.email,
                empresa: usuarioDB.empresa,
                role: usuarioDB.role
            }

            await proyectoService.obtenerProyectosId( usuarioDB.empresa, usuarioDB._id, async ( respuestaP: IRespuesta ) => {
                if ( respuestaP.codigo === 200 ) {
                    await encriptar.generarToken( usuarioFront, async( respuestaT: any ) => {
                        return callback({ ok: true, mensaje: 'Usuario logueado con exito', respuesta: null, codigo: 200, token: respuestaT, twoAuth: usuarioDB.twoAuth, proyectos: respuestaP.respuesta });
                    });
                } else {
                    return callback(respuestaP);
                }
            })

        })
    }

    async loginMovil( email: string, password: string, callback: Function ) {
        await Usuario.findOne({ email: email }, async ( err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( usuarioDB.status == 'INACTIVO' ) {
                return callback({ ok: false, mensaje: 'Usuario inactivo', respuesta: null, codigo: 400 });
            }

            const usuarioFront = {
                id: usuarioDB._id,
                nombre: usuarioDB.nombre,
                apellidoP: usuarioDB.apellidoP,
                apellidoM: usuarioDB.apellidoM,
                email: usuarioDB.email,
                empresa: usuarioDB.empresa,
                role: usuarioDB.role
            }

            encriptar.generarToken( usuarioFront, async( respuesta: any ) => {
                return callback({ ok: true, mensaje: 'Usuario logueado con exito', respuesta: null, codigo: 200, token: respuesta, twoAuth: usuarioDB.twoAuth });
            });
        });
    }

    async activarLicencia(email: string, licencia: string, callback: Function) {
        await Usuario.findOne({ email: email }, async (err: any, usuarioDB: any) => {
            if (err) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 404 });
            }

            if ( usuarioDB.role != 'ADMIN_ROLE' ) {
                return callback({ ok: false, mensaje: 'Usuario inactivo, por favor verifica tu correo!', respuesta: null, codigo: 403 });
            }

            await verify( usuarioDB.licencia, jwt_accessTokenSecret, async ( err: any, decodificado: any ) => {
                if ( err ) {
                    return callback({ ok: false, mensaje: 'Error en licencia', respuesta: err, codigo: 400 });
                }

                if ( decodificado.licencia !== licencia ) {
                    return callback({ ok: false, mensaje: 'Licencia incorrecta', respuesta: null, codigo: 401 });
                }

                usuarioDB.status = 'ACTIVO';
                usuarioDB.save((err: any, usuarioAct: any ) => {
                    if ( err ) {
                        return callback({ ok: false, mensaje: 'Error al actualizar usuario', respuesta: err, codigo: 500 });
                    }

                    return callback({ ok: true, mensaje: 'Licencia activada', respuesta: null, codigo: 200 });
                })
            });
        });
    }

    async verificaEmpresa(empresa: String): Promise<boolean> {
        let existe: boolean = false;

        await Usuario.findOne({ empresa: empresa }, (err: any, empresaDB: any) => {
            if (err) {
                existe = true;
                throw err;
            }

            if (empresaDB) {
                return existe = true;
            }

            return existe = false;
        });

        return existe;
    }

    async generarLicencia(): Promise<string> {
        let licencia = '';

        let seg1 = 'GMNYD';
        let seg2 = await (0 | Math.random() * 9e6).toString(36).toUpperCase();
        let seg3 = await (0 | Math.random() * 9e6).toString(36).toUpperCase();
        let seg4 = await (0 | Math.random() * 9e6).toString(36).toUpperCase();
        let seg5 = await (0 | Math.random() * 9e6).toString(36).toUpperCase();

        licencia = await `${seg1}-${seg2}-${seg3}-${seg4}-${seg5}`;

        return licencia;
    }

    async generarCodigo(): Promise<number> {
        let codigo = 111111;

        let min: number = 111111;
        let max: number = 999999;

        return codigo = await Math.random() * (max - min) + min;
    }

    async verificarLicencia( licencia: string ): Promise<boolean> {
        let respuesta = true;

        await verify(licencia, jwt_accessTokenSecret, async(err: any, decodificado: any) => {
            if ( err ) {
                return respuesta = await true;
            }

            if ( decodificado ) {
                return respuesta = await false;
            }
        });

        return await respuesta;
    }

    async obtenerLicencia( id: string ): Promise<string> {
        return new Promise(async(resolve, reject) => {
            await Usuario.findOne({ _id: id }, async( err: any, usuarioDB: any ) => {
                if ( err ) {
                    console.log(err);
                    return reject(err);
                }

                if ( !usuarioDB ) {
                    return reject(err);
                }

                return resolve(usuarioDB.licencia);
            });
        })
    }

    async verificaTokenUsuario( token: string ): Promise<any> {
        return new Promise(async(resuelto, error ) => {
            await verify(token, jwt_accessTokenSecret, async( err: any, decodificado: any ) => {
                if ( err ) {
                    return error('Token expirado');
                }

                console.log('decodificado',decodificado);
                await Usuario.updateOne({ _id: decodificado.usuario._id }, { $set: { status: 'ACTIVO'}}, {}, ( err: any, usuarioAct: any ) => {
                    if ( err ) {
                        return error( err );
                    }

                    resuelto( usuarioAct);
                })
            })
        })
    }

    async reenviarCorreoAct( idUsuario: string, callback: Function ) {
        Usuario.findOne({ _id: idUsuario }, async ( err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, mensaje: 'Ocurrio un error', respuesta: null, codigo: 404 });
            }

            let password = await encriptar.passwordSeguro();

            const { salt, passwordHash } = await encriptar.generarPassword(password);

            usuarioDB.salt = salt;
            usuarioDB.password = passwordHash;

            usuarioDB.save( async ( err: any, usuarioACT: any ) => {
                if ( err ) {
                    return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
                }
                usuarioDB.password.remove;
                usuarioDB.salt.remove;

                await encriptar.tokenEmail(usuarioDB, async ( tokenGenerado: any ) => {
                    const cuerpo = await `<p> Esta es tu contraseña para ingresar a la plataforma Hoxware : ${password} antes de ingresar, activa tu usuario confirmando tu correo con el siguiente link ${serverName}auth/${tokenGenerado} <p>`;
    
                    await email.enviarEmail(usuarioDB.email, 'Alta de usuario nuevo', cuerpo);
                    return callback({ ok: true, mensaje: 'Usuario actualizado con exito', respuesta: usuarioDB, codigo: 200 });
                })

            })

        })
    }

    async resetPassword( emailUsuario: string, callback: Function ) {
        Usuario.findOne( { email: emailUsuario }, async ( err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, mensaje: 'Datos incorrectos', respuesta: null, codigo: 404 });
            }

            let id = usuarioDB._id;

            let payload = {
                id,
                jwt_refreshTokenSecret
            }

            await encriptar.tokenEmail(payload, async ( tokenGenerado: any ) => {
                const cuerpo = await `<p>Haz solicitado reestablecer tu contraseña, si no fuiste tu haz caso omiso, de lo contrario da click en el siguiente link: ${serverName}auth/resetPwd/${ tokenGenerado } <p>`;
                
                await email.enviarEmail(usuarioDB.email, 'Solicitud de reestablecimiento de contraseña', cuerpo);
                return callback({ ok: true, mensaje: 'Solicitud de reestablecimiento de password enviada', respuesta: null, codigo: 200 });
            });

        });
    }

    async verficarResetPassword( token: string ): Promise<any> {
        return new Promise( async( respuesta, error ) => {
            await verify( token, jwt_accessTokenSecret, async( err: any, decodificado: any ) => {
                if ( err ) {
                    return error('No se pudo decodificar el token');
                }

                console.log(decodificado);

                if ( decodificado.usuario.jwt_refreshTokenSecret !== jwt_refreshTokenSecret ) {
                    return error('Algo salio muy mal');
                }

                await Usuario.findOne({ _id: decodificado.usuario.id }, async ( err: any, usuarioDB: any ) => {
                    if ( err ) {
                        return error('Error en base de datos');
                    }
    
                    if ( !usuarioDB ) {
                        return error('No existe un usuario con estos datos');
                    }
    
                    let password = await encriptar.passwordSeguro();
                    const { salt, passwordHash } = await encriptar.generarPassword(password);
    
                    usuarioDB.salt = salt;
                    usuarioDB.password = passwordHash;
    
                    usuarioDB.save( async ( err: any, usuarioAct: any ) => {
                        if ( err ) {
                            return error('Error en base de datos');
                        }
    
                        const cuerpo = await `<p>Contraseña actualizada correctamente: ${ password }<p>`;
                        email.enviarEmail( usuarioAct.email, 'Contraseña actualizada', cuerpo);
                        return respuesta('Contraseña reestablecida con exito');
                    });
                });
            })
        });
    }
}