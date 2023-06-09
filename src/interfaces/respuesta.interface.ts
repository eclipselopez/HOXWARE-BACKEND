import IProyecto from "./proyecto.interface";

export default interface IRespuesta {
    ok: boolean,
    mensaje: string,
    respuesta: any,
    codigo: number,
    id?: string,
    token?: string,
    twoAuth?: boolean;
    proyectos?: Array<IProyecto>
}

export interface IRespuestaOP {
    ok: boolean,
    mensaje: string,
    respuesta: any,
    codigo: number,
    error_code: number
}