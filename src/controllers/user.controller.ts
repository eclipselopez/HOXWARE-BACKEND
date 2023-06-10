import IResponse from "../interfaces/response.interface";
import { IUser, IUserUpdate } from "../interfaces/user.interface";
import User from "../models/user.model";

export default class UserService {
    constructor() {}

    listUser( user: IUser ): Promise<IResponse> {
        const role = user.role;
        const company = user.company;

        return new Promise( async (resolve, reject) => {
            if ( await this.verificarAdmin( role ) ) {
                return reject ({ ok: false, message: 'You are not admin', response: null, code: 401 });
            }
    
            User.find({ company: company }, ( err: any, usersDB: any ) => {
                if ( err ) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
                
                if ( usersDB.length < 1 ) {
                    return reject({ ok: false, message: 'No users to list', response: null, code: 400 });
                }
    
                return resolve({ ok: true, message: 'Users listed correctly', response: usersDB , code: 200 });
            })
        })
    }

    listSudoUser(): Promise<IResponse> {
        return new Promise((resolve, reject) => {
            User.find({}, ( err: any, usersDB: any ) => {
                if ( err ) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
    
                return resolve({ ok: true, message: 'Users listed correctly', response: usersDB, code: 200 });
            })
        })
    }

    updateUser( user: IUserUpdate ): Promise<IResponse> {
        return new Promise ((resolve, reject) => {
            User.updateOne( { id: user.id }, { $set: { user } }, {}, ( err: any, userAct: any ) => {
                if ( err ) {
                    return reject({ ok: false, message: 'Database error', response: null, code: 500 });
                }
    
                return resolve({ ok: true, message: 'User updated successfully ', response: null, code: 200 });
            })
        })
    }

    verificarAdmin( role: string ): Promise<boolean> {
        return new Promise( ( resolve, reject ) => {
            switch( role ) {
                case 'SUDO_ROLE':
                    reject( false );
                    break;
                case 'ADMIN_ROLE':
                    reject( false );
                    break;
                default:
                    resolve( true );
                    break;
            }
        })
    }
}