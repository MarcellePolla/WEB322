/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Marcelle Polla Student ID: 126654185 Date: Nov 24, 2019
*
*  Online (Heroku) Link: https://secure-brushlands-87541.herokuapp.com/
*
********************************************************************************/ 



const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const exphbs = require('express-handlebars');
const app = express();


const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: "main",
    helpers: { 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    } 
}));

app.set('view engine', '.hbs');

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//adds property "activeRoute" to "app.locals" whenever the route changes
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

//GET ROUTES
// setup a 'route' to listen on the default url path (http://localhost:8080)
app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/images/add", (req,res) => {
    res.render("addImage");
});

app.get("/employees/add", (req,res) => {

    data.getDepartments()
    .then((data)=>{
        res.render("addEmployee", {departments: data});
     })
     .catch((err) => {
       // set department list to empty array
       res.render("addEmployee", {departments: [] });
    });
  });

app.get("/images", (req,res) => {
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.render("images",{images:items});
    });
});

app.get("/employees", (req, res) => {
    
   if (req.query.status) {
        data.getEmployeesByStatus(req.query.status)
        .then((data) => {
            res.render("employees", (data.length > 0) ? {employees:data} : { message: "no results" });
        })
        .catch((err) => {
            res.render("employees",{ message: "no results" });
        });
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department)
        .then((data) => {
            res.render("employees", (data.length > 0) ? {employees:data} : { message: "no results" });
        })
        .catch((err) => {
            res.render("employees",{ message: "no results" });
        });
    } else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager)
        .then((data) => {
            res.render("employees", (data.length > 0) ? {employees:data} : { message: "no results" });
        })
        .catch((err) => {
            res.render("employees",{ message: "no results" });
        });
    } else {
        data.getAllEmployees()
        .then((data) => {
            res.render("employees", (data.length > 0) ? {employees:data} : { message: "no results" });
        })
        .catch((err) => {
            res.render("employees",{ message: "no results" });
        });
    }
});

app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    data.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(data.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee not found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    }).catch((err)=>{
        res.status(500).send("Unable to Show Employees");
      });;
});



app.get("/departments", (req,res) => {
    data.getDepartments()
    .then((data)=>{
        res.render("departments", (data.length > 0) ? {departments:data} : { message: "no results" });
    })
    .catch((err) => {
        res.render("departments",{message:"no results"});
    });
});

app.get("/departments/add", (req,res) => {
    res.render("addDepartment");
  });

//POST
app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body)
    .then(()=>{
      res.redirect("/employees");
    })
    .catch((err)=>{
        res.status(500).send("Unable to add the employee");
      });
  });

app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});


app.post("/employee/update", (req, res) => {
    data.updateEmployee(req.body)
    .then(()=>{
        res.redirect("/employees");
    })
    .catch((err)=>{
        res.status(500).send("Unable to update the employee");
  });
  
});

app.post("/departments/add", (req, res) => {
    data.addDepartment(req.body)
    .then(()=>{
      res.redirect("/departments");
    })
    .catch((err)=>{
        res.status(500).send("Unable to add department");
      });
  });
  

  app.post("/department/update", (req, res) => {
      data.updateDepartment(req.body)
      .then(()=>{
        res.redirect("/departments");
    })
    .catch((err)=>{
        res.status(500).send("Unable to update the department");
    });
    
  });
  
  app.get("/department/:departmentId", (req, res) => {
    data.getDepartmentById(req.params.departmentId)
    .then((data) => {
        if(data){
            res.render("department", { department: data });
        }else{
            res.status(404).send("Department not found");
        }
     
    })
    .catch((err) => {
      res.status(404).send("Department not found");
    });
  
  });

  app.get("/employees/delete/:empNum", (req,res)=>{
    data.deleteEmployeeByNum(req.params.empNum)
    .then(()=>{
      res.redirect("/employees");
    })
    .catch((err)=>{
      res.status(500).send("Unable to remove employee / Employee not found");
    });
  });

  app.get("/departments/delete/:depId", (req,res)=>{
    data.deleteDepartmentById(req.params.depId)
    .then(()=>{
      res.redirect("/departments");
    }).catch((err)=>{
      res.status(500).send("Unable to remove department / Department not found");
    });
  });

app.use((req, res) => {
    res.status(404).redirect("https://medium.com/@CollectUI/404-page-design-inspiration-march-2017-f6d9f7efd054)");
  });

data.initialize()
    .then(function(){
        app.listen(HTTP_PORT, function(){
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function(err){
        console.log("unable to start server: " + err);
});