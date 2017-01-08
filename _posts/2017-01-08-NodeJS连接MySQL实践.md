---
layout: post
comments: true
title: NodeJS连接MySQL实践
category: Byronlun Fang
date: 2017-01-08
<!-- summary: 使用Nodejs(Express)连接关系性数据库MySQL开发过程的实战总结 -->
---

之前刚开始学NodeJS的时候，用过Express连接数据库，不过连接的是**Mongodb**，属于非关系型数据库，对于前端程序员来说可以说最为熟悉不过了，因为就是我们的`json`对象嘛，直到这学期学了数据库之后，对关系型数据库有了更多的了解，于是自己用Express连接MySQL做了一个应用，下面把这个开发过程中遇到的一些问题和实践总结。

项目相关代码放在[这里](https://github.com/byronlun/interactive-system)

## 工程准备

### 安装express和mysql

```js
npm install express mysql
```

`express`在这里就不详细介绍了，如果不了解请参考[中文文档](http://expressjs.jser.us/)。
`mysql`是一个NodeJS连接MySQL的驱动，注意它只是帮助NodeJS更好的与系统安装的MySQL连接的一个依赖包，而不是真正的DBMS，所以系统需要自己安装好[MySQL](http://dev.mysql.com/downloads/)，最好是有相关的图形界面的操作工具，例如workbench、navicat for mysql等。

### 安装可能用到的依赖

这是我的项目依赖：

```json
"devDependencies": {
    "body-parser": "^1.15.2",
    "express": "^4.14.0",
    "multer": "^1.2.1",
    "mysql": "^2.12.0",
    "nodemon": "^1.11.0"
}
```

其中`bodyParser`是用来帮助express解析http请求体的中间件，因为开发过程中需要解析前端发送过来的请求，所以这个依赖是必须的，`multer`是用来帮助express实现文件上传的中间件，`nodemon`是一款帮助开发的工具，用具监控Nodejs源代码的变化和自动重启服务器，开发时不需要重新跑项目，直接刷新浏览器就可以看到改动，具体教程可以参照文章最后的参考链接。

### 创建好相应的数据库和相关的表

用DBMS建立数据库class_interaction
创建相关表，例如student表，以下过程用该表做例子，其他表操作类似，不一一讲解。
![](http://ww1.sinaimg.cn/large/005JoIL8gw1fbj8hkczihj30np05mabd.jpg)

## 应用Express和MySQL的开发过程

先看一下项目目录结构：

![](http://ww4.sinaimg.cn/large/005JoIL8gw1fbj8x0irlej305907dq33.jpg)

下面是页面发送一次请求之后，server端的处理过程。

前端js里面用[Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)发送一次请求：

```js
fetch('http://localhost:8008/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'      //发送post请求，设置为json数据格式
  },
  body: JSON.stringify({    //body传必要的json数据给后台
    id: id,
    password: password,
    userType: userType
  })
}).then(function(response) {
  return response.json()
}).then(function (json) {
  console.log(json)
});
```

在router/index.js中，接收到请求之后，做相应的路由处理


```js
var express = require('express')
var router = express.Router()
var stu = require('../controller/stu.js')
// 路由处理
router.post('/signin', function (req, res, next) {
  console.log(req.body)
  stu.queryPasswordById(req, res, next)
})
module.exports = router
```

`controller`文件夹下存放路由处理类以及相应的数据库操作SQL语句。

在controller/stu.js中，是对student的增删除改数据的控制方法，下面是stu.js中queryPasswordById方法

```js
// 连接数据库，并操作
var mysql = require('mysql')
var mysqlConfig = require('../config.js')
var stuSql = require('./stuSql.js')
// 建立数据库链接
var conn = mysql.createConnection(mysqlConfig)
module.exports = {
  // 验证学生登录信息
  queryPasswordById: function (req, res, next) {
    var stuId = req.body.id
    var password = req.body.password
    conn.query(stuSql.queryPasswordById, stuId, function (err, result) {
      // 如果用户存在则查询该用户的相关数据，并返回
      if (result[0] && result[0].password == password) {
        conn.query(stuSql.queryById, stuId, function (err, result_1) {
          result = {
            code: 200,
            msg: '用户存在',
            info: result_1[0]
          }
        })
      } else {  //如果用户不存在，返回提示信息
        result = {
          code: 500,
          msg: '用户不存在'
        }
      }
      res.json(result)
    })
  }
}
```

配置与数据库连接的参数在`config.js`中，最简单直接的方法就是建立一个数据库连接：

```js
// 连接数据库
var mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'class_interaction',   //前面建立的数据库名
    port: 3306
}
module.exports = mysqlConfig
```

在controller//stuSql.js中，是相关的student的sql语句：

```js
var stuSql = {
  insert: 'insert into student(stuId, username, email, password) values (?, ?, ?, ?)',
  queryById: 'select * from student where stuId=?',
  queryPasswordById: 'select password from student where stuId=?',
  updateInfo: 'update student set username=?, email=?, age=?, sex=?, password=? where stuId=?'
}

module.exports = stuSql
```

还有重要的`app.js`,其中对于页面的路由处理在server/route文件夹下处理:

```js
var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var router = require('./server/route')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'))

// 浏览器对页面的路由请求处理
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/login.html'))
})

app.get('/login.html', function(req, res) {
  res.sendFile(path.join(__dirname + '/login.html'))
})

app.get('/index.html', function(req, res) {
  console.log('index')
  res.sendFile(path.join(__dirname + '/index.html'))
})

// 其他业务的路由处理
app.use(router)

app.listen(8008, '127.0.0.1', function () {
  console.log('在浏览器上访问127.0.0.1:8008')
})
```

这样即可以实现一个简单的检查用户登陆信息的服务端处理。

## 连接数据库过程的其他情况

前面连接数据库是直接创建一个数据库连接，但是直接创建一个数据库连接比较“危险”，因为有很多种可能性导致连接的失败。而且如果我们的程序中随意都可以和数据库建立连接的话，我们的程序就比较得混乱，不能很有效的管理数据库连接。mysql库提供了另一种数据库连接方式给我们，就是建立数据库连接池。

```js
// 数据库连接池
var poolConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'class_interaction',
  port: 3306,
  // 最大连接数，默认是10
  connectionLimit: 10
}

// 建立连接
var conn = mysql.createPool(poolConfig)
```

如果为了数据库的安全性，设置了用户权限的话，可以在配置中，修改为多用户的情况，例如：

```js
// 多用户
var userConfig = {
  manager: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'class_interaction',
    port: 3306
  },
  student: {
    host: 'localhost',
    user: 'studentUser',
    password: 'studentUser',
    database:'class_interaction',
    port: 3306
  },
  teacher: {
    host: 'localhost',
    user: 'studentUser',
    password: 'studentUser',
    database:'class_interaction',
    port: 3306
  }
}
```

参考链接：

[初始Nodejs服务器开发](http://www.alloyteam.com/2015/03/sexpressmysql/)

[在 Express 开发中使用 nodemon](http://bubkoo.com/2014/12/02/use-nodemon-with-node-applications/)
