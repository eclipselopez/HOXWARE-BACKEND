import { IArchivo } from "../interfaces/archivo.interface";
import { IUrl } from "../interfaces/url.interface";
import Url from '../models/url.model';
import path from 'path';
import fs from 'fs';

export default class UrlService {
    constructor() {}

    async crearUrls( urls: Array<IUrl>, empresa: string, proyecto: string, callback: Function ) {
        let urlsFormateada: IUrl[] = [];

        for( let url of urls ) {
            url.proyecto = proyecto;
            url.empresa = empresa;
            let fecha = url.fechaUltimaRevision.split('/');

            let fechaFormateada = new Date(fecha[0]);

            url.fechaUltimaRevision = fechaFormateada.toString();

            await urlsFormateada.push(url);
        }

        Url.insertMany(urlsFormateada,{}, ( err: any, urlsDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error al insertar registros', respuesta: err, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Urls creadas con exito', respuesta: urlsDB, codigo: 200 });
        });
    }

    async crearUrl( url: IUrl, empresa: string, proyecto: string, callback: Function ) {
        url.proyecto = proyecto;
        url.empresa = empresa;

        Url.create( url, ( err: any, urlDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Url creada con exito', respuesta: urlDB, codigo: 200 });
        });
    }

    async listar( empresa: string, proyecto: string, callback: Function ) {
        Url.find({ $and: [ { empresa: empresa }, { proyecto: proyecto } ] }, ( err: any, urlsDB: any ) => {
            if ( err ) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            /* for( let i = 0; urlsDB.length > i; i++ ) {
                urlsDB[i].historial = null;
            } */

            return callback({ ok: true, mensaje: 'Urls listadas correctamente', respuesta: urlsDB, codigo: 200 });
        });
    }

    async actualizar( url: IUrl, id: string, empresa: string, proyecto: string, callback: Function ) {
        Url.findById(id, (err: Error, urlId: any) => {
            
            if(err){
                return callback({ok:false, codigo:500, mensaje: 'Error en base de datos', error:err});
            }
            if (!urlId){
                return callback({ok:false,codigo:214, mensaje: 'No se encontró url con ese ID'});
            }
            if (!id){
                return callback({ok:false,codigo:400, mensaje: 'Debes insertar ID'});
            }
            
            url.empresa = empresa;
            url.proyecto = proyecto;
            
            if( url.rondaValidacion ) {
                if( url.rondaValidacion < urlId.rondaValidacion ) {
                    return callback({ ok: false, mensaje: 'No estan permitidos los downgrade', respuesta: null, codigo: 400 });
                }
                
                if ( url.rondaValidacion !== urlId.rondaValidacion ) {
                    url.historial = [];
                    for(let i = 0; i<urlId.historial.length; i++) {
                        url.historial.push(urlId.historial[i]);
                    }
                    urlId.historial = null;
                    url.historial.push( urlId );
                }
                
                Url.updateOne({ _id: urlId._id }, { $set: url }, {}, ( err: any, urlAct: any ) => {
                    console.log(url);
                    if ( err ) {
                        return callback({ ok: false, mensaje: 'Error al actualizar URL', respuesta: err, codigo: 500 });
                    }

                    return callback({ ok: true, mensaje: 'Url actualizada con exito', respuesta: null, codigo: 200 });
                });
            }

            //return callback({ ok: true, mensaje: 'Url encontrada', respuesta: urlId, codigo: 200});
        })
    }

    async guardarCsvTemporal( archivo: IArchivo ) {
        return new Promise(async ( respuesta, error ) => {
            const temp = await path.resolve( __dirname, '../temp');

            const existe = await fs.existsSync( temp );
        
            if ( !existe ) {
                fs.mkdirSync( temp );
            }

            archivo.mv(`${temp}/archivo.csv`, ( err: any ) => {
                if ( err ) {
                    return error( err );
                } else {
                    return respuesta('ok');
                }
            })
        })
    }
}