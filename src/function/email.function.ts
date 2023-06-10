import nodemailer from 'nodemailer';
import config from 'config'

//------------------------------------------------------------------------------------//
//                                  Enviar Email                                      //
//------------------------------------------------------------------------------------//

export async function sendEmail( email: string, issue: string, body: string ) {
    let transport = nodemailer.createTransport({
        host: config.get('email.smtpHost'),
        port: config.get('email.smtpPort'),
        secure: true,
        auth: {
            user: config.get('email.email_usuario'),
            pass: config.get('email.passEmail'),
        }
    });

    transport.verify( ( err, resolve ) => {
        if ( err ) {
            console.log( err );
        } else {
            console.log('Servidor de correo listo para enviar');
        }
    });

    let message: any = {
        from: config.get('email.email_usuario'),
        to: `${ email }`,
        subject: `${ issue }`,
        html: `${ body }`
    };

    transport.sendMail( message, ( err, info ) => {
        if ( err ) {
            return console.log( err );
        }

        return console.log( info );
    });
}