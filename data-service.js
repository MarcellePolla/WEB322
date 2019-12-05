const Sequelize=require('sequelize');

var sequelize = new Sequelize('d7i70hf6l5rd2e', 'ftdedvlryklmps', 'ef6dd3f8311b63afc63c4cabdb710fa6785dfb8fd073b2c8b8955f73a0ffcbdc', { 
    host: 'ec2-174-129-253-144.compute-1.amazonaws.com',
    dialect: 'postgres', 
    port: 5432, 
    dialectOptions: {
      ssl: true 
    }
});



var Employee = sequelize.define('Employee', {
    employeeNum: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});


var Department = sequelize.define('Department', {
    departmentId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    departmentName: Sequelize.STRING
});

//association
Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = function (){
    return new Promise(function (resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve();
          }).catch(function() {
            reject("unable to sync the database");
          })
    })
}



module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll()
        .then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}



module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                status: status
            }
        }).then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { department: department }
        }).then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeesByManager = function (man) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeManagerNum: man}
        }).then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeNum: num}
        }).then(function (data) {
            resolve(data[0]);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.getManagers = function(){
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            where: { isManager: true}
        })
        .then(function(data){
            resolve(data);
        })
        .cath(function(err){
            reject("no results returned");
        })
    });
}


module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        Department.findAll()
        .then(function (data) {
            resolve(data);
        }).catch((err) => {
            //console.log(err);
            reject("no results returned");
        });
    });
};

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {

        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var property in employeeData) {
            if(employeeData[property] == '')
                employeeData[property] = null;
        }

        Employee.create(employeeData)
        .then(() => {
            resolve();
        }).catch((err)=>{
            console.log(err);
            reject("unable to create employee");
        });

    });

};

module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {

        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var property in employeeData) {
            if (employeeData[property] == '')
                employeeData[property] = null;
        }

        Employee.update(employeeData, {
            where: { employeeNum: employeeData.employeeNum } 
        }).then(() => {
            resolve();
        }).catch((e) => {
            console.log(e);
            reject("unable to update employee");
        });
    });
};

module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        console.log(departmentData);
        for (var property in departmentData) {
            if(departmentData[property] == '')
                departmentData[property] = null;
        }

        Department.create(departmentData)
        .then(() => {
            resolve();
        }).catch((e)=>{
            reject("unable to create department");
        });

    });
};

module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {

        for (var property in departmentData) {
            if (departmentData[property] == '')
                departmentData[property] = null;
        }

        Department.update(departmentData, {
            where: { departmentId: departmentData.departmentId } 
        }).then(() => {
            resolve();
        }).catch((e) => {
            console.log(e);
            reject("unable to update department");
        });
    });

};

module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: { departmentId: id }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(() => {
            reject("no results returned");
        });
    });
};

module.exports.deleteDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        Department.destroy({
            where: { departmentId: id }
        }).then(function () {
            resolve();
        }).catch(() => {
            reject("could not delete department");
        });
    });
};

module.exports.deleteEmployeeByNum = function (id) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: { employeeNum: id }
        }).then(function () {
            resolve();
        }).catch(() => {
            reject("could not delete employee");
        });
    });
};