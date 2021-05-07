var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products})
  })

  
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product',(req,res)=>{


  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    console.log(id);
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
          console.log(err);
        }

    })
    
  })
})
router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    console.log(proId)
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/')
    })
})

router.get('/edit-product/:id',async (req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
        
  
      
    }
  })
})
router.get('/view-users',(req,res)=>{
  productHelpers.getAllUsers().then((users)=>{
    console.log(users);
    res.render('admin/view-users',{admin:true,users})

  // res.render('admin/view-users',{admin:true})
})
})

router.get('/delete-user/:id',(req,res)=>{
  let removeId=req.params.id
  console.log(removeId)
  productHelpers.deleteUser(removeId).then((response)=>{
    res.redirect('/admin/view-users')
  })
})

router.get('/view-appointment',(req,res)=>{
  userHelpers.getAllAppointment().then((appointment)=>{
    console.log(appointment);
    res.render('admin/view-appointment',{admin:true,appointment})

  // res.render('admin/view-users',{admin:true})
})
})

router.get('/delete-appointment/:id',(req,res)=>{
  let removId=req.params.id
  console.log(removId)
  userHelpers.deleteAppointment(removId).then((response)=>{
    res.redirect('/admin/view-appointment')
  })
})

router.get('/view-orders',(req,res)=>{
  userHelpers.getAllOrders().then((order)=>{
    console.log(order);
    res.render('admin/view-orders',{admin:true,order})

  // res.render('admin/view-users',{admin:true})
})
})

router.get('/delete-order/:id',(req,res)=>{
  let removId=req.params.id
  console.log(removId)
  userHelpers.deleteOrder(removId).then((response)=>{
    res.redirect('/admin/view-orders')
  })
})


module.exports = router;
