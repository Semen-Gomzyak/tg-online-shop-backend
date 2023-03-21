const TelegramBot = require('node-telegram-bot-api');
var LiqPay = require('liqpay');
var liqpay = new LiqPay(public_key, private_key);
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config(); 

const { TOKEN, PORT } = process.env;
const webAppUrl = 'https://tg-online-shop-fronend.vercel.app/';

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express()

app.use(express.json())
app.use(cors);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, "Заходи в наш интернет магазин по кнопке ниже", {
            reply_markup: {
                    inline_keyboard: [[{text: 'Сделать заказ', web_app: {url: webAppUrl}}]]
            }
        })
    }

        if (text === '/start') {
          await bot.sendMessage(
            chatId,
            'Ниже появиться кнопка, заполнить форму',
            {
              reply_markup: {
                keyboard: [
                  [{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form'} }],
                ],
              },
            },
          );
    }
    
    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

           await bot.sendMessage(chatId, 'Спасибо за обратную связь')
           await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
            
            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате')
            }, 3000)
        } catch (error) {
            console.log(error)
        }
    }
})
app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
  try {
      
    liqpay.api(
      'request',
      {
        public_key,
        action: 'pay',
        version: '3',
        email: 'client-email@gmail.com',
        amount: totalPrice,
        currency: 'UAH',
        order_id: 'order_id_1',
        phone: '380950000001',
        description: "test"
      },
      function (json) {
        console.log(json.result);
      },
    );
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: "Успешная покупка",
            input_message_content: {message_text: "Поздравляю с покупкой, вы приобрели товар на сумму " + totalPrice}
        })
        return res.status(200).json({})
    } catch (error) {
                await bot.answerWebAppQuery(queryId, { 
                  type: 'article',
                  id: queryId,
                  title: 'Не удалось приобрести товар',
                  input_message_content: {
                    message_text:
                      'Не удалось приобрести товар'
                    },
                });
        
        return res.status(500).json({})
    }
})

app.listen(PORT, ()=> console.log('sever started on Port ' + PORT))