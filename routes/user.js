  const { response } = require('express');
  var express = require('express');
  const session = require('express-session');
  var router = express.Router();
  const productHelpers=require('../helpers/product-helpers')
  const userHelpers=require('../helpers/user-helpers');
  const varifyLogin=(req,res,next)=>{
    if(req.session.user){
      next()
    }else{
      res.redirect('/login')
    }
  }

  /* GET home page. */
  router.get('/', async function(req, res,next) {
    let user=req.session.user
    console.log(user)
    let cartCount=null
    if(req.session.user){
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    }

  
    productHelpers.getAllProducts().then((products)=>{
      
      res.render('user/view-products',{products,user,cartCount})
    })
  });

  router.get('/login',(req,res)=>{
    if(req.session.user){
      res.redirect('/')
    }else{

    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
    }
  })
  router.get('/signup',(req,res)=>{
    res.render('user/signup')
  })
  router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
      console.log(response);
      
      req.session.user=response
      req.session.user.loggedIn=true
      res.redirect('/')
    })
  })
  // router.post('/login',(req,res)=>{
  //   userHelpers.doLogin(req.body).then((response)=>{
  //     if(response.status){
        
  //       req.session.user=response.user
  //       req.session.user.loggedIn=true
  //       res.redirect('/')
  //     }else if(response.statusAdmin){
  //       req.session.admin = response.admin
  //       req.session.admin.loggedIn = true
  //       res.redirect('/admin')
  //     }
      
  //     else{
  //       req.session.userLoginErr="Invalid username or password"
  //       res.redirect('/login')
  //     }
  //   })
  // })
  router.post('/login',(req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        
        req.session.user = response.user
        req.session.user.loggedIn = true
        res.redirect('/')
      }
      else if(response.statusAdmin){
        req.session.admin = response.admin
        req.session.admin.loggedIn = true
        res.redirect('/admin')
      }
      else{
        req.session.userLoginErr = "Invalid Username or Password"
        res.redirect('/login')
      }
    })
  })
  router.get('/logout',(req,res)=>{
    req.session.user=null
    req.session.userLoggedIn=false
    res.redirect('/')
  })
  router.get('/cart',varifyLogin, async(req,res,next)=>{

    let products = await userHelpers.getCartProducts(req.session.user._id)
    let totalValue = 0
    if(products.length>0){
    totalValue = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/cart',{products,user:req.session.user._id,totalValue})
    }else{
      res.render('user/cart-empty',{user:req.session.user._id})
    }

    // console.log(products);
    // res.render('user/cart',{products,user:req.session.user._id,totalValue})
  })

  router.get('/add-to-cart/:id',(req,res)=>{
    console.log("api call")
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
    })
  })

  router.post('/change-product-Quantity',(req,res,next)=>{
    console.log(req.body)
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
    })
  })

  router.get('/place-order',varifyLogin,async(req,res)=>{
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/place-order',{total,user:req.session.user})
  })


  router.post('/place-order',async(req,res)=>{
    let products = await userHelpers.getCartProductList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body['payment-method']==='COD'){
        res.json({codSuccess:true})
      }else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
      
    })
    console.log(req.body);
  })

  router.get('/order-success',(req,res)=>{
    res.render('user/order-success',{user:req.session.user})
  })

  router.get('/orders',async(req,res)=>{
    let orders = await userHelpers.getUserOrders(req.session.user._id)
    res.render('user/orders',{user:req.session.user,orders})
    })

    router.get('/view-order-products/:id',async(req,res)=>{
      let products=await userHelpers.getOrderProducts(req.params.id)
      res.render('user/view-order-products',{user:req.session.user,products})
    })

    router.post('/verify-payment',(req,res)=>{
      console.log(req.body)
      userHelpers.verifyPayment(req.body).then(()=>{
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
          console.log('Payment Success');
          res.json({status:true})
        })  
      }).catch((err)=>{
        res.json({status:false,errMsg:''})
      })
    })

    router.get('/cart-empty',(req,res)=>{
      res.render('user/cart-empty')
    })

    router.get('/fix-appointment',varifyLogin,(req,res)=>{
      if({user:req.session.user}){
        console.log(req.body)
      res.render('user/fix-appointment')
      
      }else{
        res.redirect('/login')
      }
    })

    router.post('/fix-appointment',varifyLogin,(req,res)=>{
      console.log(req.body)
      userHelpers.fixAppointment(req.body,(result)=>{
         res.render('user/fix-appointment',{user:req.session.user})
        //  res.redirect('/user/time-success')
      })
   })


    router.get('/delete-cart/:id',(req,res)=>{
      let removeId=req.params.id
      console.log(removeId)
      userHelpers.deleteCart(removeId).then((response)=>{
        res.redirect('/')
      })
  })

  router.get('/view-equipments',async function (req, res, next) {
  let user = req.session.user
  console.log(user)
  let cartCount = null
  if(req.session.user){
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getEquipmentProducts().then((equipment)=>{
    console.log(equipment);
    res.render('user/view-equipments',{equipment,user,cartCount});
  })
});

router.get('/view-accessories',async function (req, res, next) {
  let user = req.session.user
  console.log(user)
  let cartCount = null
  if(req.session.user){
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAccessoriesProducts().then((accessories)=>{
    console.log(accessories);
    res.render('user/view-accessories',{accessories,user,cartCount});
  })
});

router.get('/view-status',async(req,res)=>{
  let checkstatus = await userHelpers.getTimeStatus(req.session._id)
  res.render('user/view-status',{user:req.session.user,checkstatus})
  })

  router.get('/delete-Userorder/:id',(req,res)=>{
    let delId=req.params.id
    console.log(delId)
    userHelpers.deleteUserOrder(delId).then((response)=>{
      res.redirect('/orders/')
    })
  })

  
  module.exports = router;



