package ai.explicable.forms;

import com.amazonaws.metrics.RequestMetricCollector;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class FormHandler implements RequestStreamHandler {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    AmazonSNS snsClient = AmazonSNSClientBuilder
            .standard()
            .withRegion(Regions.EU_WEST_1)
            .withMetricsCollector(RequestMetricCollector.NONE).build();
    Base64.Decoder decoder = Base64.getDecoder();

    @Override
    public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException {
        LambdaLogger logger = context.getLogger();


        try {
            String inputString = new String(input.readAllBytes());
            logger.log(inputString);


            // log execution details
            logger.log("ENVIRONMENT VARIABLES: " + gson.toJson(System.getenv()));
            logger.log("CONTEXT: " + gson.toJson(context));

            Map<String, Object> event = gson.fromJson(inputString, Map.class);
            // process event
            logger.log("EVENT: " + gson.toJson(event));
            logger.log("EVENT TYPE: " + event.getClass());

            byte[] decodedBytes = decoder.decode(event.get("body").toString());
            String decodedString = new String(decodedBytes);

            Map<String, String> parameters = new LinkedHashMap<>();
            String[] keyValuePairs = decodedString.split("&");
            for (String keyValuePair : keyValuePairs) {
                String[] keyAndValue = keyValuePair.split("=");
                String key = URLDecoder.decode(keyAndValue[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(keyAndValue[1], StandardCharsets.UTF_8);
                parameters.put(key, value);
            }
            String message = gson.toJson(parameters);

            logger.log("parameters: " + message);
            snsClient.publish("arn:aws:sns:eu-west-1:100172815067:ai-explicable-form-handler-sns-topic", message);

            return message;
        } catch (Throwable t) {
            logger.log(t.getMessage());
            logger.log(Arrays.asList(t.getStackTrace()).toString());
        }
        return "ERROR: unable to get logger";


    }
}
