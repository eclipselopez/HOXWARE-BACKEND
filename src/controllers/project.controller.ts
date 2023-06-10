import IProject from '../interfaces/project.interface';
import IResponse from '../interfaces/response.interface';
import Project from '../models/project.model';

export default class ProjectService {
    constructor() { }

    createProject(project: IProject): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            Project.create(project, (err: any, projectDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
                return resolve({ ok: true, message: 'Project create succesfully', response: projectDB, code: 200 });
            });
        })
    }

    getProyect(company: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            Project.find({ owner: company }, (err: any, projectsDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
                return resolve({ ok: true, message: 'Projects', response: projectsDB, code: 200 });
            })
        })
    }

    getSudoProyect(): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            Project.find({}, (err: any, projectsDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
                return resolve({ ok: true, message: 'projects listed succesfully', response: projectsDB, code: 200 });
            })
        })
    }

    getProyectById(company: string, id: string): Promise<IResponse> {
        return new Promise(async(resolve, reject) => {
            await Project.find({ $and: [ { owner: company }, { permissions: `${id}` } ]}, (err: any, projectsDB: any) => {
                if (err) {
                    return reject({ ok: false, message: 'Database error', response: err, code: 500 });
                }
    
                for ( let i = 0; projectsDB.length > i; i++ ) {
                    
                    projectsDB[i].permissions = null;
                }

                return resolve({ ok: true, message: 'projects listed succesfully', response: projectsDB, code: 200 });
            })
        })
    }

    finishProject() { }
}