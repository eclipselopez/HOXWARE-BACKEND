import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from 'config'

export async function verificaToken( req: Request, res: Response, next: NextFunction ) {
    const token: any = req.headers.authorization;
    const jwt: any = config.get('jwt.accessTokenSecret')
    
    await verify( token, jwt, async ( err: any, decodificado: any ) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Existe un problema con el token',
                err
            });
        }

        req.body.usuario = decodificado.usuario;

        next();

    });
}