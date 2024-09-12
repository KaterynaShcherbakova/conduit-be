
import { Request } from "express";
import { UserEntity } from "src/modules/user/user.entity";

export interface ExpressRequest extends Request {
    user?: UserEntity

}