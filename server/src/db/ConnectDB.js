/**
 * Created by laojiang on 2018/12/5.
 */

var mysql = require('mysql');

var ConnectDB = {
    connection:null,
    callBack:null,

    beginConnect : function (){
        connection = mysql.createConnection({
            host :'localhost',
            user : 'root',
            password :'123456',
            database :'my_db'
        });
        connection.connect();
    },

    checkUserNameAndPasswrodIsVaildBy : function (useName, password, callBack) {
        var sql = 'SELECT * FROM user_tbl';
        var content;
        var flag;
        callBack = callBack;
        connection.query(sql, function(err, result){
            if(err){
                console.log('select error', err.message);
                return;
            }
            var curUserName;
            var curPassword;
            var isVaild = false;
            for(var i=0; i<result.length; i++){
                curUserName = result[i].userName;
                curPassword = result[i].password;
                if(curUserName == useName && curPassword == password ){
                    isVaild = true;
                }
            }
            if(isVaild){
                content = "登录成功";
                flag = 1;
            }else{
                content = "登录失败";
                flag = 0;
            }
            console.log(content);
            connection.destroy();
            if(callBack){
                callBack(flag);
            }
         })
    },
}
module.exports = ConnectDB;