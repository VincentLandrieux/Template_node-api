//---IMPORT---//
const { check, validationResult } = require("express-validator");
const fs = require("fs");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cookies = require("cookies");


//---VALIDATOR---//
const loginValidate = [
    // Check Pseudo
    check('pseudo').exists({checkFalsy: true})
    .trim().escape(),
    // Check Password
    check('password').exists({checkFalsy: true})
    .trim().escape()
];
const signupValidate = [
    // Check Pseudo
    check('pseudo').exists({checkFalsy: true})
    .trim().escape(),
    // Check Password
    check('password').exists({checkFalsy: true}).isLength({ min: 8 })
    .withMessage('Password Must Be at Least 8 Characters')
    .matches('[0-9]').withMessage('Password Must Contain a Number')
    .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
    .trim().escape()
];


//---VARIABLE---//
const USER_FOLDER = process.env.USER_FOLDER;
const USER_FILE = process.env.USER_FILE;

const rounds = 10;
const secretToken = process.env.JWT_KEY;


//---FUNCTION---//
function generateToken(user){
    return jwt.sign({user}, secretToken, {expiresIn: '1h'});
}


//---EXPORT---//
module.exports = (app) => {
    app.route('/login')
    .get((req, res) => {
        try{
            return res.sendFile("public/pages/login.html", { root: "./" });
        }catch(error){
            return res.status(500).json({error: "internal error"});
        }
    })
    .post(loginValidate, (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        else {
            const pseudo = req.body.pseudo;
            const password = req.body.password;

            ////
            // add create file if !exist
            try{
                fs.readFile(USER_FOLDER+USER_FILE, (error, data) => {
                    if(error){
                        return res.status(500).json({error: error});
                    }else{
                        const users = JSON.parse(data.toString());
                        const user = users.find(el => el.pseudo == pseudo);

                        if(!user){
                            return res.status(404).json({error: 'pseudo or password incorrect'});
                        }else{
                            bcrypt.compare(password, user.password, (error, match) => {
                                if(error) return res.status(500).json(error);
                                else if(match){
                                    const token = generateToken({id: user.id, pseudo: user.pseudo});
                                    
                                    // Create a cookies instance
                                    const cookies = new Cookies(req, res);

                                    // Set a cookie
                                    cookies.set('jwt', token, {
                                        httpOnly: true,
                                        sameSite: "strict",
                                        secure: false
                                    });

                                    return res.status(200).json({
                                        result: "connected", 
                                        user: {
                                            pseudo: user.pseudo,
                                            role: user.role
                                        }
                                    });
                                }else return res.status(404).json({error: 'pseudo or password incorrect'})
                            });
                        }
                    }
                });
            }catch(error){
                return res.status(500).json({error: error});
            }
            //
            ////
        }
    });

    app.get("/logout", (req, res) => {
        try{
            // Create a cookies instance
            const cookies = new Cookies(req, res)

            // Delete old cookie
            cookies.set('jwt');

            return res.status(200).json({
                result: "disconnected"
            });
        }catch(error){
            return res.status(500).json({error: "internal error"});
        }
    });

    app.route('/signup')
    .get((req, res) => {
        try{
            return res.sendFile("public/pages/signup.html", { root: "./" });
        }catch(error){
            return res.status(500).json({error: "internal error"});
        }
    })
    .post(signupValidate, (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        else{
            const pseudo = req.body.pseudo;
            const password = req.body.password;

            bcrypt.hash(password, rounds, (error, hash) => {
                if(error) return res.status(500).json({error: "internal error"});
                else {
                    const user = {
                        pseudo: pseudo,
                        password: hash,
                        role: "user"
                    }

                    // add create file if !exist
                    try{
                        fs.readFile(USER_FOLDER+USER_FILE, (error, data) => {
                            if(error){
                                return res.status(500).json({error: "internal error"});
                            }else{
                                const users = JSON.parse(data.toString());

                                const exist = users.find(el => el.pseudo == pseudo);

                                if(exist) return res.status(500).json({error: "pseudo exist"});

                                // set user id
                                const id = Math.max(...users.map(c => c.id));
                                if(id > 0){
                                    user.id = id + 1;
                                }else{
                                    user.id = 1;
                                }

                                users.push(user);

                                fs.writeFile(USER_FOLDER+USER_FILE, JSON.stringify(users, null, '\t'), (err) => {
                                    if(err) return res.status(500).json({error: "internal error"});
                                    else{
                                        // Generate token
                                        const token = generateToken({pseudo: user.pseudo});

                                        // Create a cookies instance
                                        const cookies = new Cookies(req, res);

                                        // Set a cookie
                                        cookies.set('jwt', token, {
                                            httpOnly: true,
                                            sameSite: "strict",
                                            secure: false
                                        });

                                        return res.status(200).json({
                                            result: "registered", 
                                            user: {
                                                pseudo: user.pseudo,
                                                role: user.role
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }catch(error){
                        return res.status(500).json({error: "internal error"});
                    }
                }
            });
        }
    });
}
