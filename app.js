import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { Xendit } from 'xendit-node';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });



// let allowedOrigins = ['http://localhost'];
let allowedOrigins = ['*'];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let msg = 'The CORS policy for this site does not allow access from the specified Origin. ';
            return callback(new Error(msg), false);
        }

        return callback(null, true);
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log('Server Listening on PORT: ', PORT);
// });


const authToken = Buffer.from(process.env.XENDIT_API_SECRET_KEY).toString('base64');

async function createInvoice(total){
    try{
        const { data, status } = await axios.post('https://api.xendit.co/v2/invoices', 
            {
                external_id: 'text_xendit_001',
                amount: total,
                currency: 'IDR',
                customer: {
                    given_names: 'Prihanto',
                    surname: 'Sanjaya',
                    email: 'prihanto_sanjaya@yahoo.com',
                    mobile_number: '+6285219897296',
                },
                customer_notification_preference: {
                    invoice_paid: ['email', 'whatsapp']
                },
                success_redirect_url: 'http://localhost/doku-payment/success.php',
                failure_redirect_url: 'http://localhost/doku-payment/success.php',
                items: [
                    {
                        name: 'Mac Book Pro',
                        quantity: 1,
                        price: total,
                        category: 'Laptop'
                    }
                ],
                fees: [
                    {
                        type: 'Delivery',
                        value: 0
                    }
                ]
            },
            {
                headers: {
                    'Authorization' : `Basic ${authToken}`
                }
            }
        )

        return data;
    } catch(error){
        console.log(error);
    }
}

app.post('/api/xendit/checkout', upload.single('file'), async(request, response) => {
    const amount = parseInt(request.body.amount);
    
    const data = await createInvoice(amount);
    // console.log(data.invoice_url);
    const url_payment = data.invoice_url;
    const res = {
        msg: 'oke',
        url_payment: url_payment
    };
    response.status(200).send(res);
});

app.get('/testing', async(request, response) => {
    // const data = await createInvoice();
    // console.log(data);
    const res = {
        msg: 'oke'
    };
    response.status(200).send(res);
});

app.get('/notification', async(request, response) => {
    // const xenditClient = new Xendit({
    //     secretKey: process.env.XENDIT_API_SECRET_KEY,
    //     xenditURL: 'https://gandumbread.com'
    // });
    console.log('testing');

    // const xenditClient = new Xendit({
    //     secretKey: SECRET_API_KEY
    // });

});

export default app;