import IProyecto from '../interfaces/proyecto.interface';
import Proyecto from '../models/proyecto.model';

export default class ProyectoService {
    constructor() { }

    async crearProyecto(proyecto: IProyecto, callback: Function) {
        Proyecto.create(proyecto, (err: any, proyectoDB: any) => {
            if (err) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Proyecto creado', respuesta: proyectoDB, codigo: 200 });
        });
    }

    async obtenerProyectos(empresa: string, callback: Function) {
        Proyecto.find({ propietario: empresa }, (err: any, proyectosDB: any) => {
            if (err) {
                return callback({ ok: false, mensaje: 'Error en base datos', respuesta: err, codigo: 500 });
            }

            console.log(proyectosDB);

            return callback({ ok: true, mensaje: 'Proyectos', respuesta: proyectosDB, codigo: 200 });
        })
    }

    async obtenerProyectosSudo(callback: Function) {
        Proyecto.find({}, (err: any, proyectosDB: any) => {
            if (err) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            return callback({ ok: true, mensaje: 'Proyectos listados correctamente', respuesta: proyectosDB, codigo: 200 });
        })
    }

    async obtenerProyectosId(empresa: string, id: string, callback: Function) {
        await Proyecto.find({ $and: [ { propietario: empresa }, { permisos: `${id}` } ]}, (err: any, proyectosDB: any) => {
            if (err) {
                return callback({ ok: false, mensaje: 'Error en base de datos', respuesta: err, codigo: 500 });
            }

            for ( let i = 0; proyectosDB.length > i; i++ ) {
                
                proyectosDB[i].permisos = null;
            }

            return callback({ ok: true, mensaje: 'Proyectos listados', respuesta: proyectosDB, codigo: 200 });
        })
    }

    finalizarProyecto() { }
}