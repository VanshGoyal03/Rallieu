var express = require("express"); //ctrl C \
var mysql2 = require("mysql2");
var fileuploader = require("express-fileupload");
const { error } = require("console");
var cloudinary = require("cloudinary").v2;

var app = express();//app() returns an Object:app
app.use(fileuploader());//for receiving files from client and save on server files

app.use(express.static("Public"));//This is used to show Pic on index page
app.listen(2001, function () {
    console.log("Server Stared at Port 2001")
})

app.use(express.urlencoded(true)); //convert POST data to JSON object

app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);

    let path = __dirname + "/Public/Index.html";
    resp.sendFile(path);
})

cloudinary.config({
    cloud_name: 'dycnarj6f',
    api_key: '943157478694741',
    api_secret: 'd9V33r5dicfv0H0NYiGyLWHgseQ' // Click 'View API Keys' above to copy your API secret
});

let dbConfig = "mysql://avnadmin:AVNS_x6kTO_weSFx7chU9E_m@mysql-3bc139e6-vanshgoyal-03.i.aivencloud.com:22465/defaultdb";

let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (errKuch) {

    if (errKuch == null)
        console.log("AiVen Connected Successfulllyyy!!!!");
    else
        console.log(errKuch.message);
})

app.get("/server-signup", function (req, resp) {  //Post Data go to body

    let emailid = req.query.txtEmail;
    let pwd = req.query.txtPwd;
    let usertype = req.query.txtUser;

    mySqlVen.query("insert into sports2025 values(?,?,?,1,current_date())", [emailid, pwd, usertype], function (errKuch) {
        if (errKuch == null)
            resp.send("Signup Successfull....Badhai!!!");
        else
            resp.send(errKuch.message); //without message it also works but then it shows all the data (Pretty-Print one)
    })

})

//--------------------------------------------------------
app.get("/server-login", function (req, resp) {
    let emailid = req.query.txtEmail2;
    let pwd = req.query.txtPwd2;

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
        picurl1 = "nopic.jpg";

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
        picurl2 = "nopic.jpg";


    let emailid = req.body.txtEmail5;
    let address = req.body.txtAdd1;
    let city = req.body.txtCity;
    let state = req.body.txtState;
    let zip = req.body.txtZip;
    let sports = req.body.txtSports;
    let number = req.body.txtNo;
    let about = req.body.txtAorg;


    mySqlVen.query("insert into playerprofile values(?,?,?,?,?,?,?,?,?,?)", [emailid, picurl1, picurl2, address, city, state, zip, sports, number, about], function (errKuch) {
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

app.get("/sports", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);
    let path = __dirname + "/Public/User-Console.html";
    resp.sendFile(path);
})
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