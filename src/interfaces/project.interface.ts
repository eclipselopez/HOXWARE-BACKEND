export default interface IProject {
    owner?: string,
    name: string,
    provider: string,
    logo?: string,
    type: string,
    initDate?: Date,
    finishDate?: Date,
    license?: Array<string>
}