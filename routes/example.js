//---IMPORT---//
const { connected } = require("../lib/middlewares/auth");

const { body, check, validationResult } = require("express-validator");
const fs = require("fs");


//---VALIDATOR---//
const exampleValidate = [
    // Check id
    check('id').if(body('id').notEmpty())
    .isNumeric().withMessage('id must been a number')
    .trim().escape()
];


//---VARIABLE---//
const EXAMPLE_FOLDER = process.env.EXAMPLE_FOLDER;
const EXAMPLE_FILE = process.env.EXAMPLE_FILE;


//---FUNCTION---//


//---EXPORT---//
module.exports = (app) => {
    app.route('/examples')
    .get(connected, (req, res) => {
        fs.stat(EXAMPLE_FOLDER+EXAMPLE_FILE, (err, stats) => {
            if(err) return res.status(500).json({error: "read error"});
        });
        fs.readFile(EXAMPLE_FOLDER+EXAMPLE_FILE, (err, data) => {
            if(err) return res.status(500).json({error: "read error"});
            else{
                try {
                    const examples = JSON.parse(data.toString());
    
                    return res.status(200).json({examples});
                } catch (error) {
                    return res.status(500).json({error: "internal error"});
                }
            }
        });
    })
    .post([connected, exampleValidate], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        else {
            const example = {
                id: null,
                date: new Date(),
                user_id: res.locals.user.id
            }

            try{
                fs.readFile(EXAMPLE_FOLDER+EXAMPLE_FILE, (error, data) => {
                    if(error){
                        return res.status(500).json({error: "internal error"});
                    }else{
                        const examples = JSON.parse(data.toString());

                        // set example id
                        const id = Math.max(...examples.map(c => c.id));
                        if(id > 0){
                            example.id = id + 1;
                        }else{
                            example.id = 1;
                        }

                        // push new example
                        examples.push(example);

                        // save in file
                        fs.writeFile(EXAMPLE_FOLDER+EXAMPLE_FILE, JSON.stringify(examples, null, '\t'), (err) => {
                            if(err) return res.status(500).json({error: "write error"});
                            else{
                                return res.status(200).json({result: "Created", example});
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