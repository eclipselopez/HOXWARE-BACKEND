import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config'

export function genRandomString(length: number) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function getStringValue(data: { toString: () => any; }) {
    if (typeof data === 'number' || data instanceof Number) {
        return data.toString();
    }

    if (!Buffer.isBuffer(data) && typeof data !== 'string') {
        throw new TypeError('Los datos para generar contraseñas deber ser de tipo String o Buffer');
    }

    return data;
}

export function sha512(password: string, salt: string) {
    const hash = crypto.createHmac('sha512', getStringValue(salt));
    hash.update(getStringValue(password));
    const passwordHash = hash.digest('hex');

    return {
        salt,
        passwordHash
    }
}

export function generarPassword(password: String) {
    const salt = genRandomString(16);
    return sha512(String(password), salt);
}

export function generateResetPasswordToken(userId: any) {
    const text = JSON.stringify({ userId, valid: new Date().getTime() + production.auth_ttl });

    const cipher = crypto.createCipher(production.auth_algorithm, production.auth_secret);
    let ciphered = cipher.update(text, production.auth_inputEncoding, production.auth_outputEncoding);
    ciphered += cipher.final(production.auth_outputEncoding);

    return ciphered;
}

export async function generarToken(usuario: any, callback: Function) {

    const payload = {
        usuario
    }

    jwt.sign(payload, production.jwt_accessTokenSecret, {
        expiresIn: production.jwt_accessTokenLife
    }, (err, token) => {
        if (err) {
            return callback(err);
        } else {
            return callback(token);
        }
    });
}

export async function tokenEmail(usuario: any, callback: Function) {
    const payload = {
        usuario
    }

    jwt.sign(payload, production.jwt_accessTokenSecret, {
        expiresIn: '30m'
    }, (err, token) => {
        if (err) {
            return callback(err);
        } else {
            return callback(token);
        }
    });
}

export async function tokenLicencia( licencia: String, duracion: string, callback: Function ) {
    const payload = {
        licencia
    }

    await jwt.sign( payload, production.jwt_accessTokenSecret, {
        expiresIn: duracion
    }, async (err, token) => {
        if (err) {
            return callback(err);
        } else {
            return callback(token);
        }
    });
}


export function saltHashPassword(password: String) {
    const salt = genRandomString(16);
    return sha512(String(password), salt);
}

export async function passwordSeguro() {
    const longitudPassword = 8;
    var caracteresConseguidos = 0;
    var caracterTemporal = '';

    var arrayCaracteres:string[] = new Array();

    var passwordDefinitivo = '';

    var numeroMinimoMinusculas = 1;
    var numeroMinimoMayusculas = 1;
    var numeroMinimoNumeros = 1;
    var numeroMinimoSimbolos = 1;

    var letrasMinusculasConseguidas = 0;
    var letrasMayusculasConseguidas = 0;
    var numerosConseguidos = 0;
    var simbolosConseguidos = 0;

    function guardarCaracterPosicionAleatoria(caracterPasadoParametro: any ) {
        let guardadoPosicionVacia = false;
        let posicionArray = 0;
    
        while (guardadoPosicionVacia != true) {
            posicionArray = generaAleatorio(0, longitudPassword);
    
            if ( arrayCaracteres[posicionArray] == 'null' ) {
                arrayCaracteres[posicionArray] = caracterPasadoParametro;
                guardadoPosicionVacia = true;
            }
        }
    }

    await inicializarArray(longitudPassword).then((respuesta: any) => {
        arrayCaracteres = respuesta;
    })

    while(letrasMinusculasConseguidas < numeroMinimoMinusculas ) {
        caracterTemporal = generaCaracter('minuscula');
        guardarCaracterPosicionAleatoria(caracterTemporal);
        letrasMinusculasConseguidas++;
        caracteresConseguidos++;
    }

    while(letrasMayusculasConseguidas < numeroMinimoMayusculas ) {
        caracterTemporal = generaCaracter('mayuscula');
        guardarCaracterPosicionAleatoria(caracterTemporal);
        letrasMayusculasConseguidas++;
        caracteresConseguidos++;
    }

    while(simbolosConseguidos < numeroMinimoSimbolos ) {
        caracterTemporal = generaCaracter('simbolo');
        guardarCaracterPosicionAleatoria(caracterTemporal);
        simbolosConseguidos++;
        caracteresConseguidos++;
    }

    while(numerosConseguidos < numeroMinimoNumeros ) {
        caracterTemporal = generaCaracter('numero');
        guardarCaracterPosicionAleatoria(caracterTemporal);
        numerosConseguidos++;
        caracteresConseguidos++;
    }
    while(caracteresConseguidos < longitudPassword ) {
        caracterTemporal = generaCaracter('aleatorio');
        guardarCaracterPosicionAleatoria(caracterTemporal);
        caracteresConseguidos++;
    }

    for( let i = 0; i < arrayCaracteres.length; i++ ) {
        passwordDefinitivo = passwordDefinitivo + arrayCaracteres[i];
    }

    return passwordDefinitivo;
}

async function inicializarArray( longitud: number ) {
    let array:string[] = new Array();

    for( let i = 0; i < longitud; i++ ) {
        array[i] = 'null';
    }

    return array;
}

function generaAleatorio(iNumerInferior: number, iNumeroSuperior: number): number {
    let iAleatorio = Math.floor((Math.random() * (iNumeroSuperior - iNumerInferior)) + iNumerInferior);
    return iAleatorio;
}


function generaCaracter(tipoCaracter: string) {
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

    caracterGenerado = listaCaracteres.charAt(generaAleatorio(valorInferior, valorSuperior));
    return caracterGenerado;
}



