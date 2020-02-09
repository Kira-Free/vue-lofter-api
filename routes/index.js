const express = require('express');
const router = express.Router();
const db = require('../db')
const svgCaptcha=require('svg-captcha')

// req.session.captcha
let sessionCaptcha
let str
let savePhone
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//获取首页渲染信息
router.get('/axios/news',function(req,res,next){
  let index=req.query.index
  let code =req.query.code
  console.log(code)
  console.log(index)
  let sqlStr=`select * from news limit ${index}`
  db.query(sqlStr,(err,data)=>{
    if(err){
      console.log(err);
      res.json({error_code:0,message:'error'})
      return
    }else{
      data=JSON.parse(JSON.stringify(data))
      // console.log(data);
      // console.log([data[index-1]]);
      if(!data[0]){
        res.json({error_code:0,message:'无数据'})
        return
      }
      if(!data[index-1]){
        res.json({error_code:0,message:'已无更多'})
        return
      }
      if(code==1){
        console.log(data);
        res.json({success_code:200,message:data})
        return
      }
      console.log('查询成功');
      res.json({success_code:200,message:[data[index-1]]})
    }
  })
})
// 生成随机验证码
router.get('/axios/captcha',(req,res)=>{
  let captcha=svgCaptcha.create({
    color:true,
    noise:2,
    ignoreChars:'0oi1',
    size:4
  })
  console.log(captcha.text)
  // 保存验证码
  req.session.captcha=captcha.text.toLowerCase()
  res.type('svg')
  sessionCaptcha=req.session.captcha
  console.log(req.session.captcha)
  res.send(captcha.data)
})

// 用户密码登录
router.post('/axios/user', (req, res, next) => {
  let username=req.body.phone
  let password=req.body.pass
  let captcha=req.body.captcha.toLowerCase()
  if(captcha!==sessionCaptcha){
    console.log(req.session.captcha);
    res.json({success_code:0,message:'验证码错误'})
    return
  }
  db.query(`select * from user where phone=${username}`,(err,data)=>{
    if(err){
      console.log(err)
      res.json({success_code:0,message:'数据库查询错误'})
      return
    }else if(data.length===0){
      res.json({success_code:0,message:'查无此数据'})
      return
    }
    let result=JSON.parse(JSON.stringify(data))
    console.log(result);
    if(password!==result[0].password){
      res.json({success_code:0,message:'密码错误'})
      return
    }
    res.json({success_code:200,message:result}).end()
  })
})
// 注册验证码对比
router.post('/axios/contrast',(req,res,next)=>{
  savePhone =req.body.phone
  let captcha=req.body.captcha.toLowerCase()
  if(captcha!=sessionCaptcha){
    console.log(captcha)
    console.log(sessionCaptcha)
    console.log('1')
    res.json({success_code:0,message:'验证码错误'})
    return
  }
  str=''
  // res.json({success_code:0,message:'验证码正确'})
  // let arr=[1,2,3,4,5,6,7,8,9,0]
  for(let i=0; i<4;i++){
    str+=Math.floor(Math.random()*10)
  }
  console.log(typeof str)
  res.json({success_code:200,message:str})
})

// 注册用户
router.post('/axios/register',(req,res)=>{
  let phone = req.body.phone
  let pass=req.body.pass
  if(savePhone!==phone){
    res.json({success_code:0,message:'手机号改动'})
    return
  }
  if(pass!==str){
    res.json({success_code:0,message:'密码填写错误'})
    return
  }
  var sqlStr=`select * from user where phone= ${phone}`
  db.query(sqlStr,(err,data)=>{
    if(err){
      console(err)
      return
    }else if(data[0]){
      res.json({success_code:0,message:'该手机号已注册'})
      return
    }else{
      console.log(1)
      var sqlStr=`INSERT INTO user (phone, password) VALUES (${phone},${pass})`
      db.query(sqlStr,(err)=>{
        if(err){
          console.log(err)
          return
        }else{
          // res.json({success_code:200,message:'注册成功'})
          var sqlStr=`select * from user where phone=${phone} limit 1`
          db.query(sqlStr,(err,data)=>{
            if(err){
              console.log(err)
              res.json({success_code:0,message:'登录出错，请手动登录'})
              return
            }else if(!data[0]){
              res.json({success_code:0,message:'注册失败，无该数据'})
              return
            }
            let result=JSON.parse(JSON.stringify(data))
            console.log(result);
            res.json({success_code:200,message:result})
          })
        }
      })
    }
  })
})

module.exports = router;
