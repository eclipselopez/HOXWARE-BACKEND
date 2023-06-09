export interface IUsuario {
    id?: string,
    nombre: string,
    apellidoP: string,
    apellidoM: string,
    email: string,
    password: string,
    salt?: string,
    role: string,
    status: string,
    empresa: string,
    licencia: string,
    twoAuth?: boolean,
    codigo?: string,
    saltTA?: string
}

export interface IUsuarioUpdate {
    id: string,
    nombre: string,
    apellidoP: string,
    apellidoM: string
}