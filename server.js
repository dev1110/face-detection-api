const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const image = require('./image');

const app = express();
app.use(express.json())
app.use(cors())

// 151.106.96.30
// u926378551_clpl_emp

const db = knex({
    client: 'mysql',
    // debug: true,
    // connection: { 
    //   host : '127.0.0.1',
    //   user : 'u926378551_clpl_web001',
    //   password : 'Cyber@764',
    //   database : 'u926378551_clpl_emp',
    //   encoding: 'utf8'
    // }
    connection: { 
      host : '127.0.0.1',
      user : 'root',
      password : '',
      database : 'test',
      encoding: 'utf8'
    }
  });


//   db.select('*').from('login').where({email:'sally@email.com'.toLowerCase()})
//     .then(user=> {
//         console.log(user[0].email);
//     })
//     .catch(function(error) { 
//         console.error(error);
//     });

  


const database = {
   users: [
        {
            id: '120',
            name: 'sally',
            email: 'sally@example.com',
            password: 'sally',
            entries: 0,
            joined : new Date()
        },
        {
            id: '121',
            name: 'john',
            email: 'john@example.com',
            password: 'john',
            entries: 0,
            joined : new Date()
        }
    ]
};

app.get('/', (req, res) => {
    db.select('*').from('users')
    .then(users=> {
        console.log(users);
        res.json(users)
    })
    .catch(error=> { 
        console.error(error);
        res.json(error)
    });
})

app.post('/signin', (req, res) => {
    const {email, password} = req.body;
    db('users')
    .join('login', 'users.email', '=', 'login.email')
    .select('users.id',  'users.name', 'users.email', 'users.entries', 'login.hash')
    .where({'users.email':email.toLowerCase()})
    .then(user=> {
        if (user.length){
            const isValid = bcrypt.compareSync(password, user[0].hash);
            if(!isValid){
                res.json(`Wrong Credentials!`)
            }
            res.json(user[0])
        }else{
          res.json(`User Not Found!`)
        }
    })
    .catch(error=>{ 
        res.status(400).json(`User Not Found!`, error)
    });
})

app.post('/signup', (req, res) => {
    const {name,email,password} = req.body;
    const hash = bcrypt.hashSync(password);

    db.count('email', {as: 'exist'}).from('users').where({email:email})
    .then(user => {
        if(user[0].exist){
            res.json(`User already exists. Try logging in.`)
        }else{
            if(!email || !password || !name){
                res.json(`Any of the fields can't be empty!`)
            }else{
                const users = {
                    name: name.toLowerCase(), 
                    email:email.toLowerCase(), 
                    date_joined:new Date()
                }
                const login = {
                    email:email.toLowerCase(),
                    hash:hash
                }
                db.transaction(trx=> {
                    trx.insert(login)
                    .into('login')
                    .then(inserts =>{
                        return trx('users')
                        .insert(users)
                        .then(result =>{
                            res.json('success')
                        })
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
                })
                .catch(err => res.status(400).json('unable to register'))
            }
        }
    })
    .catch(error=> { res.json('Could not sign up! ',error) });
})

app.post('/profile/:id', (req, res) => {
    const {id} = req.params;
    db.select('*').from('users').where({id:id})
    .then(user=> {
        if(user[0].id == id) {
            return res.json(user[0]);
        }
    })
    .catch(error=> {
        res.json(`Invalid ID!`)
    });
})

app.put('/image', (req, res) => {image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => {image.handleAPICall(req, res)})

app.listen(3000, ()=>{
    console.log('app is running on port 3000');
})