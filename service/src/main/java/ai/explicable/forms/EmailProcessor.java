package ai.explicable.forms;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.*;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ForkJoinPool;

public class EmailProcessor implements RequestHandler<SNSEvent, Object> {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();

    AmazonSimpleEmailService client =
            AmazonSimpleEmailServiceClientBuilder.standard().build();

    @Override
    public String handleRequest(SNSEvent event, Context context) {
        LambdaLogger logger = context.getLogger();
        try {
//            snsClient.publish("arn:aws:sns:eu-west-1:100172815067:ai-explicable-form-handler-sns-topic", gson.toJson(parameters));

            for (SNSEvent.SNSRecord record : event.getRecords()) {
                LinkedHashMap<String, String> parameters = gson.fromJson(record.getSNS().getMessage(), LinkedHashMap.class);
                logger.log(parameters.toString());

                final String FROM = "contact@explicable.ai";
                // TODO mettre un reply-to sur le gars?
                final String TO = "pro@benoit.paris";
                final String SUBJECT = "[Explicable.ai Contact] New contact";
                final String TEXTBODY = "The following message was sent on explicable.ai: \n" +
                        "name: " + parameters.get("name") + "\n" +
                        "email: " + parameters.get("email") + "\n" +
                        "message: \n" +
                        parameters.get("message");


                SendEmailRequest request = new SendEmailRequest()
                        .withDestination(new Destination().withToAddresses(TO))
                        .withMessage(new Message()
                                .withBody(new Body().withText(
                                        new Content().withCharset("UTF-8").withData(TEXTBODY)))
                                .withSubject(new Content().withCharset("UTF-8").withData(SUBJECT)))
                        .withSource(FROM);
                SendEmailResult result = client.sendEmail(request);

                logger.log("Email sent! ID:" + result.getMessageId());

            }
            return null;
        } catch (Throwable t) {
            logger.log(t.getMessage());
            logger.log(Arrays.asList(t.getStackTrace()).toString());
        }
        return "ERROR: unable to get logger";
    }
}
