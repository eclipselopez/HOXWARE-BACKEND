import { IArchive } from "../interfaces/archive.interface";
import { IUrl } from "../interfaces/url.interface";
import Url from '../models/url.model';
import path from 'path';
import fs from 'fs';
import IResponse from "../interfaces/response.interface";

export default class UrlService {
    constructor() {}

    urlsCreate(urls: Array<IUrl>, company: string, proyect: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            let formattedUrls: IUrl[] = [];
            
            for(let url of urls) {
                url.proyect = proyect;
                url.company = company;
                let fecha = url.lastRevisionDate.split('/');
                let formattedDate = new Date(fecha[0]);
                url.lastRevisionDate = formattedDate.toString();
    
                await formattedUrls.push(url);
            }
    
            Url.insertMany(formattedUrls,{}, (err: any, urlsDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Error inserting records', response: err, code: 500 });
                }
                return resolve({ ok: true, message: 'Urls created successfully', response: urlsDB, code: 200 });
            });
        })
    }

    urlCreate(url: IUrl, company: string, proyect: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            url.proyect = proyect;
            url.company = company;

            Url.create(url, (err: any, urlDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Database Error', response: err, code: 500 });
                }
                return resolve({ ok: true, message: 'Url created successfully', response: urlDB, code: 200 });
            });
        })
    }

    urlList(company: string, proyect: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            Url.find({ $and: [ { company: company }, { proyect: proyect } ] }, (err: any, urlsDB: any) => {
                if ( err ) {
                    return reject({ ok: false, message: 'Database Error', response: err, code: 500 });
                }

                /* for( let i = 0; urlsDB.length > i; i++ ) {
                    urlsDB[i].history = null;
                } */

                return resolve({ ok: true, message: 'Urls listed correctly', response: urlsDB, code: 200 });
            });
        })
    }

    urlUpdate(url: IUrl, id: string, company: string, proyect: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            Url.findById(id, (err: Error, urlId: any) => {
                url.company = company;
                url.proyect = proyect;
                
                if(err){
                    return reject({ ok:false, message: 'Database Error', error:err, code:500 });
                }
                if (!urlId){
                    return reject({ ok:false, message: 'No url found with that ID', code:214 });
                }
                if (!id){
                    return reject({ ok:false, message: 'You must insert ID', code:400 });
                }
                if(url.roundValidation) {
                    if(url.roundValidation < urlId.roundValidation) {
                        return reject({ ok: false, message: 'Downgrades are not allowed', response: null, code: 400 });
                    }
                    if (url.roundValidation !== urlId.roundValidation) {
                        url.history = [];
                        for(let i = 0; i<urlId.history.length; i++) {
                            url.history.push(urlId.history[i]);
                        }
                        urlId.history = null;
                        url.history.push(urlId);
                    }

                    Url.updateOne({ _id: urlId._id }, { $set: url }, {}, (err: any, urlAct: any) => {
                        if (err) {
                            return reject({ ok: false, message: 'Failed to update URL', response: err, code: 500 });
                        }
                        return resolve({ ok: true, message: 'Url updated successfully', response: null, code: 200 });
                    });
                }
            })
        })
    }

    csvSaveTemporary(archive: IArchive) {
        return new Promise(async(resolve, reject) => {
            const temp = await path.resolve( __dirname, '../temp');
            const exists = await fs.existsSync( temp );
        
            if ( !exists ) {
                fs.mkdirSync( temp );
            }

            archive.mv(`${temp}/archive.csv`, ( err: any ) => {
                if ( err ) {
                    return reject( err );
                } else {
                    return resolve('ok');
                }
            })
        })
    }
}