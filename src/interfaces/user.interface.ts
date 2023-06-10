export interface IUser {
    id?: string,
    name: string,
    lastName: string,
    secondLastName: string,
    email: string,
    password: string,
    salt?: string,
    role: string,
    status: string,
    company: string,
    license: string,
    twoAuth?: boolean,
    code?: string,
    saltTA?: string
}

export interface IUserUpdate {
    id: string,
    name: string,
    lastName: string,
    secondLastName: string
}