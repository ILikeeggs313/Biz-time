const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const slugify = require('slugify');
let router = new express.Router();

router.post("/", async (req, res,next) => {
    try{
        //added a route to add an industry
        let {name} = req.body;
        let{code} = slugify(name, {lower: true});
        const result = db.query(`INSERT INTO industries(code, name)
        VALUES($1, $2) RETURNING code, name`, [name, code]);

        return res.status(201).json( {"industry": result.rows[0]} );
    } catch(e){
        return next(e)
    }
})





module.exports = router;