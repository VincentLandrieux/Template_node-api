//---IMPORT---//
const jwt = require("jsonwebtoken");
const Cookies = require("cookies");


//---INIT---//
require('dotenv').config();


//---VARIABLE---//
const secretToken = process.env.JWT_KEY;


//---EXPORT---//
module.exports.connected = function(req, res, next){
    // Create a cookies instance
    const cookies = new Cookies(req, null);

    // Get a cookie
    const token = cookies.get('jwt');
    // or
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    //

    if(!token){
        return res.status(401).json({error: "login before request"});
    }else{
        // console.log("jwt", jwt.decode(token, {complete: true}));
        jwt.verify(token, secretToken, function(err, data){
            if(err){
                return res.status(401).json({error: "login before request"});
            }else{
                if(data.user){
                    res.locals.user = data.user;

                    next();
                }else{
                    return res.status(401).json({error: "login before request"});
                }
            }
        });

    }
}