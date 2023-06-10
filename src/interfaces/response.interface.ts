import IProyecto from "./project.interface";

export default interface IResponse {
    ok: boolean,
    message: string,
    response: any,
    code: number,
    id?: string,
    token?: string,
    twoAuth?: boolean;
    proyectos?: Array<IProyecto>
}

export interface IResponseOP {
    ok: boolean,
    message: string,
    response: any,
    code: number,
    error_code: number
}