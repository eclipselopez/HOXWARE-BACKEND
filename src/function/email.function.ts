import nodemailer from 'nodemailer';
import config from 'config'

//------------------------------------------------------------------------------------//
//                                  Enviar Email                                      //
//------------------------------------------------------------------------------------//

export async function enviarEmail( email: string, asunto: string, cuerpo: string ) {
    let transporte = nodemailer.createTransport({
        host: config.get('email.smtpHost'),
        port: config.get('email.smtpPort'),
        secure: true,
        auth: {
            user: config.get('email.email_usuario'),
            pass: config.get('email.passEmail'),
        }
    });

    transporte.verify( ( err, listo ) => {
        if ( err ) {
            console.log( err );
        } else {
            console.log('Servidor de correo listo para enviar');
        }
    });

    let mensaje: any = {
        from: config.get('email.email_usuario'),
        to: `${ email }`,
        subject: `${ asunto }`,
        html: `${ cuerpo }`
    };

    transporte.sendMail( mensaje, ( err, info ) => {
        if ( err ) {
            return console.log( err );
        }

        return console.log( info );
    });
}