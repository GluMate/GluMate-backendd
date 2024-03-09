import admin from "firebase-admin";

export function authPatient(req,res,next) {
    try{
        const token = req.headers.authorization;
        console.log(token);
        if (!token) {
            res.status(401).json({message : "Authorization header missing"})
        }
        admin.auth().verifyIdToken(token).then((decodedToken) => {
            req.auth = decodedToken;
            const {role} = decodedToken;
            if(!role) {
                res.status(403).json({message : "User role not found"})
            }
            if(role == 'patient') {
                next();
            }else{
                res.status(402).json({message : "Unauthorized access"})
            }
        })
      
    } catch (err) 
    {
        console.log(err)
        res.status(401).json({message : 'user is not authenticated'});
    }
}

export function authProvider(req,res,next) {
    try{
        const token = req.headers.authorization;
        console.log(token);
        if (!token) {
            res.status(401).json({message : "Authorization header missing"})
        }
        admin.auth().verifyIdToken(token).then((decodedToken) => {
            req.auth = decodedToken;
            const {role} = decodedToken;
            if(!role) {
                res.status(403).json({message : "User role not found"})
            }
            if(role == 'provider') {
                next();
            }else{
                res.status(402).json({message : "Unauthorized access"})
            }
        })
      
    } catch (err) 
    {
        console.log(err)
        res.status(401).json({message : 'user is not authenticated'});
    }
}
export function auth(req,res,next) {
    try{
        const token = req.headers.authorization;
        console.log(token);
        if (!token) {
            res.status(401).json({message : "Authorization header missing"})
        } 
        admin.auth().verifyIdToken(token).then((decodedToken) => {
           req.auth = decodedToken;
            next();
        })   
    } catch (err) 
    {
        console.log(err)
        res.status(401).json({message : 'user is not authenticated'});
    }
}