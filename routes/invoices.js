//invoice routes
const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

router.get('/', async function(req, res, next){
    try{
        let result = await db.query(`SELECT * FROM invoices`)
        return res.json({"invoices": result.rows});
    } catch(e){
        return next(e)
    }
})

//get invoice by ID, ID is probably a params
router.get('/:id', async function(req, res, next){
    try{
        let result = await db.query(`SELECT * FROM invoices WHERE id = $1`,
        [req.params.id])
        if(result.rows.length === 0){
            //throw a 404 if no id is found
            throw new ExpressError(`no ID is found for invoice ${req.params.id}`, 404)
        }
        //else just return the result
        return res.json( {"invoice": result.rows[0]} )
        
        
    } catch(e){
        return next(e)
    }
})

//create an invoice using post route
router.post('/', async function(req, res, next){
    try{
        let {comp_code, amt} = req.body;
        let result = await db.query(`INSERT INTO invoices(comp_code, amt)
        VALUES($1, $2) RETURNING id, comp_code, amt`, [comp_code, amt])
        return res.json( {"invoice": result.rows[0]} )
    
    } catch(e){
        return next(e)
    }
})

//update an invoice using patch route


router.patch('/:id', async function(req, res, next){
    try{
        //let's first get the paid_date result
        let {amt,paid, comp_code} = req.body;
        let {id} = req.params;
        //let's set paidDate = null
        let paidDate = null;
        const paidDateResult = db.query(`SELECT paid FROM invoices
        WHERE id = $1`, [id]);
        //throw an error if there is no paid invoice
        if(paidDateResult.rows.length === 0){
            throw new ExpressError(`no invoices found at ${id}`, 404)
        }
        //otherwise, set currentPaidDate same as the paid_date from invoice
        let currentPaidDate = paidDateResult.rows[0].paid_date;

        //if there is no current paid date and the invoice is paid, set is as today
        if(!currentPaidDate && paid){
            paidDate = new Date();
        }   else if (!paid){
            paidDate = null;
        } 

        //if it is already paid and there is a paid date, then dont change
        paidDate = currentPaidDate;


        let invoicesResult = await db.query(`UPDATE invoices SET comp_code
        = $1, amt = $2 WHERE id = $3 
        RETURNING id, amt, paid, add_date, paid_date, paid`, 
        [comp_code, amt, id]);
        //throw a 404 if no invoices are found
        if(result.rows.length === 0){
            throw new ExpressError(`no invoices are found ${id}`, 404)
        }
        
        
        //otherwise just show the updated result
        return res.json( {"invoice": invoicesResult.rows[0]} )
    
    } catch(e){
        return next(e)
    }
})

//add a delete route
router.delete("/:id", async function (req, res, next) {
    try{
        let result = await db.query(
            `DELETE FROM invoices WHERE id = $1 RETURNING id`, [req.params.id]
        )
        //throw a 404 in case no company is found
        if(result.rows.length === 0){
            throw new ExpressError(`No company's id is found ${id}`, 404)
        }
        return res.json({'status': 'deleted'});
    } catch(e){
        return next (e)
    }
})


module.exports = router;