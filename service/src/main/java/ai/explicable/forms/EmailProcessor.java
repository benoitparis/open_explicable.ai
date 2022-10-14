package ai.explicable.forms;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.Arrays;
import java.util.Map;

public class EmailProcessor implements RequestHandler<Map<String, Object>, String> {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();

    AmazonSimpleEmailService client =
            AmazonSimpleEmailServiceClientBuilder.standard().build();

    @Override
    public String handleRequest(Map<String, Object> event, Context context) {
        LambdaLogger logger = context.getLogger();
        try {
            logger.log("------------------");
                logger.log(gson.toJson(event));

//            for (SNSEvent.SNSRecord record : event.getRecords()) {
//                LinkedHashMap<String, String> parameters = gson.fromJson(record.getSNS().getMessage(), LinkedHashMap.class);
//                logger.log(parameters.toString());
//
//                final String FROM = "contact@explicable.ai";
//                // TODO mettre un reply-to sur le gars?
//                final String TO = "pro@benoit.paris";
//                final String SUBJECT = "[Explicable.ai Contact] New contact";
//                final String TEXTBODY = "The following message was sent on explicable.ai: \n" +
//                        "name: " + parameters.get("name") + "\n" +
//                        "email: " + parameters.get("email") + "\n" +
//                        "message: \n" +
//                        parameters.get("message");
//
//                SendEmailRequest request = new SendEmailRequest()
//                        .withDestination(new Destination().withToAddresses(TO))
//                        .withMessage(new Message()
//                                .withBody(new Body().withText(
//                                        new Content().withCharset("UTF-8").withData(TEXTBODY)))
//                                .withSubject(new Content().withCharset("UTF-8").withData(SUBJECT)))
//                        .withSource(FROM);
//                SendEmailResult result = client.sendEmail(request);
//
//                logger.log("Email sent! ID:" + result.getMessageId());
//
//            }
            return null;
        } catch (Throwable t) {
            logger.log(t.getMessage());
            logger.log(Arrays.asList(t.getStackTrace()).toString());
        }
        return "ERROR: unable to get logger";
    }
}
