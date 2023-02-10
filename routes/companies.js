const express = require('express');
const slugify = require('slugify');
//need a router const for the app
const router = new express.Router();
const db = require('../db');
const ExpressError = require ('../expressError');

//response in this format {companies: [{code, name}, ...]}
router.get('/', async function(req, res, next) {
    try{
    const companiesQuery =  await db.query(`SELECT * FROM companies`);
    return res.json( {"companies": companiesQuery.rows} );
    } catch(e){
        return next(e)
    }
})

router.get('/:code', async (req, res, next)=> {
    try{
        const companiesQuery = await db.query(
            "SELECT * FROM companies WHERE code = $1", [req.params.code]);
        const industriesQuery = await db.query('SELECT name FROM industries WHERE code = $1',
        [req.params.code]);
        //added an additional route where we get the industry code along with the company
            //throw an error if no industries are found
            if(industriesQuery.rows.length === 0){
                throw new ExpressError(`There is no company with industry ${code}`, 404)
            }
            if (companiesQuery.rows.length === 0) {
            let notFoundError = new Error(`There is no companies with code '${req.params.code}`);
            notFoundError.status = 404;
            throw notFoundError;
    }
    const companies = companiesQuery.rows[0];
    companies.industries = industriesQuery.rows;

    res.send(companies);
    return res.json(companiesQuery.rows[0]);

    } catch(e){
        return next (e)
    }
})

//add a company with post
router.post("/", async function(req, res,next) {
    try{
        let {name, description} = req.body;
        //added slugify to avoid weird punctuations
        let code = slugify(name, {lower: true});
        const result = await db.query(
            `INSERT INTO companies(code, name, description)
            VALUES ($1, $2, $3) RETURNING code, name, description`,
            [code, name, description]
        )
        return res.status(201).json({ "company": result.rows[0]});
    } catch(e){
        return next(e)
    }
})

//update, edit a company, return 404 if no company is found
router.patch("/:code", async(req, res, next) => {
    try{
        let{name, description} = req.body;
        let code = req.body;
        const result = await db.query(
            `UPDATE companies SET name = $1, description = $2
            WHERE code = $3 RETURNING code,name, description `,
            [name, description, code]
        )
        //return a 404 if no code is found
        if(result.rows.length === 0){
            throw new ExpressError(`No such company: ${code}`, 404)
        }
        return res.json({"company": result.rows[0]});
    } catch(e){
        return next(e)
    }
})

//delete a company with code
router.delete("/:code", async function (req, res, next) {
    try{
        let result = await db.query(
            `DELETE FROM companies WHERE code = $1 RETURNING code`, [req.params.code]
        )
        //throw a 404 in case no company is found
        if(result.rows.length === 0){
            throw new ExpressError(`No company's code is found ${code}`, 404)
        }
        return res.json({'status': 'deleted'});
    } catch(e){
        return next (e)
    }
})

module.exports = router;