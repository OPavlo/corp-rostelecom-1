const express = require('express')
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const session = require('express-session') //сессии
const MongoStore = require('connect-mongo')(session)//сохранение сессий в БД Mongo
const hbs = require('hbs')
const helper = require('handlebars-helpers')()
const logger = require('morgan')
const path = require('path')
var debug = require('debug')('lesson-16:server')
var http = require('http')
const validator = require('express-validator')
const passport = require('./auth')

const mongoose = require('mongoose')
let toDo = require('./models/todolist')
let Users = require('./models/users')

//доступ к БД
mongoose.connect('mongodb://localhost:27017/todo', {useNewUrlParser: true, useUnifiedTopology: true});

let app = express()


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

//настройка поддержки сессий для passport
app.use(cookieParser())
app.use(session({
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 10 * 60 * 1000,
        httpOnly: false,
    },
    secret: 'sadasdasasqweqwqsdasdacaasdadadadadadas',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

//инициализация passport
app.use(passport.initialize)
app.use(passport.session)

// Handelbars engine
hbs.registerHelper(helper)
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.get('/', function (req, res, next) {
    res.redirect('/auth')
})

app.get('/auth', passport.checkAuth, function (req, res, next) {
    const notFirstUseSite = req.cookies.notFirstUseSite.toString() // если пришел на сайт не впервые - сработает уведомление о необходимости регистрации или авторизации
    res.cookie('notFirstUseSite', 'false')
    res.render('auth', {title: 'Authentication', notFirstUseSite: notFirstUseSite})
})


app.post('/auth', [

    validator.body('email_address').trim()
        .isEmail().withMessage('Email field not correct')
        .isLowercase()
        .custom(async (value) => await Users.checkUserAuth(value))
        .bail()
        .escape(),
    validator.body('password').trim()
        .custom(async (value, {req}) => await Users.checkUserAuth(req.body.email_address))
        .bail() // если пользователя нет - то пароль проверять не требуется
        .custom(async (value, {req}) => {
            const user = await Users.findOne({email: req.body.email_address})
            return await user.validatePasswordCheck(value)
        })
        .escape(),

    function (req, res, next) {
        const errors = validator.validationResult(req);

        if (!errors.isEmpty()) {

            res.render('auth', {
                title: 'Authentication',
                errors: errors.array(),
                formField: {
                    email_address: req.body.email_address
                }
            })
        } else {
            next()
        }
    },
    passport.authenticate //если нет ошибок, вызываем обработчик авторизации
])

app.get('/reg', passport.checkAuth, function (req, res, next) { //проверяем, что пользователь уже не авторизован
    res.render('reg', {title: 'Registration'})

})

app.post('/reg', [

    //Валидация
    validator.body('first_name').trim()
        .isLength({min: 3, max: 20}).withMessage('First Name must be from 3 to 20 symbols')
        .isAlpha().withMessage('First Name is not Alpha')
        .escape(),

    validator.body('last_name').trim()
        .isLength({min: 3, max: 20}).withMessage('Last Name must be from 3 to 20 symbols')
        .isAlpha().withMessage('Last Name is not Alpha')
        .escape(),

    validator.body('email_address').trim()
        .isEmail().withMessage('Email field not correct')
        .isLowercase()
        .custom(async (value) => await Users.checkUser(value))
        .escape(),

    validator.body('password').trim()
        .isLength({min: 3}).withMessage('Password must be at least 3 symbols long')
        .escape(),

    validator.check('repassword', 'Field "Return password" not equal "Password"').trim()
        .custom((value, {req}) => value === req.body.password)
        .escape(),


    function (req, res, next) {

        const errors = validator.validationResult(req);
        let errors_field = []
        errors.errors.forEach((el) => {
            errors_field.push(el.param)
        })


        if (!errors.isEmpty()) {
            res.render('reg', {
                title: 'Registration',
                formField: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email_address: req.body.email_address
                },
                errors: errors.array(),
                errors_field: errors_field
            })
        } else {
            const user = new Users({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email_address,
                password: req.body.password
            })

            user.save(function (err, result) {
                if (err) {
                    next(err)
                }
                //console.log(result)
                res.redirect('/auth')
            })
        }


    }
])


app.get('/todo', passport.checkNotAuth, async function (req, res, next) { //защищаем от неавторизованных пользователей
    const toDoAll = await toDo.find({user: req.user._id}).exec()
    const user = await Users.findById(req.user._id).exec()
    res.render('todo', {title: 'ToDo', toDoAll: toDoAll[0].text, user: user})

})

app.post('/todo', async function (req, res, next) {
    const toDoUser = await toDo.findOne({user: req.user._id}).exec()
    console.log('post mtd')
    toDoUser.text.push(req.body.add)
    toDoUser.save(function (error, doc) {
        if (error) console.log(error)
    })
    // if(!toDoUser) {
    //     const toDoUser = new toDo({user: req.user._id})
    //     toDoUser.save(function (error, doc) {
    //         if (error) console.log(error)
    //     })
    // }
    // if (req.body.add_button) {
    //
    //
    // }
    // if (req.body.delete) {
    //     const indexDelete = toDoUser.text.indexOf(req.body.delete)
    //     toDoUser.text.splice(indexDelete, 1)
    //     toDoUser.save(function (error, doc) {
    //         if (error) console.log(error)
    //     })
    // }
    // if (req.body.edit) {
    //     const indexUpdate = toDoUser.text.indexOf(req.body.edit)
    //     toDoUser.text.set(indexUpdate, req.body.inputDataForEdit[indexUpdate])
    //     toDoUser.save(function (error, doc) {
    //         if (error) console.log(error)
    //     })
    // }
    res.redirect('/todo')
})

app.delete('/todo/:id', async function (req, res, next) {
    const toDoUser = await toDo.findOne({user: req.user._id}).exec()
    console.log('delete method')
    toDoUser.text.splice(req.params.id, 1)
    await toDoUser.save(function (error, doc) {
        if (error) {
            console.log(error)
            res.status(400).json({error: 'Failed to delete'})
        }
        else {
            res.status(200).json(doc)
        }
    })
})

app.put('/todo/:id', async function (req, res, next) {
    //console.log(req.body)
    const toDoUser = await toDo.findOne({user: req.user._id}).exec()
    const indexUpdate = toDoUser.text.indexOf(req.body.edit)
    toDoUser.text.set(req.params.id, req.body.value)
    toDoUser.save(function (error, doc) {
        if (error) {
            //console.log(error)
            res.status(400).json({error: 'Failed to update'})
        } else {
            res.status(200).json(doc)
        }
    })
})

app.get('/usres/profile', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect(`/users/${req.user._id}`)
    } else {
        res.redirect(`/todo`)
    }

})

app.get('/users/:id', passport.checkUserProfile, async function (req, res, next) {

    const user = await Users.findById(req.user._id).exec()
    res.render('userProfile', {
        title: user.fullName,
        user: user
    })
})

app.post('/users/:id', [
    validator.body('first_name').trim()
        .isLength({min: 3, max: 20}).withMessage('First Name must be from 3 to 20 symbols')
        .isAlpha().withMessage('First Name is not Alpha')
        .escape(),

    validator.body('last_name').trim()
        .isLength({min: 3, max: 20}).withMessage('Last Name must be from 3 to 20 symbols')
        .isAlpha().withMessage('Last Name is not Alpha')
        .escape(),

    validator.body('email_address').trim()
        .isEmail().withMessage('Email field not correct')
        .isLowercase()
        .custom(async (value, {req}) => await Users.checkUserForUpdate(value, req.user._id))
        .escape(),

    async function (req, res, next) {

        const errors = validator.validationResult(req);
        let errors_field = []
        errors.errors.forEach((el) => {
            errors_field.push(el.param)
        })

        const user = await Users.findById(req.user._id).exec()

        if (!errors.isEmpty()) {
            res.render('userProfile', {
                title: user.fullName,
                formField: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email_address: req.body.email_address
                },
                user: user,
                errors: errors.array(),
                errors_field: errors_field
            })
        } else {
            await Users.updateOne({_id: req.user._id}, {
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email_address
            })
            res.redirect(`${user.url}`)

        }
    }
])

app.get('/updatePassword/users/:id', passport.checkUserProfile, async function (req, res, next) {

    const user = await Users.findById(req.user._id).exec()
    res.render('updatePassword', {
        title: 'Change password',
        user: user
    })
})

app.post('/updatePassword/users/:id', [

    validator.body('oldPassword').trim()
        .custom(async (value, {req}) => {
            await Users.checkUserPassword(req.user.email, req.body.oldPassword)
        })
        .bail()
        .escape(),

    validator.body('password').trim()
        .isLength({min: 3}).withMessage('Password must be at least 3 symbols long')
        .escape(),

    validator.check('repassword', 'Field "Return password" not equal "Password"').trim()
        .custom((value, {req}) => value === req.body.password)
        .escape(),


    async function (req, res, next) {

        const errors = validator.validationResult(req);
        let errors_array = errors.array()
        if (errors.mapped().oldPassword) { // если возникла ошибка с "Old Password" - не показывать остальные ошибки
            errors_array.splice(1)
        }
        let errors_field = []
        errors_array.forEach((el) => {
            errors_field.push(el.param)
        })
        const user = await Users.findById(req.user._id).exec()

        if (!errors.isEmpty()) {
            res.render('updatePassword', {
                title: 'Change password',
                formField: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email_address: req.body.email_address
                },
                user: user,
                errors: errors_array,
                errors_field: errors_field
            })
        } else {
            // await user.updateOne({
            //     password: req.body.password
            // })
            await Users.updateOne({_id: req.user._id}, {
                password: req.body.password
            })
            res.render('updatePassword', {
                title: 'Change password',
                user: user,
                success: 'true'
            })
        }
    }
])


app.get('/logout', passport.checkNotAuth, function (req, res) { //проверяем, что  пользователь авторизован и выходим
    req.logout()
    res.redirect('/auth')
})


// Если нет обработчиков, то  ошибка 404
app.use(function (req, res, next) {
    next(createError(404));
})

// Обработчик ошибок
app.use((err, req, res, next) => {

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
})

app.listen('4000', function () {
    console.log('http://localhost:4000')
    debug('Listening on 4000')
})





