import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from 'config'

export async function checkToken( req: Request, res: Response, next: NextFunction ) {
    const token: any = req.headers.authorization;

    await verify( token, config.get('jwt.accessTokenSecret'), async ( err: any, decoded: any ) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Existe un problema con el token',
                err
            });
        }

        req.body.user = decoded.user;

        next();
    });
}