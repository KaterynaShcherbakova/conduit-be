import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { ExpressRequest } from "src/common/types/expressRequest.interface";
import { verify } from "jsonwebtoken";
import { UserService } from "../user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) { }
    async use(req: ExpressRequest, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null;
            next();
            return
        }
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = verify(token, process.env.JWT_SECRET);
            const user = await this.userService.findUserById(decoded.id);
            req.user = user;
            next();

        } catch (error) {
            req.user = null;
            next();
        }
    }
}