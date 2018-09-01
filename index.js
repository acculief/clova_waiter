const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');

// 応答の最後に追加するテンプレート
const TEMPLATE_INQUIRY = 'ご注文をどうぞ。';
let orderName  = [];
let orderAmount = [];
let againScript = '';
let total = 0;

const clovaSkillHandler = clova.Client
  .configureSkill()
  // スキルの起動リクエスト
  .onLaunchRequest(responseHelper => {
    responseHelper.setSimpleSpeech({
      lang: 'ja',
      type: 'PlainText',
      value: `いらっしゃいませ。${TEMPLATE_INQUIRY}`,
    });
  })

  // カスタムインテント or ビルトインインテント
  .onIntentRequest(responseHelper => {
    const intent = responseHelper.getIntentName();
    let speech;
    switch (intent) {
      case 'menuIntent':
        const slots = responseHelper.getSlots()
        if(slots.menuSlot == null || slots.amountSlot == null) {
          speech = {
            lang: 'ja',
            type: 'PlainText',
            value: `もう一度お願いします。`
          }
          responseHelper.setSimpleSpeech(speech)
          responseHelper.setSimpleSpeech(speech, true)
          break
        }

        orderName.push(slots.menuSlot)
        orderAmount.push(slots.amountSlot)

        speech = {
          lang: 'ja',
          type: 'PlainText',
          value: `追加のご注文をどうぞ`
        }
        responseHelper.setSimpleSpeech(speech)
        responseHelper.setSimpleSpeech(speech, true)

        break;
      // ビルトインインテント。ユーザーによるインプットが使い方のリクエストと判別された場合
      case 'Clova.GuideIntent':
        speech = {
          lang: 'ja',
          type: 'PlainText',
          value: TEMPLATE_INQUIRY
        }
        responseHelper.setSimpleSpeech(speech)
        responseHelper.setSimpleSpeech(speech, true)
        //});
        break;
      // ビルトインインテント。ユーザーによるインプットが肯定/否定/キャンセルのみであった場合
      case 'Clova.YesIntent':
      case 'Clova.NoIntent':
      case 'Clova.CancelIntent':
        againScript = ''
        for (var i = 0; i < orderName.length; i++) {
          againScript += orderName[i] + 'を' + orderAmount[i] + '個。　'
          if (orderName[i] == 'コーヒー') {
            total += 400
          }
          if (orderName[i] == 'コーラ') {
            total += 600
          }
          if (orderName[i] == 'アイスティー') {
            total += 400
          }
          if (orderName[i] == 'ホットドッグ') {
            total += 1200
          }
          if (orderName[i] == 'オムライス') {
            total += 1500
          }
          if (orderName[i] == 'サンドイッチ') {
            total += 1000
          }
          if (orderName[i] == 'チーズケーキ') {
            total += 1800
          }
          if (orderName[i] == 'チョコレートケーキ') {
            total += 1800
          }
          if (orderName[i] == 'ショートケーキ') {
            total += 2000
          }
        }
        orderName = []
        orderAmount = []
        againScript += `。　以上のご注文を受け付けました。　合計で${total}円でございます。　少々お待ちください。`
        speech = {
          lang: 'ja',
          type: 'PlainText',
          value: `ありがとうございます。復唱します。${againScript}`,
        }
        againScript = ''
        responseHelper.setSimpleSpeech(speech)
        break;
    }
  })
  // スキルの終了リクエスト
  .onSessionEndedRequest(responseHelper => {
  })
  .handle();

const app = new express();
//TODO
// リクエストの検証を行う場合。環境変数APPLICATION_ID(値はClova Developer Center上で入力したExtension ID)が必須
const clovaMiddleware = clova.Middleware({
  applicationId: process.env.APPLICATION_ID
});
app.post('/clova', clovaMiddleware, clovaSkillHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
