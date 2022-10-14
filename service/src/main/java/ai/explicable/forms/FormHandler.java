package ai.explicable.forms;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

public class FormHandler implements RequestHandler<Map<String, Object>, String> {

    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Base64.Decoder decoder = Base64.getDecoder();

    Region region = Region.EU_WEST_1;
    EventBridgeClient eventBrClient = EventBridgeClient
            .builder()
            .region(region)
            .build();

    @Override
    public String handleRequest(Map<String, Object> event, Context context) {
        LambdaLogger logger = context.getLogger();
        try {
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

            logger.log( message);

            PutEventsRequestEntry request_entry = PutEventsRequestEntry.builder()
                    .detail(message)
                    .detailType("emailRequest")
                    .resources("arn:aws:events:eu-west-1:100172815067:event-bus/ai-explicable-event-bus")
                    .source("ai.explicable.forms.Formhandler")
                    .build();

            PutEventsRequest request = PutEventsRequest.builder()
                    .entries(request_entry)
                    .build();

            PutEventsResponse response = eventBrClient.putEvents(request);


            return response.toString();
        } catch (Throwable t) {
            logger.log(t.getMessage());
            logger.log(Arrays.asList(t.getStackTrace()).toString());
        }
        return "Error getting logger";

    }

}
