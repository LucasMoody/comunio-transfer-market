'use strict';
const comunio = require('./comunio/comunio');
const comunioUtils = require('./comunio/utils');
const request = require('request');

const VERIFY_TOKEN = "1234567";
const PAGE_ACCESS_TOKEN = 'EAAD7JNJVs6EBACiJXFTQaMZBUGZCPQsepqYg8sNuiKZBP237UPPxYZCmSjva4VDcgZANqjMXDe5Lu0pz7ggEDwZApesU1yPYu22ZBMdZAVYxzzD5F4nZAoto2DZBNBo7VhrZBzUbT6PU2ZCvmfVTZC1bMv6O1p8uhlo2dS0hsQo15VCGSNgZDZD';

module.exports.getMarket = (event, context, callback) => {
  console.log('Full event', event);
  const query = event.queryStringParameters;
  if(query) {
    console.log('Query', query);
    const rVerifyToken = query['hub.verify_token']
    if (rVerifyToken === VERIFY_TOKEN) {
      const challenge = query['hub.challenge']

      const response = {
        body: parseInt(challenge),
        statusCode: 200
      };

      callback(null, response);
    }
  } else if(event.httpMethod == 'POST') {
    const data = JSON.parse(event.body);
    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        const pageID = entry.id;
        const timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      const response = {
        statusCode: 200
      };
      callback(null, response);
    }
  } else if(event.comunio) {
    comunio.getMarketForUserName('Luque1988')
      .then(results => {
        const messageData = {
          recipient: {
            id: '1550034908352591'
          },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "list",
                top_element_style: "compact",
                elements: results
                  .filter(player => player.ownerid == "1")
                  .sort((player1, player2) => Number(player2.quote) - Number(player1.quote))
                  .slice(0,4)
                  .map(player => {
                    return {
                      title: String(player.name + '\t' + Number(player.quote).toLocaleString('de-DE')),
                      subtitle: String(player.points + ' Punkte ' + comunioUtils.positionTranslator(player.position) + ' ' + comunioUtils.clubIdToName(player.clubid))
                    }
                  })
              }
            }
          }
        };
        callSendAPI(messageData);
      })
      .catch(err => {
        console.error('Error', err);
      });

      comunio.getCommunityNews('1228147')
        .then(news => {
          if(news) {
            news.forEach(newsItem => {
              const messageData = {
                recipient: {
                  id: '1550034908352591'
                },
                message: {
                  text: newsItem.length > 640 ? newsItem.slice(0, 637) + '...' : newsItem
                }
              };
              callSendAPI(messageData)
            });
          }
        })
        .catch(err => console.error('Error', err));

  }
};

function receivedMessage(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;

  const messageText = message.text;
  const messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  console.log('MeesageData:', JSON.stringify(messageData));
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(JSON.stringify(response.body));
      console.error(error);
    }
  });
}
