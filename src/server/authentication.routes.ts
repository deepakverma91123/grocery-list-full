// routes
import {SINGLETON as UserDAO} from "./user/user.dao";
import {Exception} from '../common/exception';
import { sign, verify } from "jsonwebtoken";
import {Serialize} from "cerialize";

const SUPER_SECRET = 'change-this';

export const SIGN_UP = {
    path: '/api/sign-up',
    middleware: function *() {
        let user = UserDAO.findByEmail(this.request.body.email);
        if (user) {
            throw new Exception(401, 'E-mail already registered.');
        }
        UserDAO.insertUser(this.request.body);
        user = UserDAO.findByEmail(this.request.body.email);
        this.body = {
            token: sign(user, SUPER_SECRET),
            user: Serialize(user)
        };
    }
};

export const SIGN_IN = {
    path: '/api/sign-in',
    middleware: function *() {
        let user = UserDAO.findByEmail(this.request.body.email);
        if (user && this.request.body.password == user.password) {
            this.body = {
                token: sign(user, SUPER_SECRET),
                user: Serialize(user)
            };
        } else {
            throw new Exception(401, 'Uknown user');
        }
    }
};

export const SECURED_ROUTES = {
    path: /^\/api\/(.*)(?:\/|$)/,
    middleware: function *(next) {
        try {
            let token = this.request.headers['authorization'];
            this.state.user = verify(token.replace('Bearer ', ''), SUPER_SECRET);
            yield next;
        } catch (err) {
            throw new Exception(401, 'Uknown user');
        }
    }
};