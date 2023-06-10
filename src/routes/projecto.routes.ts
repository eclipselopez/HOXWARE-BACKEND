import { Router, Request, Response } from "express";
import ProjectService from "../controllers/project.controller";
import { checkToken } from "../middlewares/autenticacion.middlewares";

const projectRoutes = Router();
const projectCtrl = new ProjectService;

projectRoutes.post('/projectCreate', checkToken, async( req: Request, res: Response ) => {
    const user = req.body.user;
    let project = req.body.project;

    project.owner = await user.company;
    project.license = [];
    project.license.push(user.id);

    try {
        const response = await projectCtrl.createProject(project);
        return res.json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err)
    }
});

projectRoutes.get('/projectList', checkToken, async( req: Request, res: Response ) => {
    const user = req.body.user;

    try {
        switch (user.role) {
            case 'SUDO':
                const response1 = await projectCtrl.getSudoProyect();
                return res.status(response1.code).json(response1)
                break;
            case 'ADMIN_ROLE':
                const response2 = await projectCtrl.getProyect(user.company);
                return res.status(response2.code).json(response2)
                break;
            case 'USER_ROLE':
                const response3 = await projectCtrl.getProyectById( user.company, user.id);
                return res.status(response3.code).json(response3)
                break;
        }
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err);
    }
});

export default projectRoutes;