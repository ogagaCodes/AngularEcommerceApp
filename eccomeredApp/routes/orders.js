const express = require('express');
const router = express.Router();
const { database} = require('../config/helpers');


// get all orders

router.get('/', (req, res)=>{
  database.table('order_details as od')
  .join([{
    table: 'orders as o',
    on: 'o.id = od.order_id'
  },
  {
    table: 'products as p',  
    on: 'p.id = od.product_id'
  },
  {
    table: 'n_users as u',
    on : 'u.id = o.user_id'
  }
])
.withFields([
  'o.id',
  'p.title as name',
  'p.price',
  'p.description',
  'u.username'
]).sort({id: -1})
.getAll()
.then( orders =>{
  if(orders.length > 0){
    res.status(200).json(orders);
  } else {
    res.json({
      message: `No orders found`
    })
  }
})
.catch(error => console.log(error));
})


// get an order by id
router.get('/:id', (req, res) => {
   const orderId = req.params.id;
   database.table('order_details as od')
   .join([{
     table: 'orders as o',
     on: 'o.id = od.order_id'
   },
   {
     table: 'products as p',  
     on: 'p.id = od.product_id'
   },
   {
     table: 'n_users as u',
     on : 'u.id = o.user_id'
   }
 ])
 .withFields([
   'o.id',
   'p.title as name',
   'p.price',
   'p.description',
   'u.username'
 ]).filter({'o.id': orderId})
 .getAll()
 .then( orders =>{
   if(orders.length > 0){
     res.status(200).json(orders);
   } else {
     res.json({
       message: `No orders found with id ${orderId}`
     })
   }
 })
 .catch(error => console.log(error))

})

// place an order

router.post('/new', (req, res) =>{
  let { userId, products } = req.body;
  if(userId != null && userId > 0 && !isNaN(userId)){
    database.table('orders')
    .insert({
      user_id: userId
    }).then(newOrderId => {
       if(newOrderId > 0){

        products.forEach( async (p) => {
          let data = await database.table('products').filter({id:p.id}).withFields(['quantity'])
          .get();
         let inCart = p.incart;
           
         // deduct the number of piece ordered from the quantity column in database
         if(data.quantity > 0){
             data.quantity = data.quantity - inCart
             if(data.quantity < 0){
                 data.quantity = 0;
             }
         } else {
           data.quantity = 0;
          //  return;
         }
         // insert  order details wrt to newly generated id
         database.table('order_details').insert({
           order_id: newOrderId,
           product_id:p.id,
           quantity: inCart
         }).then( newid =>{
            database.table('products').filter({id:p.id}).update({
              quantity : data.quantity
            }).then(successNum =>{}).catch(err => {console.log(err)})
         }).catch(err => {
           console.log(err);
         })

        });
         
       } else {
         res.json({mesage: 'new order failed while adding order details', succes : false})
       }
       res.json({
         message: `new order placed with order id ${newOrderId}`,
         succes: true,
         order_id: newOrderId,
         products: products
       })
    }).catch(err => {
      console.log(err);
    })
  } else{
    res.json({message: "new order failed",
  success: false})
  }
  
})

// fake payment route

router.post('/payment', (req, res)=>{
   setTimeout(() => {
     res.status(200).json({
       success: true
     })
   }, 3000);
})

module.exports = router;
