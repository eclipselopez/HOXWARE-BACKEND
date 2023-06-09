export default interface IProyecto {
    propietario?: string,
    nombre: string,
    proveedor: string,
    logo?: string,
    tipo: string,
    fechaInicio?: Date,
    fechaTermino?: Date,
    permisos?: Array<string>
}