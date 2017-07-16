var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    // appId: process.env.MICROSOFT_APP_ID,
    // appPassword: process.env.MICROSOFT_APP_PASSWORD
    appId: "261d1735-9998-4fb2-bdcf-5831cc143fe5",
    appPassword: "b3k9vds0J2AhdOn5MtzYbYh"
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
	session.sendTyping();
	var splitted = session.message.text.split(" ");
	switch(splitted[0].toLowerCase()){
		case "help":
			session.send("To pair write: Pair [email] [first 5 digits of security code]");
			break;
		case "pair":
			if(splitted.length===3){

				request.post({
				     url: "http://localhost:8080/x-glu-cloud/v1/service/bot-login",
				     headers: {
				        "Content-Type": "application/json"
				     },
				     body: {
					    email:splitted[1],
					    password:splitted[2],
					    address:session.message.address
					},
				     json:true
				}, function(error, response, body){
					if(response.statusCode==200){
						session.send("Hi "+body.name+" you are sucessfully authorized to receive notifications!");
					} else {
						session.send("Entered credentials are not valid!");
					}
				   // console.log(error);
				   // console.log(JSON.stringify(response));
				   // console.log(body);
				});
			} else {
				session.send("Invalid count of parameters for pairing!");
			}
			break;
		case "card1":
			
		    var card = new builder.ThumbnailCard(session)
		        .title('BotFramework Thumbnail Card')
		        .subtitle('Your bots — wherever your users are talking')
		        .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
		        .images([
		            builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
		        ])
		        .buttons([
		            builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
		        ]);
		    var msg = new builder.Message(session).addAttachment(card);
    		session.send(msg);

			break;
		case "api":
			session.send(JSON.stringify(session.message.address));
			break;

		default:
			session.send("Sorry, I didn't understand. For further info send \"help\".");
			break;
	}


	





    
   //  send(session.message.address,"ahoj");
   // send(session.message.address,JSON.stringify(session.message.address));
     
});

function send(address, message) {
    var reply = new builder.Message()
        .address(address)
        .text(message);
    bot.send(reply);
}