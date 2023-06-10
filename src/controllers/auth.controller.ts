import {IUser} from '../interfaces/user.interface';
import User from '../models/user.model';
import encryptClass, * as encriptar from '../class/encrypt.class';
import * as email from '../function/email.function';
import IResponse from '../interfaces/response.interface';
import { verify } from 'jsonwebtoken';
import ProjectService from './project.controller';
import logger from '../../lib/logger';

const projectService = new ProjectService;

export default class AuthUserService {
    encrypt= new encryptClass

    createAdministrator(admin: IUser): Promise<IResponse> {
        logger.info(`creating ${admin.role}`)
        return new Promise((resolve, reject) => {
            if ( admin.password ) {
                const { salt, passwordHash } = this.encrypt.generarPassword(admin.password)
                admin.password = passwordHash
                admin.salt = salt
            }

            User.create(admin, (err: any, adminCreated: any) => {
                if ( err ) {
                    logger.error(err)
                    return reject({ ok: false, message: 'Error creating admin', response: err, code: 500 })
                }

                logger.info(`${admin.role} succefully created`)
                return resolve({ ok: true, message: 'User created successfully', response: adminCreated, code: 201 })
            })
        })
    }

    sudoVerify(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            User.findOne({ role: 'sudo'}, ( err: any, sudoDB: any ) => {
                if ( err ) {
                    logger.error(err)
                    return reject(false)
                }

                if(!sudoDB) {
                    const { salt, passwordHash } = this.encrypt.generarPassword('Lobo48tft803@');
                    const { token } = this.encrypt.generarToken

                    let admin: IUser = {
                        name: 'Hoxware',
                        lastName: 'Security',
                        secondLastName: 'Server',
                        email: 'soporte@hoxware.tech',
                        password: passwordHash,
                        salt: salt,
                        license: token,
                        role: 'SUDO',
                        status: 'ACTIVO',
                        company: 'Hoxware'
                    }

                    this.createAdministrator(admin)
                    return resolve(true)
                } else {
                    return resolve(true)
                }
            })
        })
    }

    async crearUsuario(usuario: any, admin: IUser, callback: Function ) {
        if ( !admin.id ) {
            return callback({ ok: false, message: 'No hay datos de admin', response: null, code: 400 });
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
                return callback({ ok: false, message: 'Error error en base de datos', response: err, code: 500 });
            }

            encriptar.tokenEmail(usuarioCreado, async ( tokenGenerado: any ) => {
                const cuerpo = await `<p> Esta es tu contraseña para ingresar a la plataforma Hoxware : ${password} antes de ingresar, activa tu usuario confirmando tu correo con el siguiente link ${serverName}auth/${tokenGenerado} <p>`;

                await email.enviarEmail(usuarioCreado.email, 'Alta de usuario nuevo', cuerpo);
                return callback({ ok: true, message: 'Usuario creado con exito', response: usuarioCreado, code: 200 });
            })
        })
    }

    async login( email: string, password: string, callback: Function ): Promise<any> {

        await Usuario.findOne( { email: email }, async(err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, message: 'Datos incorrectos', response: null, code: 400 });
            }

            /* if ( await this.verificarLicencia( usuarioDB.licencia ) ) {
                return callback({ ok: false, message: 'Licencia expirada o incorrecta', response: null, code: 400 });
            } */

            const passwordHash = await encriptar.sha512(password, usuarioDB.salt);

            if ( usuarioDB.password !== passwordHash.passwordHash ) {
                return callback({ ok: false, message: 'Datos incorrectos', response: err, code: 400 });
            }
            
            if ( usuarioDB.status == 'INACTIVO' ) {
                if ( usuarioDB.role !== 'ADMIN_ROLE' ) {
                    return callback({ ok: false, message: 'Usuario inactivo, por favor verifica tu email', response: null, code: 403 });
                } else {
                    return callback({ ok: false, message: 'Usuario inactivo', response: err, code: 401 });
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

            await proyectoService.obtenerProyectosId( usuarioDB.empresa, usuarioDB._id, async ( responseP: IResponse ) => {
                if ( responseP.code === 200 ) {
                    await encriptar.generarToken( usuarioFront, async( responseT: any ) => {
                        return callback({ ok: true, message: 'Usuario logueado con exito', response: null, code: 200, token: responseT, twoAuth: usuarioDB.twoAuth, proyectos: responseP.response });
                    });
                } else {
                    return callback(responseP);
                }
            })

        })
    }

    async loginMovil( email: string, password: string, callback: Function ) {
        await Usuario.findOne({ email: email }, async ( err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
            }

            if ( usuarioDB.status == 'INACTIVO' ) {
                return callback({ ok: false, message: 'Usuario inactivo', response: null, code: 400 });
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

            encriptar.generarToken( usuarioFront, async( response: any ) => {
                return callback({ ok: true, message: 'Usuario logueado con exito', response: null, code: 200, token: response, twoAuth: usuarioDB.twoAuth });
            });
        });
    }

    async activarLicencia(email: string, licencia: string, callback: Function) {
        await Usuario.findOne({ email: email }, async (err: any, usuarioDB: any) => {
            if (err) {
                return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, message: 'Datos incorrectos', response: null, code: 404 });
            }

            if ( usuarioDB.role != 'ADMIN_ROLE' ) {
                return callback({ ok: false, message: 'Usuario inactivo, por favor verifica tu correo!', response: null, code: 403 });
            }

            await verify( usuarioDB.licencia, jwt_accessTokenSecret, async ( err: any, decodificado: any ) => {
                if ( err ) {
                    return callback({ ok: false, message: 'Error en licencia', response: err, code: 400 });
                }

                if ( decodificado.licencia !== licencia ) {
                    return callback({ ok: false, message: 'Licencia incorrecta', response: null, code: 401 });
                }

                usuarioDB.status = 'ACTIVO';
                usuarioDB.save((err: any, usuarioAct: any ) => {
                    if ( err ) {
                        return callback({ ok: false, message: 'Error al actualizar usuario', response: err, code: 500 });
                    }

                    return callback({ ok: true, message: 'Licencia activada', response: null, code: 200 });
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

    async generarcode(): Promise<number> {
        let code = 111111;

        let min: number = 111111;
        let max: number = 999999;

        return code = await Math.random() * (max - min) + min;
    }

    async verificarLicencia( licencia: string ): Promise<boolean> {
        let response = true;

        await verify(licencia, jwt_accessTokenSecret, async(err: any, decodificado: any) => {
            if ( err ) {
                return response = await true;
            }

            if ( decodificado ) {
                return response = await false;
            }
        });

        return await response;
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
                return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, message: 'Ocurrio un error', response: null, code: 404 });
            }

            let password = await encriptar.passwordSeguro();

            const { salt, passwordHash } = await encriptar.generarPassword(password);

            usuarioDB.salt = salt;
            usuarioDB.password = passwordHash;

            usuarioDB.save( async ( err: any, usuarioACT: any ) => {
                if ( err ) {
                    return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
                }
                usuarioDB.password.remove;
                usuarioDB.salt.remove;

                await encriptar.tokenEmail(usuarioDB, async ( tokenGenerado: any ) => {
                    const cuerpo = await `<p> Esta es tu contraseña para ingresar a la plataforma Hoxware : ${password} antes de ingresar, activa tu usuario confirmando tu correo con el siguiente link ${serverName}auth/${tokenGenerado} <p>`;
    
                    await email.enviarEmail(usuarioDB.email, 'Alta de usuario nuevo', cuerpo);
                    return callback({ ok: true, message: 'Usuario actualizado con exito', response: usuarioDB, code: 200 });
                })

            })

        })
    }

    async resetPassword( emailUsuario: string, callback: Function ) {
        Usuario.findOne( { email: emailUsuario }, async ( err: any, usuarioDB: any ) => {
            if ( err ) {
                return callback({ ok: false, message: 'Error en base de datos', response: err, code: 500 });
            }

            if ( !usuarioDB ) {
                return callback({ ok: false, message: 'Datos incorrectos', response: null, code: 404 });
            }

            let id = usuarioDB._id;

            let payload = {
                id,
                jwt_refreshTokenSecret
            }

            await encriptar.tokenEmail(payload, async ( tokenGenerado: any ) => {
                const cuerpo = await `<p>Haz solicitado reestablecer tu contraseña, si no fuiste tu haz caso omiso, de lo contrario da click en el siguiente link: ${serverName}auth/resetPwd/${ tokenGenerado } <p>`;
                
                await email.enviarEmail(usuarioDB.email, 'Solicitud de reestablecimiento de contraseña', cuerpo);
                return callback({ ok: true, message: 'Solicitud de reestablecimiento de password enviada', response: null, code: 200 });
            });

        });
    }

    async verficarResetPassword( token: string ): Promise<any> {
        return new Promise( async( response, error ) => {
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
                        return response('Contraseña reestablecida con exito');
                    });
                });
            })
        });
    }
}