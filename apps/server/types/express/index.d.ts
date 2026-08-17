declare module 'express' {
  export = express;
}

declare namespace Express {
  interface Request {}
  interface Response {}
  interface NextFunction {}
}

declare const express: any;
