const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const bcrypt = require("bcryptjs");
const USER = require("../models/userSchema");
const authenicate = require("../middleware/authenticate");

// get productdata api
router.get("/getproducts", async (req, res) => {
    try {
        const producstdata = await Products.find();
        // console.log("console the data" + producstdata + "data mila hain");
        res.status(201).json(producstdata);
    } catch (error) {
        console.log("error" + error.message);
    }
});


router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
        // console.log(id);

        const individual = await Products.findOne({ id: id });
        // console.log(individual + "ind mila hai");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.post("/register",async(req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("bhai nathi present badhi details");
    };

    try {

        const preuser = await USER.findOne({ email: email });

        if(preuser){
            res.status(422).json({ error: "This email is already exist" })
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" })
        } else {

            const finalUser = new USER({
                fname,email,mobile,password,cpassword
            });

            const storedata = await finalUser.save();
            console.log(storedata + "data");
            res.status(201).json(storedata);
        }

    }
     catch (error) {
        // console.log("error the bhai catch ma for registratoin time" + error.message);
        // res.status(422).send(error);
    }

});

router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);

            const token = await userlogin.generatAuthtoken();
            console.log(token);

            res.cookie("Amazonweb", token, {
                expires: new Date(Date.now() + 900000),
                httpOnly: true
            });

            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {               
                // console.log(token);
                res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});

router.post("/addcart/:id",authenicate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await USER.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");

        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);
            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
            // console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        } else{
        res.status(401).json({ error:"invalid user"});

        }
    } catch (error) {
        res.status(401).json({ error:"invalid user"});
    }
});

router.get("/cartdetails", authenicate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});

router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await USER.findOne({ _id: req.userID });
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});


router.get("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("iteam remove");

    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});


router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("Amazonweb", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

module.exports = router;