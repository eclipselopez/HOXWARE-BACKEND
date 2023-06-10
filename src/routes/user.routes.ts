import { Router, Request, Response } from "express";
import UserService from "../controllers/user.controller";
import { checkToken } from "../middlewares/autentication.middlewares";

const userRoutes = Router();
const userCtrl = new UserService;

userRoutes.get('/listUser', checkToken, async(req: Request, res: Response) => {
    const user = req.body.user;

    try {
        switch(user.role) {
            case 'SUDO':
                const response1 = await userCtrl.listSudoUser();
                return res.status(response1.code).json(response1)
                break;
    
            case 'ADMIN_ROLE':
                const response2 = await userCtrl.listUser(user);
                return res.status(response2.code).json(response2)
                break;
        } 
    }catch (err: any) {
        return res.status(err.code ? err.code : 500).json(err);
    }
});

userRoutes.put('/updateUser', checkToken, async( req: Request, res: Response ) => {
    const user = req.body.user;

    try {
        const response = await userCtrl.updateUser(user)
        return res.status(response.code).json(response)
    } catch(err: any) {
        return res.status(err.code ? err.code : 500).json(err);
    }
})

export default userRoutes;