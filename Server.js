var express = require("express"); //ctrl C \
var mysql2 = require("mysql2");
var fileuploader = require("express-fileupload");
const { error } = require("console");
const { type } = require("os");
const { required } = require("nodemon/lib/config");
// const { GoogleGenAI } = require("@google/genai");
var cloudinary = require("cloudinary").v2;

var app = express();//app() returns an Object:app
app.use(fileuploader());//for receiving files from client and save on server files

app.use(express.static("Public"));//This is used to show Pic on index page
app.listen(2001, function () {
    console.log("Server Stared at Port 2001")
})

require('dotenv').config(); // Loads the .env file

// app.use(express.urlencoded(true)); //convert POST data to JSON object
app.use(express.urlencoded({ extended: true })); //convert POST data to JSON object this is better than above one as it can handle nested objects also. 
// extended:true means it can handle nested objects also and false means it cannot handle nested objects

const googleClientPromise = import("@google/genai")
    .then(({ GoogleGenAI }) => {
        return new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    });
console.log("Gemini API Key Loaded:", !!process.env.GEMINI_API_KEY);

app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/Public/Index.html";
    resp.sendFile(path);
})

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database Configuration
let dbConfig = process.env.AIVEN_DB_URL;

let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (errKuch) {

    if (errKuch == null)
        console.log("AiVen Connected Successfulllyyy!!!!");
    else
        console.log(errKuch.message);
})

app.get("/test-gemini", async function (req, resp) {
    try {
        const ai = await googleClientPromise;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: "Reply with exactly : Gemini Connected"
        });

        resp.send(response.text);
    }
    catch (err) {
        console.error("Gemini Error:", err);
        resp.status(500).send(err.message);
    }
});

app.post("/test-gemini-image", async function (req, resp) {
    try {
        const ai = await googleClientPromise;

        const image = req.files.testImage;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [
                {
                    inlineData: {
                        mimeType: image.mimetype,
                        data: image.data.toString("base64")
                    }
                },
                {
                    text: `Extract the following details from the aadhar card : 
                    1. Name
                    2. Date of Birth
                    3. Gender
                    4. Aadhar Number 

                    IMPORTANT LANGUAGE INSTRUCTIONS:
                    - The Aadhaar card contains information in 2 languages English and other language.
                    - Extract ONLY the English text printed on the Aadhaar card.
                    - Do not translate English fields into other language.
                    - For gender, return only "Male", "Female", or "Other".
                    - Return the date of birth in DD/MM/YYYY format.
                    - Return the Aadhaar number using English digits (0-9) only.
                    
                    if a field is missing or unreadable , return null.
                    Do not guess any value`
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        aadhar_name: { type: "STRING", nullable: true },
                        aadhar_dob: { type: "STRING", nullable: true },
                        aadhar_gender: { type: "STRING", nullable: true },
                        aadhar_no: { type: "STRING", nullable: true }
                    },
                    required: [
                        "aadhar_name",
                        "aadhar_dob",
                        "aadhar_gender",
                        "aadhar_no"
                    ]
                }
            }

        });
        resp.send(response.text);
    }

    catch (err) {
        console.error("Gemini Image Error:", err)
        resp.status(500).send(err.message);
    }
})

app.post("/server-signup", function (req, resp) {  //Post Data go to body
    // req.body is used for POST requests and req.query is used for GET requests
    let emailid = req.body.txtEmail;
    let pwd = req.body.txtPwd;
    let usertype = req.body.txtUser;

    mySqlVen.query("insert into sports2025 values(?,?,?,1,current_date())", [emailid, pwd, usertype], function (errKuch) {
        if (errKuch == null)
            resp.send("Signup Successfull....Badhai!!!");
        else
            resp.send(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })

})

//--------------------------------------------------------
app.post("/server-login", function (req, resp) { //Post Data go to body
    // req.body is used for POST requests and req.query is used for GET requests
    let emailid = req.body.txtEmail2;
    let pwd = req.body.txtPwd2;

    let query = "select * from sports2025 where emailid=? and pwd=?";

    mySqlVen.query(query, [emailid, pwd], function (errKuch, allRecords) {
        if (allRecords.length == 1) {
            let status = allRecords[0].status;

            if (status == 0)
                resp.send("Blocked");
            else if (status == 1)
                resp.send(allRecords[0].usertype);
        }
        else
            resp.send("Invalid credentials");
    })
})

//-----------------------------------------------------------------
app.post("/server-org", async function (req, resp) {
    try {
        let picurl = "";
        if (req.files != null) {
            let fName = req.files.regPic.name;
            let fullPath = __dirname + "/Public/Uploads/" + fName;
            req.files.regPic.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
                picurl = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
                console.log(picurl);
            });
        }
        else
            picurl = "nopic.jpg";


        let emailid = req.body.txtEmail3;
        let orgname = req.body.txtOname;
        let regnum = req.body.txtRNo;
        let add1 = req.body.txtAdd1;
        let add2 = req.body.txtAdd2;
        let city = req.body.txtCity;
        let state = req.body.txtState;
        let zip = req.body.txtZip;
        let sports = req.body.txtSports;
        let website = req.body.txtWeb;
        let iandf = req.body.txtIF;
        let orghead = req.body.txtOhead;
        let orghno = req.body.txtHNo;
        let about = req.body.txtAorg;


        mySqlVen.query("insert into org2025 values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, orgname, regnum, add1, add2, city, state, zip, sports, website, iandf, orghead, orghno, picurl, about], function (errKuch) {
            if (errKuch == null)
                resp.send("Record Saved Successfulllyyy....Badhai!!!");
            else
                resp.send(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
        })

    }
    catch {
        resp.send("crash")
    }
})

app.post("/update-org", async function (req, resp) {

    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.regPic.name;
        let fullPath = __dirname + "/Public/Uploads/" + fName;
        req.files.regPic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
            console.log(picurl);
        });
    }
    else
        picurl = req.body.hdn;

    let emailid = req.body.txtEmail3;
    let orgname = req.body.txtOname;
    let regnum = req.body.txtRNo;
    let add1 = req.body.txtAdd1;
    let add2 = req.body.txtAdd2;
    let city = req.body.txtCity;
    let state = req.body.txtState;
    let zip = req.body.txtZip;
    let sports = req.body.txtSports;
    let website = req.body.txtWeb;
    let iandf = req.body.txtIF;
    let orghead = req.body.txtOhead;
    let orghno = req.body.txtHNo;
    let about = req.body.txtAorg;

    mySqlVen.query("update org2025 set orgname=?, regnum=?, add1=?, add2=?, city=?, state=?, zip=?, sports=?, website=?, iandf=?, orghead=?, orghno=?, picurl=?, about=? where emailid=?", [orgname, regnum, add1, add2, city, state, zip, sports, website, iandf, orghead, orghno, picurl, about, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Record Updated Successfulllyyy....Badhai!!!");
            else
                resp.send("Invalid Email Id");
        }
        else
            resp.json(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })
})

app.get("/get-one", function (req, resp) {
    console.log(req.query.txtEmail3);
    mySqlVen.query("select * from org2025 where emailid=?", [req.query.txtEmail3], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})

//-----------------------------------------------------
app.get("/org-events", function (req, resp) {
    let emailid = req.query.txtEmail4;
    let events = req.query.txtEvent;
    let doe = req.query.txtDate;
    let toe = req.query.txtTime;
    let address = req.query.txtAdd1;
    let city = req.query.txtCity;
    let sports = req.query.txtSports;
    let minage = req.query.txtMin;
    let maxage = req.query.txtMax;
    let lastdate = req.query.txtReg;
    let fee = req.query.txtFee;
    let price = req.query.txtPrice;
    let person = req.query.txtPer;
    let contact = req.query.txtDet;
    let guest = req.query.txtGuest;


    mySqlVen.query("insert into orgevents values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, events, doe, toe, address, city, sports, minage, maxage, lastdate, fee, price, person, contact, guest], function (errKuch) {
        if (errKuch == null)
            resp.send("Event Uploaded Successfully....Badhai!!!");
        else
            resp.send(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })
})

//-----------------------------------------------------------------
app.post("/server-player", async function (req, resp) {
    //console.log("req.files:", req.files);
    if (!req.files || !req.files.AdhaarPic || !req.files.ProfilePic) {
        return resp.status(400).send("Both Aadhar Pic and Profile Pic are required.");
    }
    //console.log("Both images received successfully!");
    let extractedData = {
        aadhar_name: null,
        aadhar_dob: null,
        aadhar_gender: null,
        aadhar_no: null
    };

    let picurl1 = "";
    if (req.files && req.files.AdhaarPic) {
        let fName = req.files.AdhaarPic.name;
        const image = req.files.AdhaarPic;
        let fullPath = __dirname + "/Public/Uploads/" + fName;
        await req.files.AdhaarPic.mv(fullPath);

        const ai = await googleClientPromise;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [
                {
                    inlineData: {
                        mimeType: image.mimetype,
                        data: image.data.toString("base64")
                    }
                },
                {
                    text: `Extract the following details from the Aadhaar card:
                            Name, Date of Birth, Gender, Aadhaar Number.

                            Extract only English text.
                            Return DOB in YYYY-MM-DD format.
                            Return gender as Male, Female, or Other.
                            If missing or unreadable, return null.
                            Never guess.`
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        aadhar_name: { type: "STRING", nullable: true },
                        aadhar_dob: { type: "STRING", nullable: true },
                        aadhar_gender: { type: "STRING", nullable: true },
                        aadhar_no: { type: "STRING", nullable: true }
                    },
                    required: [
                        "aadhar_name",
                        "aadhar_dob",
                        "aadhar_gender",
                        "aadhar_no"
                    ]
                }
            }
        });
        extractedData = JSON.parse(response.text);

        console.log(extractedData);

        const picUrlResult = await cloudinary.uploader.upload(fullPath);
        picurl1 = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
        console.log(picurl1);

    }
    else
        picurl1 = "nopic.jpg";

    let picurl2 = "";
    if (req.files && req.files.ProfilePic) {
        let fName = req.files.ProfilePic.name;
        let fullPath = __dirname + "/Public/Uploads/" + fName;
        await req.files.ProfilePic.mv(fullPath);

        const picUrlResult = await cloudinary.uploader.upload(fullPath);
        picurl2 = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
        console.log(picurl2);
    }
    else
        picurl2 = "nopic.jpg";


    let emailid = req.body.txtEmail5;
    let address = req.body.txtAdd1;
    let city = req.body.txtCity;
    let state = req.body.txtState;
    let zip = req.body.txtZip;
    let sports = req.body.txtSports;
    let number = req.body.txtNo;
    let about = req.body.txtAorg;


    mySqlVen.query("insert into playerprofile (emailid,picurl1,picurl2,address,city,state,zip,sports,number,about,aadhar_name,aadhar_dob,aadhar_gender,aadhar_no) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, picurl1, picurl2, address, city, state, zip, sports, number, about, extractedData.aadhar_name, extractedData.aadhar_dob, extractedData.aadhar_gender, extractedData.aadhar_no], function (errKuch) {
        if (errKuch == null)
            resp.send("Record Saved Successfulllyyy....Badhai!!!");
        else
            resp.send(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })

})

app.post("/update-player", async function (req, resp) {

    let picurl1 = "";
    if (req.files != null) {
        let fName = req.files.AdhaarPic.name;
        let fullPath = __dirname + "/Public/Uploads/" + fName;
        req.files.AdhaarPic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl1 = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
            console.log(picurl1);
        });
    }
    else
        picurl1 = req.body.hdn1;

    let picurl2 = "";
    if (req.files != null) {
        let fName = req.files.ProfilePic.name;
        let fullPath = __dirname + "/Public/Uploads/" + fName;
        req.files.ProfilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl2 = picUrlResult.url;  //will give u the url of ur pic on cloudinary server
            console.log(picurl2);
        });
    }
    else
        picurl2 = req.body.hdn2;


    let emailid = req.body.txtEmail5;
    let address = req.body.txtAdd1;
    let city = req.body.txtCity;
    let state = req.body.txtState;
    let zip = req.body.txtZip;
    let sports = req.body.txtSports;
    let number = req.body.txtNo;
    let about = req.body.txtAorg;


    mySqlVen.query("update playerprofile set picurl1=?, picurl2=?,address=?,city=?,state=?,zip=?,sports=?,number=?,about=? where emailid=?", [picurl1, picurl2, address, city, state, zip, sports, number, about, emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send("Record Updated Successfulllyyy....Badhai!!!");
            else
                resp.send("Invalid Email Id");
        }
        else
            resp.json(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })
})

app.get("/get-player", function (req, resp) {
    console.log(req.query.txtEmail5);
    mySqlVen.query("select * from playerprofile where emailid=?", [req.query.txtEmail5], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})

//-------------------------------------------------------------------

app.get("/do-fetch-all-orgevents", function (req, resp) {
    mySqlVen.query("select * from orgevents", function (err, allRecords) {
        resp.send(allRecords);
    })
})

app.get("/delete-one", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.emailidKuch;;;;;
    let rid = req.query.ridKuch;

    mySqlVen.query("delete from orgevents where emailid=? and rid=?", [emailid, rid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " Deleted Successfulllyyyy...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})
//-------------------------------------------------------------------

app.get("/fetch-all-sports", function (req, resp) {
    mySqlVen.query("select * from sports2025", function (err, allRecords) {
        if (err == null)
            resp.send(allRecords);
        else
            resp.send(err.message);
    })
    // console.log("sports");
})

/* app.get("/sports", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);
    let path = __dirname + "/Public/User-Console.html";
    resp.sendFile(path);
}) */
app.get("/Block-one", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.emailidKuch;;;;;

    mySqlVen.query(" update sports2025 set status=0 where emailid=? ", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " Blocked Succesfully!!!");
            else
                resp.send("Unable To Block");
        }
        else
            resp.send(errKuch);

    })
})

app.get("/UnBlock-one", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.emailidKuch;;;;;

    mySqlVen.query(" update sports2025 set status=1 where emailid=? ", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " UnBlocked Succesfully!!!");
            else
                resp.send("Unable To UnBlock");
        }
        else
            resp.send(errKuch);

    })
})

//-------------------------------------------------------------------------
app.get("/update-pwd-sports2025", function (req, resp) {
    console.log(req.query)
    let emailid = req.query.kuchemail;

    mySqlVen.query(" update sports2025 set pwd=? where emailid=? and pwd=? ", [req.query.kuchnewpwd, emailid, req.query.kucholdpwd], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " Updated succesfully!!!");
            else
                resp.send("Unable To UpDate");
        }
        else
            resp.send(errKuch);
    })


})
app.get("/do-fetch-all-events", function (req, resp) {
    mySqlVen.query("select * from orgevents", function (err, allRecords) {
        resp.send(allRecords);
    })
})