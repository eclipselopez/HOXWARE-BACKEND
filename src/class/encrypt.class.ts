import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config';

export default class encryptClass {
    private genRandomString(length: number) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
    }

    private getStringValue(data: { toString: () => any; }) {
        if (typeof data === 'number' || data instanceof Number) {
            return data.toString();
        }

        if (!Buffer.isBuffer(data) && typeof data !== 'string') {
            throw new TypeError('Los datos para generar contraseñas deber ser de tipo String o Buffer');
        }

        return data;
    }

    private sha512(password: string, salt: string) {
        const hash = crypto.createHmac('sha512', this.getStringValue(salt));
        hash.update(this.getStringValue(password));
        const passwordHash = hash.digest('hex');

        return {
            salt,
            passwordHash
        }
    }

    public generarPassword(password: String) {
        const salt = this.genRandomString(16);
        return this.sha512(String(password), salt);
    }

    public generateResetPasswordToken(userId: any) {
        const text = JSON.stringify({ userId, valid: new Date().getTime() + config.get('auth_ttl') });
        const cipher = crypto.createCipher(config.get('auth_algorithm'), config.get('auth_secret'));
        let ciphered = cipher.update(text, config.get('auth_inputEncoding'), config.get('auth_outputEncoding'));
        ciphered += cipher.final(config.get('auth_outputEncoding'));

        return ciphered;
    }

    public generarToken(usuario: any, callback: Function) {

        const payload = {
            usuario
        }

        jwt.sign(payload, config.get('jwt_accessTokenSecret'), {
            expiresIn: config.get('jwt_accessTokenLife')
        }, (err, token) => {
            if (err) {
                return callback(err);
            } else {
                return callback(token);
            }
        });
    }

    public tokenEmail(usuario: any, callback: Function) {
        const payload = {
            usuario
        }

        jwt.sign(payload, config.get('jwt_accessTokenSecret'), {
            expiresIn: '30m'
        }, (err, token) => {
            if (err) {
                return callback(err);
            } else {
                return callback(token);
            }
        });
    }

    public tokenLicencia( licencia: String, duracion: string, callback: Function ) {
        const payload = {
            licencia
        }

        jwt.sign( payload, config.get('jwt_accessTokenSecret'), {
            expiresIn: duracion
        }, async (err, token) => {
            if (err) {
                return callback(err);
            } else {
                return callback(token);
            }
        });
    }


    public saltHashPassword(password: String) {
        const salt = this.genRandomString(16);
        return this.sha512(String(password), salt);
    }

    public passwordSeguro(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const longitudPassword = 8;
            let caracteresConseguidos = 0;
            let caracterTemporal = '';

            let arrayCaracteres: string[] = new Array();

            let passwordDefinitivo = '';

            let numeroMinimoMinusculas = 1;
            let numeroMinimoMayusculas = 1;
            let numeroMinimoNumeros = 1;
            let numeroMinimoSimbolos = 1;

            let letrasMinusculasConseguidas = 0;
            let letrasMayusculasConseguidas = 0;
            let numerosConseguidos = 0;
            let simbolosConseguidos = 0;

            function guardarCaracterPosicionAleatoria(caracterPasadoParametro: any) {
                let guardadoPosicionVacia = false;
                let posicionArray = 0;

                while (guardadoPosicionVacia != true) {
                    posicionArray = generaAleatorio(0, longitudPassword);

                    if (arrayCaracteres[posicionArray] == 'null') {
                        arrayCaracteres[posicionArray] = caracterPasadoParametro;
                        guardadoPosicionVacia = true;
                    }
                }
            }

            await this.inicializarArray(longitudPassword).then((respuesta: any) => {
                arrayCaracteres = respuesta;
            });

            while (letrasMinusculasConseguidas < numeroMinimoMinusculas) {
                caracterTemporal = this.generaCaracter('minuscula');
                guardarCaracterPosicionAleatoria(caracterTemporal);
                letrasMinusculasConseguidas++;
                caracteresConseguidos++;
            }

            while (letrasMayusculasConseguidas < numeroMinimoMayusculas) {
                caracterTemporal = this.generaCaracter('mayuscula');
                guardarCaracterPosicionAleatoria(caracterTemporal);
                letrasMayusculasConseguidas++;
                caracteresConseguidos++;
            }

            while (simbolosConseguidos < numeroMinimoSimbolos) {
                caracterTemporal = this.generaCaracter('simbolo');
                guardarCaracterPosicionAleatoria(caracterTemporal);
                simbolosConseguidos++;
                caracteresConseguidos++;
            }

            while (numerosConseguidos < numeroMinimoNumeros) {
                caracterTemporal = this.generaCaracter('numero');
                guardarCaracterPosicionAleatoria(caracterTemporal);
                numerosConseguidos++;
                caracteresConseguidos++;
            }

            while (caracteresConseguidos < longitudPassword) {
                caracterTemporal = this.generaCaracter('aleatorio');
                guardarCaracterPosicionAleatoria(caracterTemporal);
                caracteresConseguidos++;
            }

            for (let i = 0; i < arrayCaracteres.length; i++) {
                passwordDefinitivo = passwordDefinitivo + arrayCaracteres[i];
            }

            return passwordDefinitivo;
        });
    }

    public inicializarArray( longitud: number ) {
        let array:string[] = new Array();

        for( let i = 0; i < longitud; i++ ) {
            array[i] = 'null';
        }

        return array;
    }

    public generaAleatorio(iNumerInferior: number, iNumeroSuperior: number): number {
        let iAleatorio = Math.floor((Math.random() * (iNumeroSuperior - iNumerInferior)) + iNumerInferior);
        return iAleatorio;
    }

    public generaCaracter(tipoCaracter: string) {
        let listaCaracteres = '$@!%*?&23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        let caracterGenerado = '';
        let valorInferior = 0;
        let valorSuperior = 0;

        switch (tipoCaracter) {
            case 'minuscula':
                valorInferior = 38;
                valorSuperior = 61;
                break;

            case 'mayuscula':
                valorInferior = 14;
                valorSuperior = 37;
                break;

            case 'numero':
                valorInferior = 6;
                valorSuperior = 13;
                break;

            case 'simbolo':
                valorInferior = 0;
                valorSuperior = 5;
                break;

            case 'aleatorio':
                valorInferior = 0;
                valorSuperior = 61;
        }

        caracterGenerado = listaCaracteres.charAt(this.generaAleatorio(valorInferior, valorSuperior));
        return caracterGenerado;
    }
}

function generaAleatorio(arg0: number, longitudPassword: number): number {
    throw new Error('Function not implemented.');
}
